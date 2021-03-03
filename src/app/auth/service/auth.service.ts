import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { config } from '../../config';
import { catchError, mapTo, tap } from 'rxjs/operators';
import { Tokens } from '../tokens';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly LOCAL_STORAGE_KEY_JWT_TOKEN = `JWT_TOKEN`;
  private readonly LOCAL_STORAGE_KEY_REFRESH_TOKEN = `REFRESH_TOKEN`;
  private loggedUser: string | null = null;

  constructor(private httpClient: HttpClient) {
  }

  public login(credentials: { username: string, password: string }): Observable<boolean> {
    return this.httpClient.post<Tokens>(`${config.apiUrl}/login`, credentials).pipe(
      tap(tokens => this.doLoginUser(credentials.username, tokens)),
      mapTo(true),
      catchError(error => {
        console.error('failed to login, error: ', error.error);
        return of(false);
      })
    );
  }

  public logout(): Observable<boolean> {
    return this.httpClient.post(`${config.apiUrl}/logout`, {
      refreshToken: this.getRefreshToken(),
    }).pipe(
      tap(() => this.doLogoutUser()),
      mapTo(true),
      catchError(error => {
        console.error('failed to logout, error: ', error.error);
        return of(false);
      }),
    );
  }

  public refreshToken(): Observable<Tokens | null> {
    return this.httpClient.post<Tokens>(`${config.apiUrl}/token/refresh`, {
      refreshToken: this.getRefreshToken(),
    }).pipe(
      tap(tokens => this.storeTokens(tokens)),
      catchError(error => {
        console.error('failed to refresh token, error: ', error.error);
        return of(null);
      }),
    );
  }

  public isLoggedIn(): boolean {
    return this.getJwtToken() !== null;
  }

  public getJwtToken(): string | null {
    return localStorage.getItem(this.LOCAL_STORAGE_KEY_JWT_TOKEN);
  }

  private doLoginUser(username: string, tokens: Tokens): void {
    console.log(`do login user ${username}`, tokens);
    this.loggedUser = username;
    this.storeTokens(tokens);
  }

  private doLogoutUser(): void {
    this.loggedUser = null;
    this.removeTokens();
  }

  private storeTokens(tokens: Tokens): void {
    localStorage.setItem(this.LOCAL_STORAGE_KEY_JWT_TOKEN, tokens.token);
    localStorage.setItem(this.LOCAL_STORAGE_KEY_REFRESH_TOKEN, tokens.refresh_token);
  }

  private removeTokens(): void {
    localStorage.removeItem(this.LOCAL_STORAGE_KEY_JWT_TOKEN);
    localStorage.removeItem(this.LOCAL_STORAGE_KEY_REFRESH_TOKEN);
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem(this.LOCAL_STORAGE_KEY_REFRESH_TOKEN);
  }
}
