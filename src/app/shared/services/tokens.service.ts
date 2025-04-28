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
      },
    };

    server.emit('addToken', { token: newToken });
  }

  dropTokenOnTable(server: any, token: any) {
    server.emit('dropToken', { tokenId: token.id, position: token.position });
  }

  async saveToken(server: any, token: any) {
    try {
      const response = await server
        .timeout(500)
        .emitWithAck('createToken', token);
  
      return response;
    } 
    catch (error) {
      return null
    }
  }

  async loadTokens(server: any, world_id: string) {
    return await server.emit('listToken', world_id);
  }

  async deleteToken(server: any, token: string) {
    return await server
    .timeout(500)
    .emitWithAck('deleteToken', token);
  }
}
