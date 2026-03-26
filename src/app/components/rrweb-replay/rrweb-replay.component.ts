import {AfterViewInit, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import rrwebPlayer from 'rrweb-player';
import {ActivatedRoute} from '@angular/router';
import {RrWebService} from '../../services/rr-web.service';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {NzSpinComponent} from 'ng-zorro-antd/spin';

@Component({
  selector: 'app-rrweb-replay',
  imports: [
    NzSpinComponent
  ],
  templateUrl: './rrweb-replay.component.html',
  styleUrl: './rrweb-replay.component.scss',
})
export class RrwebReplayComponent  implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('playerHost') playerHost!: ElementRef<HTMLDivElement>;

  loading = false;
  error = '';

  private events: any[] = [];
  private player?: rrwebPlayer;
  private viewReady = false;

  constructor(
    private route: ActivatedRoute,
    private apiService: RrWebService
  ) {}

  id: string = inject(NZ_MODAL_DATA).id;
  ngOnInit(): void {

    const id =this.id?this.id: this.route.snapshot.paramMap.get('id')!;
    this.loading = true;

    this.apiService.streamById(id).
    then((result) => {
      if (result) {
        this.loading = false;
        this.events = result;
        this.initPlayer();
      }
    }).catch((error) => {
      this.error = error;
    })
  }

  ngAfterViewInit(): void {
    this.viewReady = true;

    if (!this.loading && this.events.length && !this.player) {
      setTimeout(() => this.initPlayer(), 100);
    }
  }

  private initPlayer(): void {
    if (!this.events.length || !this.playerHost?.nativeElement) return;

    this.player = new rrwebPlayer({
      target: this.playerHost.nativeElement,
      props: {
        events: this.events,
        width: Math.min(this.playerHost.nativeElement.clientWidth, 600),
        height: 600,
        autoPlay: false,
        showController: true,
        speedOption: [1, 2, 4, 8],
        skipInactive: true,
      },
    });
  }

  ngOnDestroy(): void {
    //this.player?.$destroy();
  }
}
