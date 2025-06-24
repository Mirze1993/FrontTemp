import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {NzSpinComponent} from 'ng-zorro-antd/spin';
import {GlobalStore} from './stores/auth/global.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NzSpinComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'FrontTemp';
  isSpinning=true;
  constructor(private globalStore: GlobalStore) {
    globalStore.isSpinning$.subscribe((isSpinning: boolean) => {
      this.isSpinning=isSpinning;
    });
  }


}
