import {AfterViewInit, Component, inject, NgZone, OnDestroy, OnInit} from '@angular/core';
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
import {RsaEncryptionService} from '../../services/rsa-encryption.service';

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
export class RtcChatComponent implements OnDestroy, AfterViewInit, OnInit {

  readonly nzData: any = inject(NZ_MODAL_DATA, {optional: true});
  readonly #modal = inject(NzModalRef);

  private countdownTimer?: any;
  remainingSeconds = 60;

  inputMessage: string = '';
  messages: Message[];
  protected readonly ChatPageStatus = ChatPageStatus;

  pageStatus: ChatPageStatus = this.nzData?.pageStatus;
  guid: string;

  userId: string = inject(NZ_MODAL_DATA).userId;
  readonly callerName: string = this.nzData?.callerName ?? 'Naməlum istifadəçi';
  readonly photo: string = this.nzData?.photo && this.nzData?.photo != '' ? this.nzData?.photo : 'https://cdn-icons-png.flaticon.com/512/847/847969.png';

  myPublicKey: string;
  peerPublicKey: string = this.nzData?.peerPublicKey;

  isReceiver: boolean = false;

  constructor(private signalRService: SignalrService,
              protected userService: UserService,
              private callRctService: CallRctService,
              private rsaEncryptionService: RsaEncryptionService,
              private ngZone: NgZone) {


  }


  async ngOnInit() {

  }

  async ngAfterViewInit() {

    await this.rsaEncryptionService.generateKeypair();
    this.myPublicKey = this.rsaEncryptionService.myPublicSpkiB64;

    if (this.pageStatus == ChatPageStatus.OfferSend) {
      this.guid = this.generateGuid();
      this.startOffer();
    } else if (this.pageStatus == ChatPageStatus.OfferComing) {
      this.guid = this.nzData?.guid;
      this.isReceiver = true;
    }
    this.callRctService.guid = this.guid;

    this.#modal.afterClose.subscribe(() => {
      this.clearTimers();
    });

    this.signalRService.endOfferRtcChatHandle((result) => {
      let status = parseChatPageStatus(result);
      if (status == ChatPageStatus.RejectByCaller || status == ChatPageStatus.EndByCaller || status == ChatPageStatus.EndByReceiver) {
        this.pageStatus = status;
        this.#modal.close();
      }
      this.clearProps(status)
    });

    this.signalRService.acceptRtcChatHandle(async (publicKey) => {
      this.clearTimers()
      this.peerPublicKey = publicKey;
      this.pageStatus = ChatPageStatus.CallAccept;
      this.callRctService.makeChatConnection(msg => this.receiveMessage(msg)).then(result => {
      })
      //this.callRctService.makeVideoCall(this.remoteVideo,this.localVideo1).then(mm => { })
    })

    this.signalRService.chatRtcSignalHandler(data => {
      if (data.type == 'offer') {
        this.callRctService.handleChatOffer(data.offer, mm => this.receiveMessage(mm)).then(() => {
        })
      } else if (data.type == 'answer') {
        this.callRctService.handleAnswer(data.answer).then(() => {
        })
      } else if (data.type == 'candidate') {
        this.callRctService.handleCandidate(data.candidate).then(() => {
        });
      }
    })
  }

  ngOnDestroy(): void {
    if (this.pageStatus == ChatPageStatus.OfferSend) {
      this.signalRService.endOfferRtcChat(this.guid, ChatPageStatus.RejectByCaller)
    } else if (this.pageStatus == ChatPageStatus.OfferComing) {
      this.signalRService.endOfferRtcChat(this.guid, ChatPageStatus.RejectByReceiver)
    }
    if (this.pageStatus == ChatPageStatus.CallAccept) {
      this.signalRService.endOfferRtcChat(this.guid, this.isReceiver ? ChatPageStatus.EndByReceiver : ChatPageStatus.EndByCaller)
    }
    this.clearTimers();
  }

  startOffer() {
    this.pageStatus = ChatPageStatus.OfferSend;
    console.log("myPublicKey ", this.myPublicKey);
    this.signalRService.startOfferRtcChat(this.userId, this.guid, this.myPublicKey)
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
    if (this.pageStatus == ChatPageStatus.OfferComing && status == ChatPageStatus.RejectByReceiver) {
      this.#modal.close();
    }
    this.clearProps(status);
  }

  private clearProps(status: ChatPageStatus) {
    this.clearTimers();
    this.pageStatus = status;
  }

  acceptOffer() {
    this.clearTimers();
    this.pageStatus = ChatPageStatus.CallAccept;
    this.signalRService.acceptRtcChat(this.guid, this.myPublicKey);
  }

  isMsgPrepare: boolean = false;

  async receiveMessage(message: string) {
    if (!this.messages) {
      this.messages = [];
    }
    this.isMsgPrepare = true;
    let msg = await this.rsaEncryptionService.decryptMessage(message);

    this.isMsgPrepare = false;
    this.ngZone.run(() => {
      this.messages.push({
        msg: msg,
        type: 'received'
      });
    });

  }

  async sendMessage() {
    let msg = await this.rsaEncryptionService.encryptMessage(this.inputMessage, this.peerPublicKey);
    if (!this.messages) {
      this.messages = [];
    }
    this.messages.push({
      msg: this.inputMessage,
      type: 'sent'
    });
    this.callRctService.sendChatMessage(msg)
    this.inputMessage = '';
  }
}

export interface Message {
  msg: string;
  type: "sent" | "received";
}

