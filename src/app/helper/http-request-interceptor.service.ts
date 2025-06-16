import { HttpInterceptor, HttpHeaders, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, catchError, throwError, switchMap } from 'rxjs';
import { AuthStore } from '../stores/auth/auth.store';
import { AuthService } from '../stores/auth/auth.service';
import { UserService } from '../services/api/user.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class HttpRequestInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  token?: string;
  reftoken?: string;
  header?: HttpHeaders;
  constructor(
    private _store: AuthStore,
    private authService: AuthService,
    private userService: UserService, private router:Router
  ) {

  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    this.token = this._store.currentStateValue.token;

    if (this.token) {
      return next.handle(this.copyReq(req, this.token)).pipe(map(event => {
        if (event instanceof HttpResponse) {
          if (event.status === 200) {
          }
        }
        return event;
      })
        , catchError(response => {

          if (response instanceof HttpErrorResponse) {
            if (response.status === 401) {
              return this.handle401Error(req, next);
            }
          }
          return throwError(() => response);
        })
      );
    }
    return next.handle(req).pipe(map(event => {
      if (event instanceof HttpResponse) {
        if (event.status === 200) {

        }
      }
      return event;
    })
      , catchError(response => {

        if (response instanceof HttpErrorResponse) {
          if (response.status === 401) {
            this.router.navigate(['/login']);
          }
        }
        return throwError(() => response);
      }));
  }


  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      const state = this._store.currentStateValue;
      return this.userService.loginByRefreshToken(state.refToken, Number(state.id)).pipe(
        switchMap((mm) => {
          if (!mm.success) {
            sessionStorage.clear();
           // window.location.href = environment.mainAngular;
           this.router.navigate(['/login']);
            return throwError(() => mm.errorMessage);
          }
          this.isRefreshing = false;
          this.authService.login(mm.value);
          return next.handle(this.copyReq(request, mm.value.token));
        }),
        catchError((error) => {
          this.isRefreshing = false;
          if (error as HttpErrorResponse) {
            if (error.status === '401') {
              sessionStorage.clear();
              //window.location.href = environment.mainAngular;
              this.router.createUrlTree(['/login']);
            }
          }
          //window.location.href = environment.mainAngular;
          this.router.createUrlTree(['/login'])
          return throwError(() => error);
        })
      );
    }

    return next.handle(request);
  }

  private copyReq(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        // 'Content-Type': 'application/json',
      },
    });
  }
}


export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: HttpRequestInterceptor, multi: true },
];
