import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewContainerRef
} from '@angular/core';
import {NzTableModule} from 'ng-zorro-antd/table';
import {NzDividerModule} from 'ng-zorro-antd/divider';
import {SignalrService} from '../../../../services/signalr.service';
import {isPlatformBrowser} from '@angular/common';
import {CallStatus} from '../../../../models/CallStatus';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzWaveDirective} from 'ng-zorro-antd/core/wave';
import {NzModalModule, NzModalService} from 'ng-zorro-antd/modal';
import {AdminCallComponent} from '../../../../components/admin-call/admin-call.component';


@Component({
  selector: 'app-call-to-admin',
  imports: [NzTableModule, NzDividerModule, NzButtonComponent, NzIconDirective, NzWaveDirective,NzModalModule],
  templateUrl: './call-to-admin.component.html',
  styleUrl: './call-to-admin.component.scss',
})
export class CallToAdminComponent implements OnInit, AfterViewInit {

  listOfData: any[]=[] ;
  constructor(private signalRService: SignalrService,
               private modalService: NzModalService,
               private viewContainerRef: ViewContainerRef,
              @Inject(PLATFORM_ID) private platformId: Object,
              private cdr: ChangeDetectorRef
             // private callRctService: CallRctService
  ) {
  }

  async ngAfterViewInit():  Promise<void>  {
    if (!isPlatformBrowser(this.platformId)) {
      return
    }
    await this.signalRService.startCallConnection();
    this.signalRService.offerAdminVideoCallHandle(data => {

      this.listOfData=[...data];
      this.cdr.markForCheck();
    });
    this.signalRService.refreshOfferAdminVideoCallHandle();
  }

  ngOnInit(): void {

  }
  guid:string
  acceptCall(guid: string): void {
   let data= this.listOfData.find(mm=>mm.guid==guid);

    this.guid = guid;
      this.modalService.create({
        nzTitle: null,
        nzFooter: null,
        nzClosable: true,
        nzMaskClosable: true,
        nzCentered: true,
        nzContent: AdminCallComponent,
        nzViewContainerRef: this.viewContainerRef,
        nzData: {
          callerId: data.fromUserId,
          callerName: data.fromUserName,
          callerPhoto: data.fromUserPhoto,
          guid: guid,
        }
      });


  }

  rejectCall(status: CallStatus,guid:string): void {
    this.signalRService.endOfferVideoCall(guid, status);
  }


  protected readonly CallStatus = CallStatus;
}
