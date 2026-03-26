import {Inject, Injectable} from '@angular/core';
import {record} from 'rrweb';
import {eventWithTime} from '@rrweb/types';
import {
  rrWebCreateSessionPayload,
  rrWebEndSessionPayload
} from '../models/rr-web-models';
import {firstValueFrom, Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {UpdateProfilReq, UserClaim} from '../models/AppUser';
import {Result, SimpleResult} from '../models/Result';
import {HttpClientService} from './http-client.service';
import {NzNotificationService} from 'ng-zorro-antd/notification';

@Injectable({
  providedIn: 'root',
})
export class RrWebService {

  private events: eventWithTime[] = [];
  private stopFn: (() => void) | null = null;
  private sessionId: string = '';
  private startedAt: string = '';
  private flushInterval?: ReturnType<typeof setInterval>;

  httpService: HttpClientService

  constructor(@Inject("authApiUrl") public baseUrl: string
              , private httpClient: HttpClient,
              private notification: NzNotificationService) {
    this.httpService = new HttpClientService(httpClient, baseUrl);
  }

  async startRecording() {
    if (this.stopFn)
      return;
    this.events = [];

    let session=await  this.createSession();
    if (session.success) {
      this.sessionId=session.value
      this.stopFn = record({
        emit: (event) => {
          this.events.push(event);
        },
        // Ağ isteklerini de kaydet
        recordCanvas: false,
        sampling: {
          mousemove: 50,
          mouseInteraction: true,
          scroll: 150,
          media: 800,
          input: 'last',
        },
      });
      this.flushInterval = setInterval(() => this.flushChunk(), 3_000);
      this.notification.create(
        'success',
        'Login',
        'Start oldu'
      );
    }else {
      this.notification.create(
        'error',
        'Xeta',
        session.errorMessage
      );
    }

  }

  /** Kaydı durdurur ve son verileri gönderir. */
  async stopRecording(): Promise<void> {
    if (this.stopFn) {
      this.stopFn();
      this.stopFn = null;
    }
    clearInterval(this.flushInterval);

    await this.endSession();
    this.events = [];
    this.sessionId = '';
  }

  /** Tüm oturumları listeler. */
  // getSessions(): Observable<rrWebSessionSummary[]> {
  //   return this.http.get<SessionSummary[]>(this.API);
  // }


  /** Belirli bir oturumun eventlerini getirir. */
  // getSessionEvents(id: string): Observable<eventWithTime[]> {
  //   return this.http.get<eventWithTime[]>(`${this.API}/${id}/events`);
  // }

  get isRecording(): boolean {
    return !!this.stopFn;
  }

  get currentSessionId(): string {
    return this.sessionId;
  }

  flushChunkPending:boolean=false;
  private async flushChunk(): Promise<void> {
    if (!this.events.length ||!(this.events.length>0))
      return;

    if (this.flushChunkPending)
      return;
    this.flushChunkPending=true;
    const chunk = [...this.events];
    this.events = [];

     await firstValueFrom(this.httpService.post<any, SimpleResult>({path: 'rrweb/AppendChunk',}, {events: chunk,id: this.sessionId}));
    this.flushChunkPending=false;
  }

  private async  createSession(): Promise<Result<string>> {
    const payload: rrWebCreateSessionPayload = {
      url: location.href,
      userAgent: navigator.userAgent,
    };
    return await  firstValueFrom(this.httpService.post<any, Result<string>>({path: 'rrweb/CreateSession',}, payload));
  }

  private async  endSession(): Promise<Result<string>> {
    const payload: rrWebEndSessionPayload = {
     id:this.sessionId, events: this.events,
    };
    return await  firstValueFrom(this.httpService.post<any, Result<string>>({path: 'rrweb/EndSession',}, payload));
  }

  getList(): Promise<Result<any[]>> {
    const r = this.httpService.get<Result<UserClaim[]>>({
      path: "rrweb/GetAll"
    });
    return firstValueFrom(r);
  }

  getById(id: string): Promise<Result<any>> {
    let params = { id: id };
    const r = this.httpService.get<Result<any>>({
      path: "rrweb/GetById",params: params
    });
    return firstValueFrom(r);
  }

  streamById(id: string): Promise<any> {
    let params = { id: id };
    const r = this.httpService.get<any>({
      path: "rrweb/StreamById",params: params
    });
    return firstValueFrom(r);
  }

  getPageAnalytics(): Promise<any> {
    const r= this.httpService.get<any>({path: "rrweb/analyticsPages"});
    return firstValueFrom(r);
  }

  sessionAnalytics(id): Promise<any> {
    let params = { id: id };
    const r= this.httpService.get<any>({path: "rrweb/sessionAnalytics",params: params});
    return firstValueFrom(r);
  }

  streamEvents(sessionId: string): Observable<any> {
    return new Observable(observer => {
      // AbortController əlavə etmək lazımdır ki, Observable unsubscribe olanda request dayansın
      const controller = new AbortController();

      fetch(`${this.baseUrl}/rrweb/StreamById?id=${sessionId}`, { signal: controller.signal })
        .then(async response => {
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          if (!reader) {
            observer.error('Reader tapılmadı');
            return;
          }

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');

            // Son natamam sətiri buffer-da saxlayırıq
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmedLine = line.trim();
              console.log(trimmedLine);
              if (trimmedLine) {
                try {
                  // Əgər backend-dən kvadrat mötərizə və ya vergül gəlirsə onları təmizləmək lazım ola bilər
                  const cleanLine = trimmedLine.replace(/^,|^\[|\]$/, '');

                  if (cleanLine) {
                    observer.next(JSON.parse(cleanLine));
                  }
                } catch (e) {
                  console.error("Parsing xətası:", trimmedLine);
                }
              }
            }
          }
          observer.complete();
        })
        .catch(err => observer.error(err));

      // Observable abunəliyi ləğv ediləndə bağlantını kəs
      return () => controller.abort();
    });
  }

}
