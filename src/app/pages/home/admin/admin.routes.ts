import {Routes} from '@angular/router';
import {DbCompileComponent} from './db-compile/db-compile.component';
import {authGuard} from '../../../guards/guards';

export const adminRoutes: Routes = [
  {
    path: 'db-compile',
    loadComponent : ()=>import("./db-compile/db-compile.component").then(value => value.DbCompileComponent),
    canActivate:[authGuard],
  //  data: { roles: ['ADMIN'] }
  },
  {
    path: 'db-compile-pr',
    loadComponent : ()=>import("./db-compile-pr/db-compile-pr.component").then(value => value.DbCompilePrComponent),
    canActivate:[authGuard],
    //  data: { roles: ['ADMIN'] }
  },
  {
    path: 'db-compile-pr/detail/:id',
    loadComponent : ()=>import("./db-compile-pr-detail/db-compile-pr-detail.component").then(value => value.DbCompilePrDetailComponent),
    canActivate:[authGuard],
    //data: { roles: ['ADMIN']   }
  },
  {
    path: 'settings',
    loadComponent : ()=>import("./settings/settings.component").then(value => value.SettingsComponent),
    canActivate:[authGuard],
    //data: { roles: ['ADMIN']   }
  },
  {
    path: 'call-to-admin',
    loadComponent : ()=>import("./call-to-admin/call-to-admin.component").then(value => value.CallToAdminComponent),
    canActivate:[authGuard],
    //data: { roles: ['ADMIN']   }
  },
  {
    path: 'rrweb-records',
    loadComponent : ()=>import("./rrweb-records/rrweb-records.component").then(value => value.RrwebRecordsComponent),
    canActivate:[authGuard],
    //data: { roles: ['ADMIN']   }
  },
  {
    path: 'rrweb-analytics',
    loadComponent : ()=>import("./rrweb-analytics/rrweb-analytics.component").then(value => value.RrwebAnalyticsComponent),
    canActivate:[authGuard],
    //data: { roles: ['ADMIN']   }
  },
  {
    path: 'rrweb-records/replay/:id',
    loadComponent : ()=>import("../../../components/rrweb-replay/rrweb-replay.component").then(value => value.RrwebReplayComponent),
    canActivate:[authGuard],
    //data: { roles: ['ADMIN']   }
  }
];
