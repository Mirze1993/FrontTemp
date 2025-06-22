import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {NzIconDirective, NzIconModule} from 'ng-zorro-antd/icon';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzUploadComponent, NzUploadFile, NzUploadModule} from 'ng-zorro-antd/upload';
import {NzFormControlComponent, NzFormItemComponent, NzFormModule} from 'ng-zorro-antd/form';
import {CommonModule, NgIf} from '@angular/common';
import {NzButtonComponent, NzButtonModule} from 'ng-zorro-antd/button';
import {NzInputDirective, NzInputModule} from 'ng-zorro-antd/input';
import {UserService} from '../../../../services/api/user.service';
import {Router} from '@angular/router';
import {AuthStore} from '../../../../stores/auth/auth.store';
import {NzImageDirective, NzImageModule} from 'ng-zorro-antd/image';
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
    this.user = this.authStore.currentStateValue;
    this.authStore.user$.subscribe(mm=>{
      this.user = mm;
      this.picture=environment.fileUrl+this.user.claims.find(mm => mm.type == ClaimType.ProfilPictur)?.value;
    });

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
    // Here you would typically call an API to save the changes
    this.msg.success(`${field} updated successfully!`);
  }

  // Cancel edit
  cancelEdit(field: string) {
    this.toggleEdit(field);
    // Reset form field to original value if needed
  }


  uploadImage(imgPath: string) {
    const oldImg = this.authStore.currentStateValue.claims.find(mm => mm.type == ClaimType.ProfilPictur);

    if (oldImg) {
      this.userService.updateProfile(
        {
          columnName: ClaimType.ProfilPictur,
          editType: EditType.Update,
          oldId: oldImg.id,
          newValue: imgPath
        }).then(mm => {
          this.getUserProfile();
        }
      );
    } else {
      this.userService.updateProfile({
        columnName: ClaimType.ProfilPictur,
        editType: EditType.Insert,
        newValue: imgPath
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
      // .then(mm => {
      // this.authStore.
      // this.picture = environment.fileUrl+this.userService.getImg(this.authStore.userClaims);
      // this.listOfUserRole = this.userClaims.filter(c => c.type == ClaimType.Role).map(map => map.value);
      // this.positionOld = Number(this.userService.getPosition(this.userClaims));
      // if (this.positionOld )
      //   this.position.setValue(this.positionOld);
      // console.log(this.listOfUserRole)
    //}
    // );

  }
}
