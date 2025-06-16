import {Routes} from '@angular/router';
import {authGuard} from '../../../guards/guards';

export const userRoutes: Routes = [
  {
    path: 'profile',
    loadComponent : ()=>import("./profile/profile.component").then(value => value.ProfileComponent),
    canActivate:[authGuard],
    data: { roles: ['user'] }
  }
];
