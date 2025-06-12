import { PrimeNgModule } from '@/app/shared/modules/prime-ng.module';
import { SharedModule } from '@/app/shared/modules/shared.module';
import { TableConfigService } from '@/app/shared/services/tableConfig.service';
import { TokensService } from '@/app/shared/services/tokens.service';
import { Component, inject, Input, model } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Socket } from 'socket.io-client';
import { LabelComponent } from '../../../../shared/components/label/label.component';

interface BackgroundHistory {
  url: string;
  addedAt: Date;
}

@Component({
  selector: 'app-tabletop-config',
  imports: [SharedModule, PrimeNgModule, LabelComponent],
  templateUrl: './tabletop-config.component.html',
  styleUrl: './tabletop-config.component.css',
})
export class TabletopConfigComponent {
  @Input() server: Socket;
  @Input() world_id: string = '';
  @Input() cellSize: number = 50;
  @Input() currentBackground: string | null = null;
  tokensService: TokensService = inject(TokensService);
  tableConfigService: TableConfigService = inject(TableConfigService);
  messageService: MessageService = inject(MessageService);
  visible = model<boolean>(false);

  initListeners() {
    this.server.on('getAllTokens', (tokens) => {
      if (tokens.length === 0) this.tokenList = [];
      else this.tokenList = tokens;
    });

    this.server.on(
      'backgroundHistoryUpdated',
      (history: BackgroundHistory[]) => {
        this.backgroundHistory = history.map((bg) => ({
          ...bg,
          addedAt: new Date(bg.addedAt),
        }));
      }
    );
  }

  ngOnInit() {
    this.initListeners();
    this.server.emit('getAllTokens', this.world_id);
    this.server.emit('getBackgroundHistory', this.world_id);
    this.server.emit('getCurrentBackground', this.world_id);
    this.initTokenForm();
    this.loadTokens();
    this.loadBackgroundHistory();
  }

  closeModal() {
    this.visible.set(false);
  }

  // Tokens
  showNewTokenModal: boolean = false;
  showPlayersListModal: boolean = false;
  showTokenModal: boolean = false;
  tokenList: any[] = [];
  editingToken: string = '';
  allPlayers: any[] = [];
  availablePlayers: any[] = [];
  tokenPlayers: any[] = [];
  tokenTypes = [
    { label: 'Jogadores', value: 'character' },
    { label: 'NPCs', value: 'npc' },
    { label: 'Outros', value: 'others' },
  ];
  selectedPlayer: any = null;
  tokenForm: FormGroup;
  selectedImage: any;

  addToken(token: any) {
    this.tokensService.addTokenToTable(this.server, token, this.cellSize);
  }

  async listTokenPlayers(token: any) {
    const players = await this.tableConfigService.listPlayers(this.server);
    this.tokenPlayers = [...token.players];
    this.editingToken = token.id;
    this.allPlayers = players.allowed_users;
    if (!players.allowed_users) this.availablePlayers = [];
    else
      this.availablePlayers = players.allowed_users.filter(
        (player: any) =>
          this.tokenPlayers.find(
            (tokenPlayer: any) => tokenPlayer._id === player._id
          ) === undefined
      );
  }

  async removePlayerFromToken(user: any, token_id: string) {
    const res = await this.tokensService.removePlayerFromToken(this.server, {
      user,
      token: token_id,
    });
    if (res) {
      this.tokenPlayers = this.tokenPlayers.filter(
        (player: any) => player._id !== user._id
      );
      this.availablePlayers.push(user);
      this.loadTokens();
    }
  }

  async addPlayerToToken(user: any, token_id: string) {
    const res = await this.tokensService.addPlayerToToken(this.server, {
      user: user,
      token: token_id,
    });
    if (res) {
      this.selectedPlayer = null;
      this.tokenPlayers.push(user);
      this.availablePlayers = this.availablePlayers.filter(
        (player: any) => player._id !== user._id
      );
      this.loadTokens();
    }
  }

  openTokenModal() {
    this.showTokenModal = true;
    this.loadTokens();
  }

  openPlayersList(token: any) {
    this.showPlayersListModal = true;
    this.listTokenPlayers(token);
  }

  closeTokenPlayersList() {
    this.showNewTokenModal = false;
    this.selectedPlayer = null;
    this.tokenPlayers = [];
    this.availablePlayers = [];
  }

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
    this.tokenPlayers = []
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

      const response = await this.tokensService.saveToken(
        this.server,
        tokenData
      );
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
    }
  }

  async updateToken() {
    if (this.tokenForm.valid && this.selectedImage) {
      const tokenData = {
        ...this.tokenForm.value,
        players: this.tokenPlayers,
        image: this.selectedImage,
      };
      try {
        const response = await this.server
          .timeout(500)
          .emitWithAck('updateToken', {
            token: tokenData,
          });

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
      } catch (error) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao atualziar o token',
        });
      }
    }
  }

  loadTokens() {
    this.tokensService.loadTokens(this.server, this.world_id);
  }

  editToken(token: any) {
    this.editingToken = token.id || '';
    this.tokenPlayers = token.players || [];
    this.tokenForm.patchValue(token);
    this.selectedImage = token.image;
    this.showNewTokenModal = true;
  }

  async deleteToken(token: string) {
    const res = await this.tokensService.deleteToken(this.server, token);
    if (res) {
      this.loadTokens();
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Token deletado com sucesso',
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao deletar o token',
      });
    }
  }

  // Background
  backgroundHistory: BackgroundHistory[] = [];
  showEditBackgroundDialog: boolean = false;
  editingBackgroundName: string = '';
  editingBackground: any = null;

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
      name: this.editingBackgroundName,
    };

    this.tableConfigService.updateBackgroundName(
      this.server,
      updatedBackground
    );

    this.showEditBackgroundDialog = false;
    this.editingBackground = null;
    this.editingBackgroundName = '';
  }

  async loadBackgroundHistory() {
    try {
      const response = await this.tableConfigService.loadBackgroundHistory(
        this.server
      );

      if (response) {
        this.backgroundHistory = response.map((bg: any) => ({
          ...bg,
          addedAt: new Date(bg.addedAt),
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
      const response = await this.tableConfigService.removeBackground(
        this.server
      );

      if (response) {
        this.currentBackground = null;

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
        const response = await this.tableConfigService.updateBackground(
          this.server,
          this.currentBackground
        );

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
        this.currentBackground = null;
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
