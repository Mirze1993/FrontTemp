import {Component, OnInit} from '@angular/core';
import {DatePipe} from '@angular/common';
import {
  NzCellFixedDirective,
  NzTableCellDirective,
  NzTableComponent,
  NzTbodyComponent, NzTheadComponent,
  NzThMeasureDirective, NzTrDirective
} from 'ng-zorro-antd/table';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {UserService} from '../../../../services/api/user.service';
import {AdminService} from '../../../../services/api/admin.service';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-db-compile-pr',
  imports: [
    DatePipe,
    NzCellFixedDirective,
    NzTableCellDirective,
    NzTableComponent,
    NzTbodyComponent,
    NzThMeasureDirective,
    NzTheadComponent,
    NzTrDirective,
    NzDividerComponent,
    RouterLink
  ],
  templateUrl: './db-compile-pr.component.html',
  styleUrl: './db-compile-pr.component.scss',
})
export class DbCompilePrComponent implements OnInit {
  list: any[];

  constructor(private  adminService: AdminService) {
  }

  ngOnInit(): void {
    this.adminService.GetAllCompileRequests().then(mm => {
     if(mm.success){
       this.list=mm.value;
     }
    })
  }

  openModal(requestId:number): void {

  }
}
