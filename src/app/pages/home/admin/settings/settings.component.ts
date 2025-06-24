import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {NzNotificationService} from 'ng-zorro-antd/notification';
import {Router} from '@angular/router';
import {NzDrawerService} from 'ng-zorro-antd/drawer';
import {AddUserComponent} from '../../../../components/add-user/add-user.component';
import {UntilDestroy} from '@ngneat/until-destroy';
import {NzTabComponent, NzTabDirective, NzTabSetComponent} from 'ng-zorro-antd/tabs';
import {UserSettingComponent} from '../../../../components/user-setting/user-setting.component';
import {PositionComponent} from '../../../../components/position/position.component';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';

@Component({
  selector: 'app-settings',
  imports: [
    NzTabSetComponent,
    NzTabComponent,
    NzTabDirective,
    UserSettingComponent,
    PositionComponent,
    NzDrawerModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
@UntilDestroy()
export class SettingsComponent implements OnInit {

  constructor(
    private _router: Router,
    private drawerService: NzDrawerService
  ) {

  }

  ngOnInit(): void {
    this.initForm();

  }

  initForm() {

  }




  cancel() {
    this._router.navigate(['/']);
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

