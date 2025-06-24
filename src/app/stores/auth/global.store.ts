import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GlobalStore{
  private _isSpinning = new BehaviorSubject<boolean>(false);
  public isSpinning$ = this._isSpinning.asObservable();

  showSpinner() {
    this._isSpinning.next(true);
  }

  hideSpinner() {
    this._isSpinning.next(false);
  }
}
