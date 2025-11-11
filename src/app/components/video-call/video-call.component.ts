import {AfterViewInit, Component, ElementRef, inject, OnDestroy, ViewChild} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {NgIf, NgOptimizedImage} from '@angular/common';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzWaveDirective} from 'ng-zorro-antd/core/wave';
import {SignalrService} from '../../services/signalr.service';
import {NzAvatarComponent} from 'ng-zorro-antd/avatar';
import {UserService} from '../../services/api/user.service';
import {CallRctService} from '../../services/call-rct.service';

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
export class VideoCallComponent implements OnDestroy, AfterViewInit {
  isStartCalling: boolean = true;
  readonly #modal = inject(NzModalRef);
  remainingSeconds = 60;
  guid: string;

  private callTimer?: any;
  private countdownTimer?: any;

  userId: string = inject(NZ_MODAL_DATA).userId;
  photo: string = inject(NZ_MODAL_DATA).photo;

  @ViewChild('remoteVideo') remoteVideo: ElementRef;


  constructor(private signalRService: SignalrService,
              protected userService: UserService,
              private callRctService:CallRctService) {

  }

  ngAfterViewInit(): void {
    this.guid=this.generateGuid();
    this.callRctService.guid = this.guid;
    this.#modal.afterClose.subscribe(() => {
      this.clearTimers();
    });
    this.startOffer();
    this.signalRService.endOfferVideoCallHandle(() => {
      this.cancelOffer()
    });

    this.signalRService.acceptVideoCallHandle(()=>{
      this.callRctService.makeCall(this.remoteVideo).then(mm=>{
        //this.remoteVideo.nativeElement.play()
      })
    })

    this.signalRService.rtcSignalHandler(data=>{
      console.log(data)
      if (data.type == 'answer') {

        this.callRctService.handleAnswer(data.answer).then(()=>{})
      }else if(data.type == 'candidate') {
        this.callRctService.handleCandidate(data.candidate).then(()=>{});

      }
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
     console.log(this.remoteVideo);


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
    this.cancelOffer();
  }




  generateGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
