import {AfterViewInit, Component, ElementRef, inject, OnDestroy, ViewChild} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {NgIf, NgOptimizedImage, NgSwitch, NgSwitchCase, NgSwitchDefault} from '@angular/common';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzWaveDirective} from 'ng-zorro-antd/core/wave';
import {SignalrService} from '../../services/signalr.service';
import {UserService} from '../../services/api/user.service';
import {CallRctService} from '../../services/call-rct.service';
import {CallStatus, getCallStatusText, parseCallStatus} from '../../models/CallStatus';

@Component({
  selector: 'app-video-call',
  imports: [
    NgIf,
    NzButtonComponent,
    NzIconDirective,
    NzWaveDirective,
    NgOptimizedImage,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault
  ],
  templateUrl: './video-call.component.html',
  styleUrl: './video-call.component.scss'
})
export class VideoCallComponent implements OnDestroy, AfterViewInit {
  callStatus: string = CallStatus.Calling;
  readonly #modal = inject(NzModalRef);
  remainingSeconds = 60;
  guid: string;

  private callTimer?: any;
  private countdownTimer?: any;

  userId: string = inject(NZ_MODAL_DATA).userId;
  photo: string = inject(NZ_MODAL_DATA).photo;

  @ViewChild('remoteVideo') remoteVideo: ElementRef;
  @ViewChild('localVideo1') localVideo1!: ElementRef;


  constructor(private signalRService: SignalrService,
              protected userService: UserService,
              private callRctService: CallRctService) {

  }

  ngAfterViewInit(): void {
    this.guid = this.generateGuid();
    this.callRctService.guid = this.guid;
    this.#modal.afterClose.subscribe(() => {
      this.clearTimers();
    });
    this.startOffer();
    this.signalRService.endOfferVideoCallHandle((result) => {
      console.log(result);
      this.clearProps(parseCallStatus(result))
    });

    this.signalRService.acceptVideoCallHandle( async () => {
      this.clearTimers()
      this.callRctService.makeCall(this.remoteVideo,this.localVideo1).then(mm => {
      })
    })

    this.signalRService.rtcSignalHandler(data => {
      if (data.type == 'answer') {
        this.callRctService.handleAnswer(data.answer).then(() => {
        })
      } else if (data.type == 'candidate') {
        this.callRctService.handleCandidate(data.candidate).then(() => {
        });

      }
    })
  }

  startOffer() {
    console.log('startOffer');
    this.signalRService.startOfferVideoCall(this.userId, this.guid)
    this.remainingSeconds = 60;
    this.callStatus = CallStatus.Calling;

    this.countdownTimer = setInterval(() => {
      this.remainingSeconds--;
      if (this.remainingSeconds <= 0) {
        this.cancelOffer(CallStatus.Timeout);
      }
    }, 1000);
  }

  cancelOffer(status: CallStatus): void {

    this.signalRService.endOfferVideoCall(this.guid, status)

    this.clearProps(status);
  }

  private clearProps(status: CallStatus) {
    this.clearTimers();
    this.callStatus = status;

    this.stopRemoteStream();
    this.callRctService.stopLocalCamera();
  }

  stopRemoteStream() {
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
  retryCallOffer(): void {
    this.clearTimers();
    this.startOffer();
  }

  clearTimers(): void {
    if (this.countdownTimer)
      clearInterval(this.countdownTimer);
  }

  isDestroyed: boolean = false;
  ngOnDestroy(): void {
    if(this.isDestroyed)
      return;
    if (this.callStatus != CallStatus.Calling)
      this.cancelOffer(CallStatus.EndByCaller);
    else
      this.cancelOffer(CallStatus.RejectByCaller);
    this.isDestroyed = true;
    window.location.reload();
  }


  generateGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }


  protected readonly getCallStatusText = getCallStatusText;
  protected readonly CallStatus = CallStatus;

  isMuted = false;
  isVideoStopped = false;

  toggleMute() {
    if (!this.callRctService.localStream) return;

    this.isMuted = !this.isMuted;

    this.callRctService.localStream.getAudioTracks().forEach(t => {
      t.enabled = !this.isMuted;
    });
  }

  toggleVideo() {
    if (!this.callRctService.localStream) return;

    this.isVideoStopped = !this.isVideoStopped;

    this.callRctService.localStream.getVideoTracks().forEach(t => {
      t.enabled = !this.isVideoStopped;
    });
  }
}


