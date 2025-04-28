import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor() { }

  sendMessage(server: any, message: string){
    if (!message) return;
    server.emit('message', { content: message });
  }
}
