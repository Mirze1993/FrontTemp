import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import {AuthStore} from '../stores/auth/auth.store';
import {UserService} from '../services/api/user.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authQuery = inject(AuthStore);
  const userService = inject(UserService);
  const router = inject(Router);

  const isLoggedIn = authQuery.isLoggedIn;

  if (isLoggedIn) {
    const roles =userService.getRoles(authQuery.userClaims)
    console.log(roles);
    if (roles) {
      const routeRoles = route.data['roles'] as string[] | undefined;
      if (
        routeRoles &&
        routeRoles.findIndex((r) => roles.indexOf(r) !== -1) < 0
      ) {
        // İcazəsiz giriş
        router.navigate(['/error']);
        return false;
      }

      return true;
    }
  }

  return router.createUrlTree(['/login']);
};
