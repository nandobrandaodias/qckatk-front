import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TableConfigService {

  constructor() { }

  initializeBoard(world: string, server: any){
    server.emit('initializeBoard', world);    
  }

  updateBackgroundName(server: any, background: any){
    server.emit('updateBackgroundName', {
      background: background,
    });
  }

  async loadBackgroundHistory(server: any){
    return await server
        .timeout(500)
        .emitWithAck('getBackgroundHistory');
  }

  async removeBackground(server: any){
    return await server
      .timeout(500)
      .emitWithAck('removeBackground');
  }

  async updateBackground(server: any, background: any){
    return await server
        .timeout(2000)
        .emitWithAck('updateBackground', {
          background: background,
        });
  }

  async listPlayers(server: any){
    return await server
        .timeout(500)
        .emitWithAck('listAllPlayers');
  }
}
