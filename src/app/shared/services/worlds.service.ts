import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WorldsService {
    http = inject(HttpClient);

  create(payload: any){
    return this.http.post(`${API_URL}/worlds`, payload)
  }

  join(id: string, payload: any){
    return this.http.post(`${API_URL}/worlds/join/${id}`, payload)
  }

  list(){
    return this.http.get(`${API_URL}/worlds`)
  }

  listMine(){
    return this.http.get(`${API_URL}/worlds/mine`)
  }

  findByCode(code: string){
    return this.http.get(`${API_URL}/worlds/code/${code}`)
  }
}
