import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HttpErrorResponse
} from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { catchError, filter, map, switchMap, take, tap } from 'rxjs/operators';
import { Tokens } from '../tokens';


@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  private readonly HTTP_UNAUTHORIZED = 401;

  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(public authService: AuthService) {
  }

  private static addAuthorizationHeader(request: HttpRequest<unknown>, jwtToken: string): HttpRequest<unknown> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${jwtToken}`,
      }
    });
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (this.authService.isLoggedIn()) {
      request = TokenInterceptor.addAuthorizationHeader(request, this.authService.getJwtToken() as string);
    }
    return next.handle(request).pipe(
      catchError(error => {
        return error instanceof HttpErrorResponse && error.status === this.HTTP_UNAUTHORIZED
          ? this.handle401Error(request, next)
          : throwError(error);
      })
    );
  }

  private handle401Error(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      // do not refresh if 401 generated by POST api/login
      return this.authService.refreshToken().pipe(
        tap(() => this.isRefreshing = false),
        filter(token => token !== null),
        map(token => token as Tokens),
        tap(({token: jwtToken}) => this.refreshTokenSubject.next(jwtToken)),
        switchMap(({token: jwtToken}) => next.handle(TokenInterceptor.addAuthorizationHeader(request, jwtToken))),
      );
    }

    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      map(token => token as string),
      take(1),
      switchMap(jwtToken => next.handle(TokenInterceptor.addAuthorizationHeader(request, jwtToken))),
    );
  }
}
