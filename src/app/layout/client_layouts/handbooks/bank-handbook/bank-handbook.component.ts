import { Component, OnInit } from '@angular/core';
import {BankService} from "../../../../service/bank.service";
import {Bank} from "../../../../model/bank";
import {MatTableDataSource} from "@angular/material/table";
import {Trn} from "../../../../model/trn";
import {Sort} from "@angular/material/sort";
import {MatDialogRef} from "@angular/material/dialog";
import {EditUserComponent} from "../../../admin_layouts/edit-user/edit-user.component";

@Component({
  selector: 'app-bank-handbook',
  templateUrl: './bank-handbook.component.html',
  styleUrls: ['./bank-handbook.component.scss']
})
export class BankHandbookComponent implements OnInit {

  bankList: Bank[]
  dataSource: MatTableDataSource<Bank> = new MatTableDataSource()
  displayedColumns: string[] = ['position','corrAcc','bankAdress','bankName',]

  constructor(private bankService: BankService,
              private dialogRef: MatDialogRef<EditUserComponent>) {
    this.bankList = bankService.bankList
    this.dataSource = new MatTableDataSource(this.bankList)
  }

  ngOnInit(): void {
  }

  sortChanged($event: Sort) {

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  clickRow(row: any) {
    this.dialogRef.close(row)
  }
}
