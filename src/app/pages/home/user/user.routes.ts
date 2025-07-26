import {Routes} from '@angular/router';
import {authGuard} from '../../../guards/guards';

export const userRoutes: Routes = [
  {
    path: 'profile',
    loadComponent : ()=>import("./profile/profile.component").then(value => value.ProfileComponent),
    canActivate:[authGuard],
    data: { roles: ['user'] }
  },
  {
    path: 'ai-chat',
    loadComponent : ()=>import("./ai-chat/ai-chat.component").then(value => value.AiChatComponent),
    canActivate:[authGuard],
    data: { roles: ['user'] }
  },
  {
    path: 'face-id',
    loadComponent : ()=>import("./face-id/face-id.component").then(value => value.FaceIdComponent),
    canActivate:[authGuard],
    data: { roles: ['user'] }
  }
];
