import { Injectable } from '@angular/core';
import {Result} from '../../models/Result';
import {RoleValue} from '../../models/AppUser';
import {firstValueFrom} from 'rxjs';
import {HttpClientService} from '../http-client.service';
import {CompileLog} from '../../models/Admin';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private httpService: HttpClientService) {

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
}
