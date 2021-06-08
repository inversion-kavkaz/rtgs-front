import {Injectable, OnDestroy} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Subject} from "rxjs";

interface repResp {
  report_type_id: number,
  report_type_name: string
}

@Injectable({
  providedIn: 'root'
})
export class ReportService implements OnDestroy {

  reportList = []
  reportName: string = ""
  reportSubj = new Subject()

  constructor(readonly http: HttpClient) {
    this.getReportName()
    this.getAllReport()
  }

  getAllReport() {
    if (this.reportList.length < 1) {
      this.http.get(environment.REPORT_BASE_URL + environment.GET_REPORTS_BY_TYPEID + 200000).subscribe(res => {
        this.reportSubj.next(res)
        this.reportList = res as []
      }, error => {
        console.log(`error fro load reports!`)
      })
    }
  }

  getReportName() {
    if (this.reportName.length < 1)
      this.http.get<repResp>(environment.REPORT_BASE_URL + environment.GET_REPORT_TYPE_NAME + 200000).subscribe(res => {
        this.reportSubj.next(res.report_type_name)
        this.reportName = res.report_type_name
      })
  }

  ngOnDestroy(): void {
  }


}
