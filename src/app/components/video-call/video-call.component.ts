import {Component, inject, OnDestroy} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {NgIf, NgOptimizedImage} from '@angular/common';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzWaveDirective} from 'ng-zorro-antd/core/wave';
import {SignalrService} from '../../services/signalr.service';
import {NzAvatarComponent} from 'ng-zorro-antd/avatar';
import {UserService} from '../../services/api/user.service';

@Component({
  selector: 'app-video-call',
  imports: [
    NgIf,
    NzButtonComponent,
    NzIconDirective,
    NzWaveDirective,
    NgOptimizedImage
  ],
  templateUrl: './video-call.component.html',
  styleUrl: './video-call.component.scss'
})
export class VideoCallComponent implements OnDestroy {
  isStartCalling: boolean = true;
  readonly #modal = inject(NzModalRef);
  remainingSeconds = 60;
  guid: string;

  private callTimer?: any;
  private countdownTimer?: any;

  userId: string = inject(NZ_MODAL_DATA).userId;
  photo: string = inject(NZ_MODAL_DATA).photo;

  constructor(private signalRService: SignalrService,
              protected userService: UserService) {
    this.guid=this.generateGuid();
    this.#modal.afterClose.subscribe(() => {
      this.clearTimers();
    });
    this.startOffer();
    this.signalRService.videoCallOfferEnd(() => {
      this.cancelOffer()
    })
  }

  startOffer() {
    this.signalRService.startOfferVideoCall(this.userId,this.guid)
    this.remainingSeconds = 60;
    this.isStartCalling = true;

    this.countdownTimer = setInterval(() => {
      this.remainingSeconds--;
      if (this.remainingSeconds <= 0) {
        this.cancelOffer();
      }
    }, 1000);

    this.callTimer = setTimeout(() => {
      this.cancelOffer();
    }, 60 * 1000);
  }

  cancelOffer(): void {
    if (!this.isStartCalling) return;

    this.clearTimers();
    this.signalRService.endOfferVideoCall(this.guid)
    this.isStartCalling = false;
  }

  retryCallOffer(): void {
    this.clearTimers();
    this.startOffer();
  }

  clearTimers(): void {
    if (this.callTimer) clearTimeout(this.callTimer);
    if (this.countdownTimer) clearInterval(this.countdownTimer);
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }


  generateGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
