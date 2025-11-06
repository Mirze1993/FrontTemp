import {Inject, Injectable} from '@angular/core';
import * as signalR from '@microsoft/signalr';
import {AuthStore} from '../stores/auth/auth.store';
import {HttpErrorResponse} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {

  token: string;

  constructor(
    private authStore: AuthStore,
    @Inject("aiApiUrl") private aiBaseUrl,
    @Inject("authApiUrl") private authApiUrl) {
    authStore.state$.subscribe((state) => {
      this.token = state.token;
    })
  }

  private hubAiChatConnection: signalR.HubConnection;
  private callHubConnection: signalR.HubConnection;

  public startAiConnection = () => {
    this.hubAiChatConnection = new signalR.HubConnectionBuilder()
      .withAutomaticReconnect()
      .withUrl(this.aiBaseUrl + "/chat"
        , {
          accessTokenFactory: () => {
            return this.token
          }
        }
      )
      .build();


    this.hubAiChatConnection.start()
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


  public ReceiveAiMessage = (fn: (data: string, isEnd: boolean) => void) => {
    this.hubAiChatConnection.on("ReceiveMessage", (data: string, isEnd: boolean) => {
      fn(data, isEnd);
    });
  }

  sendAiMessage(message: string, sessionId: string): void {
    this.hubAiChatConnection.invoke('sendMessageAi', {Content: message, sessionId: sessionId});
  }


  public startCallConnection = () => {
    this.callHubConnection = new signalR.HubConnectionBuilder()
      .withAutomaticReconnect()
      .withUrl(this.authApiUrl + "/callChat"
        , {
          accessTokenFactory: () => {
            return this.token
          }
        }
      )
      .build();


    this.callHubConnection.start()
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
  public stopCallConnection = ()=>{
    this.callHubConnection.stop();
    this.callHubConnection = null;
  }

  public videoCallOfferCome = (fn: (name: string, picture: string) => void) => {
    this.callHubConnection.on("VideoCallOfferCome", (name: string, picture: string) => {
      fn(name, picture);
    });
  }

  startOfferVideoCall(userId: string): void {
    this.callHubConnection.invoke('StartOfferVideoCall', {userId: userId});
  }

}
