import {AfterViewInit, Component, inject, OnDestroy} from '@angular/core';
import {NgClass, NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import {NzSplitterComponent, NzSplitterModule, NzSplitterPanelComponent} from 'ng-zorro-antd/splitter';
import {NzTagComponent} from 'ng-zorro-antd/tag';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzLayoutModule} from 'ng-zorro-antd/layout';
import {NzMenuModule} from 'ng-zorro-antd/menu';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {ChatPageStatus, parseChatPageStatus} from '../../models/ChatPageStatus';
import {UserService} from '../../services/api/user.service';
import {SignalrService} from '../../services/signalr.service';
import {CallRctService} from '../../services/call-rct.service';
import {parseCallStatus} from '../../models/CallStatus';

@Component({
  selector: 'app-rtc-chat',
  imports: [
    FormsModule, NzIconModule, NzLayoutModule, NzMenuModule, NzSplitterModule, NzButtonModule,

    NgForOf,
    NzSplitterComponent,
    NzSplitterPanelComponent,
    NzTagComponent,
    ReactiveFormsModule,
    NgClass, NgIf, NgOptimizedImage
  ],
  templateUrl: './rtc-chat.component.html',
  styleUrl: './rtc-chat.component.scss'
})
export class RtcChatComponent  implements OnDestroy, AfterViewInit {

  readonly nzData: any = inject(NZ_MODAL_DATA, {optional: true});
  readonly #modal = inject(NzModalRef);

  private countdownTimer?: any;
  remainingSeconds = 60;

  inputMessage: string = '';
  messages: any;
  protected readonly ChatPageStatus = ChatPageStatus;

  pageStatus: ChatPageStatus=this.nzData?.pageStatus;
  guid: string;

  userId: string = inject(NZ_MODAL_DATA).userId;
  readonly callerName: string = this.nzData?.callerName ?? 'Naməlum istifadəçi';
  readonly photo: string = this.nzData?.photo ?? 'https://cdn-icons-png.flaticon.com/512/847/847969.png';

  constructor(private signalRService: SignalrService,
              protected userService: UserService,
              private callRctService: CallRctService) {
  }


  sendMessage(){

  }


  ngAfterViewInit(): void {
    if(this.pageStatus==ChatPageStatus.OfferSend)
     this.guid = this.generateGuid();
    else if(this.pageStatus==ChatPageStatus.OfferComing) {
      this.guid = this.nzData?.guid;
    }
    this.callRctService.guid = this.guid;

    this.#modal.afterClose.subscribe(() => {
      this.clearTimers();
    });
    this.startOffer();
    this.signalRService.endOfferRtcChatHandle((result) => {
      this.clearProps(parseChatPageStatus(result))
    });

    this.signalRService.acceptRtcChatHandle( async () => {
      this.clearTimers()
     // this.callRctService.makeVideoCall(this.remoteVideo,this.localVideo1).then(mm => { })
    })

    this.signalRService.chatRtcSignalHandler(data => {
      if (data.type == 'offer') {
        this.callRctService.handleChatOffer(data.offer,msg => {}).then(() => {
        })
      }
       else if (data.type == 'answer') {
        this.callRctService.handleAnswer(data.answer).then(() => {
        })
      } else if (data.type == 'candidate') {
        this.callRctService.handleCandidate(data.candidate).then(() => {
        });
      }
    })
  }

  ngOnDestroy(): void {
  }

  startOffer() {
    this.pageStatus=ChatPageStatus.OfferSend;
    this.signalRService.startOfferRtcChat(this.userId, this.guid)
    this.remainingSeconds = 60;

    this.countdownTimer = setInterval(() => {
      this.remainingSeconds--;
      if (this.remainingSeconds <= 0) {
        this.cancelOffer(ChatPageStatus.Timeout);
      }
    }, 1000);
  }

  generateGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  clearTimers(): void {
    if (this.countdownTimer)
      clearInterval(this.countdownTimer);
  }

  cancelOffer(status: ChatPageStatus): void {
    this.signalRService.endOfferRtcChat(this.guid, status)
    this.clearProps(status);
  }

  private clearProps(status: ChatPageStatus) {
    this.clearTimers();
    this.pageStatus = status;
  }
}

