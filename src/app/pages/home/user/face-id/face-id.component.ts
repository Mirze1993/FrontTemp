import {Component, ElementRef, ViewChild} from '@angular/core';
import * as H from '../../../../../assets/models/human.esm.js';
import {DatePipe, NgIf, NgTemplateOutlet} from '@angular/common';
import {NzButtonModule, NzButtonSize} from 'ng-zorro-antd/button';
import {NzIconModule} from 'ng-zorro-antd/icon'
import {NzInputModule} from 'ng-zorro-antd/input';
import {FileService} from '../../../../services/api/file.service';
import {filter, finalize, firstValueFrom, map, Subscription} from 'rxjs';
import {HttpEventType} from '@angular/common/http';
import {NzProgressComponent} from 'ng-zorro-antd/progress';
import {UserService} from '../../../../services/api/user.service';
import {asanFinanceResp} from '../../../../models/AppUser';
import {FormsModule} from '@angular/forms';
import {NzDividerModule} from 'ng-zorro-antd/divider';
import {NzGridModule} from 'ng-zorro-antd/grid';
import {NzAvatarModule} from 'ng-zorro-antd/avatar';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzSkeletonModule} from 'ng-zorro-antd/skeleton';

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


  human: any;
  ctx!: CanvasRenderingContext2D;
  running = false;
  stream!: MediaStream;
  capturedImage: string = '';
  countdown: number = 0;
  countdownInterval: any;

  mediaRecorder!: MediaRecorder;
  recordedChunks: Blob[] = [];
  recordedVideoUrl: string = '';

  asanFinanceResp: asanFinanceResp;
  pin: string


  orginalEmbedding: any;

  ovalTarget = {
    cx: 320,   // mərkəz X
    cy: 240,   // mərkəz Y
    rx: 80,   // horizontal radius
    ry: 110    // vertical radius
  };
  insideOval: boolean = false;
  isStartKyc: boolean = false;
  kycImage1: string = '';
  kyc1: number ;
  kycImage2: string = '';
  kyc2: number;

  constructor(private fileServer: FileService, private userService: UserService) {
  }

  async ngOnInit() {

    // const Human =await import('../../../../../assets/models/human.esm.js');
    this.human = new H.Human({
      modelBasePath: 'assets/models/',
      face: {enabled: true, detector: {rotation: true}, mesh: {enabled: true}, emotion: {enabled: true}},
      body: {enabled: false},
      hand: {enabled: false},
      gesture: {enabled: false},
      object: {enabled: false},
      debug: false,
      filter: {enabled: true,flip:true},
    });


  }


  getUserFromAsanFinance() {
    this.userService.GetUserFromAsanFinance(this.pin).then((result) => {
      if (result.success) {
        this.asanFinanceResp = result.value;
        this.pin = "";
        this.getEmbeddingFromBase64();
      }
    })
  }

  async startCamera() {
    this.running = true;
    const video = this.videoRef.nativeElement;
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;

    // Kamera açılır
    this.stream = await navigator.mediaDevices.getUserMedia({video: true});
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

  isFaceInsideOval(faceBox: number[]): boolean {
    const [x, y, w, h] = faceBox;

    // Üz qutusunun dörd künc nöqtələri
    const corners = [
      [x, y],
      [x + w, y],
      [x, y + h],
      [x + w, y + h]
    ];
    // Ovalın parametrləri
    // Üzün mərkəz nöqtəsini hesabla
    const faceCenterX = x + w / 2;
    const faceCenterY = y + h / 2;
    const dx = faceCenterX - this.ovalTarget.cx;
    const dy = faceCenterY - this.ovalTarget.cy;

    const ovalCheck = (dx * dx) / (this.ovalTarget.rx * this.ovalTarget.rx) + (dy * dy) / (this.ovalTarget.ry * this.ovalTarget.ry) <= 1;
    const bordersClose =
      Math.abs((x + w) - (this.ovalTarget.cx + this.ovalTarget.rx)) < 100 &&
      Math.abs(x - (this.ovalTarget.cx - this.ovalTarget.rx)) < 100 &&
      Math.abs(y - (this.ovalTarget.cy - this.ovalTarget.ry)) < 100 &&
      Math.abs((y + h) - (this.ovalTarget.cy + this.ovalTarget.ry)) < 100;

    return ovalCheck && bordersClose;
  }

  drawOval(ctx: CanvasRenderingContext2D, solid: boolean) {
    ctx.beginPath();
    ctx.ellipse(this.ovalTarget.cx, this.ovalTarget.cy, this.ovalTarget.rx, this.ovalTarget.ry, 0, 0, 2 * Math.PI);
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 3;

    if (solid) {
      ctx.setLineDash([]); // Bütöv xətt
    } else {
      ctx.setLineDash([10, 5]); // Qırıq-qırıq xətt
    }

    ctx.stroke();
    ctx.setLineDash([]); // Default vəziyyətə qaytar
  }
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  async takePictureWithCountdown(queue: number) {
    for (this.countdown = 3; this.countdown  > 0; this.countdown --) {
      await this.delay(1000);
    }
    await this.takePicture(queue);
  }

  async takePicture(queue: number) {

    const video = this.videoRef.nativeElement;
    let a = await this.human.detect(video).then(result => {
      if (result.face?.length) {
        const face = result.face[0];
        const box = face.box;

        const tempCanvas = document.createElement('canvas');
        const [x, y, w, h] = box;
        tempCanvas.width = w;
        tempCanvas.height = h;

        const tempCtx = tempCanvas.getContext('2d')!;
        tempCtx.drawImage(video, x, y, w, h, 0, 0, w, h);

        // Şəklin Base64 halını əldə edirik
        if (queue == 1)
          this.kycImage1 = tempCanvas.toDataURL('image/png');
        else if (queue == 2)
          this.kycImage2 = tempCanvas.toDataURL('image/png');
        else
          this.capturedImage = tempCanvas.toDataURL('image/png');
      } else {
        alert("Üz tapılmadı!");
      }
    });

  }

  uploadImageToServer() {
    if (!this.capturedImage) return;

    const blob = this.dataURItoBlob(this.capturedImage);
    const file = new File([blob], 'capture.png', {type: blob.type});
    this.fileUpload(file);
    this.getImgSimilarity(file, file);
  }

  uploadVideoToServer() {
    if (!this.recordedVideoUrl) return;

    fetch(this.recordedVideoUrl)
      .then(res => res.blob())
      .then(blob => {

        const file = new File([blob], 'recording.webm', {type: blob.type});
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

  startKyc() {
    this.isStartKyc = true;
  }

  async takeKycPicture() {

    if (!this.isStartKyc)
      return;
    if (this.isStartKyc && this.kycImage1.length < 1) {
      await this.takePictureWithCountdown(1);
      this.ovalTarget.rx = 120;
      this.ovalTarget.ry = 160;
      this.checkKyc(this.kycImage1).then(result => {
        this.kyc1=result
      });
    } else if (this.isStartKyc && this.kycImage2.length < 1) {
      await this.takePictureWithCountdown(2);
      this.ovalTarget.rx = 100;
      this.ovalTarget.ry = 140;
      this.isStartKyc = false;
      this.checkKyc(this.kycImage1).then(result => {
        this.kyc2=result
      });
    } else {
      this.isStartKyc = false;
    }

  }

  async checkKyc(image: string): Promise<number> {
    const blob = this.dataURItoBlob(image);
    const file = new File([blob], 'capture.png', { type: blob.type });

    const originalBlob = await fetch('data:image/png;base64,' + this.asanFinanceResp.image)
      .then(res => res.blob());

    const originalFile = new File([originalBlob], 'original.png', { type: originalBlob.type });

    return await this.getImgSimilarity(originalFile, file);
  }

  async getImgSimilarity(file1: File, file2: File): Promise<number> {
    if (!file1 || !file2) return 0;

    try {
      const event = await firstValueFrom(
        this.fileServer.getImgSimilarity(file1, file2).pipe(
          filter(e => e.type === HttpEventType.Response),
          map(e => parseFloat(e.body.value.toFixed(4)))
        )
      );
      return event;
    } catch (error) {
      console.error('Similarity error:', error);
      return 0;
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

    this.mediaRecorder = new MediaRecorder(stream, {mimeType: 'video/webm'});

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.recordedChunks, {type: 'video/webm'});
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
    return new Blob([ab], {type: mimeString});
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

    let simPer = '';
    if (result.face && result.face.length > 0) {
      if (this.asanFinanceResp && this.orginalEmbedding) {
        simPer = this.human.match.similarity(result.face[0].embedding, this.orginalEmbedding)
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let drawOptions = {
      faceLabels: `face
        similarity: ${simPer}
        confidence: [score]%
        [gender] [genderScore]%
        age: [age] years
        distance: [distance]cm
        real: [real]%
        live: [live]%
        [emotions]
        roll: [roll]° yaw:[yaw]° pitch:[pitch]°
        gaze: [gaze]°`,
      bodyLabels: 'body [score]%',
      bodyPartLabels: '[label] [score]%',
      objectLabels: '[label] [score]%',
      handLabels: '[label] [score]%',
      fingerLabels: '[label]',
      gestureLabels: '[where] [who]: [what]',
    };
    this.human.draw.options.mirror = false;
    this.human.draw.all(canvas, this.human.result, drawOptions);


    this.insideOval = false;
    if (result.face.length > 0 && this.isStartKyc) {

      this.insideOval = this.isFaceInsideOval(result.face[0].box);
      // ctx.strokeStyle = this.insideOval ? 'lime' : 'red';
      // ctx.lineWidth = 2;
      //ctx.strokeRect(box[0], box[1], box[2], box[3]);
      this.drawOval(ctx, this.insideOval);

      //Şəkil avtomatik çəkilsin
      if (this.insideOval) {
        await this.takeKycPicture();
        alert('Üz uyğun oval sahədədir — şəkil çəkildi!');
      }
    }

    requestAnimationFrame(async () =>await this.detectLoop());
  }


  async getEmbeddingFromBase64(): Promise<number[] | null> {
    const img = new Image();
    img.src = 'data:image/png;base64,' + this.asanFinanceResp.image;

    await new Promise(resolve => img.onload = resolve);

    const result = await this.human.detect(img);
    this.orginalEmbedding = result.face?.[0]?.embedding || null
    return result.face?.[0]?.embedding || null;
  }
}
