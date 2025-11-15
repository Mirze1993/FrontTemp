import {ElementRef, Injectable} from '@angular/core';
import {SignalrService} from './signalr.service';

@Injectable({
  providedIn: 'root'
})
export class CallRctService {

  configuration: RTCConfiguration = {
    iceServers: [
      {
        urls: "stun:stun.relay.metered.ca:80",
      },
      {
        urls: "turn:standard.relay.metered.ca:80",
        username: "556fe57d4b626406262f6439",
        credential: "LjU+37v9uBMwm0z1",
      },
      {
        urls: "turn:standard.relay.metered.ca:80?transport=tcp",
        username: "556fe57d4b626406262f6439",
        credential: "LjU+37v9uBMwm0z1",
      },
      {
        urls: "turn:standard.relay.metered.ca:443",
        username: "556fe57d4b626406262f6439",
        credential: "LjU+37v9uBMwm0z1",
      },
      {
        urls: "turns:standard.relay.metered.ca:443?transport=tcp",
        username: "556fe57d4b626406262f6439",
        credential: "LjU+37v9uBMwm0z1",
      },
    ],
    iceCandidatePoolSize: 10
  }

  connection: RTCPeerConnection;
  guid: string;

  constructor(private signalRService: SignalrService) {
  }

  async makeCall(remoteVideo: ElementRef,localVideo: ElementRef) {
    await this._initConnection(remoteVideo,localVideo)
    const offer = await this.connection.createOffer();
    await this.connection.setLocalDescription(offer);
    this.signalRService.rtcSignal(this.guid, {type: 'offer', offer});
    console.log(offer);

  }

  public async handleOffer(
    offer: RTCSessionDescription,
    remoteVideo: ElementRef,
    localVideo: ElementRef
  ): Promise<void> {
    await this._initConnection(remoteVideo,localVideo);

    console.log('handle offler', offer);
    await this.connection.setRemoteDescription(
      new RTCSessionDescription(offer)
    );

    const answer = await this.connection.createAnswer();

    await this.connection.setLocalDescription(answer);

    this.signalRService.rtcSignal(this.guid, {type: 'answer', answer});
    if(this.pendingCandidates){
      for (const c of this.pendingCandidates) {
        await this.connection.addIceCandidate(c).catch(console.error);
      }
    }
  }

  public async handleAnswer(answer: RTCSessionDescription): Promise<void> {
    await this.connection.setRemoteDescription(
      new RTCSessionDescription(answer)
    );
  }

  pendingCandidates: RTCIceCandidateInit[] = [];

  public async handleCandidate(candidate: RTCIceCandidate): Promise<void> {
    if (candidate) {
      console.log('handleCandidate', candidate);
      console.log('handleCandidate remoteDescription', this.connection.remoteDescription);
      if (this.connection.remoteDescription)
        await this.connection.addIceCandidate(new RTCIceCandidate(candidate));
      else
        this.pendingCandidates.push(new RTCIceCandidate(candidate));
    }
  }


  private async _initConnection(remoteVideo: ElementRef,localVideo:ElementRef): Promise<void> {
    this.connection = new RTCPeerConnection(this.configuration);

    await this._getStreams(remoteVideo,localVideo);

    this._registerConnectionListeners();
  }

  private _registerConnectionListeners(): void {
    this.connection.onicegatheringstatechange = ev => {
      console.log(
        `ICE gathering state changed: ${this.connection.iceGatheringState}`
      );
      switch (this.connection.iceGatheringState) {
        case "new":
          console.log("🔹 ICE gathering başlamayıb");
          break;
        case "gathering":
          console.log("🔸 ICE gathering gedir...");
          break;
        case "complete":
          console.log("✅ ICE gathering bitdi!");
          break;
      }
    }

    this.connection.onconnectionstatechange = () => {
      console.log(
        `Connection state change: ${this.connection.connectionState}`
      );
    };

    this.connection.onsignalingstatechange = () => {
      console.log(`Signaling state change: ${this.connection.signalingState}`);
    };

    this.connection.onicecandidate = (event) => {
      if (event.candidate) {
        const payload = {
          type: 'candidate',
          candidate: event.candidate.toJSON(),
        };
        this.signalRService.rtcSignal(this.guid, payload);
      }
    };

  }

  localStream!: MediaStream | null;
  private async _getStreams(remoteVideo: ElementRef,localVideo:ElementRef): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    this.localStream = stream;


    const remoteStream = new MediaStream();

    remoteVideo.nativeElement.srcObject = remoteStream;

    this.connection.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
    };

    stream.getTracks().forEach((track) => {
      this.connection.addTrack(track, stream);
    });

    localVideo.nativeElement.srcObject =  this.localStream ;
  }
  stopLocalCamera() {
    if (!this.localStream) return;

    this.localStream.getTracks().forEach(t => t.stop());
    this.localStream = null;
  }

}
