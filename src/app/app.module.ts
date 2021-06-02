import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {LoginComponent} from './auth/login/login.component';
import {AdminComponent} from './layout/admin_layouts/admin/admin.component';
import {ClientComponent} from './layout/client_layouts/client/client.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MaterialModule} from "./material-module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {authErrorInterceptorProviders} from "./auth/helper/error-interceptor.service";
import {authInterceptorProviders} from "./auth/helper/auth-interceptor.service";
import {MatGridListModule} from "@angular/material/grid-list";
import {EditUserComponent} from './layout/admin_layouts/edit-user/edit-user.component';
import {MatSelectModule} from "@angular/material/select";
import {AddUserComponent} from './layout/admin_layouts/add-user/add-user.component';
import {MatCheckboxModule} from "@angular/material/checkbox";
import { ViewTrnComponent } from './layout/client_layouts/view-trn/view-trn.component';
import { CreateTrnComponent } from './layout/client_layouts/create-trn/create-trn.component';
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {NgxCurrencyModule} from "ngx-currency";
import { BankHandbookComponent } from './layout/client_layouts/handbooks/bank-handbook/bank-handbook.component';
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import { CorrMainComponent } from './layout/corr_layouts/corr-main/corr-main.component';
import { CtrlMainComponent } from './layout/ctrl_layouts/ctrl-main/ctrl-main.component';
import {MatListModule} from "@angular/material/list";
import { SpacePipe } from './utils/space.pipe';
import {MatTabsModule} from "@angular/material/tabs";
import { FilterLayoutComponent } from './layout/filter-layout/filter-layout.component';
import {PdfViewerModule} from "ng2-pdf-viewer";
import { RepoprtComponent } from './layout/repoprt/repoprt.component';

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
    MatGridListModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgxCurrencyModule,
    FormsModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatTabsModule,
    PdfViewerModule
  ],
  providers: [authInterceptorProviders, authErrorInterceptorProviders, MatNativeDateModule, MatNativeDateModule ],
  bootstrap: [AppComponent]
})
export class AppModule { }
