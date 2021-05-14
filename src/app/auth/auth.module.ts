import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AuthService } from './service/auth.service';
import { AuthGuard } from './guard/auth.guard';
import { TokenInterceptor } from './interceptor/token.interceptor';
import { LoginComponent } from './login/login.component';
import { AnonymousGuard } from './guard/anonymous.guard';
import { LogoutComponent } from './logout/logout.component';


@NgModule({
  declarations: [LoginComponent, LogoutComponent],
  providers: [
    AuthGuard,
    AnonymousGuard,
    AuthService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    RouterModule,
  ]
})
export class AuthModule {
}
