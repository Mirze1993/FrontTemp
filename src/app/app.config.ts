import {ApplicationConfig, provideZoneChangeDetection, importProvidersFrom} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideClientHydration, withEventReplay} from '@angular/platform-browser';
import {en_US, provideNzI18n} from 'ng-zorro-antd/i18n';
import {registerLocaleData} from '@angular/common';
import en from '@angular/common/locales/en';
import {FormsModule} from '@angular/forms';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {provideHttpClient, withFetch, withInterceptorsFromDi} from '@angular/common/http';
import {httpInterceptorProviders, HttpRequestInterceptor} from './helper/http-request-interceptor.service';
import {NZ_ICONS} from 'ng-zorro-antd/icon';
import {icons} from './icons';
import {environment} from '../environments/environment';

registerLocaleData(en);

const authUrl = environment.authApiUrl;

const aiUrl = environment.aiApiUrl;


export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes), provideClientHydration(withEventReplay()),
    provideNzI18n(en_US), importProvidersFrom(FormsModule),
    provideAnimationsAsync(),
    provideHttpClient(
      withFetch(),
      withInterceptorsFromDi() ),
    { provide: NZ_ICONS, useValue: icons },
    httpInterceptorProviders,
    {
      provide: 'authApiUrl',
      useValue: authUrl
    },
    {
      provide: 'aiApiUrl',
      useValue: aiUrl
    }
  ]
};
