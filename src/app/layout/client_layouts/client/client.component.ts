import {Component, OnInit, ViewChild} from '@angular/core';
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
import {MatSort} from "@angular/material/sort";
import {EditUserComponent} from "../../admin_layouts/edit-user/edit-user.component";
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

  displayedColumns: string[] = ['select','position', 'edNo','edDate', 'payeePersonalAcc'
    , 'payerPersonalAcc', 'sum','currency','payeeINN', 'payeeName','payerINN', 'payerName'
    ,'purpose']
  dataSource: MatTableDataSource<Trn>  = new MatTableDataSource()
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
    createDialogTransaction.width = '80%';
    createDialogTransaction.height = '90%';
    this.dialog.open(CreateTrnComponent, createDialogTransaction).afterClosed()
      .subscribe( result => {
        // if(result != undefined && result.res != 0)
        //   this.currentTransactions.includes(new Trn(),1)
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
      .subscribe( result => {
        if(result != undefined && result.res != 0)
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

}
