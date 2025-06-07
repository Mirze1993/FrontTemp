import {Routes} from '@angular/router';
import {DbCompileComponent} from './db-compile/db-compile.component';

export const adminRoutes: Routes = [
  {
    path: 'db-compile',
    loadComponent : ()=>import("./db-compile/db-compile.component").then(value => value.DbCompileComponent)
  }
];
