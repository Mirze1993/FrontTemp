import {AfterViewInit, Component, OnInit} from '@angular/core';
import {NzTableModule} from 'ng-zorro-antd/table';
import {NzDividerModule} from 'ng-zorro-antd/divider';
import {SignalrService} from '../../../../services/signalr.service';

@Component({
  selector: 'app-call-to-admin',
  imports: [NzTableModule, NzDividerModule],
  templateUrl: './call-to-admin.component.html',
  styleUrl: './call-to-admin.component.scss',
})
export class CallToAdminComponent implements OnInit, AfterViewInit {


  constructor(private signalRService: SignalrService) {
  }

  ngAfterViewInit(): void {
    this.signalRService.startOfferVideoCallHandle((callerName, callerPhoto, callerId, guid) => {

    });
  }

  ngOnInit(): void {

  }

  listOfData: any[] = [
    {
      key: '1',
      name: 'John Brown',
      age: 32,
      address: 'New York No. 1 Lake Park'
    },
    {
      key: '2',
      name: 'Jim Green',
      age: 42,
      address: 'London No. 1 Lake Park'
    },
    {
      key: '3',
      name: 'Joe Black',
      age: 32,
      address: 'Sidney No. 1 Lake Park'
    }
  ];
}
