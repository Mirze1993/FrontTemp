import {ChangeDetectorRef, Component, ElementRef, inject, OnDestroy, ViewChild} from '@angular/core';
import {NgIf, NgSwitchCase} from '@angular/common';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzWaveDirective} from 'ng-zorro-antd/core/wave';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {CallStatus, getCallStatusText} from '../../models/CallStatus';
import {SignalrService} from '../../services/signalr.service';
import {UserService} from '../../services/api/user.service';
import {CallRctService} from '../../services/call-rct.service';

@Component({
  selector: 'app-admin-call',
  imports: [
    NgIf,
    NzButtonComponent,
    NzIconDirective,
    NzWaveDirective
  ],
  templateUrl: './admin-call.component.html',
  styleUrl: './admin-call.component.scss',
})
export class AdminCallComponent implements OnDestroy{
  readonly #modal = inject(NzModalRef);
  readonly nzData: any = inject(NZ_MODAL_DATA, {optional: true});

  readonly callerId: number = this.nzData?.callerId;
  readonly guid: string = this.nzData?.guid;
  readonly callerName: string = this.nzData?.callerName ?? 'Naməlum istifadəçi';
  readonly photo: string = this.nzData?.photo ?? 'https://cdn-icons-png.flaticon.com/512/847/847969.png';

  callStatus: string = CallStatus.Calling;
  protected readonly CallStatus = CallStatus;

  @ViewChild('remoteVideo') remoteVideo: ElementRef;
  @ViewChild('localVideo') localVideo!: ElementRef;

  constructor(  private signalRService: SignalrService,
                protected userService: UserService,
                private callRctService: CallRctService,
                private cdr: ChangeDetectorRef) {
     console.log(this.callerName);
    this.signalRService.endOfferVideoCallHandle((result) => {
      this.#modal.close();
    })

    this.signalRService.videoRtcSignalHandler(data => {
        this.callRctService.guid = this.guid;
        if (data.type == 'offer') {
          this.callRctService.handleVideoOffer(data.offer, this.remoteVideo,this.localVideo).then(() => {
          })
        } else if (data.type == 'candidate') {
          this.callRctService.handleCandidate(data.candidate).then(() => {
            this.cdr.markForCheck();
          });
        }
      }
    )
  }

  acceptCall(){
    this.callStatus = CallStatus.CallAccept;
    this.signalRService.acceptVideoCall(this.guid);
  }
  /** ❌ Rədd et */
  rejectCall(status: CallStatus): void {

    this.signalRService.endOfferVideoCall(this.guid, status);
    this.clearProps(status);
  }


  private clearProps(status: CallStatus) {
    this.stopRecording();
    this.callStatus = status;
    this.#modal.close(status);
    this.stopRemoteStream();
    this.callRctService.stopLocalCamera();

  }

  private stopRemoteStream() {
    const videoEl = this.remoteVideo?.nativeElement;
    if (!videoEl) return;

    const stream = videoEl.srcObject as MediaStream;

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    videoEl.srcObject = null;
    videoEl.pause();

    console.log("Remote video stream stopped");
  }

  isMuted = false;
  isVideoStopped = false;

  toggleMute() {
    if (!this.callRctService.localStream) return;

    this.isMuted = !this.isMuted;

    this.callRctService.localStream.getAudioTracks().forEach(t => {
      t.enabled = !this.isMuted;
    });
  }

  toggleVideo() {
    if (!this.callRctService.localStream) return;

    this.isVideoStopped = !this.isVideoStopped;

    this.callRctService.localStream.getVideoTracks().forEach(t => {
      t.enabled = !this.isVideoStopped;
    });
  }


  private mediaRecorder!: MediaRecorder;
  private recordedChunks: Blob[] = [];
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private animationId!: number;
  private combinedStream!: MediaStream;
  isRecording: boolean = false;
  recordingSeconds: number = 0;
  private recordingTimer: any;
  startRecording() {
    const remoteVideoEl = this.remoteVideo?.nativeElement;
    const localVideoEl = this.localVideo?.nativeElement;

    if (!remoteVideoEl) {
      console.error('Remote video yoxdur');
      return;
    }
    this.isRecording = true;
    this.recordingSeconds = 0;

    // ⏱️ timer başlat
    this.recordingTimer = setInterval(() => {
      this.recordingSeconds++;
    }, 1000);

    // Canvas yarat
    this.canvas = document.createElement('canvas');
    this.canvas.width = 1280;
    this.canvas.height = 720;

    this.ctx = this.canvas.getContext('2d')!;

    // Video-ları çəkmək (loop)
    const drawFrame = () => {
      // Remote (full ekran)
      this.ctx.drawImage(remoteVideoEl, 0, 0, this.canvas.width, this.canvas.height);

      // Local (kiçik sağ alt)
      if (localVideoEl) {
        this.ctx.drawImage(
          localVideoEl,
          this.canvas.width - 200,
          this.canvas.height - 150,
          200,
          150
        );
      }

      this.animationId = requestAnimationFrame(drawFrame);
    };

    drawFrame();

    // Canvas stream al
    const canvasStream = this.canvas.captureStream(30);

    // 🔊 Audio əlavə et
    const remoteStream = remoteVideoEl.srcObject as MediaStream;
    const localStream = localVideoEl.srcObject as MediaStream;

    const audioTracks = [
      ...remoteStream.getAudioTracks(),
      ...localStream.getAudioTracks()
    ];

    this.combinedStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...audioTracks
    ]);

    // Recorder qur
    this.recordedChunks = [];
    this.mediaRecorder = new MediaRecorder(this.combinedStream, {
      mimeType: 'video/webm; codecs=vp9'
    });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `call-${new Date().getTime()}.webm`;
      a.click();

      URL.revokeObjectURL(url);
    };

    this.mediaRecorder.start();
    console.log('🎥 Recording başladı');
  }
  stopRecording() {

    this.isRecording = false;

    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

  }


  isDestroyed: boolean = false;
  ngOnDestroy(): void {
    if(this.isDestroyed)
      return;
    if (this.callStatus != CallStatus.Calling)
      this.rejectCall(CallStatus.EndByReceiver);
    else
      this.rejectCall(CallStatus.RejectByReceiver);
    this.isDestroyed = true;
    window.location.reload();
  }

}
