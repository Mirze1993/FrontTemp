import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NzInputModule} from 'ng-zorro-antd/input';
import {LoginUserReq} from '../../models/AppUser';
import {UserService} from '../../services/api/user.service';
import {AuthService} from '../../stores/auth/auth.service';
import {Router} from '@angular/router';
import {NgIf} from '@angular/common';
import {NzNotificationService} from 'ng-zorro-antd/notification';
import {NzSpinComponent} from 'ng-zorro-antd/spin';
import {GlobalStore} from '../../stores/auth/global.store';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, NzInputModule, NgIf, NzSpinComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {

  constructor(private fb: FormBuilder,
              private userService: UserService,
              private authService: AuthService,
              private router: Router,
              private notification: NzNotificationService,
              private globalStore: GlobalStore) {
  }

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      email: [null, [Validators.required]],
      password: [null, [Validators.required]],
      remember: [true],
    });
    this.registerForm = this.fb.group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
        tryPassword: ['', Validators.required],
      },
      {validators: this.passwordMatchValidator});
  }

  validateForm!: FormGroup;
  registerForm!: FormGroup;
  isLoginMode = true;

  submitForm(user: LoginUserReq) {
    if (this.validateForm.invalid)
      return;
    this.globalStore?.showSpinner();
    this.userService.login(user).then(mm => {
      if (mm.success) {
        this.authService.login(mm.value);
        this.notification.create(
          'success',
          'Login',
          'Login oldu'
        );
        this.globalStore?.hideSpinner();
        this.router.navigate(['/']).then(r => {

        });
        return;
      }else{
        this.notification.create(
          'error',
          'Xeta',
          mm.errorMessage
        );
      }
      this.globalStore?.hideSpinner();
    });
  }

  register(data: any) {
    if (this.registerForm.invalid)
      return;
    this.globalStore?.showSpinner();
    this.userService.register({
      email: data.email,
      name: data.name,
      password: data.password
    }).then(mm => {
      if (mm.success) {
        this.notification.create(
          'success',
          'Qeydiyyat',
          'Qeydiyyat yaradıldı'
        );
        this.isLoginMode = true;
      }
      else {
        this.notification.create(
          'error',
          'Qeydiyyat',
          mm.errorMessage
        );
      }
      this.globalStore?.hideSpinner();
    })
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const tryPassword = form.get('tryPassword')?.value;
    return password === tryPassword ? null : {passwordMismatch: true};
  }
}
