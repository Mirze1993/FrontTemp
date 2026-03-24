import {afterNextRender, AfterViewInit, Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {UserService} from '../../services/api/user.service';
import {NotifResp} from '../../models/AppUser';
import {NzBadgeComponent} from 'ng-zorro-antd/badge';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzDrawerModule} from 'ng-zorro-antd/drawer';
import { NzCommentModule} from 'ng-zorro-antd/comment';
import {DatePipe, isPlatformBrowser, NgForOf, NgStyle} from '@angular/common';

@Component({
  selector: 'app-notif',
  imports: [
    NzBadgeComponent,
    NzIconDirective,
    NzDrawerModule,
    NzCommentModule,
    NgStyle,
    NgForOf,
    DatePipe
  ],
  templateUrl: './notif.component.html',
  styleUrl: './notif.component.scss'
})
export class NotifComponent implements OnInit,AfterViewInit {

  constructor(private userService:UserService,@Inject(PLATFORM_ID) private platformId: Object) {
    // afterNextRender(async () => {
    //   await this.getNotif();
    // });
  }

  unreadCount:number;
  notifs:NotifResp[];
  async ngOnInit() {
    //await this.getNotif();
    if (isPlatformBrowser(this.platformId)) {
     await this.getNotif();
    }
  }
  async ngAfterViewInit() {
    // await this.getNotif();
  }

  visible = false;

  private async getNotif() {
    await this.userService.getUnreadNotifCount().then(mm => {
      this.unreadCount = mm.value;
    });
  }

  open(): void {
    this.userService.getNotif().then(mm=>{
      this.notifs= mm.value.sort((s1,s2)=>s2.id -s1.id);
    });
    this.visible = true;

  }

  close(): void {
    this.visible = false;
    let t=this.notifs.filter(f=>!f.isRead).map(m=>m.id);
    if(t&&t.length>0)
      this.userService.ReadNotif(t).then(mm=>{
        this.getNotif();
      })
  }

}
