import {
  HttpErrorResponse,
  HttpHandler,
  HttpInterceptorFn,
} from '@angular/common/http';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  if (authService.isAuthenticatedUser()) {
    const authReq = req.clone({headers: authService.generateHttpHeader()});
    return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 405) authService.logout();
        return throwError(() => error);
      })
    );
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 || error.status === 405) authService.logout();
      return throwError(() => error);
    })
  );
};
