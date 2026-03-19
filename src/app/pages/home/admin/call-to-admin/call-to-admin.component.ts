import {AfterViewInit, Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {NzTableModule} from 'ng-zorro-antd/table';
import {NzDividerModule} from 'ng-zorro-antd/divider';
import {SignalrService} from '../../../../services/signalr.service';
import {isPlatformBrowser} from '@angular/common';

@Component({
  selector: 'app-call-to-admin',
  imports: [NzTableModule, NzDividerModule],
  templateUrl: './call-to-admin.component.html',
  styleUrl: './call-to-admin.component.scss',
})
export class CallToAdminComponent implements OnInit, AfterViewInit {

  listOfData: any[]=[] ;
  constructor(private signalRService: SignalrService,@Inject(PLATFORM_ID) private platformId: Object) {
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return
    }
    this.signalRService.startCallConnection();
    this.signalRService.offerAdminVideoCallHandle(data => {
      console.log(data);
      this.listOfData=[...data];
    });
  }

  ngOnInit(): void {

  }


}
