import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {AsyncSubject, BehaviorSubject, interval, Observable, Subject} from "rxjs";
import {User} from "../model/user";
import {TokenStorageService} from "./token-storage.service";
import {ReportOrder} from "../model/report-order";

interface repResp {
  report_type_id: number,
  report_type_name: string
}


@Injectable({
  providedIn: 'root'
})
export class ReportService {

  reportList = []
  reportName: string = ""
  reportSubj = new Subject()
  currentUser: User
  orderedReportList: ReportOrder[] = []
  orderForArchive: BehaviorSubject<any> = new BehaviorSubject<any>({})
  lastOrderSubj: Subject <ReportOrder> = new Subject()
  lastOrderReportUIDSubj: Subject<string> = new Subject()
  reportTypeId = 0

  constructor(
    readonly http: HttpClient,
    readonly tokenStorage: TokenStorageService) {
    this.currentUser = tokenStorage.getUser()
    this.setInitReportTypeId()
    this.getReportName()
    this.getAllReport()
    this.checkReportStatus()
  }

  setInitReportTypeId() {
    if (this.currentUser.roles[0] === 'ROLE_USER')
      this.reportTypeId = 5440
    if (this.currentUser.roles[0] === 'ROLE_CORR')
      this.reportTypeId = 610005
  }

  getAllReport() {
    if (this.reportList.length < 1) {
      this.http.get(environment.REPORT_BASE_URL + environment.GET_REPORTS_BY_TYPEID + this.reportTypeId).subscribe(res => {
        this.reportSubj.next(res as [])
        this.reportList = res as []
      }, error => {
        console.log(`error fro load reports!`)
      })
    }
  }

  getReportName() {
    if (this.reportName.length < 1)
      this.http.get<repResp>(environment.REPORT_BASE_URL + environment.GET_REPORT_TYPE_NAME + this.reportTypeId).subscribe(res => {
        const repFullName = `${res.report_type_id} - ${res.report_type_name}`
        this.reportSubj.next(repFullName)
        this.reportName = repFullName
      })
  }

  getReportParams(reportTypeId: string, reportId: string): Observable<any> {
    const params = new HttpParams()
      .set('reportTypeID', reportTypeId)
      .set('reportID', reportId);
    return this.http.get(environment.REPORT_BASE_URL + environment.GET_REPORT_PARAMS, {params})

  }


  getReportUID(): Observable<any> {
    const params = new HttpParams()
      .set('userLogin', this.currentUser.login)
    return this.http.get<any>(environment.REPORT_BASE_URL + environment.GET_REPORT_UID, {params})
  }

  orderReport(reportTypeId: string, reportId: string, reportFormat: string, paramsList: string[]) {
    this.getReportUID().subscribe(res => {
      const UID = res.reqUID
      const params = this.getHttpsParams(reportTypeId, reportId, reportFormat, paramsList, UID)
      this.lastOrderReportUIDSubj.next(UID)
      this.http.get<any>(environment.REPORT_BASE_URL + environment.PREPARE_REPORT, {params})
        .subscribe(result => {
          const UUID = result.reqUId
          if (this.orderedReportList.filter(p => p.reqUId === UUID).length < 1) {
            let newReport: ReportOrder = this.createNewOrder(reportTypeId, reportId, reportFormat, paramsList, result)
            this.orderedReportList.push(newReport)
            //this.lastOrderSubj.next(newReport)
          }
        }, error => {
          console.log(`ordered report error`)
        })
    }, error => {
      console.log(`Error for UID request`)
      console.log(error)
    })
  }

  getReportStatus(reqUID: string): Observable<any> {
    const params = new HttpParams()
      .set('reqUID', reqUID)
      .set('userLogin', this.currentUser.login)
    return this.http.get(environment.REPORT_BASE_URL + environment.GET_REPORT_STATUS, {params})
  }

  getReport(reqUID: string): Observable<any> {
    const params = new HttpParams()
      .set('reqUID', reqUID)
      .set('userLogin', this.currentUser.login)
    return this.http.get(environment.REPORT_BASE_URL + environment.GET_REPORT, {params})
  }


  checkReportStatus() {
    interval(5000)
      .subscribe(() => {
        this.orderedReportList
          .forEach(rep => {
            if(rep.statusCode === -1) {
              this.getReportStatus(rep.reqUId).subscribe(res => {
                rep.statusCode = res.statuscode
                rep.statusMessage = res.statusmessage
                console.log(`next`)
                this.lastOrderSubj.next(rep)
                this.orderForArchive.next(rep)
              })
            }
          })
        console.log(this.orderedReportList)
      })
  }

  removeReport(uid: string | null){
    const removableOrder = this.orderedReportList.find(p => p.reqUId === uid)
    if (removableOrder) {
      this.orderedReportList.splice(this.orderedReportList.indexOf(removableOrder), 1)
    }
  }

  createNewOrder(reportTypeId: string, reportId: string, reportFormat: string, paramsList: string[], res: any): ReportOrder {
    return {
      reportTypeId: reportTypeId,
      reportId: reportId,
      reportFormat: reportFormat,
      reqUId: res.reqUId,
      statusDate: res.statusDate,
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      p1: paramsList[0],
      p2: paramsList[0],
      p3: paramsList[0],
      p4: paramsList[0],
      p5: paramsList[0],
      p6: paramsList[0],
      p7: paramsList[0],
      p8: paramsList[0],
      p9: paramsList[0],
      p10: paramsList[0]
    }
  }

  getHttpsParams(reportTypeId: string, reportId: string, reportFormat: string, paramsList: string[], reqUID: string): HttpParams {
    return new HttpParams()
      .set('reqUID', reqUID)
      .set('userLogin', this.currentUser.login)
      .set('reportTypeID', reportTypeId)
      .set('reportID', reportId)
      .set('reportFormat', reportFormat)
      .set('P1', paramsList[0])
      .set('P2', paramsList[1])
      .set('P3', paramsList[2])
      .set('P4', paramsList[3])
      .set('P5', paramsList[4])
      .set('P6', paramsList[5])
      .set('P7', paramsList[6])
      .set('P8', paramsList[7])
      .set('P9', paramsList[8])
      .set('P10', paramsList[9])
  }
}
