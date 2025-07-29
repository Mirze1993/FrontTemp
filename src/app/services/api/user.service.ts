import {Inject, Injectable} from '@angular/core';
import { HttpClientService } from '../http-client.service';
import { delay, first, firstValueFrom, map, Observable } from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';
import { Result, SimpleResult } from '../../models/Result';
import {
  LoginByRefTokReq,
  LoginUserReq,
  UpdateProfilReq,
  SetClaimReq,
  Register,
  RoleValue,
  UserClaim,
  SearchUserResp,
  NotifResp,
  intList,
  position,
  UserInfoResp,
  ClaimType,
  Session,
  asanFinanceResp
} from '../../models/AppUser';
import {environment} from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  httpService: HttpClientService
  constructor( @Inject("authApiUrl") public baseUrl: string,private httpClient: HttpClient) {
    this.httpService=new HttpClientService(httpClient,baseUrl);
  }

  loginByRefreshToken(refToken: string, id: number) {
    let req = new LoginByRefTokReq(refToken, id);
    return this.httpService.post<LoginByRefTokReq, Result<Session>>({ path: 'auth/loginByRefreshToken', }, req);
  }

  async login(
    user: LoginUserReq,
    successCallBack?: () => void,
    errorCallBack?: (errorMessage: string) => void): Promise<Result<Session>> {
    try {
      const observable = this.httpService.post<LoginUserReq, Result<Session>>({ path: 'auth/login', }, user, successCallBack, errorCallBack);

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

    return firstValueFrom(this.httpService.post<UpdateProfilReq, Result<boolean>>({ path: 'user/UpdateProfile', }, req));
  }


  setClaim(req: SetClaimReq): Promise<Result<number>> {
    let r = this.httpService.post<SetClaimReq, Result<number>>({ path: 'user/SetClaim', }, req);
    return firstValueFrom(r);
  }

  register(req: Register): Promise<Result<number>> {
    let r = this.httpService.post<Register, Result<number>>({ path: 'auth/register', }, req);
    return firstValueFrom(r);
  }

  removeClaimByType(req: SetClaimReq): Promise<Result<number>> {
    let r = this.httpService.post<SetClaimReq, Result<number>>({ path: 'auth/RemoveClaimByType', }, req);
    return firstValueFrom(r);
  }


  getRoleValue(): Promise<Result<RoleValue[]>> {

    const r = this.httpService.get<Result<RoleValue[]>>({
      path: "user/GetRoleValue"
    });
    return firstValueFrom(r);
  }


  getProfile(): Promise<Result<UserClaim[]>> {

    const r = this.httpService.get<Result<UserClaim[]>>({
      path: "user/GetProfile"
    });
    return firstValueFrom(r);
  }

  getProfileById(id: number): Promise<Result<UserClaim[]>> {
    let params = { id: id };
    const r = this.httpService.get<Result<UserClaim[]>>({
      path: "user/GetProfile", params: params
    });
    return firstValueFrom(r);
  }

  searchUser(name: string): Promise<Result<SearchUserResp[]>> {

    let httpParams = new HttpParams();

    httpParams = httpParams.append("name", name ? name : "%");


    const r = this.httpService.get<Result<SearchUserResp[]>>({
      path: "user/SearchUsers",
      params: httpParams
    });
    return firstValueFrom(r);
  }


  //---------notif-----------

  getNotif(): Promise<Result<NotifResp[]>> {
    const r = this.httpService.get<Result<NotifResp[]>>({
      path: "user/GetNotif",
    });
    return firstValueFrom(r);
  }

  getUnreadNotifCount(): Promise<Result<number>> {
    const r = this.httpService.get<Result<number>>({
      path: "user/GetUnReadNotifCount",
    });
    return firstValueFrom(r);
  }

  ReadNotif(values: number[]): Promise<SimpleResult> {
    let req :intList={values:values};
    const r = this.httpService.post<intList,SimpleResult>({
      path: "user/ReadNotif"
    },req);
    return firstValueFrom(r);
  }
  //--------------------------
  InstPosition(value: position): Promise<SimpleResult> {
    const r = this.httpService.post<position,SimpleResult>({
      path: "user/InstPosition"
    },value);
    return firstValueFrom(r);
  }


  GetPosition(): Promise<Result<position[]>> {
    const r = this.httpService.get<Result<position[]>>({
      path: "user/GetPosition",
    });
    return firstValueFrom(r);
  }

  DeletePosition(id: number): Promise<SimpleResult> {
    const param = { id: id }
    return firstValueFrom( this.httpService.delete<SimpleResult>({
      path: 'user/DeletePosition'
    }, id.toString()));
  }


  //---------------------------

  GetUserFromAsanFinance(pin:string ): Promise<Result<asanFinanceResp>> {
    let httpParams = new HttpParams();

    httpParams = httpParams.append("pin",pin);
    const r = this.httpService.get<Result<asanFinanceResp>>({
      path: "user/GetUserFromAsanFinance",
      params: httpParams
    });
    return firstValueFrom(r);
  }


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
    return claims?.filter(mm => mm.type === ClaimType.Role)?.map(mm=>mm.value);
  }
  getImg(claims: UserClaim[]): string {
    return this.getFilePath(claims.find(mm => mm.type === ClaimType.ProfilPictur)?.value);
  }

  getImgFullPath(path: string): string {
    return path?environment.fileUrl+path:'https://www.w3schools.com/howto/img_avatar.png';
  }

  getPosition(claims: UserClaim[]): string {
    return claims.find(mm => mm.type === ClaimType.JobPosission)?.value;
  }

}
