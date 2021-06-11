import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
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
import {MatSort, Sort} from "@angular/material/sort";
import {compare} from "../../../utils/utils";
import {Balance} from "../../../model/balance";
import {MatPaginator} from "@angular/material/paginator";
import {interval, merge, Subject} from "rxjs";
import {map, startWith, switchMap} from "rxjs/operators";
import {Filter} from "../../../model/filter";
import {BalanceService} from "../../../service/balance.service";
import {FilterLayoutComponent} from "../../filter-layout/filter-layout.component";
import {ReportComponent} from "../../report/report.component";
import {ReportService} from "../../../service/report.service";
import {ReportOrder} from "../../../model/report-order";

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss']
})
export class ClientComponent implements OnInit, AfterViewInit{

  currentBank: Bank
  currentUser: User
  deleteList: number[] = []
  buttonVisible: boolean = false

  displayedColumns: string[] = ['select', 'status', 'position', 'edNo', 'edDate', 'payeePersonalAcc'
    , 'payerPersonalAcc', 'sum', 'currency', 'payeeINN', 'payeeName', 'payerINN', 'payerName'
    , 'purpose']
  dataSource: MatTableDataSource<Trn> = new MatTableDataSource()
  selection = new SelectionModel<Trn>(true, []);
  lastMove: number = new Date().getMinutes()

  filterData = {} as Filter
  isFiltering = false
  isLoading = true
  balance: Balance = {
    real_balance: 0,
    planned_balance: 0,
    payment_position: 0
  }

  pageIndex = 0
  pageSize = 50
  resultsLength: any = 0;

  sortList: string[] = []

  orderReportList: ReportOrder[] = []
  notShowReports = 0

  @ViewChild(MatPaginator, {read : MatPaginator , static: false}) paginator?: MatPaginator;
  @ViewChild(MatSort,  {read : MatSort , static: false}) sort?: MatSort;
  filters: string[] = []


  constructor(
    private authService: AuthService,
    private tokenStorage: TokenStorageService,
    private notificationService: NotificationService,
    private router: Router,
    private trnService: TrnService,
    private dialog: MatDialog,
    private balanceServiсe: BalanceService,
    readonly reportServiсe: ReportService
  ) {

    this.currentBank = this.tokenStorage.getBank()
    this.currentUser = this.tokenStorage.getUser()
    this.selection.changed.subscribe(() => {
      this.buttonVisible = this.selection.selected.length.valueOf() === 1 ? true : false
    })

    reportServiсe.orderForArchive.subscribe(res  => {
      const order = res as ReportOrder
      if(order.statusCode != -1) {
        this.orderReportList = this.reportServiсe.orderedReportList
        this.notShowReports += 1
      }
    })

    this.initFilter()
    this.initSorted()
    this.initBalance()

  }

  ngAfterViewInit() {
    // @ts-ignore
    this.sort?.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    // @ts-ignore
    merge<MatSort,MatPaginator>(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoading = true
          if(this.sort?.active != 'created')
            this.sortList.push(`${this.sort?.active} ${this.sort?.direction}`)
          // @ts-ignore
          return this.trnService.getFilteringTrn(this.filterData as Filter, this.paginator.pageIndex, this.paginator.pageSize, this.sortList.toString())
        }),
        map(data => {
          this.isLoading = false;
          this.sortList.splice(0, this.sortList.length)
          if (data === null) return []
          return data;
        })
      ).subscribe(data => {
        this.dataSource.data = data.trnList
        this.resultsLength = data.loadLength
        // @ts-ignore
        this.pageIndex = this.paginator?.pageIndex
        // @ts-ignore
        this.pageSize = this.paginator?.pageSize
      }, error => {
        this.notificationService.showSnackBar(error.message || error.statusText);
      },
      () =>{
      });
  }

  initSorted() {
    this.sortList.push("edDate desc")
  }

  initBalance() {
    const balDate = {
      data: null,
      curr: "RUR",
      acc: this.filterData.payerCorrespAcc
    }
    this.balanceServiсe.getBalance(balDate).subscribe(res => {
      this.balance.real_balance = +res.real_balance.toString().replace(",", ".")
      this.balance.planned_balance = +res.planned_balance.toString().replace(",", ".")
      this.balance.payment_position = +res.payment_position.toString().replace(",", ".")
    }, error => {
      this.notificationService.showSnackBar("Balance loading error")
    })
  }

  initFilter() {
    this.filterData.payerCorrespAcc = this.currentBank.corrAcc
    this.filterData.login = this.currentUser.login
  }

  ngOnInit(): void {
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
    const currentTrn: Trn = this.dataSource.data.find(u => u.itrnnum == row.itrnnum) as Trn
    viewDialogTransaction.data = {
      trn: currentTrn
    };
    this.dialog.open(ViewTrnComponent, viewDialogTransaction)
      // .afterClosed()
      // .subscribe(result => {
      //   if (result != undefined && result.res != 0)
      //     this.loadTrans(new Date())
      // });
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
    if (this.selection.isSelected(this.dataSource.data[i]))
      this.selection.deselect(this.dataSource.data[i])
    else
      this.selection.select(this.dataSource.data[i])
  }

  move() {
    let nowMonent = new Date().getMinutes()
    if((nowMonent - this.lastMove) > 5) {
      this.tokenStorage.logOut()
    }
    this.lastMove = nowMonent
  }

  setFilter() {
    const viewDialogFilter = new MatDialogConfig();
    viewDialogFilter.width = '60%';
    viewDialogFilter.height = '50%';
    viewDialogFilter.data = {filter: this.filterData};
    this.dialog.open(FilterLayoutComponent, viewDialogFilter).afterClosed().subscribe(res => {
      if (res === 1) {
        this.isFiltering = true
        this.sort?.sortChange.next()
        this.filters.splice(0,this.filters.length)
        Object.keys(this.filterData).forEach(key => {
          let value = ""
          // @ts-ignore
          if(this.filterData[key] != null && key != "payerCorrespAcc" && key != "login") {
            if (key === 'startDate' || key === 'endDate') {
              // @ts-ignore
              value = this.filterData[key].toLocaleDateString()
            } else { // @ts-ignore
              value = this.filterData[key]
            }
            this.filters.push(`${key} = ${value}`)
          }
        })
      }
    })
  }

  openReportDialog() {
    const viewReportsDialog = new MatDialogConfig();
    viewReportsDialog.width = '80%';
    viewReportsDialog.height = '80%';
    this.dialog.open(ReportComponent, viewReportsDialog)
  }

  accChanged(event: any) {
    let currentAcc = (event.target as HTMLSelectElement).value;
    this.filterData.payerCorrespAcc = currentAcc
    this.sort?.sortChange.next()
    this.initBalance()

  }

  resetFilter() {
    this.filters.splice(0,this.filters.length)
    this.filterData.startDate = null
    this.filterData.endDate = null
    this.filterData.sum = null
    this.filterData.payerPersonalAcc = null
    this.filterData.payeePersonalAcc = null
    this.filterData.payeeCorrespAcc = null
    this.filterData.purpose = null
    this.filterData.payerName = null
    this.filterData.payeeName = null
    this.filterData.currency = null
    this.filterData.status = null

    this.initSorted()

    this.sort?.sortChange.next()
  }

  remove(filter: string) {
    let filterKey = filter.substr(0, filter.indexOf("=") - 1)

    if(filterKey === 'startDate' || filterKey === 'endDate'){
      this.filters.splice(this.filters.indexOf(this.filters.find(s => s.indexOf("startDate")) as string), 1);
      this.filters.splice(this.filters.indexOf(this.filters.find(s => s.indexOf("endDate")) as string), 1);
      // @ts-ignore
      this.filterData['endDate'] = null
      this.filterData['startDate'] = null
     this.sort?.sortChange.next()
      return
    }

    const index = this.filters.indexOf(filter);
    if (index >= 0) {
      this.filters.splice(index, 1);
      // @ts-ignore
      this.filterData[filterKey] = null
     this.sort?.sortChange.next()
   }
  }

  openReportArchive() {
    this.notShowReports = 0
  }
}


