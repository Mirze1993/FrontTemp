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

  callType: 'chat' | 'video';


  dataChannel!: RTCDataChannel;

  constructor(private signalRService: SignalrService) {
  }

  //#region Video Call Operations
  async makeVideoCall(remoteVideo: ElementRef, localVideo: ElementRef) {
    this.callType = 'video';
    await this._initVideoConnection(remoteVideo, localVideo)
    const offer = await this.connection.createOffer();
    await this.connection.setLocalDescription(offer);
    this.signalRService.videoRtcSignal(this.guid, {type: 'offer', offer});
  }


  public async handleVideoOffer(
    offer: RTCSessionDescription,
    remoteVideo: ElementRef,
    localVideo: ElementRef
  ): Promise<void> {
    await this._initVideoConnection(remoteVideo, localVideo);
    await this.connection.setRemoteDescription(
      new RTCSessionDescription(offer)
    );

    const answer = await this.connection.createAnswer();

    await this.connection.setLocalDescription(answer);

    this.signalRService.videoRtcSignal(this.guid, {type: 'answer', answer});
    if (this.pendingCandidates) {
      for (const c of this.pendingCandidates) {
        await this.connection.addIceCandidate(c).catch(console.error);
      }
    }
  }


  private async _initVideoConnection(remoteVideo: ElementRef, localVideo: ElementRef): Promise<void> {
    this.connection = new RTCPeerConnection(this.configuration);

    await this._getVideoStreams(remoteVideo, localVideo);

    this._registerConnectionListeners();
  }

  localStream!: MediaStream | null;

  private async _getVideoStreams(remoteVideo: ElementRef, localVideo: ElementRef): Promise<void> {
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

    localVideo.nativeElement.srcObject = this.localStream;
  }

  stopLocalCamera() {
    if (!this.localStream) return;

    this.localStream.getTracks().forEach(t => t.stop());
    this.localStream = null;
  }

  //#endregion

  //#region Chat Call Operations
  async makeChatConnection(onMessageCallback: (msg: string) => void) {
    this.callType = 'chat';

    this.connection = new RTCPeerConnection(this.configuration);

    // Chat üçün DataChannel açılır
    this.dataChannel = this.connection.createDataChannel("chat");
    this._setupDataChannel(onMessageCallback);

    this._registerConnectionListeners();

    const offer = await this.connection.createOffer();
    await this.connection.setLocalDescription(offer);

    this.signalRService.chatRtcSignal(this.guid, {type: 'offer', offer});
  }

  async handleChatOffer(offer: RTCSessionDescription,onMessageCallback: (msg: string) => void) {
    this.callType = 'chat';

    this.connection = new RTCPeerConnection(this.configuration);

    // Qarşı tərəf dataChannel-i burda alacaq
    this.connection.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this._setupDataChannel(onMessageCallback);
    };

    this._registerConnectionListeners();

    await this.connection.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await this.connection.createAnswer();
    await this.connection.setLocalDescription(answer);

    this.signalRService.chatRtcSignal(this.guid, {type: 'answer', answer});

    if (this.pendingCandidates.length) {
      for (const c of this.pendingCandidates) {
        await this.connection.addIceCandidate(c);
      }
    }
  }

  private _setupDataChannel(onMessageCallback: (msg: string) => void) {
    this.dataChannel.onopen = () => {
      console.log("🟢 DataChannel OPEN (Chat hazırdır)");
    };

    this.dataChannel.onclose = () => {
      console.log("🔴 DataChannel bağlandı");
    };

    this.dataChannel.onerror = (err) => {
      console.error("DataChannel Error:", err);
    };

    this.dataChannel.onmessage = (event) => {
      if (onMessageCallback)
        onMessageCallback(event.data);
    };
  }

  sendChatMessage(message: string) {
    if (this.dataChannel && this.dataChannel.readyState === "open") {
      this.dataChannel.send(message);
    } else {
      console.warn("DataChannel hazır deyil");
    }
  }
  //#endregion

  public async handleAnswer(answer: RTCSessionDescription): Promise<void> {
    await this.connection.setRemoteDescription(
      new RTCSessionDescription(answer)
    );
  }

  pendingCandidates: RTCIceCandidateInit[] = [];

  public async handleCandidate(candidate: RTCIceCandidate): Promise<void> {
    if (candidate) {
      if (this.connection.remoteDescription)
        await this.connection.addIceCandidate(new RTCIceCandidate(candidate));
      else
        this.pendingCandidates.push(new RTCIceCandidate(candidate));
    }
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
        if (this.callType == "chat")
          this.signalRService.chatRtcSignal(this.guid, payload);
        else if (this.callType == "video")
          this.signalRService.videoRtcSignal(this.guid, payload);
      }
    };

  }


}
