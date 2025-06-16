import {Component, OnInit} from '@angular/core';
import {NavigationComponent} from "../../components/navigation/navigation.component";
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzLayoutModule} from 'ng-zorro-antd/layout';
import {NzMenuModule} from 'ng-zorro-antd/menu';
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb'
import {AuthService} from '../../stores/auth/auth.service';
import {UserService} from '../../services/api/user.service';
import {Router, RouterModule} from '@angular/router';
import {AuthStore} from '../../stores/auth/auth.store';
import {AuthState} from '../../models/AppUser';
import {NzAvatarComponent} from 'ng-zorro-antd/avatar';

@Component({
  selector: 'app-home',
  imports: [NzBreadCrumbModule, NzIconModule, NzMenuModule, NzLayoutModule, RouterModule, NzAvatarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  isCollapsed = false;
  user: AuthState;
  defaultAvatar = 'https://www.gravatar.com/avatar/?d=mp'

  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService,
    private authStore: AuthStore
  ) {
  }

  ngOnInit(): void {
    this.user = this.authStore.currentStateValue;
  }

  isLogin: boolean;

  logout() {
    this.authService.exit();
    this.router.navigate(['/login']).then(() => {

    });

  }

  onProfile() {
    this.router.navigate(['/profile']);
  }

  onSettings() {
    this.router.navigate(['/settings']);
  }
}
