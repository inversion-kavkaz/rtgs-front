import {Component, Inject, OnInit} from '@angular/core';
import {ReportService} from "../../service/report.service";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {environment} from "../../../environments/environment";
import {User} from "../../model/user";
import {TokenStorageService} from "../../service/token-storage.service";
import {ReportOrder} from "../../model/report-order";
import {Subject} from "rxjs";

@Component({
  selector: 'app-report-params-view',
  templateUrl: './report-params-view.component.html',
  styleUrls: ['./report-params-view.component.scss']
})
export class ReportParamsViewComponent implements OnInit {

  reportParams: any[] = []
  reportPParams: any[] = []
  currentUser: User
  isReportFormed: boolean = false
  currentReportUID: string | null = null
  isReportProcessed: boolean = false
  reportFormedError: string = ""

  constructor(
    readonly reportService: ReportService,
    @Inject(MAT_DIALOG_DATA) public report: any,
    private dialogRef: MatDialogRef<ReportParamsViewComponent>,
    readonly storageService: TokenStorageService,
    readonly dialog: MatDialog,
  ) {
    this.currentUser = storageService.getUser()
    this.getReportParams()
    this.reportService.lastOrderSubj = new Subject<ReportOrder>()
    this.showReport()
  }

  getReportParams() {
    this.reportService.getReportParams(this.report.report.report_type_id, this.report.report.report_id).subscribe(res => {
      this.reportParams = res as []
      if (this.reportParams.length < 1)
        this.submit()
    })
  }

  ngOnInit(): void {
  }

  submit() {

    let inputList = document.getElementsByClassName("rep_param")
    for (let i = 0; i < inputList.length; i++) {
      if (inputList.item(i) != null) { // @ts-ignore
        this.reportPParams.push(inputList.item(i).value)
      }
    }

    const orderReportParams = {
      reportTypeId: this.report.report.report_type_id,
      reportId: this.report.report.report_id,
      reportParams: this.reportPParams
    }

    this.reportService.orderReport(orderReportParams.reportTypeId, orderReportParams.reportId, "PDF", orderReportParams.reportParams)
    this.reportService.lastOrderReportUIDSubj.subscribe(uid => {
      this.currentReportUID = uid
    })
    this.isReportFormed = true
    this.isReportProcessed = true
  }

  showReport() {
    this.reportService.lastOrderSubj.subscribe(lastRep => {
      if (lastRep.statusCode === 0) {
        this.isReportFormed = false
        this.isReportProcessed = false
        const reportURL = `${environment.REPORT_BASE_URL + environment.GET_REPORT}?reqUID=${lastRep.reqUId}&userLogin=${this.currentUser.login}`
        //window.location.href = reportURL
        window.open(reportURL, '_blank')
        this.closeDialog(1)
      }
      if (lastRep.statusCode != 0 && lastRep.statusCode != -1) {
        this.isReportFormed = false
        this.reportFormedError = `${lastRep.statusCode} - ${lastRep.statusMessage}`
      }
    })
  }


  closeDialog(number: number) {
    this.dialogRef.close(number)
    this.reportService.lastOrderSubj.complete()
  }

  closeReport() {
    this.reportService.removeReport(this.currentReportUID)
    this.closeDialog(0)
  }

  backgroundReport() {
    console.log(this.currentReportUID)
    this.closeDialog(0)
  }
}
