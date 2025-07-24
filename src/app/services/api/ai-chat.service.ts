import {Inject, Injectable} from '@angular/core';
import {AddChatHistoryReq, ChatMessage, ChatSession} from '../../models/ai-chat';
import {HttpClientService} from '../http-client.service';
import {Result, SimpleResult} from '../../models/Result';
import {firstValueFrom} from 'rxjs';
import {position} from '../../models/AppUser';

@Injectable({
  providedIn: 'root'
})
export class AiChatService {

  constructor(private httpService: HttpClientService, @Inject("aiApiUrl") public baseUrl: string) {
    this.httpService.baseUrl=baseUrl;
  }

  getSessions(): Promise<Result<ChatSession[]>> {
    const r = this.httpService.get<Result<ChatSession[]>>({
      path: "ChatHistory/AllSession"
    });
    return firstValueFrom(r);
  }
  getSessionById(id:string): Promise<Result<ChatSession>> {
    const r = this.httpService.get<Result<ChatSession>>({
      path: "ChatHistory/GetSessionById"
    });
    return firstValueFrom(r);
  }


  createSession(): Promise<Result<ChatSession>> {
    const r = this.httpService.postSimple<Result<ChatSession>>({
      path: "ChatHistory/CreateSession"
    });
    return firstValueFrom(r);
  }

  addHistory(value: AddChatHistoryReq): Promise<SimpleResult> {
    const r = this.httpService.post<AddChatHistoryReq,SimpleResult>({
      path: "ChatHistory/AddHistory"
    },value);
    return firstValueFrom(r);
  }


}
