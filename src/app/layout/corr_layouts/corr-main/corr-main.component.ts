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
import {Filter} from "../../../model/filter";

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
  filterData  = {}

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

    this.initFilter()
    this.loadTrans()

   }

   initFilter(){
     this.filterData = {
       startDate: new Date(),
       endDate: new Date(),
       login: "",
       sum: 0,
       payerPersonalAcc: "",
       payerCorrespAcc: this.currentBank.corrAcc,
       payeePersonalAcc: "",
       payeeCorrespAcc: "",
       purpose: "",
       payerName: "",
       payeeName: "",
       currency : "",
       status : 4
     }
   }

  loadTrans() {
    this.trnService.getFilteringTrn(this.filterData as Filter).subscribe(data => {
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
          this.loadTrans()
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

  return() {

  }

  register() {

  }
}