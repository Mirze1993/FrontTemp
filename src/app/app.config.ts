import {ApplicationConfig, provideZoneChangeDetection, importProvidersFrom} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideClientHydration, withEventReplay} from '@angular/platform-browser';
import {en_US, provideNzI18n} from 'ng-zorro-antd/i18n';
import {registerLocaleData} from '@angular/common';
import en from '@angular/common/locales/en';
import {FormsModule} from '@angular/forms';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {provideHttpClient} from '@angular/common/http';
import {httpInterceptorProviders, HttpRequestInterceptor} from './helper/http-request-interceptor.service';
import {NZ_ICONS} from 'ng-zorro-antd/icon';
import {icons} from './icons';
import {environment} from '../environments/environment';
import {persistState} from '@datorama/akita';

registerLocaleData(en);

const baseUrl = typeof window !== 'undefined'
  ? `${location.protocol}//${location.hostname}:${environment.port}`
  : 'http://localhost:4200';


let akitaPersistStorage: any = undefined;
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  akitaPersistStorage = persistState({
    key: 'AkitaStores',
    include: ['auth']
  });
}

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes), provideClientHydration(withEventReplay()),
    provideNzI18n(en_US), importProvidersFrom(FormsModule),
    provideAnimationsAsync(),
    provideHttpClient(),
    { provide: NZ_ICONS, useValue: icons },
    httpInterceptorProviders,
    {
      provide: 'baseUrl',
      useValue: baseUrl
    },
    ...(akitaPersistStorage ? [{ provide: 'persistStorage', useValue: akitaPersistStorage }] : [])
  ]
};
