import {Inject, Injectable, LOCALE_ID} from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {Trn} from "../model/trn";
import {TokenStorageService} from "./token-storage.service";
import {formatDate} from '@angular/common';
import {AuthService} from "./auth.service";
// @ts-ignore
import {TrnResponse} from "../model/trnResponse";
import {Filter} from "../model/filter";


const TRN_URL_ALL = 'http://localhost:5000/api/trn/getAll'
const TRN_URL_FILTER = 'http://localhost:5000/api/trn/getFilteringTrn'

const TRN_URL_CREATE = 'http://localhost:5000/api/trn/create'
const TRN_URL_DELETE = 'http://localhost:5000/api/trn/delete'
const TRN_URL_UPDATE = 'http://localhost:5000/api/trn/update'

const TRN_URL_AFFIRM = 'http://localhost:5000/api/trn/affirm'

const DATE_FORMAT = 'yyyy-MM-dd';


@Injectable({
  providedIn: 'root'
})
export class TrnService {

  currentLogin: string

  constructor(private http: HttpClient,
              private tokenService: TokenStorageService,
              @Inject(LOCALE_ID) private locale: string,
              private authService: AuthService
  ) {
    this.currentLogin = tokenService.getUser().login
  }

  getTranByDate(date: Date): Observable<any>{
    let reqDate  = formatDate(date,DATE_FORMAT,this.locale);

    return this.http.post(TRN_URL_ALL,
      {
      date : reqDate,
      login : this.currentLogin
    })
  }

  getFilteringTrn(filter: Filter, pageNum: number, pageSize: number): Observable<any>{
    return this.http.post(TRN_URL_FILTER,
      {
        filter : filter,
        login : this.currentLogin,
        pageNum : pageNum,
        pageSize : pageSize
    })
  }

  createTrn(trn: any) : Observable<TrnResponse>{
    return this.http.post<TrnResponse>(TRN_URL_CREATE,trn)
  }

  deleteTrn(delListid: any): Observable<any> {
    return this.http.post(TRN_URL_DELETE,delListid)
  }

  updateTrn(trn: any): Observable<any>{
    return this.http.post(TRN_URL_UPDATE,trn)
  }

  affirmTrn(idList: any): Observable<any>{
    return this.http.post(TRN_URL_AFFIRM, { idList : idList})
  }
}
