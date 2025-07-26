import { Injectable } from '@angular/core';
import { HttpClientService } from '../http-client.service';
import { HttpEvent } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import {Result, SimpleResult} from '../../models/Result';
import {environment} from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(private httpService: HttpClientService) {


  }

  fileUpload(file: File): Observable<HttpEvent<Result<string>>> {

    const formData = new FormData();

    formData.append("file", file);

    return this.httpService.postEvent<FormData, Result<string>>({
      fullPath: environment.fileUrl + "/File/Save"
    }, formData);

  }

  getImgSimilarity(file1: File,file2: File): Observable<HttpEvent<Result<number>>> {

    const formData = new FormData();

    formData.append("file1", file1);
    formData.append("file2", file2);

    return  this.httpService.postEvent<FormData, Result<number>>({
      fullPath: environment.fileUrl + "/File/GetImgSimilarity"
    }, formData);


  }

  fileDelete(url: string): Promise<SimpleResult> {
    let e = this.httpService.delete<SimpleResult>({
      fullPath: environment.fileUrl + "/File/Delete?PhotoUrl=" + url
    }, "");
    return firstValueFrom(e);
  }
}
