import {Component, OnInit} from '@angular/core';
import {TokenStorageService} from "../../../service/token-storage.service";
import {NotificationService} from "../../../service/notification.service";
import {Router} from "@angular/router";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {TrnService} from "../../../service/trn.service";
import {Bank} from "../../../model/bank";
import {User} from "../../../model/user";
import {Trn} from "../../../model/trn";
import {MatTableDataSource} from "@angular/material/table";
import {SelectionModel} from "@angular/cdk/collections";
import {ViewTrnComponent} from "../view-trn/view-trn.component";
import {CreateTrnComponent} from "../create-trn/create-trn.component";
import {AuthService} from "../../../service/auth.service";

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss']
})
export class ClientComponent implements OnInit {

  currentBank: Bank
  currentUser: User
  currentTransactions: Trn[] = []
  deleteList: number[] = []

  displayedColumns: string[] = ['select', 'position', 'edNo', 'edDate', 'payeePersonalAcc'
    , 'payerPersonalAcc', 'sum', 'currency', 'payeeINN', 'payeeName', 'payerINN', 'payerName'
    , 'purpose']
  dataSource: MatTableDataSource<Trn> = new MatTableDataSource()
  selection = new SelectionModel<Trn>(true, []);

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

    console.log('this.currentBank' + this.currentBank)
    console.log('this.currentUser' + this.currentUser)

    this.loadTrans(new Date())
  }

  loadTrans(date: Date) {
    this.trnService.getTranByDate(date).subscribe(data => {
      this.currentTransactions = data
      this.dataSource = new MatTableDataSource(this.currentTransactions);

      console.log(data)
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

  addTransaction() {
    const createDialogTransaction = new MatDialogConfig();
    createDialogTransaction.width = '50em';
    createDialogTransaction.maxWidth = '50em';
    createDialogTransaction.minWidth = '50em';

    createDialogTransaction.height = '45em';
    createDialogTransaction.maxHeight = '45em';
    createDialogTransaction.minHeight = '45em';

    createDialogTransaction.data = this.dataSource
    this.dialog.open(CreateTrnComponent, createDialogTransaction).afterClosed()
      .subscribe(result => {
          this.dataSource._updateChangeSubscription()
      });

  }

  editClick(id: any) {

  }

  clickTrnRow(row: Trn) {
    const viewDialogTransaction = new MatDialogConfig();
    viewDialogTransaction.width = '80%';
    viewDialogTransaction.height = '80%';
    const currentTrn = this.currentTransactions.find(u => u.id == row.id)
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

    if(this.selection.selected.length < 1) {
      this.notificationService.showSnackBar("You mast checked transactions")
      return
    }
    this.selection.selected.filter(t => t.status === 0).forEach(trn => {
        this.deleteList.push(trn.id)
    })
    this.trnService.deleteTrn({idList : this.deleteList}).subscribe( result => {

      this.selection.selected.filter(t => t.status === 0).forEach(trn => {
        this.dataSource.data.splice(this.dataSource.data.findIndex(t => t.id === trn.id),1)
      })
      this.dataSource._updateChangeSubscription()
      this.notificationService.showSnackBar("Success deleted " + this.selection.selected.length + ' transactions')

    }, error => {
      this.notificationService.showSnackBar("delete Error " + error.message)
    }, () => {
      this.clearSelected()
    })
  }

  clearSelected(){
    this.selection.clear()
    this.deleteList.splice(0,this.deleteList.length)
  }
}
