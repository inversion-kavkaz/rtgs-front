import {Component, OnInit} from '@angular/core';
import {ReportService} from "../../service/report.service";
import {MatTableDataSource} from "@angular/material/table";
import {Sort} from "@angular/material/sort";
import {compare} from "../../utils/utils";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {ViewTrnComponent} from "../client_layouts/view-trn/view-trn.component";
import {ReportParamsViewComponent} from "../report-params-view/report-params-view.component";

@Component({
  selector: 'app-repoprt',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {

  dataSource: MatTableDataSource<any> = new MatTableDataSource()
  reportTypeName: string = ""

  displayedColumns: string[] = ['report_id', 'report_name']


  constructor(
    readonly reportsService: ReportService,
    readonly dialog: MatDialog,
  ) {
    this.loadReports()
  }

  loadReports(){
    this.dataSource.data = this.reportsService.reportList
    if(this.reportsService.reportList.length < 1)
    this.reportsService.reportSubj.subscribe(res => {
      if(typeof res != 'string')
        this.dataSource.data = res as []
    }, error => {
      console.log(`load reports list error`)
    })


    this.reportTypeName =this.reportsService.reportName
    if(this.reportTypeName.length < 1)
      this.reportsService.reportSubj.subscribe( res => {
        if(typeof res === 'string')
          this.reportTypeName = res

      }, error => {
        console.log(`load report type name error`)
      })


  }

  ngOnInit(): void {
  }

  orderReport(row: any) {

    const viewReportParamsDialog = new MatDialogConfig();
    viewReportParamsDialog.width = '50%';
    viewReportParamsDialog.height = '50%';
    viewReportParamsDialog.data = {
      report: row
    };
    this.dialog.open(ReportParamsViewComponent, viewReportParamsDialog)
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  sortChanged(sort: Sort) {
    if (!sort.active || sort.direction === '') {
      return;
    }

    this.dataSource.data = this.dataSource.data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'report_id'   :
          return compare(a.report_id, b.report_id, isAsc);
        case 'report_name' :
          return compare(a.report_name, b.report_name, isAsc);
        default:
          return 0;
      }
    });

  }

}
