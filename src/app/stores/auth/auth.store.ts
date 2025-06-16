import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {ComponentStore} from '@ngrx/component-store';
import {AuthState, Token_Decode, UserClaim} from '../../models/AppUser';
import {toBoolean, toNumber} from 'ng-zorro-antd/core/util';
import {jwtDecode} from 'jwt-decode';
import {isPlatformBrowser} from '@angular/common';

export function createInitialAuthState(): AuthState {
  return {
    loading: false,
  } as AuthState;
}

@Injectable({providedIn: 'root'})
export class AuthStore extends ComponentStore<AuthState> {

  public currentStateValue: AuthState;
  public isLoggedIn: boolean;
  // State select
  readonly user$ = this.select(state => state);


  roles: string[] = [];
  userId: number | undefined;
  userClaims: UserClaim[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    const initialState = createInitialAuthState();

    // Əvvəlcədən localStorage-u oxu
    if (isPlatformBrowser(platformId)) {
      const saved = localStorage.getItem('authState');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          Object.assign(initialState, parsed); // localStorage-dakı məlumatları initial state-ə qoy
        } catch (e) {
          console.error('LocalStorage parse error:', e);
        }
      }
    }

    // İndi ComponentStore-u localStorage-dan yüklənmiş state ilə qur
    super(initialState);

    // Subscribe & localStorage yeniləmə
    if (isPlatformBrowser(this.platformId)) {
      this.user$.subscribe(state => {
        this.currentStateValue = state;
        localStorage.setItem('authState', JSON.stringify(state));
        if (state.token) {
          const decoded = jwtDecode<Token_Decode>(state.token);
          this.isLoggedIn =toNumber(decoded.exp)  * 1000 > Date.now();
          this.roles =decoded.Role || [];
          this.userId = decoded.Id;
        }else{
          this.roles=[];
          this.userId = -1;
          this.isLoggedIn=false;
        }

        if (state.claims) {
          this.userClaims = state.claims;
        }
      });
    }
  }

  readonly setAuthState = this.updater((state, auth: AuthState) => ({
    ...state,
    ...auth,
  }));

  readonly setLoading = this.updater((state, loading: boolean) => ({
    ...state,
    loading
  }));

  readonly resetAuthState = this.updater(() => createInitialAuthState());


}




