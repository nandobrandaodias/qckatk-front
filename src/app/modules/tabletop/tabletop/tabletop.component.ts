import { AuthService } from '@/app/shared/modules/auth/auth.service';
import { SharedModule } from '@/app/shared/modules/shared.module';
import { API_URL } from '@/environments/environment';
import {
  Component,
  inject,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy,
  AfterViewInit,
  HostListener,
  signal,
} from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ChatService } from '@/app/shared/services/chat.service';
import { TokensService } from '@/app/shared/services/tokens.service';
import { ToolsService } from '@/app/shared/services/tools.service';
import { TableConfigService } from '@/app/shared/services/tableConfig.service';
import { SliderModule } from 'primeng/slider';
import { ConfigComponent } from "../menu/config/config.component";
import { TabletopConfigComponent } from "../menu/tabletop-config/tabletop-config.component";

interface Token {
  id: string;
  type: 'character' | 'npc' | 'others';
  label: string;
  position: {
    x: number;
    y: number;
    row: number;
    col: number;
  };
  ownerId: string;
}

interface TokenMoveEvent {
  tokenId: string;
  position: {
    row: number;
    col: number;
    x: number;
    y: number;
  };
}

interface BackgroundHistory {
  url: string;
  addedAt: Date;
}

@Component({
  selector: 'app-tabletop',
  imports: [SharedModule, SliderModule, ConfigComponent, TabletopConfigComponent],
  templateUrl: './tabletop.component.html',
  styleUrl: './tabletop.component.css',
})
export class TabletopComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('gridBoard') gridBoardRef!: ElementRef;
  @ViewChild('chatElement') chatElement: ElementRef<HTMLDivElement>;

  router = inject(Router);
  activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  authService: AuthService = inject(AuthService);
  chatService: ChatService = inject(ChatService);
  tableConfigService: TableConfigService = inject(TableConfigService);
  tokensService: TokensService = inject(TokensService);
  toolsService: ToolsService = inject(ToolsService);
  messageService: MessageService = inject(MessageService);

  showGridConfigModal: boolean = false;
  gridConfigForm: FormGroup;

  world_id: string = '';
  menu: boolean = false;
  server: Socket;
  user: any;
  message: string = '';
  chat: any[] = [];

  showConfigModal = signal(false);
  showTabletopConfigModal = signal(false);

  gridRows: number[] = Array.from({ length: 15 }, (_, i) => i);
  gridCols: number[] = Array.from({ length: 20 }, (_, i) => i);
  cellSize: number = 50;

  tokens: any[] = [];
  selected_token: any = '';
  draggingToken: Token | null = null;
  dragOffset = { x: 0, y: 0 };
  cursorPosition = { x: 0, y: 0 };
  boardInitialized: boolean = false;
  currentBackground: string | null = null;
  backgroundHistory: BackgroundHistory[] = [];

  @HostListener('document:keydown', ['$event'])
  async keyDownToken(event: KeyboardEvent) {
    const key = event.key;

    if (key === 'Backspace' && this.selected_token && this.user.owner) {
      this.deleteTokenFromBoard(this.selected_token.id);
      this.selected_token = null;
    }

    if (
      (key === 'ArrowUp' ||
        key === 'ArrowDown' ||
        key === 'ArrowLeft' ||
        key === 'ArrowRight') &&
      this.selected_token
    ) {
      const { row, col } = this.selected_token.position;
      let newRow = row;
      let newCol = col;
      if (event.key === 'ArrowUp') newRow--;
      else if (event.key === 'ArrowDown') newRow++;
      else if (event.key === 'ArrowLeft') newCol--;
      else if (event.key === 'ArrowRight') newCol++;
      if (
        newRow >= 0 &&
        newRow < this.gridRows.length &&
        newCol >= 0 &&
        newCol < this.gridCols.length
      ) {
        const updatedToken = { ...this.selected_token };
        updatedToken.position = {
          row: newRow,
          col: newCol,
          x: newCol * this.cellSize + (this.cellSize - 45) / 2,
          y: newRow * this.cellSize + (this.cellSize - 45) / 2,
        };

        const tokenIndex = this.tokens.findIndex(
          (t) => t.id === updatedToken.id
        );

        if (tokenIndex >= 0) {
          const res = await this.tokensService.moveToken(this.server, updatedToken);
          if(res){
            this.tokens[tokenIndex] = updatedToken
            this.selected_token = updatedToken;
          }
        }
      }
    }
  }

  ngOnInit(): void {
    this.world_id = this.activatedRoute.snapshot.params['id'];
    this.user = this.authService.userToken();
    this.server = io(`${API_URL}/tabletop`, {
      auth: this.authService.userToken(),
      query: { room: this.world_id },
      transports: ['websocket'],
      withCredentials: true,
    });
    this.startEventListeners();
  }

  ngAfterViewInit(): void {
    this.server.emit('getBoardState', this.world_id);
  }

  ngOnDestroy(): void {
    if (this.server) {
      this.server.emit('updateBoardState', {
        room: this.world_id,
        tokens: this.tokens,
      });
      this.server.disconnect();
    }
  }

  startEventListeners() {
    this.server.on('owner_connected', (res) => {
      this.user.owner = res;
    });

    this.server.on('newMessage', (res) => this.handleNewMessage(res));

    this.server.on('loadingChat', (res) => this.loadingChat(res));

    this.server.on('disconnect', () => this.exitWorld());

    this.server.on('boardState', (state) => this.handleBoardState(state));

    this.server.on('backgroundUpdated', (background: string | null) => {
      this.currentBackground = background;
    });

    this.server.on('tokenAdded', (token) => this.handleTokenAdded(token));

    this.server.on('tokenMoved', (event: TokenMoveEvent) =>
      this.handleTokenMoved(event)
    );

    this.server.on('tokenRemoved', (tokenId: string) =>
      this.handleTokenRemoved(tokenId)
    );

    this.server.on('tokenPermissionAdded', ({user, token}) => this.tokenPermissionAdded(user, token));

    this.server.on('tokenPermissionRemoved', ({user, token}) => this.tokenPermissionRemoved(user, token));

    this.server.on('boardInitialized', (isInitialized: boolean) => {
      this.boardInitialized = isInitialized;
      if (!isInitialized) {
        this.initializeBoard();
      }
    });
  }

  toggleMenu() {
    this.menu = !this.menu;
  }

  exitWorld() {
    this.router.navigate(['/']);
  }

  // Board State
  handleBoardState(state: any) {
    if (state && state.tokens && Array.isArray(state.tokens)) {
      this.tokens = state.tokens;
    }
    if (state && state.background) {
      this.currentBackground = state.background;
    }
  }

  initializeBoard() {
    this.tableConfigService.initializeBoard(this.world_id, this.server);
  }

  // Token
  handleTokenAdded(token: Token) {
    const existingIndex = this.tokens.findIndex((t) => t.id == token.id);
    if (existingIndex === -1) {
      this.tokens = [...this.tokens, token];
    }
  }

  handleTokenMoved(event: TokenMoveEvent) {
    const tokenIndex = this.tokens.findIndex((t) => t.id === event.tokenId);
    if (tokenIndex >= 0) {
      const updatedTokens = [...this.tokens];
      updatedTokens[tokenIndex] = {
        ...updatedTokens[tokenIndex],
        position: event.position,
      };
      this.tokens = updatedTokens;
    }
  }

  handleTokenRemoved(tokenId: string) {
    this.tokens = this.tokens.filter((t) => t.id !== tokenId);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  startDragging(event: DragEvent, token: Token) {
    this.draggingToken = token;
    if (!this.draggingToken) {
      this.draggingToken = { ...token };
      event.dataTransfer?.setData('text/plain', token.id);
      event.preventDefault();
    }
  }

  async dropToken(event: DragEvent) {
    event.preventDefault();
    if (!this.draggingToken || !this.gridBoardRef) return;

    const boardRect = this.gridBoardRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - boardRect.left;
    const y = event.clientY - boardRect.top;
    
    const col = Math.floor(x / (this.cellSize * this.zoomLevel));
    const row = Math.floor(y / (this.cellSize * this.zoomLevel));

    if (
      col >= 0 &&
      col < this.gridCols.length &&
      row >= 0 &&
      row < this.gridRows.length
    ) {
      const updatedToken = { ...this.draggingToken };
      updatedToken.position = {
        x: col * this.cellSize + (this.cellSize - 45) / 2,
        y: row * this.cellSize + (this.cellSize - 45) / 2,
        row: row,
        col: col,
      };

      const tokenIndex = this.tokens.findIndex((t) => t.id === updatedToken.id);
      if (tokenIndex >= 0) {
        const response = await this.tokensService.moveToken(this.server, updatedToken);
        if(response) this.tokens[tokenIndex] = updatedToken;
      }
    }

    this.draggingToken = null;
  }

  //zoom
  zoomLevel: number = 1;
  minZoom: number = 0.5;
  maxZoom: number = 4;
  zoomStep: number = 0.1;
  showZoomControls: boolean = false;

  toggleZoomControls() {
    this.showZoomControls = !this.showZoomControls;
  }

  @HostListener('wheel', ['$event'])
  onMouseWheel(event: WheelEvent) {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      const delta = event.deltaY > 0 ? -this.zoomStep : this.zoomStep;
      this.setZoom(this.zoomLevel + delta);
    }
  }

  setZoom(newZoomLevel: number) {
    const clampedZoom = Math.max(this.minZoom, Math.min(this.maxZoom, newZoomLevel));
    
    if (clampedZoom !== this.zoomLevel) {
      this.zoomLevel = clampedZoom;
    }
  }

  resetZoom() {
    this.zoomLevel = 1;
  }

  selectToken(token?: Token) {
    if (!token) this.selected_token = null;
    else this.selected_token = token;
  }

  deleteTokenFromBoard(token: string) {
    this.server.emit('removeToken', token);
  }

  tokenPermissionAdded(user: any, token_id: any) {
    this.tokens = this.tokens.map((token) => {
      if (token.tokenId === token_id) {
        const tokenIdx = this.tokens.findIndex((t) => t.tokenId === token_id);
        if (tokenIdx >= 0) {
          let token = this.tokens[tokenIdx];
          token.players.push({
            username: user.username,
            _id: user._id,
          })
          this.tokens[tokenIdx] = token
        }
      }
      return token;
    }
    );
  }

  tokenPermissionRemoved(user: any, token_id: any) {
    this.tokens = this.tokens.map((token) => {
      if (token.tokenId === token_id) {
        const tokenIdx = this.tokens.findIndex((t) => t.tokenId === token_id);
        if (tokenIdx >= 0) {
          const token = this.tokens[tokenIdx];
          token.players = token.players.filter((player: any) => player._id !== user._id);
          this.tokens[tokenIdx] = token;
        }
      }
      return token;
    });
  }

  // Chat
  loadingChat(data: any) {
    this.chat = [...data.chat];
  }

  checkMessageUser(msg: any) {
    if (msg.user.username == this.user.username) return true;
    return false;
  }

  handleNewMessage(message: any) {
    this.chat.push(message);
  }

  sendNewMessage() {
    this.chatService.sendMessage(this.server, this.message);
    this.message = '';
  }

  handleChatKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.sendNewMessage();
    }
  }

  systemMessageType(type: string) {
    if (type == 'warn') return 'warning-message';
    else if (type == 'danger') return 'danger-message';
    else if (type == 'info') return 'info-message';
    else return '';
  }

  // Configs
  openConfigModal() {
    this.showConfigModal.update(current => true);
  }

  closeConfigModal() {
    this.showConfigModal.update(current => false);
  }

  // Tabletop Configs
  openTabletopConfigModal() {
    this.showTabletopConfigModal.update(current => true);
  }

  closeTabletopConfigModal() {
    this.showTabletopConfigModal.update(current => false);
  }
}
