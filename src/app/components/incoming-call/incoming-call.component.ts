import {Component, ElementRef, inject, OnDestroy, ViewChild} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {SignalrService} from '../../services/signalr.service';
import {UserService} from '../../services/api/user.service';
import {NgIf, NgOptimizedImage} from '@angular/common';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzWaveDirective} from 'ng-zorro-antd/core/wave';
import {CallRctService} from '../../services/call-rct.service';

@Component({
  selector: 'app-incoming-call',
  imports: [NgIf, NzButtonComponent, NzIconDirective, NzWaveDirective],
  templateUrl: './incoming-call.component.html',
  styleUrl: './incoming-call.component.scss'
})
export class IncomingCallComponent implements OnDestroy {
  readonly #modal = inject(NzModalRef);
  readonly nzData: any = inject(NZ_MODAL_DATA, {optional: true});

  readonly callerId: number = this.nzData?.callerId;
  readonly guid: string = this.nzData?.guid;
  readonly callerName: string = this.nzData?.callerName ?? 'Naməlum istifadəçi';
  readonly photo: string = this.nzData?.photo ?? 'https://cdn-icons-png.flaticon.com/512/847/847969.png';

  isRinging = true;
  remainingSeconds = 60;

  private autoCancelTimer?: any;
  private countdownTimer?: any;

  @ViewChild('remoteVideo') remoteVideo: ElementRef;

  constructor(
    private signalRService: SignalrService,
    protected userService: UserService,
    private callRctService: CallRctService
  ) {
    this.startRinging();
    this.#modal.afterClose.subscribe(() => this.clearTimers());
    this.signalRService.endOfferVideoCallHandle(() => {
      this.#modal.close();
    })

    this.signalRService.rtcSignalHandler(data => {
      this.callRctService.guid = this.guid;
      console.log(data)
        if (data.type == 'offer') {
          this.callRctService.handleOffer(data.offer, this.remoteVideo).then(()=>{})
        }else if(data.type == 'candidate') {
          this.callRctService.handleCandidate(data.candidate).then(()=>{});
          console.log(data.candidate);
         // this.remoteVideo.nativeElement.play()
        }
      }
    )
  }


  /** 🔔 Zəng başladıqda */
  startRinging(): void {
    this.isRinging = true;
    this.remainingSeconds = 60;

    // 1 dəqiqə ərzində cavab verilməsə → zəngi bitir
    this.countdownTimer = setInterval(() => {
      this.remainingSeconds--;
      if (this.remainingSeconds <= 0) this.rejectCall();
    }, 1000);

    this.autoCancelTimer = setTimeout(() => {
      this.rejectCall();
    }, 60 * 1000);
  }

  /** ✅ Cavab ver */
  acceptCall(): void {
    this.clearTimers();
    this.isRinging = false;
    this.signalRService.acceptVideoCall(this.guid);
  }

  /** ❌ Rədd et */
  rejectCall(): void {
    if (!this.isRinging) return;
    this.signalRService.endOfferVideoCall(this.guid);
    this.clearTimers();
    this.isRinging = false;
    this.#modal.close('rejected');
  }

  /** 🧹 Timer-ləri təmizlə */
  clearTimers(): void {
    if (this.autoCancelTimer) clearTimeout(this.autoCancelTimer);
    if (this.countdownTimer) clearInterval(this.countdownTimer);
  }

  ngOnDestroy(): void {
    this.rejectCall();
  }
}
