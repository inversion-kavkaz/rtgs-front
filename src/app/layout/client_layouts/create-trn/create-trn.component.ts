import {Component, OnInit} from '@angular/core';
import {TrnService} from "../../../service/trn.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MatDialogRef} from "@angular/material/dialog";
import {EditUserComponent} from "../../admin_layouts/edit-user/edit-user.component";
import {NotificationService} from "../../../service/notification.service";
import {TokenStorageService} from "../../../service/token-storage.service";
import {User} from "../../../model/user";
import {Bank} from "../../../model/bank";
import {numberValidator} from "../../../validators/validators";

@Component({
  selector: 'app-create-trn',
  templateUrl: './create-trn.component.html',
  styleUrls: ['./create-trn.component.scss']
})
export class CreateTrnComponent implements OnInit {

  trnCreatedForm: FormGroup
  currentUser: User
  currentBank: Bank

  constructor(private dialogRef: MatDialogRef<EditUserComponent>,
              private fb: FormBuilder,
              private notificationService: NotificationService,
              private tokenStorageService: TokenStorageService,
              private trnService: TrnService,
  ) {
    this.currentBank = tokenStorageService.getBank()
    this.currentUser = tokenStorageService.getUser()
    this.trnCreatedForm = this.createProfileForm()
  }

  createProfileForm(): FormGroup {
    return this.fb.group({
      edNo: [null],
      edDate: [new Date(), Validators.compose([Validators.required])],

      edReceiver: ["", Validators.compose([Validators.required])],

      transKind: [1, Validators.compose([Validators.required])],
      sum: ["", Validators.compose([Validators.required])],
      currency: ["", Validators.compose([Validators.required])],
      purpose: ["", Validators.compose([Validators.required])],

      edAuthor: [this.currentBank.bik, Validators.compose([Validators.required])],
      payerCorrespAcc: ["", Validators.compose([Validators.required])],
      payerPersonalAcc: ["", Validators.compose([Validators.required])],
      payerINN: ["", Validators.compose([Validators.required])],
      payerName: ["", Validators.compose([Validators.required])],

      payeeCorrespAcc: ["", Validators.compose([Validators.required])],
      payeePersonalAcc: ["", Validators.compose([Validators.required])],
      payeeINN: ["", Validators.compose([Validators.required])],
      payeeName: ["", Validators.compose([Validators.required])],

    });
  }

  ngOnInit(): void {
  }

  closeDialog(number: number) {

  }

  submit() {

  }

}
