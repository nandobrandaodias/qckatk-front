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
} from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { LabelComponent } from '../../../shared/components/label/label.component';
import { MessageService } from 'primeng/api';

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
  imports: [SharedModule, LabelComponent],
  templateUrl: './tabletop.component.html',
  styleUrl: './tabletop.component.css',
})
export class TabletopComponent implements OnInit, OnDestroy, AfterViewInit {

  
  @ViewChild('gridBoard') gridBoardRef!: ElementRef;
  @ViewChild('chatElement') chatElement: ElementRef<HTMLDivElement>;

  router = inject(Router);
  activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  authService: AuthService = inject(AuthService);
  world_id: string = '';
  menu: boolean = false;
  server: Socket;
  user: any;
  msg: string = '';
  chat: any[] = [];

  showTokenModal: boolean = false;
  showTokenDialog: boolean = false;
  showNewTokenModal: boolean = false;

  tokenList: any[] = [];
  editingToken: string = '';
  availablePlayers: any[] = [];

  gridRows: number[] = Array.from({ length: 15 }, (_, i) => i);
  gridCols: number[] = Array.from({ length: 20 }, (_, i) => i);
  cellSize: number = 50;

  tokens: any[] = [];
  draggingToken: Token | null = null;
  dragOffset = { x: 0, y: 0 };
  boardInitialized: boolean = false;
  tokenForm: FormGroup;
  selectedImage: any;
  messageService: MessageService = inject(MessageService);

  currentBackground: string | null = null;
  backgroundHistory: BackgroundHistory[] = [];
  showEditBackgroundDialog: boolean = false;
  editingBackgroundName: string = '';
  editingBackground: any = null;

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
    this.initTokenForm();
    this.loadBackgroundHistory();
  }

  ngAfterViewInit(): void {
    // pegar estado do board
    this.server.emit('getBoardState', this.world_id);
  }

ngOnDestroy(): void {
    if (this.server) {
      this.server.emit('updateBoardState', {
        room: this.world_id,
        tokens: this.tokens
      });
      this.server.disconnect();
    }
    window.removeEventListener('beforeunload', this.handleBeforeUnload.bind(this));
  }

  private handleBeforeUnload(event: BeforeUnloadEvent) {
    // salvar o board quando sair (talvez n esteja funcionando)*2
    if (this.server && this.tokens.length > 0) {
      this.server.emit('updateBoardState', {
        room: this.world_id,
        tokens: this.tokens
      });
    }
  }

  
  startEventListeners() {
    this.server.on('user_connected', (res) => {
    });

    this.server.on('newMessage', (res) => this.handleNewMessage(res));

    this.server.on('disconnect', () => this.exitWorld());

    this.server.on('loadingChat', (res) => this.loadingChat(res));

    this.server.on('boardState', (state) => this.handleBoardState(state));

    // Add this new listener
    this.server.on('backgroundHistoryUpdated', (history: BackgroundHistory[]) => {
      this.backgroundHistory = history.map(bg => ({
        ...bg,
        addedAt: new Date(bg.addedAt)
      }));
    });

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

    this.server.on('getAllTokens', (tokens) => (this.tokenList = tokens));

    // ver criacao do board
    this.server.on('boardInitialized', (isInitialized: boolean) => {
      this.boardInitialized = isInitialized;
      if (!isInitialized) {
        this.addInitialTokens();
      }
    });
  }

  // metodos chat
  checkMessageUser(msg: any) {
    if (msg.user.username == this.user.username) return true;
    return false;
  }

  handleNewMessage(message: any) {
    this.chat.push(message);
  }

  sendNewMessage() {
    if (!this.msg) return;
    this.server.emit('message', { content: this.msg });
    this.msg = '';
  }

  toggleMenu() {
    this.menu = !this.menu;
  }

  exitWorld() {
    this.router.navigate(['/']);
  }

  handleBoardState(state: any) {
    if (state && state.tokens && Array.isArray(state.tokens)) {
      this.tokens = state.tokens;
    }
    if (state && state.background) {
      this.currentBackground = state.background;
    }
  }

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

  addInitialTokens() {
    const characterToken = {
      id: `character-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'character',
      label: 'C',
      position: {
        row: 2,
        col: 3,
        x: 3 * this.cellSize + (this.cellSize - 45) / 2,
        y: 2 * this.cellSize + (this.cellSize - 45) / 2,
      },
      ownerId: this.user.id,
    };

    const monsterToken = {
      id: `monster-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'monster',
      label: 'M',
      position: {
        row: 7,
        col: 10,
        x: 10 * this.cellSize + (this.cellSize - 45) / 2,
        y: 7 * this.cellSize + (this.cellSize - 45) / 2,
      },
      ownerId: this.user.id,
    };

    this.tokens = [characterToken, monsterToken];
    this.server.emit('initializeBoard', { room: this.world_id });
  }

  addToken(token: any) {
    const newToken = {
      id: `${token.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tokenId: token.id,
      type: token.type,
      label: token.image || '',
      position: {
        row: 0,
        col: 0,
        x: (this.cellSize - 45) / 2,
        y: (this.cellSize - 45) / 2,
      },
      ownerId: this.user.id,
    };

    this.tokens = [...this.tokens, newToken];

    this.server.emit('addToken', { token: newToken, room: this.world_id });
  }

  // movimentacao token
  cursorPosition = { x: 0, y: 0 };

  startDragging(event: MouseEvent, token: Token) {
    if (this.draggingToken) {
      this.dropToken(event);
      event.preventDefault();
    } else {
      this.draggingToken = { ...token };
      event.preventDefault();
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.draggingToken || !this.gridBoardRef) return;

    const boardRect = this.gridBoardRef.nativeElement.getBoundingClientRect();

    const x = event.clientX - boardRect.left;
    const y = event.clientY - boardRect.top;

    this.cursorPosition = { x, y };

    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);

    // manter dentro do grid
    if (
      col >= 0 &&
      col < this.gridCols.length &&
      row >= 0 &&
      row < this.gridRows.length
    ) {
      const updatedToken = { ...this.draggingToken };
      updatedToken.position = {
        x: x - this.cellSize / 2,
        y: y - this.cellSize / 2,
        row: row,
        col: col,
      };

      // Update do token no tokens array
      const tokenIndex = this.tokens.findIndex((t) => t.id === updatedToken.id);
      if (tokenIndex >= 0) {
        const updatedTokens = [...this.tokens];
        updatedTokens[tokenIndex] = updatedToken;
        this.tokens = updatedTokens;
        this.draggingToken = updatedToken;
      }
    }
  }

  dropToken(event: MouseEvent) {
    if (!this.draggingToken || !this.gridBoardRef) return;

    const boardRect = this.gridBoardRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - boardRect.left;
    const y = event.clientY - boardRect.top;

    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);

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
        const updatedTokens = [...this.tokens];
        updatedTokens[tokenIndex] = updatedToken;
        this.tokens = updatedTokens;

        this.server.emit('moveToken', {
          tokenId: updatedToken.id,
          position: updatedToken.position,
          room: this.world_id,
        });
      }
    }

    this.draggingToken = null;
  }

  loadingChat(data: any) {
    this.chat = [...data.chat];
  }

  systemMessageType(type: string) {
    if (type == 'warn') return 'warning-message';
    else if (type == 'danger') return 'danger-message';
    else if (type == 'info') return 'info-message';
    else return '';
  }

  
  onTabChange(event: any) {
    if (event.index === 1) {
      this.loadBackgroundHistory();
    }
  }
  
  tokenTypes = [
    { label: 'Jogadores', value: 'character' },
    { label: 'NPCs', value: 'npc' },
    { label: 'Outros', value: 'others' },
  ];

  initTokenForm() {
    this.tokenForm = new FormGroup({
      id: new FormControl(''),
      name: new FormControl('', [Validators.required]),
      type: new FormControl('', [Validators.required]),
    });
  }

  openNewTokenModal() {
    this.showNewTokenModal = true;
    this.editingToken = '';
    this.initTokenForm();
    this.selectedImage = null;
  }

  closeNewTokenModal() {
    this.showNewTokenModal = false;
    this.tokenForm.reset();
    this.selectedImage = null;
  }

  onImageSelect(event: any) {
    const file = event.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImage = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async saveToken() {
    if (this.tokenForm.valid && this.selectedImage) {
      const tokenData = {
        ...this.tokenForm.value,
        image: this.selectedImage,
      };
      
      try {
        const response = await this.server
          .timeout(500)
          .emitWithAck('createToken', tokenData);

        if (response) {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Token criado com sucesso',
          });
          this.closeNewTokenModal();
          this.loadTokens();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao salvar o token',
          });
        }
      } catch (error) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao salvar o token',
        });
      }
    }
  }

openTokenModal() {
  this.showTokenModal = true;
  this.loadTokens();
  this.loadBackgroundHistory();
}

  async updateToken() {
    if (this.tokenForm.valid && this.selectedImage) {
      const tokenData = {
        ...this.tokenForm.value,
        image: this.selectedImage,
      };
      try {
        const response = await this.server
          .timeout(500)
          .emitWithAck('updateToken', {
            token: tokenData
          })

          if (response) {
            this.closeNewTokenModal();
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Token atualizado com sucesso',
            });
            this.loadTokens();
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao atualziar o token',
            });
          }
      }
      catch (error) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao atualziar o token',
        });
      }
    }
  }

  loadTokens() {
    this.server.emit('listToken', this.world_id);
  }

  editToken(token: any) {
    this.editingToken = token.id || '';
    this.tokenForm.patchValue(token);
    this.selectedImage = token.image;
    this.showNewTokenModal = true;
  }

  async deleteToken(token: string) {
    const res = await this.server.timeout(500).emitWithAck('deleteToken', token);
    if(res){
      this.loadTokens();
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Token deletado com sucesso',
      });
    }
    else this.messageService.add({
      severity:'error',
      summary: 'Erro',
      detail: 'Erro ao deletar o token',
    });
  }

  editBackgroundName(background: any) {
    this.editingBackground = background;
    this.editingBackgroundName = background.name;
    this.showEditBackgroundDialog = true;
  }
  
  saveBackgroundName() {
    if (!this.editingBackgroundName.trim() || !this.editingBackground) {
      return;
    }
  
    const updatedBackground = {
      ...this.editingBackground,
      name: this.editingBackgroundName
    };
  
    this.server.emit('updateBackgroundName', {
      background: updatedBackground,
      room: this.world_id
    });
  
    this.showEditBackgroundDialog = false;
    this.editingBackground = null;
    this.editingBackgroundName = '';
  }

  async loadBackgroundHistory() {
    try {
      const response = await this.server
        .timeout(500)
        .emitWithAck('getBackgroundHistory', { room: this.world_id });
      
      if (response) {
        this.backgroundHistory = response.map((bg: any) => ({
          ...bg,
          addedAt: new Date(bg.addedAt)
        }));
      }
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao carregar histórico de backgrounds',
      });
    }
  }

  
async removeBackground() {
  try {
    const response = await this.server
      .timeout(500)
      .emitWithAck('removeBackground', {
        room: this.world_id,
      });

    if (response) {
      this.currentBackground = null;
      
      // Update board state after removing background
      this.server.emit('updateBoardState', {
        room: this.world_id,
        tokens: this.tokens,
        background: null
      });

      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Background removido com sucesso',
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao remover o background',
      });
    }
  } catch (error) {
    this.messageService.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Erro ao remover o background',
    });
  }
}
  
onBackgroundSelect(event: any) {
  const file = event.files[0];
  if (file) {
    // Check file size (1MB limit)
    if (file.size > 1048576) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Arquivo muito grande. Máximo 1MB.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e: any) => {
      try {
        this.currentBackground = e.target.result;
        await this.updateBackground();
      } catch (error) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao atualizar o background. Tente novamente.',
        });
      }
    };
    reader.onerror = () => {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao ler o arquivo. Tente novamente.',
      });
    };
    reader.readAsDataURL(file);
  }
}

async updateBackground() {
  if (this.currentBackground) {
    try {
      const response = await this.server
        .timeout(2000) // Using the 2 second timeout
        .emitWithAck('updateBackground', {
          background: this.currentBackground,
          room: this.world_id,
        });

      if (response) {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Background atualizado com sucesso',
        });
      } else {
        throw new Error('Failed to update background');
      }
    } catch (error) {
      this.currentBackground = null; // Reset on error
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao atualizar o background. Tente novamente.',
      });
      }
    }
  }

  async useBackgroundFromHistory(backgroundUrl: string) {
    this.currentBackground = backgroundUrl;
    await this.updateBackground();
  }
 
}

