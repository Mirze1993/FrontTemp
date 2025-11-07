import {Component, inject} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {SignalrService} from '../../services/signalr.service';
import {UserService} from '../../services/api/user.service';
import {NgIf, NgOptimizedImage} from '@angular/common';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzWaveDirective} from 'ng-zorro-antd/core/wave';

@Component({
  selector: 'app-incoming-call',
  imports:[NgIf, NzButtonComponent, NzIconDirective, NzWaveDirective, NgOptimizedImage],
  templateUrl: './incoming-call.component.html',
  styleUrl: './incoming-call.component.scss'
})
export class IncomingCallComponent {
  readonly #modal = inject(NzModalRef);
  readonly nzData: any = inject(NZ_MODAL_DATA, { optional: true });

  readonly callerId: number = this.nzData?.callerId;
  readonly guid: string = this.nzData?.guid;
  readonly callerName: string = this.nzData?.callerName ?? 'Naməlum istifadəçi';
  readonly photo: string = this.nzData?.photo ?? 'https://cdn-icons-png.flaticon.com/512/847/847969.png';

  isRinging = true;
  remainingSeconds = 60;

  private autoCancelTimer?: any;
  private countdownTimer?: any;

  constructor(
    private signalRService: SignalrService,
    protected userService: UserService
  ) {
    this.startRinging();
    this.#modal.afterClose.subscribe(() => this.clearTimers());
    this.signalRService.videoCallOfferEnd(()=>{
      this.#modal.close();
    })
  }

  /** 🔔 Zəng başladıqda */
  startRinging(): void {
    this.isRinging = true;
    this.remainingSeconds = 60;

    // 1 dəqiqə ərzində cavab verilməsə → zəngi bitir
    this.countdownTimer = setInterval(() => {
      this.remainingSeconds--;
      if (this.remainingSeconds <= 0) this.rejectCall();
    }, 1000);

    this.autoCancelTimer = setTimeout(() => {
      this.rejectCall();
    }, 60 * 1000);
  }

  /** ✅ Cavab ver */
  acceptCall(): void {
    this.clearTimers();
    this.isRinging = false;

    // SignalR vasitəsilə cavabı göndər
    // this.signalRService.acceptVideoCall(this.callerId);

    // Modalı bağla və nəticə qaytar
    this.#modal.close('accepted');
  }

  /** ❌ Rədd et */
  rejectCall(): void {
    if (!this.isRinging) return;
    this.signalRService.endOfferVideoCall(this.guid);
    console.log('📵 Zəng rədd edildi və ya vaxt bitdi');
    this.clearTimers();
    this.isRinging = false;

    // SignalR vasitəsilə rədd siqnalı göndər
    // this.signalRService.rejectVideoCall(this.callerId);

    // Modal bağlanır
    this.#modal.close('rejected');
  }

  /** 🧹 Timer-ləri təmizlə */
  clearTimers(): void {
    if (this.autoCancelTimer) clearTimeout(this.autoCancelTimer);
    if (this.countdownTimer) clearInterval(this.countdownTimer);
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }
}
