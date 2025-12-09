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



  startOfferVideoCall(userId: string,guid :string): void {
    this.callHubConnection.invoke('startOfferVideoCall', userId,guid)
      .catch(err => console.error("Video call error:", err));
  }
  public startOfferVideoCallHandle = (fn: (name: string, callerPhoto: string,callerId :string,guid:string) => void) => {
    this.callHubConnection.on("startOfferVideoCallHandle", (callerName: string, callerPhoto: string,callerId :string,guid:string) => {
      fn(callerName, callerPhoto,callerId,guid);
    });
  }



  endOfferVideoCall (guid:string,result:string): void {
    this.callHubConnection.invoke('endOfferVideoCall', guid,result);
  }
  public endOfferVideoCallHandle = (fn: (result:string) => void) => {
    this.callHubConnection.on("endOfferVideoCallHandle", (result) => {
      fn(result);
    });
  }

  acceptVideoCall(guid:string): void {
    this.callHubConnection.invoke('acceptVideoCall', guid);
  }

  acceptVideoCallHandle(fn:()=>void): void {
    this.callHubConnection.on("acceptVideoCallHandle", fn);
  }

  //---------------------------------------------------------------
  startOfferRtcChat(userId: string,guid :string): void {
    this.callHubConnection.invoke('startOfferRtcChat', userId,guid)
      .catch(err => console.error("Video call error:", err));
  }
  public startOfferRtcChatHandle = (fn: (name: string, callerPhoto: string,callerId :string,guid:string) => void) => {
    this.callHubConnection.on("startOfferRtcChatHandle", (callerName: string, callerPhoto: string,callerId :string,guid:string) => {
      fn(callerName, callerPhoto,callerId,guid);
    });
  }



  endOfferRtcChat (guid:string,result:string): void {
    this.callHubConnection.invoke('endOfferRtcChat', guid,result);
  }
  public endOfferRtcChatHandle = (fn: (result:string) => void) => {
    this.callHubConnection.on("endOfferRtcChatHandle", (result) => {
      fn(result);
    });
  }

  acceptRtcChat(guid:string): void {
    this.callHubConnection.invoke('acceptRtcChat', guid);
  }

  acceptRtcChatHandle(fn:()=>void): void {
    this.callHubConnection.on("acceptRtcChatHandle", fn);
  }
  //---------------------------------------------------------------

  videoRtcSignal(guid:string,payload:any){
    this.callHubConnection.invoke('videoRtcSignal', guid,payload);
  }

  videoRtcSignalHandler(fn:(data:any) => void) {
    this.callHubConnection.on("videoRtcSignalHandle", (data:any) => {
      fn(data)});
  }

  chatRtcSignal(guid:string,payload:any){
    this.callHubConnection.invoke('chatRtcSignal', guid,payload);
  }

  chatRtcSignalHandler(fn:(data:any) => void) {
    this.callHubConnection.on("chatRtcSignalHandle", (data:any) => {
      fn(data)});
  }

}
