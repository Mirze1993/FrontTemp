import {Component, ElementRef, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {RrWebService} from '../../../../services/rr-web.service';
import {NzDividerModule} from 'ng-zorro-antd/divider';
import {NzTableModule} from 'ng-zorro-antd/table';
import {DatePipe} from '@angular/common';
import {NzModalModule, NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {RrwebReplayComponent} from '../../../../components/rrweb-replay/rrweb-replay.component';
import {RouterModule} from '@angular/router';
import {VideoCallComponent} from '../../../../components/video-call/video-call.component';

@Component({
  selector: 'app-rrweb-records',
  imports: [NzDividerModule, NzTableModule, DatePipe,NzModalModule,RouterModule],
  templateUrl: './rrweb-records.component.html',
  styleUrl: './rrweb-records.component.scss',
})
export class RrwebRecordsComponent implements OnInit {
  constructor(private rrWebService: RrWebService,
              private modalService: NzModalService,
              private viewContainerRef: ViewContainerRef) {
  }

  list: any[];

  ngOnInit(): void {
    this.rrWebService.getList().then(result => {
      if (result) {
        this.list = result.value;
      }
    })
  }


  loading = false;


  private modalRef?: NzModalRef;
  onReplay(id: string){


    this.modalRef = this.modalService.create({
      nzTitle: null,
      nzFooter: null,
      nzClosable: true,
      nzMaskClosable: true,
      nzCentered: true,
      nzContent: RrwebReplayComponent,
      nzWidth: '95vw',
      nzBodyStyle: { padding: '0', height: '90vh', overflow: 'scroll' },
      nzStyle: { top: '2vh' },
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        id: id
      }
    });
  }


  onDelete(id: string) {

  }

}
