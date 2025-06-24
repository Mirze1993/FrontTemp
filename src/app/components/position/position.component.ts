import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {NzModalModule, NzModalService} from 'ng-zorro-antd/modal';
import {UserService} from '../../services/api/user.service';
import {position} from '../../models/AppUser';
import {NgIf} from '@angular/common';
import {NzTreeComponent, NzTreeModule} from 'ng-zorro-antd/tree';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzPopoverDirective} from 'ng-zorro-antd/popover';
import {NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent} from 'ng-zorro-antd/form';
import {NzColDirective} from 'ng-zorro-antd/grid';
import {NzInputDirective} from 'ng-zorro-antd/input';
import {NzTreeSelectComponent} from 'ng-zorro-antd/tree-select';

@Component({
  selector: 'app-position',
  imports: [
    NgIf,
    NzTreeModule,
    NzIconDirective,
    NzPopoverDirective,
    NzModalModule,
    ReactiveFormsModule,
    NzFormItemComponent,
    NzFormLabelComponent,
    NzFormControlComponent,
    NzColDirective,
    NzInputDirective,
    NzFormDirective,
    NzTreeSelectComponent
  ],
  templateUrl: './position.component.html',
  styleUrl: './position.component.scss'
})


export class PositionComponent implements OnInit {
  @Input() positionValue: FormControl<number>;
  @Input() dropDown:boolean=false;
  data:Node[]=[];
  nodes:any[] = this.data;
  addForm: FormGroup<{
    name: FormControl<string>;
    description: FormControl<string>;
  }>;

  constructor(private modal: NzModalService,private fb: NonNullableFormBuilder,private userService:UserService) {
    this.addForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],

    });
  }
  ngOnInit(): void {
    console.log(this.positionValue);
    this.getPosition();
  }

  private getPosition() {
    this.userService.GetPosition().then(mm => {
      this.createTree(mm.value);
    });
  }

  onChange($event: string): void {
  }

  showDeleteConfirm(id:number): void {
    this.modal.confirm({
      nzTitle: 'Are you sure delete this task?',
      nzContent: '<b style="color: red;">Some descriptions</b>',
      nzOkText: 'Yes',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {this.deletePosition(id)},
      nzCancelText: 'No',
      nzOnCancel: () => console.log('Cancel')
    });
  }

  deletePosition(id:number){
    this.userService.DeletePosition(id).then(mm=>{
      this.getPosition();
    })
  }

  isVisible = false;
  selectedNode:any;
  showModal(node:any): void {
    this.isVisible = true;
    this.selectedNode=node;
  }

  handleOk(): void {
    if (this.addForm.valid) {
      console.log('submit', this.addForm.value);
      this.userService.InstPosition({description:this.addForm.value.description,name:this.addForm.value.name,parentId:this.selectedNode?.key})
        .then(mm=>{
          this.getPosition();
        });
      this.isVisible = false;
    } else {
      Object.values(this.addForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  handleCancel(): void {
    this.isVisible = false;
    console.log(this.nodes)
  }


  createTree(position:position[]){
    let r= this.getRootNodes(position);
    for(let item of r){
      this.getChilderen(item,position)
    }
    console.log(r);
    this.nodes=r;
  }

  getChilderen(node:Node,position:position[]):Node{
    let e= position.filter(mm=>mm.parentId==node.key);
    if(!e||e.length===0)
    {
      node.isLeaf=true;
      return node;
    };
    node.children=e.map<Node>(mm=>({key:mm.id,title:mm.name,expanded:true,'description':mm.description}));
    for(let item of node.children){
      this.getChilderen(item,position)
    }
    return node;
  }

  getRootNodes(node:position[]):Node[]{
    return node.filter(mm=> !mm.parentId||mm.parentId<1).map<Node>(mm=> ({key:mm.id,title:mm.name,expanded:true,'description':mm.description}))
  }

}

export interface Node{
  title: string;
  key: number;
  expanded?:boolean,
  isLeaf?: boolean ;
  children?:Node[];
  description?:string;
}

