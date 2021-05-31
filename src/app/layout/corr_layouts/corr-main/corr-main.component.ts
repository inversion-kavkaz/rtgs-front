import { Component, OnInit } from '@angular/core';
import {Bank} from "../../../model/bank";
import {User} from "../../../model/user";
import {Trn} from "../../../model/trn";
import {MatTableDataSource} from "@angular/material/table";
import {SelectionModel} from "@angular/cdk/collections";
import {AuthService} from "../../../service/auth.service";
import {TokenStorageService} from "../../../service/token-storage.service";
import {NotificationService} from "../../../service/notification.service";
import {Router} from "@angular/router";
import {TrnService} from "../../../service/trn.service";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {CreateTrnComponent} from "../../client_layouts/create-trn/create-trn.component";
import {ViewTrnComponent} from "../../client_layouts/view-trn/view-trn.component";
import {Sort} from "@angular/material/sort";
import {compare} from "../../../utils/utils";

@Component({
  selector: 'app-corr-main',
  templateUrl: './corr-main.component.html',
  styleUrls: ['./corr-main.component.scss']
})
export class CorrMainComponent implements OnInit {
  currentBank: Bank
  currentUser: User
  currentTransactions: Trn[] = []
  deleteList: number[] = []
  buttonVisible: boolean = false

  displayedColumns: string[] = ['select', 'status', 'position', 'edNo', 'edDate', 'payeePersonalAcc'
    , 'payerPersonalAcc', 'sum', 'currency', 'payeeINN', 'payeeName', 'payerINN', 'payerName'
    , 'purpose']
  dataSource: MatTableDataSource<Trn> = new MatTableDataSource()
  selection = new SelectionModel<Trn>(true, []);
  lastMove: number = new Date().getMinutes()
  isChecked = true
  filterData = {}

  constructor(
    private authService: AuthService,
    private tokenStorage: TokenStorageService,
    private notificationService: NotificationService,
    private router: Router,
    private trnService: TrnService,
    private dialog: MatDialog
  ) {
    this.currentBank = this.tokenStorage.getBank()
    this.currentUser = this.tokenStorage.getUser()
    this.selection.changed.subscribe(() => {
      this.buttonVisible = this.selection.selected.length.valueOf() === 1 ? true : false
    })
    this.loadTrans(new Date())

    this.filterData = {
      date: null,

    }
  }

  loadTrans(date: Date) {
    this.trnService.getTranByDate(date).subscribe(data => {
      this.currentTransactions = data
      this.dataSource = new MatTableDataSource(this.currentTransactions);
      this.dataSource.data = this.dataSource.data.sort((t1, t2) => {
        return (t1.edNo - t2.edNo) >= 0 ? 1 : -1
      })

    }, error => {
      this.notificationService.showSnackBar(error.message || error.statusText);
    })
  }

  ngOnInit(): void {
  }

  logout() {
    this.tokenStorage.logOut()
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  addTransaction(type: string) {
    const createDialogTransaction = new MatDialogConfig();
    createDialogTransaction.width = '50em';
    createDialogTransaction.maxWidth = '50em';
    createDialogTransaction.minWidth = '50em';
    // createDialogTransaction.height = '45em';
    // createDialogTransaction.maxHeight = '45em';
    // createDialogTransaction.minHeight = '45em';
    createDialogTransaction.data = {trnList: this.dataSource.data, selected: this.selection.selected, type: type}
    this.dialog.open(CreateTrnComponent, createDialogTransaction).afterClosed()
      .subscribe(result => {
        if (type === 'Edit') {
          const itrnnum = this.selection.selected[0].itrnnum
          console.log('itrnnum')
          console.log(itrnnum)
          let index = this.dataSource.data.findIndex(t => t.itrnnum === itrnnum)
          console.log('index')
          console.log(index)
          this.dataSource.data.splice(index, 1)
        }
        this.clearSelected()
        this.dataSource._updateChangeSubscription()
      });

  }

  dblClickTrnRow(row: Trn) {
    const viewDialogTransaction = new MatDialogConfig();
    viewDialogTransaction.width = '80%';
    viewDialogTransaction.height = '80%';
    const currentTrn = this.currentTransactions.find(u => u.itrnnum == row.itrnnum)
    viewDialogTransaction.data = {
      trn: currentTrn
    };
    this.dialog.open(ViewTrnComponent, viewDialogTransaction).afterClosed()
      .subscribe(result => {
        if (result != undefined && result.res != 0)
          this.loadTrans(new Date())
      });
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource.data);
  }

  checkboxLabel(row?: Trn): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  deleteTransaction() {

    if (this.selection.selected.length < 1) {
      this.notificationService.showSnackBar("You mast checked transactions")
      return
    }
    this.selection.selected.filter(t => t.status == 1).forEach(trn => {
      this.deleteList.push(trn.itrnnum)
    })

    if (this.deleteList.length < 1) {
      this.clearSelected()
      this.notificationService.showSnackBar("No transaction for delete")
      return;
    }

    if (!confirm("Are you sure to delete " + this.selection.selected.length) + " transactions") {
      this.selection.clear()
      return;
    }

    this.trnService.deleteTrn({idList: this.deleteList}).subscribe(result => {

      console.log('ret result = ' + result)

      this.deleteList.forEach(trn => {
        this.dataSource.data.splice(this.dataSource.data.findIndex(t => t.itrnnum === trn), 1)
      })
      this.dataSource._updateChangeSubscription()
      this.notificationService.showSnackBar("Success deleted " + this.selection.selected.length + ' transactions')

    }, error => {
      this.notificationService.showSnackBar("delete Error " + error.message)
    }, () => {
      this.clearSelected()
    })
  }

  clearSelected() {
    this.selection.clear()
    this.deleteList.splice(0, this.deleteList.length)
  }

  clickTrnRow(i: any) {
    if (this.selection.isSelected(this.currentTransactions[i]))
      this.selection.deselect(this.currentTransactions[i])
    else
      this.selection.select(this.currentTransactions[i])
  }


  sortChanged(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      return;
    }

    this.dataSource.data = this.dataSource.data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {

        case 'status' :
          return compare(a.status, b.status, isAsc);
        case 'position' :
          return compare(a.position, b.position, isAsc);
        case 'edNo' :
          return compare(a.edNo, b.edNo, isAsc);
        case 'edDate' :
          return compare(a.edDate.getDate(), b.edDate.getDate(), isAsc);
        case 'payeePersonalAcc' :
          return compare(a.payeePersonalAcc, b.payeePersonalAcc, isAsc);
        case 'payerPersonalAcc' :
          return compare(a.payerPersonalAcc, b.payerPersonalAcc, isAsc);
        case 'sum' :
          return compare(a.sum, b.sum, isAsc);
        case 'currency' :
          return compare(a.currency, b.currency, isAsc);
        case 'payeeINN' :
          return compare(a.payeeINN, b.payeeINN, isAsc);
        case 'payeeName' :
          return compare(a.payeeName, b.payeeName, isAsc);
        case 'payerINN' :
          return compare(a.payerINN, b.payerINN, isAsc);
        case 'payerName' :
          return compare(a.payerName, b.payerName, isAsc);
        case 'purpose' :
          return compare(a.purpose, b.purpose, isAsc);
        default:
          return 0;
      }
    });

  }

  move() {
    let nowMonent = new Date().getMinutes()
    if((nowMonent - this.lastMove) > 5) {
      this.tokenStorage.logOut()
    }
    this.lastMove = nowMonent
  }

  setFilter() {

  }

  onChange() {
    console.log('check date')
  }

}
