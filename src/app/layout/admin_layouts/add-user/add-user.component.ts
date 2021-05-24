import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {NotificationService} from "../../../service/notification.service";
import {UserService} from "../../../service/user.service";
import {EditUserComponent} from "../edit-user/edit-user.component";
import {AuthService} from "../../../service/auth.service";
import {TokenStorageService} from "../../../service/token-storage.service";

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {
  public profileEditForm: FormGroup;
  hide = true;
  bankId: number

  constructor(private dialogRef: MatDialogRef<EditUserComponent>,
              private fb: FormBuilder,
              private notificationService: NotificationService,
              private userService: UserService,
              private authService: AuthService,
              private tokenStorage: TokenStorageService) {
    this.profileEditForm = this.createProfileForm()
    this.bankId = this.tokenStorage.getUser().bank.id
  }

  ngOnInit(): void {
  }

  createProfileForm(): FormGroup {
    return this.fb.group({
      ename: ["" ,Validators.compose([Validators.required])],
      login: ["" ,Validators.compose([Validators.required])],
      password: ["",Validators.compose([Validators.required])],
      roles: ["ROLE_USER", Validators.compose([Validators.required])]
    });
  }

  closeDialog(result:number) {
    this.dialogRef.close({res:result})
  }

  submit() {

    const newUser = {
      bank_id:  this.bankId,
      eName:    this.profileEditForm.value.ename,
      login:    this.profileEditForm.value.login,
      password: this.profileEditForm.value.password
    }
    this.authService.register(newUser).subscribe(data => {
      this.closeDialog(1)
      }, error => {
    }
    )
  }


}
