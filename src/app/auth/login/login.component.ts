import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {NotificationService} from "../../service/notification.service";
import {TokenStorageService} from "../../service/token-storage.service";
import {AuthService} from "../../service/auth.service";
import {compare} from "../../utils/utils";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public loginForm: FormGroup;
  public loginError = ""
  hide: boolean = true;

  constructor(private authService: AuthService,
              private tokenStorage: TokenStorageService,
              private notificationService: NotificationService,
              private router: Router,
              private fb: FormBuilder) {

    // if (this.tokenStorage.getUser().roles[0] === 'ROLE_ADMIN')
    //   this.router.navigate(['/admin'])
    // else
    //   this.router.navigate(['/client'])
    this.loginForm = this.createLoginForm();
  }

  ngOnInit(): void {}

  createLoginForm(): FormGroup {
    return this.fb.group({
      login: ['', Validators.compose([Validators.required])],
      password: ['', Validators.compose([Validators.required])],
    });
  }
  submit(): void {
    this.authService.login({
      login: this.loginForm.value.login,
      password: this.loginForm.value.password
    }).subscribe(data => {

      this.tokenStorage.saveToken(data.token);
      this.tokenStorage.saveUser(data.user);
      this.tokenStorage.saveBank(data.bank);



      this.notificationService.showSnackBar('Successfully logged in');


      switch (data.user.roles[0]) {
        case 'ROLE_ADMIN' : this.router.navigate(['/admin']); return
        case 'ROLE_USER' : this.router.navigate(['/client']); return
        case 'ROLE_CTRL' : this.router.navigate(['/ctrl']); return
        case 'ROLE_CORR' : this.router.navigate(['/corr']); return

        default:
        window.location.reload();
      }


      // if(data.user.roles[0] === 'ROLE_ADMIN')
      //   this.router.navigate(['/admin']);
      // else
      //   this.router.navigate(['/client']);
      //
//      window.location.reload();
    }, error => {
      if(error.error.login === 'Invalid Username'){
        this.loginError = "Invalid login data"
        this.loginForm.reset()
      }
    });
  }

}
