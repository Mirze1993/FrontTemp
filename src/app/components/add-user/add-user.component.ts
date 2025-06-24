import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {UserService} from '../../services/api/user.service';
import {NzNotificationService} from 'ng-zorro-antd/notification';
import {NzModalModule, NzModalContentDirective} from 'ng-zorro-antd/modal';
import {NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent} from 'ng-zorro-antd/form';
import {NzColDirective} from 'ng-zorro-antd/grid';
import {NzInputDirective} from 'ng-zorro-antd/input';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {PositionComponent} from '../position/position.component';

@Component({
  selector: 'app-add-user',
  imports: [
    NzModalModule,
    NzModalContentDirective,
    NzFormItemComponent,
    NzFormDirective,
    ReactiveFormsModule,
    NzFormLabelComponent,
    NzFormControlComponent,
    NzColDirective,
    NzInputDirective,
    NzButtonComponent,
    PositionComponent
  ],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.scss'
})
export class AddUserComponent implements OnInit {

  isVisible = false;

  addForm: FormGroup<{
    name: FormControl<string>;
    email: FormControl<string>;
    password: FormControl<string>;
  }>;

  constructor(private fb: NonNullableFormBuilder, private userService: UserService, private notification: NzNotificationService) {

  }
  ngOnInit(): void {
    this.addForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required]],
      password: ['', [Validators.required]]

    });
  }

  onSubmit() {
    if (this.addForm.valid) {
      this.userService.register({
        email: this.addForm.value.email,
        name: this.addForm.value.name,
        password: this.addForm.value.password
      }).then(mm => {
        if (mm.success)
          this.notification.create('success', 'User yaradildi', 'Success');
        else
          this.notification.create('error', mm.errorMessage, 'Error')
      })

    } else {
      Object.values(this.addForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }

  }

  showModal(): void {
    this.isVisible = true;
  }

  handleOk(): void {
    this.onSubmit();
    this.isVisible = false;
  }

  handleCancel(): void {
    console.log('Button cancel clicked!');
    this.isVisible = false;
  }



}

