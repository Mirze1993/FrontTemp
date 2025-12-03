import {Component, ElementRef, inject, OnDestroy, ViewChild} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {SignalrService} from '../../services/signalr.service';
import {UserService} from '../../services/api/user.service';
import {NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault} from '@angular/common';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzWaveDirective} from 'ng-zorro-antd/core/wave';
import {CallRctService} from '../../services/call-rct.service';
import {CallStatus, getCallStatusText} from '../../models/CallStatus';

@Component({
  selector: 'app-incoming-call',
  imports: [NgIf, NzButtonComponent, NzIconDirective, NzWaveDirective, NgSwitchCase, NgSwitch, NgSwitchDefault],
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

  callStatus: string = CallStatus.Calling;
  remainingSeconds = 60;


  private countdownTimer?: any;

  @ViewChild('remoteVideo') remoteVideo: ElementRef;
  @ViewChild('localVideo') localVideo!: ElementRef;

  constructor(
    private signalRService: SignalrService,
    protected userService: UserService,
    private callRctService: CallRctService
  ) {
    this.startRinging();
    this.#modal.afterClose.subscribe(() => this.clearTimers());
    this.signalRService.endOfferVideoCallHandle((result) => {
      console.log(result);
      this.#modal.close();
    })

    this.signalRService.rtcSignalHandler(data => {
        this.callRctService.guid = this.guid;
        if (data.type == 'offer') {
          this.callRctService.handleOffer(data.offer, this.remoteVideo,this.localVideo).then(() => {
          })
        } else if (data.type == 'candidate') {
          this.callRctService.handleCandidate(data.candidate).then(() => {
          });
        }
      }
    )
  }


  /** 🔔 Zəng başladıqda */
  startRinging(): void {
    this.callStatus = CallStatus.Calling;
    this.remainingSeconds = 60;

    this.countdownTimer = setInterval(() => {
      this.remainingSeconds--;
      if (this.remainingSeconds <= 0)
        this.rejectCall(CallStatus.Timeout);
    }, 1000);
  }

  /** ✅ Cavab ver */
  acceptCall(): void {
    this.clearTimers();
    this.callStatus = CallStatus.CallAccept;
    this.signalRService.acceptVideoCall(this.guid);
  }

  /** ❌ Rədd et */
  rejectCall(status: CallStatus): void {

    this.signalRService.endOfferVideoCall(this.guid, status);
    this.clearProps(status);
  }


  private clearProps(status: CallStatus) {
    this.clearTimers();
    this.callStatus = status;
    this.#modal.close(status);
    this.stopRemoteStream();
    this.callRctService.stopLocalCamera();
  }

  private stopRemoteStream() {
    const videoEl = this.remoteVideo?.nativeElement;
    if (!videoEl) return;

    const stream = videoEl.srcObject as MediaStream;

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    videoEl.srcObject = null;
    videoEl.pause();

    console.log("Remote video stream stopped");
  }

  /** 🧹 Timer-ləri təmizlə */
  clearTimers(): void {
    if (this.countdownTimer)
      clearInterval(this.countdownTimer);
  }

  isDestroyed: boolean = false;
  ngOnDestroy(): void {
    if(this.isDestroyed)
      return;
    if (this.callStatus != CallStatus.Calling)
      this.rejectCall(CallStatus.EndByReceiver);
    else
      this.rejectCall(CallStatus.RejectByReceiver);
    this.isDestroyed = true;
    window.location.reload();
  }

  protected readonly getCallStatusText = getCallStatusText;
  protected readonly CallStatus = CallStatus;
}
