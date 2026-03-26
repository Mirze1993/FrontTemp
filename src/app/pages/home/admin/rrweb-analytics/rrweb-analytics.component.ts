import { Component } from '@angular/core';
import {NzCardModule} from 'ng-zorro-antd/card';
import {NzStatisticModule} from 'ng-zorro-antd/statistic';
import {NzTableModule} from 'ng-zorro-antd/table';
import {CommonModule} from '@angular/common';
import {RrWebService} from '../../../../services/rr-web.service';

@Component({
  selector: 'app-rrweb-analytics',
  imports: [CommonModule, NzTableModule, NzStatisticModule, NzCardModule],
  templateUrl: './rrweb-analytics.component.html',
  styleUrl: './rrweb-analytics.component.scss',
})
export class RrwebAnalyticsComponent {
  list: any[] = [];
  loading = false;

  get top3(): any[] { return this.list.slice(0, 3); }

  constructor(private rrWebService: RrWebService) {}

  ngOnInit(): void {
    this.loading = true;
    this.rrWebService.getPageAnalytics()
      .then(result => {
        this.list = result.value; this.loading = false;
      })

  }

  formatTime(ms: number): string {
    if (ms < 1000)  return `${Math.round(ms)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}d ${s}s`;
  }

  shortUrl(url: string): string {
    try { return new URL(url).pathname; }
    catch { return url; }
  }
}
