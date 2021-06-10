import {Component, Inject, OnInit} from '@angular/core';
import {ReportService} from "../../service/report.service";
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {environment} from "../../../environments/environment";
import {User} from "../../model/user";
import {TokenStorageService} from "../../service/token-storage.service";
import {PdfViewComponent} from "../pdf-viewer/pdf-view.component";

@Component({
  selector: 'app-report-params-view',
  templateUrl: './report-params-view.component.html',
  styleUrls: ['./report-params-view.component.scss']
})
export class ReportParamsViewComponent implements OnInit {

  reportParams: any[] = []
  reportPParams: any[] = []
  currentUser:User
  isReportFormed: boolean = false

  constructor(
    readonly reportService: ReportService,
    @Inject(MAT_DIALOG_DATA) public report: any,
    private dialogRef: MatDialogRef<ReportParamsViewComponent>,
    readonly storageService: TokenStorageService,
    readonly dialog: MatDialog,
  ) {
    this.currentUser = storageService.getUser()
    this.getReportParams()
    this.showReport()
  }

  getReportParams(){
    this.reportService.getReportParams(this.report.report.report_type_id,this.report.report.report_id).subscribe(res => {
      this.reportParams = res as []
    })
  }

  ngOnInit(): void {
  }

  submit() {

    let inputList = document.getElementsByClassName("rep_param")
    for(let i = 0; i < inputList.length; i++){
      if(inputList.item(i) != null)
        { // @ts-ignore
          this.reportPParams.push(inputList.item(i).value)
        }
    }

    const orderReportParams = {
      reportTypeId: this.report.report.report_type_id,
      reportId: this.report.report.report_id,
      reportParams: this.reportPParams
    }

    this.reportService.orderReport(orderReportParams.reportTypeId,orderReportParams.reportId,"PDF",orderReportParams.reportParams)
    this.isReportFormed = true
    //this.closeDialog(1)

  }

  showReport(){
    this.reportService.lastOrderSubj.subscribe(lastRep => {
      if(lastRep.statusCode === 0){
        this.isReportFormed = false
        const reportURL = `${environment.REPORT_BASE_URL + environment.GET_REPORT}?reqUID=${lastRep.reqUId}&userLogin=${this.currentUser.login}`
        console.log(`open report`)
        console.log(reportURL)

        //window.open(reportURL,'_blank')
        window.open(reportURL)

        //this.openPdfViewer(reportURL)
        this.closeDialog(1)
      }
    })
  }


  openPdfViewer(src: string){
    const viewReportPDFDialog = new MatDialogConfig();
    viewReportPDFDialog.width = '50%';
    viewReportPDFDialog.height = '80%';
    viewReportPDFDialog.data = {
      src: src
    };
    this.dialog.open(PdfViewComponent, viewReportPDFDialog)

  }

  closeDialog(number: number) {
    this.dialogRef.close(number)
  }
}
