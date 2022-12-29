import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { UserToken } from '../model/UserToken';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private httpClient: HttpClient) {}

  public getUserToken(
    username: string,
    password: string
  ): Observable<UserToken> {
    const form = new FormData();
    form.append('username', username);
    form.append('password', password);

    return this.httpClient
      .post<UserToken>('http://localhost:8080/ocp/login', form)
      .pipe(tap((res) => this.setSession(res)));
  }

  private setSession(res: UserToken): void {
    localStorage.setItem('access_token', res.access_token);
    localStorage.setItem('refresh_token', res.refresh_token);
  }

  public isUserLoggedIn(): boolean {
    return localStorage.getItem('access_token') !== null;
  }

  public getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  public logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
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
}
