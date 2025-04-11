import { Injectable } from '@angular/core';
import { AuthStore } from './auth.store';
import { Query, toBoolean } from '@datorama/akita';
import { jwtDecode } from "jwt-decode";
import { AuthState, Token_Decode, UserClaim } from '../../models/AppUser';


@Injectable({ providedIn: 'root' })
export class AuthQuery extends Query<AuthState> {
  user$ = this.select();
  userId$ = this.select('id');

  roles:string[];
  userId:number;
  userClaims:UserClaim[];

  isLoggedIn$ = this.select(state => toBoolean(state.token));
  constructor( store: AuthStore) {
    super(store);
    this.user$.subscribe(mm=>{
      if(mm.token){
        this.roles = jwtDecode <Token_Decode>(mm.token)?.Role;
        this.userId=jwtDecode<Token_Decode>(mm.token)?.Id;
      }
      if(mm.claims)
      this.userClaims=mm.claims;
    })
  }
  
}