import {Component, EventEmitter, Input, Output} from '@angular/core';
import {finalize, Subscription} from 'rxjs';
import {FileService} from '../../services/api/file.service';
import { HttpEventType } from '@angular/common/http';
import {base64ToFile, ImageCroppedEvent, ImageCropperComponent} from 'ngx-image-cropper';
import {NzIconDirective, NzIconModule} from 'ng-zorro-antd/icon';
import {NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import {NzProgressComponent} from 'ng-zorro-antd/progress';
import {NzButtonComponent} from 'ng-zorro-antd/button';

@Component({
  selector: 'app-image-upload',
  imports: [
    ImageCropperComponent,
    NgIf,
    NzProgressComponent,
    NgForOf,
    NzIconModule
  ],
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.scss'
})
export class ImageUploadComponent {


  @Input()
  requiredFileType: string;

  @Output()
  imgUrl = new EventEmitter<string>();

  fileName = '';
  uploadProgress: number;
  uploadSub: Subscription;
  avatars: string[] = [
    "https://api.dicebear.com/8.x/avataaars/png?seed=Ada",
    "https://api.dicebear.com/8.x/avataaars/png?seed=Max",
    "https://api.dicebear.com/8.x/avataaars/png?seed=Zoe",
    "https://api.dicebear.com/8.x/avataaars/png?seed=Leo",
    "https://api.dicebear.com/8.x/avataaars/png?seed=Luna",
    "https://api.dicebear.com/8.x/avataaars/png?seed=Oscar",
    "https://api.dicebear.com/8.x/avataaars/png?seed=Ella",
    "https://api.dicebear.com/8.x/avataaars/png?seed=Ben",
    "https://api.dicebear.com/8.x/avataaars/png?seed=Mila",
    "https://api.dicebear.com/8.x/avataaars/png?seed=Jack",
    "https://api.dicebear.com/8.x/avataaars/png?seed=Chloe",
    "https://api.dicebear.com/8.x/avataaars/png?seed=Noah",
    "https://api.dicebear.com/8.x/avataaars/png?seed=Emma",
    "https://api.dicebear.com/8.x/avataaars/png?seed=Daniel",
    "https://api.dicebear.com/8.x/avataaars/png?seed=Ruby",
    "https://api.dicebear.com/8.x/avataaars/png?seed=Kai",
    "https://api.dicebear.com/8.x/avataaars/png?seed=Ivy",
    "https://api.dicebear.com/8.x/avataaars/png?seed=Lucas",
    "https://api.dicebear.com/8.x/avataaars/png?seed=Olivia",
    "https://api.dicebear.com/8.x/avataaars/png?seed=Ezra",
    "https://api.dicebear.com/8.x/avataaars/png?seed=Nova",
    "https://api.dicebear.com/8.x/avataaars/png?seed=Felix"
  ];




  constructor(private http: FileService) { }

  onFileSelected(event:any) {
    console.log(event)
    const file: File = event.target.files[0];
    this.imgChangeEvt = event;
    if (file)
      this.fileName = file.name;
  }

  deleteImg() {
    this.imgChangeEvt = null;
    this.imageFile=null;
    this.fileName = null;
  }

  uploadImg() {
    if (this.imgChangeEvt||this.imageFile) {
      const f = base64ToFile(this.cropImgPreview);
      const file:File=new File([f],this.fileName);
      console.log(file);
      if (file) {
        this.fileName = file.name;
        const upload$ = this.http.fileUpload(file)
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
            this.imgUrl.emit(event.body.value);
          }
        })
        this.imgChangeEvt = null;
        this.imageFile=null;
        this.fileName = null;
      }
    }
  }

  cancelUpload() {
    this.uploadSub.unsubscribe();
    this.reset();
  }

  reset() {
    this.uploadProgress = null;
    this.uploadSub = null;
  }

  imgChangeEvt: any = '';
  cropImgPreview: any = '';
  onFileChange(event: any): void {

  }
  cropImg(e: ImageCroppedEvent) {

    this.cropImgPreview = e.base64;
  }
  imgLoad() {
    // display cropper tool
  }
  initCropper() {
    // init cropper
  }
  imgFailed() {
    // error msg
  }


  async  getBase64ImageFromUrl(imageUrl:any) {
    var res = await fetch(imageUrl);
    return await res.blob();

  }

  imageFile:any;
  onImageSelect(uri:string){
    this.getBase64ImageFromUrl(uri).then(mm=>{
      this.imageFile=mm;
      this.fileName="temp"+mm.type.replace('/','.');
    })
  }
}
