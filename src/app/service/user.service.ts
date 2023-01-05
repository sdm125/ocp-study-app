import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { UserToken } from '../model/UserToken';
import { Properties } from '../properties';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private httpClient: HttpClient, private router: Router) {}

  public getUserToken(
    username: string,
    password: string
  ): Observable<UserToken> {
    const form = new FormData();
    form.append('username', username);
    form.append('password', password);

    return this.httpClient
      .post<UserToken>(Properties.LOGIN_ENDPOINT, form)
      .pipe(tap((res) => this.setSession(res)));
  }

  public refreshUserToken(): Observable<UserToken> {
    if (this.isTokenExp(this.getRefreshToken())) {
      this.logout();
    }

    const headers = new HttpHeaders().append(
      'Authorization',
      'Bearer ' + this.getRefreshToken()
    );

    return this.httpClient.post<UserToken>(
      Properties.REFRESH_TOKEN_ENDPOINT,
      null,
      {
        headers: headers,
      }
    );
  }

  public setSession(res: UserToken): void {
    localStorage.setItem('access_token', res.access_token);
    localStorage.setItem('refresh_token', res.refresh_token);
  }

  public isUserLoggedIn(): boolean {
    return localStorage.getItem('access_token') !== null;
  }

  public getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  public getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  public logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.router.navigate(['login']);
  }

  public hasAdminAccess(): any {
    if (!this.isUserLoggedIn()) return;

    const token = this.getToken();
    const extractedToken = token?.split('.')[1];

    if (extractedToken) {
      const data = JSON.parse(atob(extractedToken));
      return data.roles.includes('ROLE_ADMIN');
    }
  }

  public isTokenExp(token: string | null): boolean {
    const extractedToken = token?.split('.')[1];

    if (extractedToken) {
      const data = JSON.parse(atob(extractedToken));
      return data.exp * 1000 < Date.now();
    }

    return true;
  }
}
