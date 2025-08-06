import {Routes} from '@angular/router';
import {LoginComponent} from './pages/login/login.component';
import {HomeComponent} from './pages/home/home.component';
import {adminRoutes} from './pages/home/admin/admin.routes';
import {homeRoutes} from './pages/home/home.routes';
import {authGuard} from './guards/guards';

export const routes: Routes = [
  {path: '', redirectTo: 'home', pathMatch: 'full'},
  {path: 'home',
    loadComponent : ()=>import("./pages/home/home.component").then(value => value.HomeComponent),
    children: homeRoutes,
    canActivate:[authGuard],
  },
  {path: 'login', component: LoginComponent},
  {
    path: 'error',
    loadComponent: () => import("./pages/error/error.component").then(value => value.ErrorComponent)
  },
];
