import {Component, OnInit, ViewContainerRef} from '@angular/core';
import {NzSkeletonModule} from 'ng-zorro-antd/skeleton';
import {NzListModule} from 'ng-zorro-antd/list';
import {UserService} from '../../../../services/api/user.service';
import {SearchUserResp} from '../../../../models/AppUser';
import {NgForOf, NgIf} from '@angular/common';
import {NzCardComponent} from 'ng-zorro-antd/card';
import {NzTableComponent} from 'ng-zorro-antd/table';
import {NzBadgeModule} from 'ng-zorro-antd/badge';
import {NzAvatarModule} from 'ng-zorro-antd/avatar';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {SignalrService} from '../../../../services/signalr.service';
import {NzModalModule, NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {VideoCallComponent} from '../../../../components/video-call/video-call.component';
import {RtcChatComponent} from '../../../../components/rtc-chat/rtc-chat.component';
import {ChatPageStatus} from '../../../../models/ChatPageStatus';

@Component({
  selector: 'app-contact',
  imports: [NzListModule, NzSkeletonModule, NgForOf, NzCardComponent,
    NzTableComponent, NzBadgeModule, NzAvatarModule,
    NzIconModule, NzButtonModule, NzModalModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent implements OnInit {

  users: SearchUserResp[];
  private modalRef?: NzModalRef;
  constructor(protected userService: UserService,
              private signalRService: SignalrService,
              private modalService: NzModalService,
              private viewContainerRef: ViewContainerRef) {
  }

  ngOnInit(): void {
    this.searchUser('');
  }

  searchUser(userName: string) {
    this.userService.searchUser(userName ?? '').then(mm => {
      this.users = mm.value
    });
  }

  sendOffer(userId: string,photo: string): void {
    this.openCallModal(userId,photo)
  }

  openCallModal(userId: string,photo: string) {

    this.modalRef = this.modalService.create({
      nzTitle: null,
      nzFooter: null,
      nzClosable: true,
      nzMaskClosable: true,
      nzCentered: true,
      nzContent: VideoCallComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        userId: userId,
        photo: photo
      }
    });

  }

  sendChatOffer(userId: string,photo: string): void {
    this.openChatModal(userId,photo)
  }
  openChatModal(userId: string,photo: string) {

    this.modalRef = this.modalService.create({
      nzTitle: null,
      nzFooter: null,
      nzClosable: true,
      nzMaskClosable: true,
      nzCentered: true,
      nzContent: RtcChatComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        userId: userId,
        photo: photo,
        pageStatus:ChatPageStatus.OfferComing
      }
    });

  }

}
