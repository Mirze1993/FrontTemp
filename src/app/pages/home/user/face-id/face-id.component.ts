import {Component, ElementRef, ViewChild} from '@angular/core';
import * as H from'../../../../../assets/models/human.esm.js';
import {DatePipe, NgIf, NgTemplateOutlet} from '@angular/common';
import { NzButtonModule, NzButtonSize } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzInputModule } from 'ng-zorro-antd/input';
import {FileService} from '../../../../services/api/file.service';
import {finalize, Subscription} from 'rxjs';
import {HttpEventType} from '@angular/common/http';
import {NzProgressComponent} from 'ng-zorro-antd/progress';
import {UserService} from '../../../../services/api/user.service';
import {asanFinanceResp} from '../../../../models/AppUser';
import {FormsModule} from '@angular/forms';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';

@Component({
  selector: 'app-face-id',
  imports: [
    NgIf, NzButtonModule, NzIconModule, NzProgressComponent, NzInputModule, FormsModule, NzDividerModule, NzGridModule,
    NzAvatarModule, NzCardModule, NzSkeletonModule, DatePipe, NgTemplateOutlet
  ],
  templateUrl: './face-id.component.html',
  styleUrl: './face-id.component.scss'
})
export class FaceIdComponent {
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;


  human:  any;
  ctx!: CanvasRenderingContext2D;
  running = false;
  stream!: MediaStream;
  capturedImage: string = '';
  countdown: number = 0;
  countdownInterval: any;

  mediaRecorder!: MediaRecorder;
  recordedChunks: Blob[] = [];
  recordedVideoUrl: string = '';

  asanFinanceResp: asanFinanceResp ;
  pin:string
  recordingText:string=''

  similarityResult :number;

  constructor(private fileServer:FileService,private userService:UserService) {
  }

  async ngOnInit() {

    // const Human =await import('../../../../../assets/models/human.esm.js');
    this.human = new H.Human({
      modelBasePath: 'assets/models/',
      face: { enabled: true,
        detector: { rotation: true },
        mesh: { enabled: true },
        emotion: { enabled: true } ,
        liveness: { enabled: true },   // <-- BUNU ƏLAVƏ ET
        antispoof: { enabled: true }
      },
      body: { enabled: false },
      hand: { enabled: false },
      gesture: { enabled: false },
      object: { enabled: false },
      segmentation: { enabled: true },
      debug: false,
      filter: {
        enabled: true,
      },
    });


  }


  getUserFromAsanFinance(){
    this.userService.GetUserFromAsanFinance(this.pin).then((result) => {
      if(result.success){
        this.asanFinanceResp=result.value;
        this.pin="";
        this.getEmbeddingFromBase64();
        this.recordingText='Mən '+ this.asanFinanceResp.fullName + ' bu çəkilişin aparilmasına razıyam.'
      }
    })
  }

  async startCamera(){
    this.running = true;
    const video = this.videoRef.nativeElement;
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;

    // Kamera açılır
    this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = this.stream;
    await video.play();

    await this.human.load();
    if (this.running) {
      this.detectLoop();
    }
  }

  stopCamera() {

    const tracks = this.stream?.getTracks();
    tracks?.forEach(track => track.stop());
    this.running = false;
  }

  emb:any;
  takePicture() {
    const canvas = this.canvasRef.nativeElement;
    const video = this.videoRef.nativeElement;

    // Ən son deteksiya nəticəsini alırıq
    this.human.detect(video).then(result => {
      if (result.face?.length) {
        const face = result.face[0]; // yalnız birinci üzü götürürük
        this.emb=result.face?.[0]?.embedding
        const box = face.box;

        // Müvəqqəti canvas yaradılır — yalnız üzü kəsmək üçün
        const tempCanvas = document.createElement('canvas');
        const [x, y, w, h] = box;
        tempCanvas.width = w;
        tempCanvas.height = h;

        const tempCtx = tempCanvas.getContext('2d')!;
        tempCtx.drawImage(video, x, y, w, h, 0, 0, w, h);

        // Şəklin Base64 halını əldə edirik
        this.capturedImage = tempCanvas.toDataURL('image/png');
      } else {
        alert("Üz tapılmadı!");
      }
    });

  }
  uploadImageToServer() {
    if (!this.capturedImage) return;

    const blob = this.dataURItoBlob(this.capturedImage);
    const file = new File([blob], 'capture.png', { type: blob.type });
    this.fileUpload(file);
    this.getImgSimilarity(file,file);
  }
  uploadVideoToServer() {
    if (!this.recordedVideoUrl) return;

    fetch(this.recordedVideoUrl)
      .then(res => res.blob())
      .then(blob => {

        const file = new File([blob], 'recording.webm', { type: blob.type });
        this.fileUpload(file);

      //   this.http.post('https://your-backend.com/api/upload-video', formData).subscribe({
      //     next: () => alert('Video uğurla göndərildi!'),
      //     error: (err) => console.error('Video upload error:', err)
      //   });
       });
  }

  private fileUpload(file: File) {
    if (file) {

      const upload$ = this.fileServer.fileUpload(file)
        .pipe(
          finalize(() => this.reset())
        );

      this.uploadSub = upload$.subscribe(event => {
        console.log(event);
        if (event.type == HttpEventType.UploadProgress) {
          this.uploadProgress = Math.round(100 * (event.loaded / event.total));
        }
        if (event.type == HttpEventType.Response) {
          console.log(event.body);
        }
      })
    }
  }

  checkKyc(){
    this.similarityResult=0;
    this.takePicture();
    const blob = this.dataURItoBlob(this.capturedImage);
    const file = new File([blob], 'capture.png', { type: blob.type });
    // fetch('data:image/png;base64,'+this.asanFinanceResp.image)
    //   .then(res => res.blob())
    //   .then(blob => {
    //     const orginalFile = new File([blob], 'orginal.png', { type: blob.type });
    //     this.getImgSimilarity(orginalFile,file);
    //   });
    this.getImgSimilarity(file,file);

  }

  private getImgSimilarity(file1: File,file2: File) {
    this.similarityResult=0;
    if (file1&&file2) {

      const upload$ = this.fileServer.getImgSimilarity(file1,file2)
        .pipe(
          finalize(() => this.reset())
        );

      this.uploadSub = upload$.subscribe(event => {

        if (event.type == HttpEventType.UploadProgress) {
          this.uploadProgress = Math.round(100 * (event.loaded / event.total));
        }
        if (event.type == HttpEventType.Response) {
          this.similarityResult= parseFloat(event.body.value.toFixed(4));
        }
      })
    }
  }

  uploadProgress: number;
  uploadSub: Subscription;
    reset() {
      this.uploadProgress = null;
      this.uploadSub = null;
    }

  recordVideo() {
    const video = this.videoRef.nativeElement;
    const stream = video.srcObject as MediaStream;

    if (!stream) {
      alert('Kamera aktiv deyil');
      return;
    }

    this.recordedChunks = [];
    this.recordedVideoUrl = '';
    this.countdown = 10;

    this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
      this.recordedVideoUrl = URL.createObjectURL(blob);
      clearInterval(this.countdownInterval);
      this.countdown = 0;
    };

    this.mediaRecorder.start();
    console.log('Recording started');

    // ⏱️ Tərs sayım timer-i işə sal
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.mediaRecorder.stop();
      }
    }, 1000);
  }
  dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  cancelRecording() {
    clearInterval(this.countdownInterval);
    this.recordedVideoUrl = null;
    this.countdown = 0;
  }

  tryRecordingAgain() {
    clearInterval(this.countdownInterval);
    this.recordedVideoUrl = null;
    this.countdown = 0;
    this.recordVideo(); // mövcud video qeyd funksiyasını yenidən çağırırıq
  }



  async detectLoop() {
    if (!this.running) return;

    const video = this.videoRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const result = await this.human.detect(video);


    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (result.face && result.face.length > 0) {

      let simPer = '';
      // if(this.emb){
      //   simPer=this.human.match.similarity(result.face[0].embedding,this.emb)+'%';
      // }

      if(this.asanFinanceResp&&this.emb){
        simPer= this.human.match.similarity(result.face[0].embedding,this.emb)
      }
      let drawOptions = {
        faceLabels: `face
                    similarity: ${simPer}%
                    confidence: [score]%
                    [gender] [genderScore]%
                    age: [age] years
                    distance: [distance]cm
                    real: [real]%
                    live: [live]%
                    [emotions]
                    roll: [roll]° yaw:[yaw]° pitch:[pitch]°
                    gaze: [gaze]°`,

      };

      this.human.draw.all(canvas, this.human.result, drawOptions);

      // for (const face of result.face) {
      //   const [x, y, w, h] = face.box;
      //
      //   // ✅ 1. Box çək
      //   ctx.strokeStyle = 'lime';
      //   ctx.lineWidth = 2;
      //   ctx.strokeRect(x, y, w, h);
      //
      //   // ✅ 2. Mesh varsa çək
      //   if (face.mesh) {
      //     ctx.strokeStyle = 'magenta';
      //     ctx.beginPath();
      //     for (const point of face.mesh) {
      //       ctx.moveTo(point[0], point[1]);
      //       ctx.arc(point[0], point[1], 1.5, 0, 2 * Math.PI);
      //     }
      //     ctx.stroke();
      //   }
      //
      //   let emotionsText = '';
      //
      //   if (face.emotion && Object.keys(face.emotion).length > 0) {
      //     const keysToShow = ['happy', 'sad', 'neutral','angry'];
      //
      //     emotionsText = keysToShow
      //       .map((key) => {
      //         const score = face.emotion.find(ee=>ee.emotion==key)?.score ?? 0;
      //         return `${key}: ${(score * 100).toFixed(1)}%`;
      //       })
      //       .join(' | ');
      //
      //   }
      //
      //   const infoText = [
      //     `Age: ${face.age?.toFixed(1)} years`,
      //     `Gender: ${face.gender} (${face.genderScore?.toFixed(2)})`,
      //     `Emotion: ${emotionsText}`,
      //     `Confidence: ${(face.score * 100).toFixed(1)}%`,
      //     `SimPer: ${simPer}`,
      //   ];
      //
      //   ctx.fillStyle = 'black';
      //   ctx.font = '14px Arial';
      //   let offset = 0;
      //   for (const line of infoText) {
      //     ctx.fillText(line, x, y - 10 - offset);
      //     offset += 16;
      //   }
      // }
    }

    requestAnimationFrame(() => this.detectLoop());
  }


  async getEmbeddingFromBase64(): Promise<number[] | null> {
    const img = new Image();
    img.src = 'data:image/png;base64,'+this.asanFinanceResp.image;

    await new Promise(resolve => img.onload = resolve);

    const result = await this.human.detect(img);
    this.emb=result.face?.[0]?.embedding || null
    return result.face?.[0]?.embedding || null;
  }
}
