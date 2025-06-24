import {Directive, ElementRef, Input, OnInit, TemplateRef, ViewContainerRef} from '@angular/core';
import {AuthStore} from '../stores/auth/auth.store';
import {ClaimType} from '../models/AppUser';
import {UserService} from '../services/api/user.service';

@Directive({
  selector: '[accessControl]'
})
export class AccessControlDirective implements OnInit {


  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private auth: AuthStore,
    private userService: UserService) { }



  private userRoles: string[] = [];
  private permission: string[] = [];
  private op: string = "and"
  private isHidden: boolean = true;
  ngOnInit() {
    this.userRoles =this.userService.getRoles( this.auth.userClaims);

    this.auth.user$.subscribe(mm=>{
      this.userRoles=this.userService.getRoles( mm.claims);
    })
    this.updateView();

  }
  @Input()
  set accessControl(val: string[]) {
    this.permission = val;
    if (val && this.userRoles && val.length > 0)
      this.updateView();
  }

  @Input()
  set accessControlOp(val: string) {
    this.op = val;
    if (val && this.userRoles && this.permission && val.length > 0)
      this.updateView();

  }

  private updateView() {

    if (this.checkAccess()) {
      if (this.isHidden) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.isHidden = false;
      }
    } else {
      this.viewContainer.clear();
      this.isHidden = true;
    }

  }




  private checkAccess() {
    let hasPermission = false;
    if (this.userRoles && this.permission && this.permission.length > 0) {
      for (const per of this.permission) {
        let found = this.userRoles.find(mm => mm.toLowerCase() === per.toLowerCase());
        if (found) {
          hasPermission = true;
          if (this.op.toLowerCase() == "or")
            break;
        } else {
          hasPermission = false;
          if (this.op.toLowerCase() == "and")
            break;
        }
      }
    } else if (this.userRoles && !this.permission)
      return hasPermission=true;
    return hasPermission;

  }
}
