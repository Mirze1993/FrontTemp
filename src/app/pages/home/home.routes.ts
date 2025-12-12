import {Routes} from '@angular/router';
import {adminRoutes} from './admin/admin.routes';
import {HomeComponent} from './home.component';
import {userRoutes} from './user/user.routes';

export const homeRoutes: Routes = [
  {path: '', redirectTo: 'user', pathMatch: 'full'},
  //{path:"admin",children:adminRoutes},
  {path:"user",children:userRoutes}
];
