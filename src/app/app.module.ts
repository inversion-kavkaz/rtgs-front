import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {LoginComponent} from './auth/login/login.component';
import {AdminComponent} from './layout/admin_layouts/admin/admin.component';
import {ClientComponent} from './layout/client_layouts/client/client.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MaterialModule} from "./material-module";
import {ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {authErrorInterceptorProviders} from "./auth/helper/error-interceptor.service";
import {authInterceptorProviders} from "./auth/helper/auth-interceptor.service";
import {MatGridListModule} from "@angular/material/grid-list";
import {EditUserComponent} from './layout/admin_layouts/edit-user/edit-user.component';
import {MatSelectModule} from "@angular/material/select";
import {AddUserComponent} from './layout/admin_layouts/add-user/add-user.component';
import {MatCheckboxModule} from "@angular/material/checkbox";

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AdminComponent,
    ClientComponent,
    EditUserComponent,
    AddUserComponent
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
  ],
  providers: [authInterceptorProviders, authErrorInterceptorProviders],
  bootstrap: [AppComponent]
})
export class AppModule { }
