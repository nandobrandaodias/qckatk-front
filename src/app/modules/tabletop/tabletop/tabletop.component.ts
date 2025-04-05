import { AuthService } from '@/app/shared/modules/auth/auth.service';
import { SharedModule } from '@/app/shared/modules/shared.module';
import { API_URL } from '@/environments/environment';
import { Component, inject, OnInit, ViewChild, ElementRef, OnDestroy, AfterViewInit, HostListener } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { ActivatedRoute, Router } from '@angular/router';

interface Token {
  id: string;
  type: 'character' | 'monster' | 'item';
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

@Component({
  selector: 'app-tabletop',
  imports: [SharedModule],
  templateUrl: './tabletop.component.html',
  styleUrl: './tabletop.component.css'
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
  
  gridRows: number[] = Array.from({ length: 15 }, (_, i) => i);
  gridCols: number[] = Array.from({ length: 20 }, (_, i) => i);
  cellSize: number = 50;
  
  tokens: Token[] = [];
  draggingToken: Token | null = null;
  dragOffset = { x: 0, y: 0 };
  boardInitialized: boolean = false;

  ngOnInit(): void {
    this.world_id = this.activatedRoute.snapshot.params["id"];
    this.user = this.authService.userToken();
    this.server = io(`${API_URL}/tabletop`, {
      auth: this.authService.userToken(),
      query: {room: this.world_id},
      transports: ['websocket'],
      withCredentials: true
    });
    this.startEventListeners();
  }
  
  ngAfterViewInit(): void {
    // pegar estado do board
    this.server.emit('getBoardState', this.world_id);
  }
  
  ngOnDestroy(): void {
    // limpar conexao websocket
    if (this.server) {
      this.server.disconnect();
    }
  }

  startEventListeners() {
    this.server.on('user_connected', (res) => {
      if (this.tokens.length > 0) {
        this.server.emit('updateBoardState', {
          room: this.world_id,
          tokens: this.tokens
        });
      }
    });
    
    this.server.on('newMessage', (res) => this.handleNewMessage(res));
    
    this.server.on('disconnect', () => this.exitWorld());

    this.server.on('loadingChat', (res)=>this.loadingChat(res))

    this.server.on('boardState', (state) => this.handleBoardState(state));
    
    this.server.on('tokenAdded', (token) => this.handleTokenAdded(token));
    
    this.server.on('tokenMoved', (event: TokenMoveEvent) => this.handleTokenMoved(event));
    
    this.server.on('tokenRemoved', (tokenId: string) => this.handleTokenRemoved(tokenId));

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

  handleNewMessage(message: any){
    this.chat.push(message)
  }

  sendNewMessage(){
    if(!this.msg) return
    this.server.emit("message", {content: this.msg})
    this.msg = ''
  }

  toggleMenu() {
    this.menu = !this.menu;
  }

  exitWorld() {
    this.router.navigate(['/']);
  }
  
  // metodos board
  handleBoardState(state: any) {
    if (state && state.tokens && Array.isArray(state.tokens)) {
      this.tokens = state.tokens;
    }
  }
  
  handleTokenAdded(token: Token) {
    // ver se ja existe tokens
    const existingIndex = this.tokens.findIndex(t => t.id === token.id);
    if (existingIndex === -1) {
      this.tokens = [...this.tokens, token];
    }
  }
  
  handleTokenMoved(event: TokenMoveEvent) {
    const tokenIndex = this.tokens.findIndex(t => t.id === event.tokenId);
    if (tokenIndex >= 0) {
      // criar array para confirmar mudanca
      const updatedTokens = [...this.tokens];
      updatedTokens[tokenIndex] = {
        ...updatedTokens[tokenIndex],
        position: event.position
      };
      this.tokens = updatedTokens;
    }
  }
  
  handleTokenRemoved(tokenId: string) {
    this.tokens = this.tokens.filter(t => t.id !== tokenId);
  }
  
  // exemplo de tokens para teste
  addInitialTokens() {
    const characterToken: Token = {
      id: `character-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'character',
      label: 'C',
      position: {
        row: 2,
        col: 3,
        x: 3 * this.cellSize + (this.cellSize - 45) / 2,
        y: 2 * this.cellSize + (this.cellSize - 45) / 2
      },
      ownerId: this.user.id
    };
    
    const monsterToken: Token = {
      id: `monster-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'monster',
      label: 'M',
      position: {
        row: 7,
        col: 10,
        x: 10 * this.cellSize + (this.cellSize - 45) / 2,
        y: 7 * this.cellSize + (this.cellSize - 45) / 2
      },
      ownerId: this.user.id
    };
    
    this.tokens = [characterToken, monsterToken];
    
    // enviar cricao de tokens pro server
    this.server.emit('addToken', { token: characterToken, room: this.world_id });
    this.server.emit('addToken', { token: monsterToken, room: this.world_id });
    
    // marca iniciacao do board
    this.server.emit('initializeBoard', { room: this.world_id });
  }
  
  addToken(type: 'character' | 'monster' | 'item') {
    const newToken: Token = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: type,
      label: type === 'character' ? 'C' : type === 'monster' ? 'M' : 'I',
      position: {
        row: 0,
        col: 0,
        x: (this.cellSize - 45) / 2,
        y: (this.cellSize - 45) / 2
      },
      ownerId: this.user.id
    };
    
    this.tokens = [...this.tokens, newToken];
    
    this.server.emit('addToken', { token: newToken, room: this.world_id });
  }
  
  // movimentacao token
  cursorPosition = { x: 0, y: 0 };
  
  startDragging(event: MouseEvent, token: Token) {
    if (token.ownerId !== this.user.id) return;
    
    if (this.draggingToken) {
      this.dropToken(event);
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
    if (col >= 0 && col < this.gridCols.length && row >= 0 && row < this.gridRows.length) {
      const updatedToken = { ...this.draggingToken };
      updatedToken.position = {
        x: x - this.cellSize / 2,
        y: y - this.cellSize / 2,
        row: row,
        col: col
      };
      
      // Update do token no tokens array
      const tokenIndex = this.tokens.findIndex(t => t.id === updatedToken.id);
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
    
    if (col >= 0 && col < this.gridCols.length && row >= 0 && row < this.gridRows.length) {
      // grudar no grid
      const updatedToken = { ...this.draggingToken };
      updatedToken.position = {
        x: col * this.cellSize + (this.cellSize - 45) / 2,
        y: row * this.cellSize + (this.cellSize - 45) / 2,
        row: row,
        col: col
      };
      
      const tokenIndex = this.tokens.findIndex(t => t.id === updatedToken.id);
      if (tokenIndex >= 0) {
        const updatedTokens = [...this.tokens];
        updatedTokens[tokenIndex] = updatedToken;
        this.tokens = updatedTokens;
        
        this.server.emit('moveToken', {
          tokenId: updatedToken.id,
          position: updatedToken.position,
          room: this.world_id
        });
      }
    }
    
    this.draggingToken = null;
  }

  loadingChat(data: any){
    this.chat = [...data.chat]
  }

  systemMessageType(type: string){
    if(type == 'warn') return 'warning-message'
    else if(type == 'danger') return 'danger-message'
    else if(type == 'info') return 'info-message'
    else return '' 
  }
}
