import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ClaimType, EditType, UserClaim} from '../../models/AppUser';
import {FormControl, FormsModule} from '@angular/forms';
import {UserService} from '../../services/api/user.service';
import {NzNotificationService} from 'ng-zorro-antd/notification';
import { NzModalContentDirective, NzModalModule, NzModalService} from 'ng-zorro-antd/modal';
import {environment} from '../../../environments/environment';
import {NzOptionComponent, NzSelectComponent} from 'ng-zorro-antd/select';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {NgForOf} from '@angular/common';
import {NzDescriptionsComponent, NzDescriptionsItemComponent} from 'ng-zorro-antd/descriptions';
import {ImageUploadComponent} from '../image-upload/image-upload.component';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {PositionComponent} from '../position/position.component';

@Component({
  selector: 'app-edit-profile',
  imports: [
    NzSelectComponent,
    NzDividerComponent,
    NzOptionComponent,
    NgForOf,
    NzDescriptionsComponent,
    NzDescriptionsItemComponent,
    NzModalModule,
    ImageUploadComponent,
    NzButtonComponent,
    NzModalContentDirective,
    FormsModule,
    PositionComponent
  ],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.scss'
})

export class EditProfileComponent implements OnChanges {

  @Input() userId: number;
  @Input() email: string;

  userClaims: UserClaim[];
  userName: string;
  picture: string;

  positionOld: number;
  position: FormControl<number>=new FormControl<number>(0);

  listOfRole: any[] = [];
  listOfUserRole: string[] = [];

  name = 'Angular 4';
  url :any= '';
  onSelectFile(event:any) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();

      reader.readAsDataURL(event.target.files[0]); // read file as data url

      reader.onload = (event) => { // called once readAsDataURL is completed
        this.url = event.target.result;
      }
    }
  }


  public delete(){
    this.url = null;
  }


  isNotSelected(value: string): boolean {
    return this.listOfUserRole.indexOf(value) === -1;
  }


  constructor(protected userService: UserService, private notification: NzNotificationService, private modal: NzModalService) { }
  ngOnChanges(changes: SimpleChanges): void {
    this.getUserProfil();
  }

  private getUserProfil() {

    this.userService.getProfileById(this.userId).then(mm => {
      this.userClaims = mm.value;
      this.userName = this.userService.getName(this.userClaims);
      this.picture = this.userService.getImg(this.userClaims);
      this.listOfUserRole = this.userClaims.filter(c => c.type == ClaimType.Role).map(map => map.value);
      this.positionOld = Number(this.userService.getPosition(this.userClaims));
      if (this.positionOld )
        this.position.setValue(this.positionOld);
      console.log(this.listOfUserRole)
    });

  }

  ngOnInit(): void {
    this.userService.getRoleValue().then(mm => {
      mm.value.forEach(item => {
        this.listOfRole.push(item.name);
      })
    })
    this.getUserProfil();
  }


  setRole() {

    let removeList = this.listOfRole.filter(mm => this.listOfUserRole.indexOf(mm) === -1);
    this.userService.removeClaimByType({ ClaimType: ClaimType.Role, UserId: this.userId, Value: removeList });
    this.userService.setClaim({ ClaimType: ClaimType.Role, UserId: this.userId, Value: this.listOfUserRole }).then(mm => {
      if (mm.success) {
        this.notification.create(
          'success',
          'Success',
          'This is done', {
            nzDuration: 2000, nzAnimate: true
          }
        );
      } else {
        this.notification.create(
          'error',
          'Error',
          mm.errorMessage, {
            nzDuration: 2000, nzAnimate: true
          }
        );
      }
    })
  }



  showConfirm(): void {
    this.modal.confirm({
      nzTitle: '<i>Do you Want to confirm these items?</i>',
      nzContent: '<b>Testiq et</b>',
      nzOnOk: () => this.setRole()
    });
  }
  showDeleteConfirm(): void {
    this.modal.confirm({
      nzTitle: 'Are you sure delete this task?',
      nzContent: '<b style="color: red;">Some descriptions</b>',
      nzOkText: 'Yes',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => { this.listOfUserRole = this.userClaims.filter(c => c.type == ClaimType.Role).map(map => map.value); },
      nzCancelText: 'No',
      nzOnCancel: () => console.log('Cancel')
    });
  }


  positionShowConfirm(): void {
    this.modal.confirm({
      nzTitle: '<i>Do you Want to confirm these items?</i>',
      nzContent: '<b>Testiq et</b>',
      nzOnOk: () => { this.positionSetValue()}
    });
  }
  positionShowDeleteConfirm(): void {
    this.modal.confirm({
      nzTitle: 'Are you sure delete this task?',
      nzContent: '<b style="color: red;">Some descriptions</b>',
      nzOkText: 'Yes',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        if(this.positionOld)
          this.position.setValue(this.positionOld)
        else this.position=new FormControl()},
      nzCancelText: 'No',
      nzOnCancel: () => {      }
    });
  }

  positionSetValue(){
    console.log(this.position);
    this.userService.setClaim({ClaimType:ClaimType.JobPosission,UserId:this.userId,Value:[this.position.value.toString()]});
    this.positionOld=this.position.value;
  }

  uploadImage(imgPath: string) {
    const oldImg = this.userClaims.find(mm => mm.type == ClaimType.ProfilPictur);

    if (oldImg) {
      this.userService.updateProfile({ columnName: ClaimType.ProfilPictur, editType: EditType.Update, oldId: oldImg.id, newValue: imgPath }).then(mm => {
        this.getUserProfil();

      });
    } else {
      this.userService.updateProfile({ columnName: ClaimType.ProfilPictur, editType: EditType.Insert, newValue: imgPath }).then(mm => {
        this.getUserProfil();
      });;
    }
  }

  isVisible = false;

  showModal(): void {
    this.isVisible = true;
  }

  handleOk(): void {

    this.isVisible = false;
  }

  handleCancel(): void {
    this.isVisible = false;
  }



}

