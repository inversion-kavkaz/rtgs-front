import {AfterViewInit, Component, HostListener, OnInit, ViewChild} from '@angular/core';
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
import {ViewTrnComponent} from "../../client_layouts/view-trn/view-trn.component";
import {MatSort, Sort} from "@angular/material/sort";
import {compare} from "../../../utils/utils";
import {Filter} from "../../../model/filter";
import {BalanceService} from "../../../service/balance.service";
import {Balance} from "../../../model/balance";
import {FilterLayoutComponent} from "../../filter-layout/filter-layout.component";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {merge} from "rxjs";
import {map, startWith, switchMap} from "rxjs/operators";

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
  dataSource: MatTableDataSource<Trn> = new MatTableDataSource()
  selection = new SelectionModel<Trn>(true, []);
  lastMove: number = new Date().getMinutes()
  filterData: any = {}
  isLoading = true
  balance: Balance = {
    real_balance: 0,
    planned_balance: 0,
    payment_position: 0
  }

  pageNum = 0
  pageSize = 50
  resultsLength: any = 100;

  links = ['Output documents', 'Input documents'];
  activeLink = this.links[0];

  isCtrl: boolean = false
  sortList: string[] = []
  currentSortActive = ""

  @ViewChild(MatSort) sort?: MatSort;
  @ViewChild(MatPaginator) paginator?: MatPaginator;
  private isLoadingResults?: boolean;


  constructor(
    private authService: AuthService,
    private tokenStorage: TokenStorageService,
    private notificationService: NotificationService,
    private router: Router,
    private trnService: TrnService,
    private dialog: MatDialog,
    private balanceServise: BalanceService
  ) {
    this.currentBank = this.tokenStorage.getBank()
    this.currentUser = this.tokenStorage.getUser()
    this.selection.changed.subscribe(() => {
      this.buttonVisible = this.selection.selected.length.valueOf() > 0 ? true : false
    })

    this.initFilter()
    this.initSorted()
    //this.loadTrans()
    this.initBalance()

  }

  ngAfterViewInit() {
    // @ts-ignore
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    // @ts-ignore
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoading = true
          return  this.trnService.getFilteringTrn(this.filterData as Filter, this.pageNum, this.pageSize, this.sortList.toString())
        }),
        map(data => {

          console.log(data)
          this.isLoading = false;

          if (data === null) {
            return [];
          }
          this.resultsLength = data.total_count;
          return data.items;
        })
      ).subscribe(data => {
      this.dataSource.data = data.trnList as Trn[]
      this.resultsLength = data.loadLength
    });
  }


  initSorted(){
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
    this.filterData.startDate = null //new Date()
    this.filterData.endDate = null //new Date()
    this.filterData.payerCorrespAcc = this.currentBank.corrAcc
  }

  loadTrans() {
    let ss = this.sortList.toString()
    console.log(ss)
    this.isLoading = true
    this.trnService.getFilteringTrn(this.filterData as Filter, this.pageNum, this.pageSize, ss).subscribe(data => {
      this.dataSource.data = data.trnList as Trn[]
      this.resultsLength = data.loadLength
    }, error => {
      this.notificationService.showSnackBar(error.message || error.statusText);
    }, () => {
      this.isLoading = false
      this.sortList.splice(0,this.sortList.length)
      console.log('after clear ' + this.sortList.toString())
    })
  }

  ngOnInit(): void {
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
    if (this.selection.isSelected(this.dataSource.data[i]))
      this.selection.deselect(this.dataSource.data[i])
    else
      this.selection.select(this.dataSource.data[i])
  }

  @HostListener('window:keydown', ['$event'])
  keyEventDown(event: KeyboardEvent) {
    this.isCtrl = event.ctrlKey
  }

  @HostListener('window:keyup', ['$event'])
  keyEventUp(event: KeyboardEvent) {
    this.isCtrl = event.ctrlKey
    if(this.sortList.length > 0)
      this.loadTrans()
  }


  sortChanged(sort: Sort) {

    if (!sort.active || sort.direction === '') {
      return;
    }

    let newStr = `${sort.active} ${sort.direction}`
    let index = this.sortList.findIndex(s => s.substring(0,s.search(" ")) === newStr.substring(0,newStr.search(" ")))
    if(index != -1)
      this.sortList.splice(index,1)
    this.sortList.push(newStr)
      if(!this.isCtrl)
        this.loadTrans()


    // this.dataSource.data = this.dataSource.data.sort((a, b) => {
    //   const isAsc = sort.direction === 'asc';
    //   switch (sort.active) {
    //
    //     case 'status'   :
    //       return compare(a.status, b.status, isAsc);
    //     case 'position' :
    //       return compare(a.position, b.position, isAsc);
    //     case 'edNo'     :
    //       return compare(a.edNo, b.edNo, isAsc);
    //     case 'edDate'   :
    //       return compare(a.edDate.toTimeString(), b.edDate.toTimeString(), isAsc);
    //     case 'payeePersonalAcc' :
    //       return compare(a.payeePersonalAcc, b.payeePersonalAcc, isAsc);
    //     case 'payerPersonalAcc' :
    //       return compare(a.payerPersonalAcc, b.payerPersonalAcc, isAsc);
    //     case 'sum' :
    //       return compare(a.sum, b.sum, isAsc);
    //     case 'currency' :
    //       return compare(a.currency, b.currency, isAsc);
    //     case 'payeeINN' :
    //       return compare(a.payeeINN, b.payeeINN, isAsc);
    //     case 'payeeName' :
    //       return compare(a.payeeName, b.payeeName, isAsc);
    //     case 'payerINN' :
    //       return compare(a.payerINN, b.payerINN, isAsc);
    //     case 'payerName' :
    //       return compare(a.payerName, b.payerName, isAsc);
    //     case 'purpose' :
    //       return compare(a.purpose, b.purpose, isAsc);
    //     default:
    //       return 0;
    //   }
    // });

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
        this.loadTrans()
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
    this.loadTrans()
    this.initBalance()
  }

    onSelectTab(tabNum: number) {
    console.log(tabNum)
    if (tabNum === 1) {
      this.filterData.payeeCorrespAcc = this.currentBank.corrAcc
      this.filterData.payerCorrespAcc = null
      this.filterData.status = 4
    } else {
      this.filterData.payerCorrespAcc = this.currentBank.corrAcc
      this.filterData.payeeCorrespAcc = null
      this.filterData.status = null
    }
    this.loadTrans()
  }

  openReportDialog() {

    window.location.href = "http://172.16.0.146:1216/download"

  }

  getServerData(event: PageEvent) {
    console.log(event)
    this.pageNum = event.pageIndex
    this.pageSize = event.pageSize
    this.loadTrans()
  }
}
