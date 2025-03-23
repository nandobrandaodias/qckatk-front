import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { API_URL } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor() {}
  router = inject(Router);
  http = inject(HttpClient);
  isAuthenticated: boolean = false

  login(payload: { username: string; password: string }) {
    this.http.post(`${API_URL}/auth`, payload).subscribe({
      next: (res) => {
        this.saveUserToken(res)
        this.router.navigate(['/home'])
      },
    });
  }

  saveUserToken(data: any){
    localStorage.setItem('access_token', JSON.stringify(data))
    this.isAuthenticated = true
  }

  generateHttpHeader(){
    const token = this.userToken()
    const headers = new HttpHeaders({
      Authorization: 'Bearer' + ' ' + token.token
    })
    return headers
  }

  userTokenString(){
    return localStorage.getItem("access_token")
  }

  userToken(): any{
    let user = localStorage.getItem("access_token")
    return user ? JSON.parse(user) : ""
  }

  logout(): void{
    localStorage.removeItem("access_token")
    this.router.navigate(['/'])
    this.isAuthenticated = false
  }

  isAuthenticatedUser(): boolean{
    return this.userToken() ? true : false
  }
}
