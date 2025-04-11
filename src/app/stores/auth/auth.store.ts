import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { AuthState } from '../../models/AppUser';



export function createInitialAuthState(): AuthState {
    return { } as AuthState;
  }
  
  @Injectable({ providedIn: 'root' })
  @StoreConfig({
    name: 'auth'
  })
  export class AuthStore extends Store<AuthState> {
    constructor() {
      super(createInitialAuthState());
    }
}