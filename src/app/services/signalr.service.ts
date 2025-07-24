import {Inject, Injectable} from '@angular/core';
import * as signalR from '@microsoft/signalr';
import {AuthStore} from '../stores/auth/auth.store';
import {HttpErrorResponse} from '@angular/common/http';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {

  token:string;
  constructor( private authStore: AuthStore, @Inject("aiApiUrl") private baseUrl) {
    authStore.state$.subscribe((state) => {
      this.token= state.token;
    })
  }

  private hubConnection: signalR.HubConnection;

  public startConnection = () => {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withAutomaticReconnect()
      .withUrl(this.baseUrl+ "/chat"
        , { accessTokenFactory: () => { return this.token } }
      )
      .build();


    this.hubConnection.start()
      .then(() => console.log('Connection started'))
      .catch(error => {
        if (error as HttpErrorResponse) {
          if (error.status === '401') {
            console.log('-----------');
          }
        }
        console.log('Error while starting connection: ' + error)
      })
  }


  public ReceiveMessage = (fn: (data: string,isEnd:boolean) => void) => {
    this.hubConnection.on("ReceiveMessage", (data: string,isEnd:boolean) => {
      fn(data,isEnd);
    });
  }

  sendMessage(message: string,sessionId:string): void {
    this.hubConnection.invoke('sendMessageAi', {Content: message, sessionId: sessionId});
  }

}
