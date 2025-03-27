import { AuthService } from '@/app/shared/modules/auth/auth.service';
import { SharedModule } from '@/app/shared/modules/shared.module';
import { API_URL } from '@/environments/environment';
import { Component, inject, Input, OnInit } from '@angular/core';;
import { io, Socket } from 'socket.io-client'
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-tabletop',
  imports: [SharedModule],
  templateUrl: './tabletop.component.html',
  styleUrl: './tabletop.component.css'
})
export class TabletopComponent implements OnInit{
  router = inject(Router)
  activatedRoute: ActivatedRoute = inject(ActivatedRoute)
  authService: AuthService = inject(AuthService)
  world_id: string;
  menu: boolean = false;
  server: Socket;
  user: any
  msg = ''
  messages: any[] = []

  ngOnInit(): void {
    this.world_id = this.activatedRoute.snapshot.params["id"];
    this.user = this.authService.userToken()
    this.server = io(`${API_URL}/tabletop`, {
      auth: this.authService.userToken(),
      query: {room: this.world_id},
      transports: ['websocket'],
      withCredentials: true
    })
    this.startEventListeners()
  }

  startEventListeners(){
    this.server.on('user_connected', (res)=>{
      console.log(res)
    });
    this.server.on('newMessage', (res)=>this.handleNewMessage(res))
    this.server.on('disconnect', ()=>this.exitWorld())
  }

  checkMessageUser(msg: any){
    if(msg.user.username == this.user.username) return true
    return false
  }

  handleNewMessage(message: any){
    this.messages.push(message)
  }

  sendNewMessage(){
    if(!this.msg) return
    this.server.emit("message", {content: this.msg})
  }

  toggleMenu(){
    this.menu = !this.menu
  }

  exitWorld(){
    this.router.navigate(['/'])
  }
}
