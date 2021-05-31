import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LoginComponent} from "./auth/login/login.component";
import {AdminComponent} from "./layout/admin_layouts/admin/admin.component";
import {ClientComponent} from "./layout/client_layouts/client/client.component";
import {AuthGuardService} from "./auth/helper/auth-guard.service";
import {CtrlMainComponent} from "./layout/ctrl_layouts/ctrl-main/ctrl-main.component";
import {CorrMainComponent} from "./layout/corr_layouts/corr-main/corr-main.component";

const routes: Routes = [
  {path: 'login' ,component: LoginComponent},
  {path: 'admin', component: AdminComponent,canActivate: [AuthGuardService]},
  {path: 'client', component: ClientComponent,canActivate: [AuthGuardService]},
  {path: 'ctrl', component: CtrlMainComponent,canActivate: [AuthGuardService]},
  {path: 'corr', component: CorrMainComponent,canActivate: [AuthGuardService]},

  {path: '', redirectTo: 'login', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
