import { PrimeNgModule } from '@/app/shared/modules/prime-ng.module';
import { SharedModule } from '@/app/shared/modules/shared.module';
import { TableConfigService } from '@/app/shared/services/tableConfig.service';
import { WorldsService } from '@/app/shared/services/worlds.service';
import { Component, inject, Input, model } from '@angular/core';
import { Socket } from 'socket.io-client';

@Component({
  selector: 'app-config',
  imports: [PrimeNgModule, SharedModule],
  templateUrl: './config.component.html',
  styleUrl: './config.component.css'
})
export class ConfigComponent {
  @Input() world_id: string = ''
  @Input() server: Socket;
  @Input() owner: boolean;
  worldService: WorldsService = inject(WorldsService)
  tableConfigService: TableConfigService = inject(TableConfigService)
  visible = model<boolean>(false);
  world: any = {}

  playerList: any[] = []

  ngOnInit() {
    if(this.world) this.worldService.showWorldInfo(this.world_id).subscribe({
      next: (r) => this.world = r,
      error: (e) => console.error(e)
    })

    this.tableConfigService.listAllPlayersStatus(this.server).then((r: any) => {
      this.playerList = r;
    }).catch((e) => {
      console.error('Erro ao listar os jogadores:', e);
    });
  }

  startListeners(){}

  test(){}

  closeModal() {
    this.visible.set(false);
  }
}
