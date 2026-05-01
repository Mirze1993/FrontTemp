import {Inject, Injectable} from '@angular/core';
import {Result, SimpleResult} from '../../models/Result';
import {position, RoleValue} from '../../models/AppUser';
import {firstValueFrom} from 'rxjs';
import {HttpClientService} from '../http-client.service';
import {CompileLog} from '../../models/Admin';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  httpService: HttpClientService
  constructor(@Inject("authApiUrl") public baseUrl: string,private httpClient: HttpClient) {
    this.httpService=new HttpClientService(httpClient,baseUrl);
  }

  GetDistinctList(): Promise<Result<string[]>> {

    const r = this.httpService.get<Result<string[]>>({
      path: "DbCompLog/GetDistinctList"
    });
    return firstValueFrom(r);
  }

  GetByName(name:string): Promise<Result<CompileLog[]>> {
    let params = { name: name };
    const r = this.httpService.get<Result<CompileLog[]>>({
      path: "DbCompLog/GetByName",params: params
    });
    return firstValueFrom(r);
  }
  GetById(id:number): Promise<Result<CompileLog>> {
    let params = { id: id };
    const r = this.httpService.get<Result<CompileLog>>({
      path: "DbCompLog/GetById",params: params
    });
    return firstValueFrom(r);
  }

  GetAllCompileRequests(): Promise<Result<any[]>> {

    const r = this.httpService.get<Result<any[]>>({
      path: "DbCompLog/GetAllCompileRequests"
    });
    return firstValueFrom(r);
  }

  GetCompileRequestById(requestId:number): Promise<Result<any>> {
    let params = { requestId: requestId };
    const r = this.httpService.get<Result<any[]>>({
      path: "DbCompLog/GetCompileRequestById",params: params
    });
    return firstValueFrom(r);
  }

  ApproveAndCompilePr(req: any): Promise<SimpleResult> {
    const r = this.httpService.post<any,SimpleResult>({
      path: "DbCompLog/ApproveAndCompilePr"
    },req);
    return firstValueFrom(r);
  }

  RejectAndCompilePr(req: any): Promise<SimpleResult> {
    const r = this.httpService.post<any,SimpleResult>({
      path: "DbCompLog/RejectAndCompilePr"
    },req);
    return firstValueFrom(r);
  }
}
