import {Component, inject} from '@angular/core';
import {DatePipe, NgClass, NgForOf, NgIf, NgOptimizedImage, NgSwitchCase} from '@angular/common';
import {NzSplitterComponent, NzSplitterModule, NzSplitterPanelComponent} from 'ng-zorro-antd/splitter';
import {NzTagComponent} from 'ng-zorro-antd/tag';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzLayoutModule} from 'ng-zorro-antd/layout';
import {NzMenuModule} from 'ng-zorro-antd/menu';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NZ_MODAL_DATA} from 'ng-zorro-antd/modal';
import {ChatPageStatus} from '../../models/ChatPageStatus';
import {UserService} from '../../services/api/user.service';

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
export class RtcChatComponent {

  readonly nzData: any = inject(NZ_MODAL_DATA, {optional: true});

  inputMessage: string = '';
  messages: any;

  pageStatus: ChatPageStatus=this.nzData?.pageStatus;
  readonly guid: string = this.nzData?.guid;
  readonly callerName: string = this.nzData?.callerName ?? 'Naməlum istifadəçi';
  readonly photo: string = this.nzData?.photo ?? 'https://cdn-icons-png.flaticon.com/512/847/847969.png';

  constructor( protected userService: UserService) {
  }

  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  sendMessage(){

  }

  protected readonly ChatPageStatus = ChatPageStatus;
}

