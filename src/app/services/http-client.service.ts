import { HttpClient, HttpEvent, HttpParams, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpClientService {

  constructor(private httpClient: HttpClient, @Inject("baseUrl") private baseUrl: string) {

  }

  private getUrl(requestParameter: RequestParametr): string {

    return `${requestParameter.baseUrl ? requestParameter.baseUrl : this.baseUrl}/${requestParameter.path}`;
  }
  get<T>(reqParam: Partial<RequestParametr>, id?: string): Observable<T> {

    let url: string = "";
    if (reqParam.fullPath)
      url = reqParam.fullPath;
    else
      url = `${this.getUrl(reqParam)}${id ? `/${id}` : ""}`;

    return this.httpClient.get<T>(url, {
      headers: reqParam.headers,
      params:reqParam.params
    })

  }

  post<T, R>(
    requestParameter: Partial<RequestParametr>,
    body: Partial<T>,
    successCallBack?:()=>void,
    errorCallBack?:(errorMsg:string)=>void
    ): Observable<R> {

    let url: string = "";
    if (requestParameter.fullPath)
      url = requestParameter.fullPath;
    else
      url = `${this.getUrl(requestParameter)}${requestParameter.queryString ? `?${requestParameter.queryString}` : ""}`

    return this.httpClient.post<R>(url, body, { headers: requestParameter.headers });
  }

  postRouter<T>(reqParam: Partial<RequestParametr>, id: number): Observable<T> {
    let url: string = "";
    if (reqParam.fullPath)
      url = reqParam.fullPath;
    else
      url = `${this.getUrl(reqParam)}/${id}`;

    return this.httpClient.delete<T>(url, {
      headers: reqParam.headers
    })
  }

  postEvent<T, R>(
    requestParameter: Partial<RequestParametr>,
    body: Partial<T>,
    successCallBack?:()=>void,
    errorCallBack?:(errorMsg:string)=>void
    ): Observable<HttpEvent<R>> {

    let url: string = "";
    if (requestParameter.fullPath)
      url = requestParameter.fullPath;
    else
      url = `${this.getUrl(requestParameter)}${requestParameter.queryString ? `?${requestParameter.queryString}` : ""}`

    return this.httpClient.post<R>(url, body, { headers: requestParameter.headers,observe:"events",reportProgress: true });
  }

  put<T>(reqParam: Partial<RequestParametr>, body: Partial<T>): Observable<T> {
    let url: string = "";
    if (reqParam.fullPath)
      url = reqParam.fullPath;
    else
      url = `${this.getUrl(reqParam)}`;

    return this.httpClient.put<T>(url, body, {
      headers: reqParam.headers
    });
  }

  delete<T>(reqParam: Partial<RequestParametr>, id: string): Observable<T> {
    let url: string = "";
    if (reqParam.fullPath)
      url = reqParam.fullPath;
    else
      url = `${this.getUrl(reqParam)}/${id}`;

    return this.httpClient.delete<T>(url, {
      headers: reqParam.headers
    })
  }


  ToHttpParams(request: any): HttpParams {
    let httpParams = new HttpParams();
    Object.keys(request).forEach(function (key) {
      httpParams = httpParams.append(key, request[key]);
    });

    return httpParams;
  }


}

export class RequestParametr {
  path?: string;
  queryString?: string;

  headers?: HttpHeaders;
  params?:HttpParams | {[param: string]: string | number | boolean | readonly (string | number | boolean)[];}
  baseUrl?: string;
  fullPath?: string;

}
