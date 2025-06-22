import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthStore } from './auth.store';
import { Session, Token_Decode } from '../../models/AppUser';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';
import { UserService } from '../../services/api/user.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl: string;
  constructor(private _http: HttpClient, private _store: AuthStore,private userService:UserService) {
    this.baseUrl = environment.apiUrl;
  }

  login(session: Session) {
    this._store.setLoading(true);
    const ju = jwtDecode<Token_Decode>(session.token);
    this._store.setAuthState(   {
      token: session.token,
      refToken: session.refreshToken,
      photo: "https://res.cloudinary.com/dvujyxh7e/image/upload/c_scale,w_48/v1593253478/trung-vo_bioxmc.png",
      id: ju.Id,
      email: ju.Email,
      loading: false
    }) ;

    this._store.setLoading(false);
    this.setProfile();
    //this._store.setError(err);
  }

  exit(){
    this._store.resetAuthState();
    localStorage.removeItem('authState');
  };

  setProfile() {

    this.userService.getProfile().then(mm=>{
      if(mm.success){
        const url= this.userService.getImg(mm.value);
        const name= this.userService.getName(mm.value);
        console.log(name)
        this._store.setAuthState({
          ...this._store.currentStateValue,
          photo: url,
          name:name,
          claims: mm.value
        });
      }
    });
    //this._store.setLoading(true);


    // this._store.setLoading(false);
    //this._store.setError(err);
  }
}

