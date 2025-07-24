import {AfterViewChecked, AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {DatePipe, NgClass, NgForOf} from '@angular/common';
import { NzTagModule} from 'ng-zorro-antd/tag';
import { NzButtonModule} from 'ng-zorro-antd/button';
import {SignalrService} from '../../../../services/signalr.service';
import {AiChatService} from '../../../../services/api/ai-chat.service';
import {ChatMessage, ChatSession} from '../../../../models/ai-chat';
import { NzGridModule } from 'ng-zorro-antd/grid';
import {NzLayoutComponent, NzSiderComponent} from 'ng-zorro-antd/layout';
import {NzMenuDirective} from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu'
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzSplitterModule } from 'ng-zorro-antd/splitter';

@Component({
  selector: 'app-ai-chat',
  imports: [
    FormsModule,NzIconModule,NzLayoutModule,NzMenuModule,NzSplitterModule,
    NgClass,
    NzTagModule,
    NgForOf,
    NzButtonModule,
    DatePipe,
    NzGridModule,
    NzLayoutComponent,
    NzSiderComponent,
    NzMenuDirective
  ],
  templateUrl: './ai-chat.component.html',
  styleUrl: './ai-chat.component.scss'
})
export class AiChatComponent implements OnInit, AfterViewInit, OnDestroy,AfterViewChecked {

  inputMessage: string = '';

  sessions: ChatSession[] = [];
  activeSession: ChatSession | null = null;

  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  constructor(private signalRService:SignalrService,private chatService: AiChatService,private notification: NzNotificationService) {
   chatService.getSessions().then(mm=>{
      if(mm.success)
        this.sessions=mm.value;
      if(this.sessions.length > 0)
        this.activeSession=this.sessions[0];
      else {
        this.createNewSession()
      }
    });
  }

  currentStreamMessage: string = '';
  ngAfterViewInit(): void {
    this.signalRService.startConnection();
    this.signalRService.ReceiveMessage((msg,isEnd) => {

      if(isEnd)
      {
        this.notification.create(
          "success",
          'Netice',
          'Ugurla cavablandirildi'
        );
        return
      }
      this.currentStreamMessage += msg;

      if (this.activeSession.history.length === 0 || this.activeSession.history[this.activeSession.history.length - 1].role !== 'assistant') {
        this.activeSession.history.push({
          role: 'assistant',
          content: this.currentStreamMessage
        });
      } else {
        this.activeSession.history[this.activeSession.history.length - 1].content = this.currentStreamMessage;
      }
    });
  }

  ngOnDestroy(): void {
  }

  ngOnInit(): void {
  }


  selectSession(session: ChatSession) {
    this.activeSession = session;
    // this.chatService.getSessionById(session.id).then(session => {
    //   this.activeSession=session.value;
    // })
  }

  createNewSession(){
    this.chatService.createSession().then(cs=>{
      this.sessions.unshift(cs.value)
      this.activeSession=cs.value;
    })
  }

  sendMessage() {
    this.currentStreamMessage=""
    const trimmed = this.inputMessage.trim();
    if (!trimmed) return;

    this.activeSession.history.push({ role: 'user', content: trimmed });
    const userInput = this.inputMessage;
    this.signalRService.sendMessage(userInput, this.activeSession.id);
    this.inputMessage = '';

    // setTimeout(() => {
    //   this.messages.push({
    //     role: 'assistant',
    //     content: `GPT cavabı: "${userInput}" üçün sadə cavab.`
    //   });
    // }, 800);
  }

  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  // Scroll həmişə aşağı olsun
  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom() {
    try {
      this.chatContainer.nativeElement.scrollTop =
        this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Scroll xətası:', err);
    }
  }


}
