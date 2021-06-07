import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {LoginComponent} from './auth/login/login.component';
import {AdminComponent} from './layout/admin_layouts/admin/admin.component';
import {ClientComponent} from './layout/client_layouts/client/client.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {authErrorInterceptorProviders} from "./auth/helper/error-interceptor.service";
import {authInterceptorProviders} from "./auth/helper/auth-interceptor.service";
import {EditUserComponent} from './layout/admin_layouts/edit-user/edit-user.component';
import {AddUserComponent} from './layout/admin_layouts/add-user/add-user.component';
import {ViewTrnComponent} from './layout/client_layouts/view-trn/view-trn.component';
import {CreateTrnComponent} from './layout/client_layouts/create-trn/create-trn.component';
import {MatNativeDateModule} from "@angular/material/core";
import {NgxCurrencyModule} from "ngx-currency";
import {BankHandbookComponent} from './layout/client_layouts/handbooks/bank-handbook/bank-handbook.component';
import {CorrMainComponent} from './layout/corr_layouts/corr-main/corr-main.component';
import {CtrlMainComponent} from './layout/ctrl_layouts/ctrl-main/ctrl-main.component';
import {SpacePipe} from './utils/space.pipe';
import {FilterLayoutComponent} from './layout/filter-layout/filter-layout.component';
import {PdfViewerModule} from "ng2-pdf-viewer";
import {RepoprtComponent} from './layout/repoprt/repoprt.component';
import {MaterialModule} from "./material-module";
import {MatChipsModule} from "@angular/material/chips";

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AdminComponent,
    ClientComponent,
    EditUserComponent,
    AddUserComponent,
    ViewTrnComponent,
    CreateTrnComponent,
    BankHandbookComponent,
    CorrMainComponent,
    CtrlMainComponent,
    SpacePipe,
    FilterLayoutComponent,
    RepoprtComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxCurrencyModule,
    FormsModule,
    PdfViewerModule,
    MatChipsModule,
  ],
  providers: [authInterceptorProviders, authErrorInterceptorProviders, MatNativeDateModule],
  bootstrap: [AppComponent]
})
export class AppModule {
}
