import {AfterViewInit, Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {Bank} from "../../../model/bank";
import {User} from "../../../model/user";
import {Trn} from "../../../model/trn";
import {SelectionModel} from "@angular/cdk/collections";
import {AuthService} from "../../../service/auth.service";
import {TokenStorageService} from "../../../service/token-storage.service";
import {NotificationService} from "../../../service/notification.service";
import {Router} from "@angular/router";
import {TrnService} from "../../../service/trn.service";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {ViewTrnComponent} from "../../client_layouts/view-trn/view-trn.component";
import {Filter} from "../../../model/filter";
import {BalanceService} from "../../../service/balance.service";
import {Balance} from "../../../model/balance";
import {FilterLayoutComponent} from "../../filter-layout/filter-layout.component";
import {merge, Subject} from "rxjs";
import {map, startWith, switchMap} from "rxjs/operators";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort, MatSortable, Sort} from "@angular/material/sort";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {ReportComponent} from "../../report/report.component";
import {ReportService} from "../../../service/report.service";

enum Regim{
  Payer,
  Payee
}

@Component({
  selector: 'app-corr-main',
  templateUrl: './corr-main.component.html',
  styleUrls: ['./corr-main.component.scss']
})
export class CorrMainComponent implements OnInit, AfterViewInit {


  currentBank: Bank
  currentUser: User
  buttonVisible: boolean = false

  displayedColumns: string[] = ['select', 'status', 'position', 'edNo', 'edDate', 'payeePersonalAcc'
    , 'payerPersonalAcc', 'sum', 'currency', 'payeeINN', 'payeeName', 'payerINN', 'payerName'
    , 'purpose']
  dataSource: MatTableDataSource<any> = new MatTableDataSource()
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

  links = ['Output documents', 'Input documents'];
  activeLink = this.links[0];

  isCtrl: boolean = false
  sortList: string[] = []

  @ViewChild(MatPaginator, {read : MatPaginator , static: false}) paginator?: MatPaginator;
  @ViewChild(MatSort,  {read : MatSort , static: false}) sort?: MatSort;
  filters: string[] = []

  clientRegim: Regim = Regim.Payer

  regim:Subject<Regim> = new Subject()


  constructor(
    private authService: AuthService,
    private tokenStorage: TokenStorageService,
    private notificationService: NotificationService,
    private router: Router,
    private trnService: TrnService,
    private dialog: MatDialog,
    private balanceServise: BalanceService,
    readonly reportsService: ReportService,
  ) {
    this.currentBank = this.tokenStorage.getBank()
    this.currentUser = this.tokenStorage.getUser()
    this.selection.changed.subscribe((s) => {
      this.buttonVisible = this.selection.selected.length.valueOf() > 0
      && this.selection.selected.filter(i => i.status == 4).length == 0 ? true : false

    })

    this.initFilter()
    this.initSorted()
    this.initBalance()

  }

  ngAfterViewInit() {

    // @ts-ignore
    this.sort?.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    // @ts-ignore
    merge<MatSort,MatPaginator>(this.sort.sortChange, this.paginator.page,this.regim)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.initFilter()
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
    this.balanceServise.getBalance(balDate).subscribe(res => {
      this.balance.real_balance = +res.real_balance.toString().replace(",", ".")
      this.balance.planned_balance = +res.planned_balance.toString().replace(",", ".")
      this.balance.payment_position = +res.payment_position.toString().replace(",", ".")
    }, error => {
      this.notificationService.showSnackBar("Balance loading error")
    })
  }

  initFilter() {
    if (this.clientRegim === 1) {
      this.filterData.payeeCorrespAcc = this.currentBank.corrAcc
      if(!this.isFiltering)
        this.filterData.payerCorrespAcc = null
      this.filterData.status = 4
    } else {
      this.filterData.payerCorrespAcc = this.currentBank.corrAcc
      if(!this.isFiltering) {
        this.filterData.payeeCorrespAcc = null
        this.filterData.status = null
      }
    }


   // this.filterData.payerCorrespAcc = this.currentBank.corrAcc
  }

  ngOnInit(): void {

    this.dataSource.sort = this.sort as MatSort
    this.dataSource.paginator = this.paginator as MatPaginator
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  dblClickTrnRow(row: Trn) {
    const viewDialogTransaction = new MatDialogConfig();
    viewDialogTransaction.width = '80%';
    viewDialogTransaction.height = '80%';
    const currentTrn = this.dataSource.data.find(u => u.itrnnum == row.itrnnum)
    viewDialogTransaction.data = {
      trn: currentTrn
    };
    this.dialog.open(ViewTrnComponent, viewDialogTransaction)
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
    if (this.selection.isSelected(this.dataSource.data[i]))
      this.selection.deselect(this.dataSource.data[i])
    else
      this.selection.select(this.dataSource.data[i])
  }

  @HostListener('window:keydown', ['$event'])
  keyEventDown(event: KeyboardEvent) {
    this.isCtrl = event.ctrlKey
    //console.log(event.key)
  }

  @HostListener('window:keyup', ['$event'])
  keyEventUp(event: KeyboardEvent) {
    this.isCtrl = event.ctrlKey
    // if (this.sortList.length > 0)
    //   this.loadTrans()
  }

  move() {
    let nowMonent = new Date().getMinutes()
    if ((nowMonent - this.lastMove) > 5) {
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
        console.log('---------------------------------')
        console.log(this.filterData)
        this.isFiltering = true
        this.sort?.sortChange.next()
        this.filters.splice(0,this.filters.length)
        Object.keys(this.filterData).forEach(key => {
          let value = ""
          // @ts-ignore
          if(this.filterData[key] != null &&
            ((key != "payerCorrespAcc" && this.clientRegim === Regim.Payer)
            || (key != "payeeCorrespAcc" && key != "status" && this.clientRegim === Regim.Payee)
            )) {
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

  return() {

  }

  register() {

    this.trnService.affirmTrn(this.selection.selected.map(t => t.itrnnum)).subscribe(res => {
      const resList: any[] = res as []
      resList.filter(r => r.affirmResult === 'SUCCESS').forEach(r => {
        // @ts-ignore
        this.dataSource.data.find(p => p.itrnnum === r.itrnnum).status = 4
      })

      this.selection.clear()
      this.initBalance()

    }, error => {
      console.log(error)
      this.notificationService.showSnackBar("Affirm error")
    })

  }

  accChanged(event: any) {
    let currentAcc = (event.target as HTMLSelectElement).value;
    this.filterData.payerCorrespAcc = currentAcc
    this.sort?.sortChange.next()
    this.initBalance()
  }

  onSelectTab(tabNum: number) {
    this.resetFilter()
    this.clientRegim = tabNum === 1 ? Regim.Payee : Regim.Payer
    this.regim.next(this.clientRegim)
  }

  openReportDialog() {
    const viewReportsDialog = new MatDialogConfig();
    viewReportsDialog.width = '80%';
    viewReportsDialog.height = '80%';
    this.dialog.open(ReportComponent, viewReportsDialog)
  }

  resetFilter() {
    this.isFiltering = false
    this.filters.splice(0,this.filters.length)
    this.filterData.startDate = null
    this.filterData.endDate = null
    this.filterData.login = null
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
}
