import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { AuthStore } from './auth.store';
import { resetStores } from '@datorama/akita';
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
    this._store.update((state) => {
      return {
        ...state,
        ... {
          token: session.token,
          refToken: session.refreshToken,
          photo: "https://res.cloudinary.com/dvujyxh7e/image/upload/c_scale,w_48/v1593253478/trung-vo_bioxmc.png",
          id: ju.Id,
          name: ju.Name,
          email: ju.Email,

        }
      };
    });

    this._store.setLoading(false);
    // this.setPhoto();
    //this._store.setError(err);
  }

  exit(){
    resetStores();
    localStorage.removeItem('AkitaStores');
  };

  setPhoto() {

    this.userService.getProfil().then(mm=>{
      if(mm.success){
        const url= this.userService.getImg(mm.value);
        this._store.update((state) => {
          return {
            ...state,
            ... {
              photo: url,claims:mm.value
            }
          };
        });
      }
    });
    //this._store.setLoading(true);


    // this._store.setLoading(false);
    //this._store.setError(err);
  }
}

