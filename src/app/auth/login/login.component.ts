import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass']
})
export class LoginComponent implements OnInit {

  public readonly FORM_FIELD_USERNAME = 'username';
  public readonly FORM_FIELD_PASSWORD = 'password';

  public form = new FormGroup({
    [this.FORM_FIELD_USERNAME]: new FormControl('', [
      Validators.required,
      Validators.email,
    ]),
    [this.FORM_FIELD_PASSWORD]: new FormControl('', [
      Validators.required,
    ]),
  });

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
  }

  get userNameControl(): AbstractControl {
    return this.form.controls[this.FORM_FIELD_USERNAME];
  }

  get passwordControl(): AbstractControl {
    return this.form.controls[this.FORM_FIELD_PASSWORD];
  }

  public isInvalidFormField(formFieldName: string): boolean {
    return this.form.controls[formFieldName].invalid && this.form.controls[formFieldName].touched;
  }

  public onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.authService.login(
      {
        username: this.userNameControl.value,
        password: this.passwordControl.value,
      }
    ).subscribe(() => this.router.navigate(['/']));
  }
}
