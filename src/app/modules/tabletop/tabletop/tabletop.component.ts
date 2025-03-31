import { AuthService } from '@/app/shared/modules/auth/auth.service';
import { SharedModule } from '@/app/shared/modules/shared.module';
import { API_URL } from '@/environments/environment';
import { Component, inject, Input, OnInit, ViewChild, ElementRef, OnDestroy, AfterViewInit, HostListener } from '@angular/core';
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

  router = inject(Router);
  activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  authService: AuthService = inject(AuthService);
  
  world_id: string = '';
  menu: boolean = false;
  server: Socket;
  user: any;
  msg: string = '';
  messages: any[] = [];
  
  // Grid configuration
  gridRows: number[] = Array.from({ length: 15 }, (_, i) => i);
  gridCols: number[] = Array.from({ length: 20 }, (_, i) => i);
  cellSize: number = 50;
  
  // Tokens
  tokens: Token[] = [];
  draggingToken: Token | null = null;
  dragOffset = { x: 0, y: 0 };
  boardInitialized: boolean = false;
  
  constructor() {
    this.server = io(''); // Placeholder initialization to be replaced in ngOnInit
  }

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
    // Request current board state after view is initialized
    this.server.emit('getBoardState', this.world_id);
  }
  
  ngOnDestroy(): void {
    // Clean up socket connection
    if (this.server) {
      this.server.disconnect();
    }
  }

  startEventListeners() {
    this.server.on('user_connected', (res) => {
      console.log('User connected:', res);
      // When a new user connects, emit the current board state
      if (this.tokens.length > 0) {
        this.server.emit('updateBoardState', {
          room: this.world_id,
          tokens: this.tokens
        });
      }
    });
    
    this.server.on('newMessage', (res) => this.handleNewMessage(res));
    
    this.server.on('disconnect', () => this.exitWorld());
    
    // Board-specific events
    this.server.on('boardState', (state) => this.handleBoardState(state));
    
    this.server.on('tokenAdded', (token) => this.handleTokenAdded(token));
    
    this.server.on('tokenMoved', (event: TokenMoveEvent) => this.handleTokenMoved(event));
    
    this.server.on('tokenRemoved', (tokenId: string) => this.handleTokenRemoved(tokenId));

    // Listen for the board initialization flag
    this.server.on('boardInitialized', (isInitialized: boolean) => {
      this.boardInitialized = isInitialized;
      if (!isInitialized) {
        // If the board isn't initialized, this client is the first one,
        // so add the initial tokens
        this.addInitialTokens();
      }
    });
  }
  
  // Chat-related methods
  checkMessageUser(msg: any) {
    if (msg.user.username == this.user.username) return true;
    return false;
  }

  handleNewMessage(message: any) {
    this.messages.push(message);
  }

  sendNewMessage() {
    if (!this.msg) return;
    this.server.emit("message", {content: this.msg});
    this.msg = '';
  }

  toggleMenu() {
    this.menu = !this.menu;
  }

  exitWorld() {
    this.router.navigate(['/']);
  }
  
  // Board-related methods
  handleBoardState(state: any) {
    console.log('Received board state:', state);
    if (state && state.tokens && Array.isArray(state.tokens)) {
      this.tokens = state.tokens;
    }
  }
  
  handleTokenAdded(token: Token) {
    console.log('Token added:', token);
    // Check if token already exists
    const existingIndex = this.tokens.findIndex(t => t.id === token.id);
    if (existingIndex === -1) {
      this.tokens = [...this.tokens, token];
    }
  }
  
  handleTokenMoved(event: TokenMoveEvent) {
    console.log('Token moved:', event);
    const tokenIndex = this.tokens.findIndex(t => t.id === event.tokenId);
    if (tokenIndex >= 0) {
      // Create a new array to ensure change detection
      const updatedTokens = [...this.tokens];
      updatedTokens[tokenIndex] = {
        ...updatedTokens[tokenIndex],
        position: event.position
      };
      this.tokens = updatedTokens;
    }
  }
  
  handleTokenRemoved(tokenId: string) {
    console.log('Token removed:', tokenId);
    this.tokens = this.tokens.filter(t => t.id !== tokenId);
  }
  
  // Add random character and monster tokens as examples
  addInitialTokens() {
    // Add a character token
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
    
    // Add a monster token
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
    
    // Emit token addition events to server
    this.server.emit('addToken', { token: characterToken, room: this.world_id });
    this.server.emit('addToken', { token: monsterToken, room: this.world_id });
    
    // Mark the board as initialized
    this.server.emit('initializeBoard', { room: this.world_id });
  }
  
  // Add new token at default position
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
    
    // Emit token addition event to server
    this.server.emit('addToken', { token: newToken, room: this.world_id });
  }
  
  // Token dragging functionality
  startDragging(event: MouseEvent, token: Token) {
    // Only allow dragging tokens owned by the current user
    if (token.ownerId !== this.user.id) return;
    
    this.draggingToken = { ...token };
    
    const tokenElement = event.target as HTMLElement;
    const rect = tokenElement.getBoundingClientRect();
    
    this.dragOffset = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    
    event.preventDefault();
  }
  
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.draggingToken || !this.gridBoardRef) return;
    
    const boardRect = this.gridBoardRef.nativeElement.getBoundingClientRect();
    
    // Calculate position relative to the board
    const x = event.clientX - boardRect.left - this.dragOffset.x;
    const y = event.clientY - boardRect.top - this.dragOffset.y;
    
    // Calculate grid coordinates
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);
    
    // Ensure the token stays within the grid boundaries
    if (col >= 0 && col < this.gridCols.length && row >= 0 && row < this.gridRows.length) {
      // Create a new token object to ensure change detection
      const updatedToken = { ...this.draggingToken };
      updatedToken.position = {
        x: col * this.cellSize + (this.cellSize - 45) / 2,
        y: row * this.cellSize + (this.cellSize - 45) / 2,
        row: row,
        col: col
      };
      
      // Update the token in the tokens array
      const tokenIndex = this.tokens.findIndex(t => t.id === updatedToken.id);
      if (tokenIndex >= 0) {
        const updatedTokens = [...this.tokens];
        updatedTokens[tokenIndex] = updatedToken;
        this.tokens = updatedTokens;
        this.draggingToken = updatedToken;
      }
    }
  }
  
  @HostListener('document:mouseup')
  onMouseUp() {
    if (this.draggingToken) {
      // Emit token moved event with room information
      this.server.emit('moveToken', {
        tokenId: this.draggingToken.id,
        position: this.draggingToken.position,
        room: this.world_id
      });
      
      this.draggingToken = null;
    }
  }
  
  // Handle grid cell click - useful for placing tokens
  handleCellClick(row: number, col: number) {
    console.log(`Cell clicked: row ${row}, col ${col}`);
    // You can implement additional functionality here
  }
}