import { Injectable } from '@angular/core';
import { HttpClientService } from '../http-client.service';
import { delay, first, firstValueFrom, map, Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { Result, SimpleResult } from '../../models/Result';
import { LoginByRefTokReq, LoginUserReq, UpdateProfilReq, SetClaimReq, Register, RoleValue, UserClaim, SearchUserResp, NotifResp, intList, position, UserInfoResp, ClaimType, Session } from '../../models/AppUser';
@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private httpservice: HttpClientService) { }

  loginByRefreshToken(refToken: string, id: number) {
    let req = new LoginByRefTokReq(refToken, id);
    return this.httpservice.post<LoginByRefTokReq, Result<Session>>({ path: 'auth/loginByRefreshToken', }, req);
  }

  async login(
    user: LoginUserReq,
    successCallBack?: () => void,
    errorCallBack?: (errorMessage: string) => void): Promise<Result<Session>> {
    try {
      const observable = this.httpservice.post<LoginUserReq, Result<Session>>({ path: 'auth/login', }, user, successCallBack, errorCallBack);

      return await firstValueFrom(observable);
    } catch (e) {
      //errorCallBack(e.message)
      return new Promise<Result<Session>>((resolve, reject) => {
        resolve(
          new Result<Session>().errorResult("errorrr: " + e)
        )
      });
    }
  }

  updateProfile(req: UpdateProfilReq): Promise<Result<boolean>> {

    return firstValueFrom(this.httpservice.post<UpdateProfilReq, Result<boolean>>({ path: 'user/UpdateProfile', }, req));
  }


  setClaim(req: SetClaimReq): Promise<Result<number>> {
    let r = this.httpservice.post<SetClaimReq, Result<number>>({ path: 'auth/SetClaim', }, req);
    return firstValueFrom(r);
  }

  register(req: Register): Promise<Result<number>> {
    let r = this.httpservice.post<Register, Result<number>>({ path: 'auth/register', }, req);
    return firstValueFrom(r);
  }

  removeClaimByType(req: SetClaimReq): Promise<Result<number>> {
    let r = this.httpservice.post<SetClaimReq, Result<number>>({ path: 'auth/RemoveClaimByType', }, req);
    return firstValueFrom(r);
  }


  getRoleValue(): Promise<Result<RoleValue[]>> {

    const r = this.httpservice.get<Result<RoleValue[]>>({
      path: "auth/GetRoleValue"
    });
    return firstValueFrom(r);
  }


  getProfile(): Promise<Result<UserClaim[]>> {

    const r = this.httpservice.get<Result<UserClaim[]>>({
      path: "user/GetProfile"
    });
    return firstValueFrom(r);
  }

  getProfileById(id: number): Promise<Result<UserClaim[]>> {
    let params = { id: id };
    const r = this.httpservice.get<Result<UserClaim[]>>({
      path: "user/GetProfile", params: params
    });
    return firstValueFrom(r);
  }

  searchUser(name: string): Promise<Result<SearchUserResp[]>> {

    let httpParams = new HttpParams();

    httpParams = httpParams.append("name", name ? name : "%");


    const r = this.httpservice.get<Result<SearchUserResp[]>>({
      path: "user/SearchUsers",
      params: httpParams
    });
    return firstValueFrom(r);
  }


  //---------notif-----------

  getNotif(): Promise<Result<NotifResp[]>> {
    const r = this.httpservice.get<Result<NotifResp[]>>({
      path: "auth/GetNotif",
    });
    return firstValueFrom(r);
  }

  getUnreadNotifCount(): Promise<Result<number>> {
    const r = this.httpservice.get<Result<number>>({
      path: "user/GetUnReadNotifCount",
    });
    return firstValueFrom(r);
  }

  ReadNotif(values: number[]): Promise<SimpleResult> {
    let req :intList={values:values};
    const r = this.httpservice.post<intList,SimpleResult>({
      path: "user/ReadNotif"
    },req);
    return firstValueFrom(r);
  }
  //--------------------------
  InstPosition(value: position): Promise<SimpleResult> {
    const r = this.httpservice.post<position,SimpleResult>({
      path: "user/InstPosition"
    },value);
    return firstValueFrom(r);
  }


  GetPosition(): Promise<Result<position[]>> {
    const r = this.httpservice.get<Result<position[]>>({
      path: "user/GetPosition",
    });
    return firstValueFrom(r);
  }

  DeletePosition(id: number): Promise<SimpleResult> {
    const param = { id: id }
    return firstValueFrom( this.httpservice.delete<SimpleResult>({
      path: 'user/DeletePosition'
    }, id.toString()));
  }


  //---------------------------




  getFilePath(path: string): string {
    if (path)
      return path;
    return null;
  }

  ToJUser(list: SearchUserResp[]): UserInfoResp[] {
    let users: UserInfoResp[] = [];
    for (var item of list) {
      users.push({
        id: item.appUserId,
        photo: this.getFilePath(item.photo) || 'https://therichpost.com/wp-content/uploads/2020/06/avatar2.png',
        name: item.name,
      });

    }
    return users;
  };


  getClaimValue(claims: UserClaim[], type: ClaimType): string {
    return claims.find(mm => mm.type === type).value;
  }

  getName(claims: UserClaim[]): string {
    return claims.find(mm => mm.type === ClaimType.Name).value;
  }

  getRoles(claims: UserClaim[]): string[] {
    return claims.filter(mm => mm.type === ClaimType.Role).map(mm=>mm.value);
  }
  getImg(claims: UserClaim[]): string {
    return this.getFilePath(claims.find(mm => mm.type === ClaimType.ProfilPictur)?.value);
  }

  getPosition(claims: UserClaim[]): string {
    return claims.find(mm => mm.type === ClaimType.JobPosission)?.value;
  }

}
