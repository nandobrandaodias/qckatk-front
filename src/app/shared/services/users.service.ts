import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../modules/auth/auth.service';
import { API_URL } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  http = inject(HttpClient);
  router = inject(Router);
  authService = inject(AuthService);

  signUp(payload: any) {
    this.http.post(`${API_URL}/users`, payload).subscribe({
      next: (res)=>{
        this.authService.saveUserToken(res)
        this.router.navigate(['/home'])
      },
      error: (e)=> {
        console.log(e)
        return false
      }
    })
  }

  getUserInfo(){
    return this.http.get(`${API_URL}/users/me`)
  }
}
