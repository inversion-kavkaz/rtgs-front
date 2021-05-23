import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {NotificationService} from "../../../service/notification.service";
import {UserService} from "../../../service/user.service";
import {User} from "../../../model/user";

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent implements OnInit {

  public profileEditForm: FormGroup;
  hide = true;

  constructor(private dialogRef: MatDialogRef<EditUserComponent>,
              private fb: FormBuilder,
              private notificationService: NotificationService,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private userService: UserService) {
    this.profileEditForm = this.createProfileForm()
  }

  ngOnInit(): void {
  }

  createProfileForm(): FormGroup {
    return this.fb.group({
      ename: [this.data.user.ename ,Validators.compose([Validators.required])],
      password: [null],
      roles: [this.data.user.roles, Validators.compose([Validators.required])]
    });
  }

  closeDialog() {
    this.dialogRef.close()
  }

  submit() {

  }
}
