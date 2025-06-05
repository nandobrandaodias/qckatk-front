import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokensService {
  constructor() {}

  addTokenToTable(server: any, token: any, cellSize: number) {
    const newToken = {
      id: `${token.id}-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      name: token.name,
      tokenId: token.id,
      type: token.type,
      players: token.players,
      label: token.image || '',
      position: {
        row: 0,
        col: 0,
        x: (cellSize - 45) / 2,
        y: (cellSize - 45) / 2,
      },
      stats: {
        maxhp: token.maxhp ?? 1,
        hp: token.hp ?? 1,
      }
    };

    server.emit('addToken', { token: newToken });
  }

  async moveToken(server: any, token: any) {
    const response = await server.timeout(1000).emitWithAck('moveToken', {
      tokenId: token.id,
      position: token.position,
    });
    return response;
  }

  async saveToken(server: any, token: any) {
    try {
      const response = await server
        .timeout(500)
        .emitWithAck('createToken', token);
      return response;
    } catch (error) {
      return null;
    }
  }

  async loadTokens(server: any, world_id: string) {
    return await server.emit('listToken', world_id);
  }

  async deleteToken(server: any, token: string) {
    return await server.timeout(500).emitWithAck('deleteToken', token);
  }

  async removePlayerFromToken(server: any, data: any) {
    return await server.timeout(500).emitWithAck('removeTokenPermission', data);
  }
  
  async addPlayerToToken(server: any, data: any) {
    return await server.timeout(500).emitWithAck('addTokenPermission', data);
  }
}
