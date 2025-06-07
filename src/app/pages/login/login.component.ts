import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NzInputModule} from 'ng-zorro-antd/input';
import {LoginUserReq} from '../../models/AppUser';
import {UserService} from '../../services/api/user.service';
import {AuthService} from '../../stores/auth/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, NzInputModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {

  constructor(private fb: FormBuilder, private userService: UserService, private authService: AuthService, private router: Router) {
  }

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      email: [null, [Validators.required]],
      password: [null, [Validators.required]],
      remember: [true],
    });
  }

  validateForm!: FormGroup;

  submitForm(user: LoginUserReq) {
    if (this.validateForm.invalid)
      return;
    this.userService.login(user).then(mm => {
      if (mm.success) {
        this.authService.login(mm.value);
        this.router.navigate(['/']);
        return;
      }
    });
  }
}
