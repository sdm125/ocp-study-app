import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
    const access_token = this.userService.getToken();

    if (access_token) {
      const cloned = req.clone({
        headers: req.headers.set('Authorization', 'Bearer ' + access_token),
      });
      return next.handle(cloned);
    } else {
      return next.handle(req);
    }
  }
}
