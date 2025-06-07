import { Component } from '@angular/core';
import { NavigationComponent } from "../../components/navigation/navigation.component";
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import {AuthQuery} from '../../stores/auth/auth.query';
import {AuthService} from '../../stores/auth/auth.service';
import {UserService} from '../../services/api/user.service';
import {Router, RouterModule} from '@angular/router';
@Component({
  selector: 'app-home',
  imports: [NzBreadCrumbModule, NzIconModule, NzMenuModule, NzLayoutModule,RouterModule  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  isCollapsed = false;

  constructor(
    public authQuery: AuthQuery,
    private authService: AuthService,
    private router: Router,
    private userService: UserService
  ) { }

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
