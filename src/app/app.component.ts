import { Component, LOCALE_ID, Inject } from '@angular/core';
import {TokenStorageService} from "./service/token-storage.service";
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'rtgs-front';

  languageList = [
    { code: 'en', label: 'English' },
    { code: 'ru', label: 'Русский' }
  ];

  constructor(@Inject(LOCALE_ID) protected localeId: string, public tokenStorage: TokenStorageService) { }

}
