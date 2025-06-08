import {Component, OnInit} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {FormsModule} from '@angular/forms';
import {AdminService} from '../../../../services/api/admin.service';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {CompileLog} from '../../../../models/Admin';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzGridModule} from 'ng-zorro-antd/grid';
import {NzRadioModule} from 'ng-zorro-antd/radio';
import {SideBySideDiffComponent, UnifiedDiffComponent} from 'ngx-diff';
import {NzDividerComponent} from 'ng-zorro-antd/divider';
import {NzCodeEditorComponent} from 'ng-zorro-antd/code-editor';

@Component({
  selector: 'app-db-compile',
  imports: [RouterModule,
    NzSelectModule,
    FormsModule,
    NgForOf,
    NzButtonModule,
    NzCheckboxModule,
    NzGridModule,
    DatePipe,
    NzRadioModule,
    UnifiedDiffComponent,
    SideBySideDiffComponent, NgIf, NzCodeEditorComponent, NzDividerComponent
  ],
  templateUrl: './db-compile.component.html',
  styleUrl: './db-compile.component.scss'
})
export class DbCompileComponent implements OnInit {
  compileName: string = null;
  compileNameList: string[] = null;
  compileList: CompileLog[] = null;

  compare1Id: number;
  compare2Id: number;

  compare1: CompileLog;
  compare2: CompileLog;

  showType:string;
  showCode:string;

  code = `console.log("Hello, TypeScript!");`;

  constructor(private router: Router, private adminService: AdminService) {
  }

  ngOnInit(): void {
    this.adminService.GetDistinctList().then(m => {
      this.compileNameList = m.value
    })


  }

  getCompilesByName() {

    this.adminService.GetByName(this.compileName).then(m => {
      this.compileList = m.value
    })
  }

  findDiff() {
    this.adminService.GetById(this.compare1Id).then(m => {
      this.compare1 = m.value
    })
    this.adminService.GetById(this.compare2Id).then(m => {
      this.compare2 = m.value
    })
  }


}
