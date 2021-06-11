import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ReportService} from "../../../service/report.service";
import {environment} from "../../../../environments/environment";
import {User} from "../../../model/user";
import {TokenStorageService} from "../../../service/token-storage.service";
import {Subject} from "rxjs";
import {ReportOrder} from "../../../model/report-order";

@Component({
  selector: 'app-view-trn',
  templateUrl: './view-trn.component.html',
  styleUrls: ['./view-trn.component.scss']
})
export class ViewTrnComponent implements OnInit {

  currentReportUID = ""
  isReportFormed = false
  isReportProcessed = false
  reportFormedError = ""
  currentUser: User


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    readonly reportService: ReportService,
    readonly dialogRef: MatDialogRef<ViewTrnComponent>,
    readonly tokenService: TokenStorageService
  ) {
    this.currentUser = this.tokenService.getUser()
    this.reportService.lastOrderSubj = new Subject<ReportOrder>()
    this.showReport()
  }

  ngOnInit(): void {
  }

  openReportDialog() {

    const orderReportParams = {
      reportTypeId: '99999999900',
      reportId: '1',
      reportParams: [this.data.trn.itrnnum,'','','','','','','','','']
    }

    console.log(orderReportParams)

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
