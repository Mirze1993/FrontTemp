import {Component, OnInit} from '@angular/core';
import {NavigationComponent} from "../../components/navigation/navigation.component";
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzLayoutModule} from 'ng-zorro-antd/layout';
import {NzMenuModule, NzSubMenuTitleComponent} from 'ng-zorro-antd/menu';
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb'
import {AuthService} from '../../stores/auth/auth.service';
import {UserService} from '../../services/api/user.service';
import {Router, RouterModule} from '@angular/router';
import {AuthStore} from '../../stores/auth/auth.store';
import {AuthState, ClaimType} from '../../models/AppUser';
import {NzAvatarComponent} from 'ng-zorro-antd/avatar';
import {environment} from '../../../environments/environment';
import {AccessControlDirective} from '../../directives/access-control.directive';
import {NotifComponent} from '../../components/notif/notif.component';

@Component({
  selector: 'app-home',
  imports: [NzBreadCrumbModule, NzIconModule, NzMenuModule, NzLayoutModule, RouterModule,
    NzAvatarComponent, AccessControlDirective, NotifComponent,
    ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  isCollapsed = false;
  user: AuthState;
  defaultAvatar = 'https://www.gravatar.com/avatar/?d=mp'
  picture: string;

  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService,
    private authStore: AuthStore
  ) {
  }

  ngOnInit(): void {
    this.user = this.authStore.currentStateValue;
    this.authStore.user$.subscribe(mm=>{
      this.user = mm;
      this.picture=this.user.photo?environment.fileUrl+this.user.photo:this.defaultAvatar;
    });
  }

  isLogin: boolean;

  logout() {
    this.authService.exit();
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/login']);
    });

  }

  onProfile() {
    this.router.navigate(['/profile']);
  }

  onSettings() {
    this.router.navigate(['/settings']);
  }
}
