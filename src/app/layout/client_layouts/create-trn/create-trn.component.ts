import {Component, Inject, OnInit} from '@angular/core';
import {TrnService} from "../../../service/trn.service";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {EditUserComponent} from "../../admin_layouts/edit-user/edit-user.component";
import {NotificationService} from "../../../service/notification.service";
import {TokenStorageService} from "../../../service/token-storage.service";
import {User} from "../../../model/user";
import {Bank} from "../../../model/bank";
import {numberValidator} from "../../../validators/validators";
import {Trn} from "../../../model/trn";

@Component({
  selector: 'app-create-trn',
  templateUrl: './create-trn.component.html',
  styleUrls: ['./create-trn.component.scss']
})
export class CreateTrnComponent implements OnInit {

  trnCreatedForm: FormGroup
  currentUser: User
  currentBank: Bank
  today  = new Date().toDateString()

  constructor(private dialogRef: MatDialogRef<EditUserComponent>,
              private fb: FormBuilder,
              private notificationService: NotificationService,
              private tokenStorageService: TokenStorageService,
              private trnService: TrnService,
              @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.currentBank = tokenStorageService.getBank()
    this.currentUser = tokenStorageService.getUser()
    this.trnCreatedForm = this.createProfileForm()
    console.log(this.data.data)

  }

  createProfileForm(): FormGroup {
    return this.fb.group({
      edNo: [null],
      edDate: [(new Date()).toISOString().substr(0,10)],

      edReceiver: ["258746985"],

      transKind: [1],
      sum: ["", Validators.compose([Validators.required])],
      currency: ["SYP", Validators.compose([Validators.required])],
      purpose: [''],

      edAuthor: [this.currentBank.bik],
      payerCorrespAcc: [this.currentBank.corrAcc],
      payerPersonalAcc: ["", Validators.compose([Validators.required])],
      payerINN: [""],
      payerName: [""],

      payeeCorrespAcc: ["", Validators.compose([Validators.required])],
      payeePersonalAcc: ["", Validators.compose([Validators.required])],
      payeeINN: [""],
      payeeName: [""],
    });
  }

  ngOnInit(): void {
  }

  closeDialog(number: number) {
    this.dialogRef.close(number)
  }

  submit(actionType: number) {
    const newTrn = {
      edNo: this.trnCreatedForm.value.edNo,
      edAuthor: this.trnCreatedForm.value.edAuthor,
      edReceiver: this.trnCreatedForm.value.edReceiver,
      transKind: this.trnCreatedForm.value.transKind,
      sum: this.trnCreatedForm.value.sum,
      payerPersonalAcc: this.trnCreatedForm.value.payerPersonalAcc,
      payerCorrespAcc: this.trnCreatedForm.value.payerCorrespAcc,
      payeePersonalAcc: this.trnCreatedForm.value.payeePersonalAcc,
      payeeCorrespAcc: this.trnCreatedForm.value.payeeCorrespAcc,
      userId: this.currentUser.id,
      purpose: this.trnCreatedForm.value.purpose,
      payerName: this.trnCreatedForm.value.payerName,
      payeeName: this.trnCreatedForm.value.payeeName,
      currency : this.trnCreatedForm.value.currency
    }

    this.trnService.createTrn(newTrn).subscribe( result => {
      this.data.data.push(result)
      if(actionType === 1)
        this.closeDialog(1)
      if(actionType === 2)
        this.trnCreatedForm.reset()
      this.notificationService.showSnackBar("Transaction success add")
        }, error => {
      console.log(error)
    })

  }
}
