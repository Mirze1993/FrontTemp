import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {NzIconDirective, NzIconModule} from 'ng-zorro-antd/icon';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzUploadModule} from 'ng-zorro-antd/upload';
import {NzFormControlComponent, NzFormItemComponent, NzFormModule} from 'ng-zorro-antd/form';
import {CommonModule, NgIf} from '@angular/common';
import {NzButtonComponent, NzButtonModule} from 'ng-zorro-antd/button';
import {NzInputDirective, NzInputModule} from 'ng-zorro-antd/input';
import {UserService} from '../../../../services/api/user.service';
import {Router} from '@angular/router';
import {AuthStore} from '../../../../stores/auth/auth.store';
import {NzImageModule} from 'ng-zorro-antd/image';
import {ImageUploadComponent} from '../../../../components/image-upload/image-upload.component';
import {NzDescriptionsComponent, NzDescriptionsItemComponent} from 'ng-zorro-antd/descriptions';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {NzModalModule} from 'ng-zorro-antd/modal';
import {AuthState, ClaimType, EditType} from '../../../../models/AppUser';
import {environment} from '../../../../../environments/environment';
import {AuthService} from '../../../../stores/auth/auth.service';

@Component({
  selector: 'app-profile',
  imports: [
    FormsModule,
    NzIconDirective,
    NzFormControlComponent,
    NzFormItemComponent,
    NgIf,
    NzButtonComponent,
    NzInputDirective,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzUploadModule,
    NzButtonModule,
    NzIconModule,
    NzFormModule,
    NzInputModule,
    NzImageModule,
    ImageUploadComponent,
    NzDescriptionsComponent,
    NzDescriptionsItemComponent,
    NzDividerComponent,
    NzModalModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  isEditingName = false;
  isEditingEmail = false;
  isEditingPassword = false;
  picture: string;
  user:AuthState;

  constructor(private fb: FormBuilder,
              private msg: NzMessageService,
              private userService: UserService,
              private router: Router,
              private authStore: AuthStore,
              private authService: AuthService,
  ) {

  }

  ngOnInit(): void {
    this.setValue(this.authStore.currentStateValue)
    this.authStore.user$.subscribe(mm=>{;
      this.setValue(mm);
    });


  }

  setValue(user:AuthState){
    this.user = user;
    if(this.user.claims)
      this.picture=environment.fileUrl+this.user.claims.find(mm => mm.type == ClaimType.ProfilPictur)?.value;
    this.profileForm = this.fb.group({
      name: [this.user.name, [Validators.required]],
      email: [this.user.email, [Validators.required, Validators.email]],
      currentPassword: [''],
      newPassword: [''],
      confirmPassword: ['']
    });
  }

  // Edit toggle functions
  toggleEdit(field: string) {
    switch (field) {
      case 'name':
        this.isEditingName = !this.isEditingName;
        break;
      case 'email':
        this.isEditingEmail = !this.isEditingEmail;
        break;
      case 'password':
        this.isEditingPassword = !this.isEditingPassword;
        break;
    }
  }

  // Save functions
  saveField(field: string) {
    this.toggleEdit(field);

    this.msg.success(`${field} updated successfully!`);
  }

  // Cancel edit
  cancelEdit(field: string) {
    this.toggleEdit(field);
    // Reset form field to original value if needed
  }

  updateName(){
    this.toggleEdit("name");
    this.updateByType(this.profileForm.get('name').value,ClaimType.Name);
    this.msg.success(`$name updated successfully!`);
  }
  uploadImage(imgPath: string){
    this.updateByType(imgPath,ClaimType.ProfilPictur);
  }

  updateByType(value: string,claimType:ClaimType) {

    const old = this.authStore.currentStateValue.claims.find(mm => mm.type == claimType);

    if (old) {
      this.userService.updateProfile(
        {
          columnName: claimType,
          editType: EditType.Update,
          oldId: old.id,
          newValue: value
        }).then(mm => {
          this.getUserProfile();
        }
      );
    } else {
      this.userService.updateProfile({
        columnName: claimType,
        editType: EditType.Insert,
        newValue: value
      }).then(mm => {
        this.getUserProfile();
      });
    }

  }



  isVisible: boolean = false;

  showModal(): void {
    this.isVisible = true;
  }

  handleOk(): void {

    this.isVisible = false;
  }

  handleCancel(): void {
    this.isVisible = false;
  }


  private getUserProfile() {
    this.authService.setProfile();
  }
}
