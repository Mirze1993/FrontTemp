import {Routes} from '@angular/router';
import {adminRoutes} from './admin/admin.routes';
import {HomeComponent} from './home.component';

export const homeRoutes: Routes = [
  {path:"admin",children:adminRoutes}
];
