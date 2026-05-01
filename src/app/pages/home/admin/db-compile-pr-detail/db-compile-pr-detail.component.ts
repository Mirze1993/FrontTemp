import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {AdminService} from '../../../../services/api/admin.service';
import {toNumber} from 'ng-zorro-antd/core/util';
import {DatePipe, NgIf} from '@angular/common';
import {NzRadioComponent, NzRadioGroupComponent} from 'ng-zorro-antd/radio';
import {SideBySideDiffComponent, UnifiedDiffComponent} from 'ngx-diff';
import {FormsModule} from '@angular/forms';
import { NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb';
import {NzGridModule} from 'ng-zorro-antd/grid';
import {NzCodeEditorComponent} from 'ng-zorro-antd/code-editor';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzModalModule, NzModalService} from 'ng-zorro-antd/modal';
import {NzInputDirective} from 'ng-zorro-antd/input';
import {NzNotificationService} from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-db-compile-pr-detail',
  imports: [
    NgIf,
    NzRadioComponent,
    NzRadioGroupComponent,
    SideBySideDiffComponent,
    UnifiedDiffComponent,
    FormsModule, NzButtonModule,
    NzBreadCrumbModule, NzGridModule, NzModalModule,
    RouterLink, DatePipe, NzCodeEditorComponent, NzDividerComponent, NzInputDirective
  ],
  templateUrl: './db-compile-pr-detail.component.html',
  styleUrl: './db-compile-pr-detail.component.scss',
})
export class DbCompilePrDetailComponent implements OnInit {

  id:string
  detail:any;
  showType:string='UnifiedDiff';

  constructor( private route: ActivatedRoute,private  adminService: AdminService,private modal: NzModalService,private notification: NzNotificationService) {


  }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id')!;
    this.getById();
  }

  private getById() {
    this.adminService.GetCompileRequestById(toNumber(this.id)).then(mm => {
      if (mm.success) {
        this.detail = mm.value;
      }
    });
  }

  compileComment: string = '';
  cancelComment: string = '';

  @ViewChild('compileTpl', { static: true }) compileTpl!: TemplateRef<any>;
  @ViewChild('cancelTpl', { static: true }) cancelTpl!: TemplateRef<any>;


  compileModal() {
    this.compileComment = '';

    this.modal.confirm({
      nzTitle: 'Compile etməyə əminsiz?',
      nzContent: this.compileTpl,
      nzOnOk: () => {
        this.adminService.ApproveAndCompilePr({
          reqId: this.id,
          comment:this.compileComment
        }).then((mm) => {
          if(mm.success){
            this.notification.create(
              'success',
              'compile',
              'compile oldu'
            );
          }else {
            this.notification.create(
              'error',
              'Xeta',
              mm.errorMessage
            );
          }
          this.getById();

        })
      }
    });
  }

  compileCancelModal() {
    this.cancelComment = '';

    this.modal.confirm({
      nzTitle: 'Pull request-i ləğv etməyə əminsiz?',
      nzContent: this.cancelTpl,
      nzOkDanger: true,
      nzOnOk: () => {
        this.adminService.RejectAndCompilePr({
          reqId: this.id,
          comment:this.compileComment
        }).then((mm) => {
          if(mm.success){
            this.notification.create(
              'success',
              'Reject',
              'Reject oldu'
            );
          }else {
            this.notification.create(
              'error',
              'Xeta',
              mm.errorMessage
            );
          }
          this.getById();
        })
      }
    });
  }

}
