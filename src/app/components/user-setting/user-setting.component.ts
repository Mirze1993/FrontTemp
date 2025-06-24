import {Component, OnInit} from '@angular/core';
import {SearchUserResp} from '../../models/AppUser';
import {UserService} from '../../services/api/user.service';
import {NzDrawerService} from 'ng-zorro-antd/drawer';
import {EditProfileComponent} from '../edit-profile/edit-profile.component';
import {AddUserComponent} from '../add-user/add-user.component';
import {NzCardComponent} from 'ng-zorro-antd/card';
import {NzTableComponent} from 'ng-zorro-antd/table';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-user-setting',
  imports: [
    NzCardComponent,
    NzTableComponent,
    NgForOf
  ],
  templateUrl: './user-setting.component.html',
  styleUrl: './user-setting.component.scss'
})
export class UserSettingComponent implements OnInit {


  users: SearchUserResp[];

  constructor(private userService: UserService,private drawerService: NzDrawerService) { }

  ngOnInit(): void {
    this.serachUser('');
  }

  serachUser(userName: string) {
    this.userService.searchUser(userName ?? '').then(mm => {
      this.users=mm.value
    });
  }

  openProfile(userId:number,email:string){

    const drawerRef = this.drawerService.create<EditProfileComponent, { value: string }, string>({
      nzTitle: 'User Profile',
      //nzFooter: 'Footer',
      //nzExtra: 'Extra',
      nzWidth:'50%',
      nzContent: EditProfileComponent,
      nzContentParams: {
        userId: userId,
        email:email
      }
    });



    drawerRef.afterOpen.subscribe(() => {
      console.log('Drawer(Component) open');
    });

    drawerRef.afterClose.subscribe(data => {
      console.log(data);
      // if (typeof data === 'string') {
      //   this.value = data;
      // }
    });

  }

  addUser(){

    const drawerRef = this.drawerService.create<AddUserComponent, { value: string }, string>({
      nzTitle: 'Add User',
      //nzFooter: 'Footer',
      //nzExtra: 'Extra',
      nzWidth:'50%',
      nzContent: AddUserComponent
    });

    drawerRef.afterOpen.subscribe(() => {
      console.log('Drawer(Component) open');
    });

    drawerRef.afterClose.subscribe(data => {
      console.log(data);
      // if (typeof data === 'string') {
      //   this.value = data;
      // }
    });

  }


}
