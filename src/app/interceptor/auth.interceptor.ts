import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { UserService } from '../service/user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthInterceptor implements HttpInterceptor {
  constructor(private userService: UserService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (req.url.includes('login') || req.url.includes('token/refresh')) {
      return next.handle(req);
    }

    const access_token = this.userService.getToken();
    if (access_token) {
      return next.handle(this.getClonedReq(req, access_token)).pipe(
        catchError((err) => {
          if (err.status === 403) {
            return this.handleRefreshToken(req, next);
          }
          return of();
        })
      );
    } else {
      return next.handle(req);
    }
  }

  handleRefreshToken(req: HttpRequest<any>, next: HttpHandler) {
    return this.userService.refreshUserToken().pipe(
      switchMap((res) => {
        this.userService.setSession(res);
        return next.handle(this.getClonedReq(req, this.userService.getToken()));
      })
    );
  }

  getClonedReq(
    req: HttpRequest<any>,
    access_token: string | null
  ): HttpRequest<any> {
    return req.clone({
      headers: req.headers.set('Authorization', 'Bearer ' + access_token),
    });
  }
}
