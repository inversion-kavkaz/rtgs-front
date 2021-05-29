import {Component, Inject, OnInit} from '@angular/core';
import {TrnService} from "../../../service/trn.service";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {EditUserComponent} from "../../admin_layouts/edit-user/edit-user.component";
import {NotificationService} from "../../../service/notification.service";
import {TokenStorageService} from "../../../service/token-storage.service";
import {User} from "../../../model/user";
import {Bank} from "../../../model/bank";
import {numberValidator} from "../../../validators/validators";
import {Trn} from "../../../model/trn";
import {BankService} from "../../../service/bank.service";
import {BankHandbookComponent} from "../handbooks/bank-handbook/bank-handbook.component";

@Component({
  selector: 'app-create-trn',
  templateUrl: './create-trn.component.html',
  styleUrls: ['./create-trn.component.scss']
})
export class CreateTrnComponent implements OnInit {

  trnCreatedForm: FormGroup
  currentUser: User
  currentBank: Bank
  date = new FormControl(new Date());
  trnResult: string = "undefined"
  trnResultText: string = ""
  currentTransaction: Trn
  actionType: string
  banksSprav: Bank[] = []
  isBankLoaded = false


  constructor(private dialogRef: MatDialogRef<EditUserComponent>,
              private fb: FormBuilder,
              private notificationService: NotificationService,
              private tokenStorageService: TokenStorageService,
              private trnService: TrnService,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private bankSevice: BankService,
              private dialog: MatDialog

  ) {
    this.currentTransaction = this.data.selected[0]
    this.currentBank = tokenStorageService.getBank()
    this.currentUser = tokenStorageService.getUser()
    this.trnCreatedForm = this.createProfileForm()
    this.actionType = this.data.type
    if(this.bankSevice.bankList.length > 0){
      this.isBankLoaded = true
      this.banksSprav = bankSevice.bankList
    } else
    this.bankSevice.listLoaded.subscribe(res => {
      this.isBankLoaded = true
      this.banksSprav = bankSevice.bankList
    })
  }

  createProfileForm(): FormGroup {
    console.log(this.currentTransaction)

    return this.fb.group({
      edNo: [this.currentTransaction != undefined ? this.currentTransaction.edNo : null],
      edReceiver: [this.currentBank.bik],

      transKind: [this.currentTransaction != undefined ? this.currentTransaction.transKind : 1],
      sum: [this.currentTransaction != undefined ? this.currentTransaction.sum : null, Validators.compose([Validators.required])],
      currency: [this.currentTransaction != undefined ? this.currentTransaction.currency : "SYP", Validators.compose([Validators.required])],
      purpose: [this.currentTransaction != undefined ? this.currentTransaction.purpose : null],

      edAuthor: [this.currentBank.bik],
      payerCorrespAcc: [this.currentBank.corrAcc],
      payerPersonalAcc: [this.currentTransaction != undefined ? this.currentTransaction.payerPersonalAcc : null, Validators.compose([Validators.required])],
      payerINN: [this.currentTransaction != undefined ? this.currentTransaction.payerINN : null],
      payerName: [this.currentTransaction != undefined ? this.currentTransaction.payerName : null],

      payeeCorrespAcc: [this.currentTransaction != undefined ? this.currentTransaction.payeeCorrespAcc : null, Validators.compose([Validators.required])],
      payeePersonalAcc: [this.currentTransaction != undefined ? this.currentTransaction.payeePersonalAcc : null, Validators.compose([Validators.required])],
      payeeINN: [this.currentTransaction != undefined ? this.currentTransaction.payeeINN : null],
      payeeName: [this.currentTransaction != undefined ? this.currentTransaction.payeeName : null],
    });
  }

  ngOnInit(): void {
  }

  closeDialog(number: number) {
    this.dialogRef.close(number)
  }

  submit(action: number) {

    const newTrn = {
      itrnnum: this.currentTransaction != undefined ? this.currentTransaction.itrnnum : null,
      itrnanum: this.currentTransaction != undefined ? this.currentTransaction.itrnanum : null,
      edNo: this.trnCreatedForm.value.edNo,
      edAuthor: this.trnCreatedForm.value.edAuthor,
      edDate : this.date.value,
      edReceiver: this.trnCreatedForm.value.edReceiver,
      transKind: this.trnCreatedForm.value.transKind,
      sum: this.trnCreatedForm.value.sum,
      payerPersonalAcc: this.trnCreatedForm.value.payerPersonalAcc,
      payerCorrespAcc: this.currentBank.corrAcc,
      payeePersonalAcc: this.trnCreatedForm.value.payeePersonalAcc,
      payeeCorrespAcc: this.trnCreatedForm.value.payeeCorrespAcc,
      login: this.currentUser.login,
      purpose: this.trnCreatedForm.value.purpose,
      payerName: this.trnCreatedForm.value.payerName,
      payeeName: this.trnCreatedForm.value.payeeName,
      currency : this.trnCreatedForm.value.currency
    }

    console.log(this.data.trnList)


    if(this.actionType != 'Edit') {
      this.trnService.createTrn(newTrn).subscribe(result => {
        this.trnCRUD(result, action)
      }, err => {
        this.trnResult = 'error'
        this.trnResultText = err.error.message || err.statusText
      })
    } else {
      this.trnService.updateTrn(newTrn).subscribe(result => {
        this.trnCRUD(result, action)
      }, err => {
        this.trnResult = 'error'
        this.trnResultText = err.error.message || err.statusText
      })

    }

  }

  trnCRUD(result: any,action: number){
    this.trnResultText = result.responseResult
    this.trnResult = result.trn === null ? 'error' : 'success'

    if(result.trn != null)

      this.data.trnList.unshift(result.trn)
    if(action === 1) {
      setTimeout(() => {
        this.closeDialog(1)
      }, 2000)
    }
    if(action === 2)
      this.trnCreatedForm.reset()
  }

  openBanksGuide() {
    const createDialogBankGuid = new MatDialogConfig();
    createDialogBankGuid.width = '50%'
    createDialogBankGuid.maxHeight = '80%'


    this.dialog.open(BankHandbookComponent,createDialogBankGuid).afterClosed().subscribe(res => {
      this.trnCreatedForm.value.payeeCorrespAcc = res.corrAcc
      console.log(res.corrAcc)
      console.log(this.trnCreatedForm.value.payeeCorrespAcc)
      console.log('Dialog closed ')
      console.log(res)

    })
  }
}
