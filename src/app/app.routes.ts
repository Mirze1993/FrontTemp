import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import {HomeComponent} from './pages/home/home.component';
import {adminRoutes} from './pages/home/admin/admin.routes';
import {homeRoutes} from './pages/home/home.routes';

export const routes: Routes = [
   {path: '', redirectTo: 'home', pathMatch: 'full'},
   {path:'home',component:HomeComponent, children:homeRoutes},
   {path:'login', component:LoginComponent},
];
