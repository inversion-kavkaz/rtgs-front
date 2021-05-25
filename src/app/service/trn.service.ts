import {Inject, Injectable, LOCALE_ID} from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {Trn} from "../model/trn";
import {TokenStorageService} from "./token-storage.service";
import {formatDate} from '@angular/common';


const TRN_URL_ALL = 'http://localhost:5000/api/trn/getAll'
const TRN_URL_CREATE = 'http://localhost:5000/api/trn/create'
const TRN_URL_DELETE = 'http://localhost:5000/api/trn/delete'
const TRN_URL_UPDATE = 'http://localhost:5000/api/trn/update'

const DATE_FORMAT = 'yyyy-MM-dd';


@Injectable({
  providedIn: 'root'
})
export class TrnService {

  currentUserId: number

  constructor(private http: HttpClient,
              private tokenService: TokenStorageService,
              @Inject(LOCALE_ID) private locale: string
  ) {
    this.currentUserId = tokenService.getUser().user.id
  }

  getTranByDate(date: Date): Observable<any>{
    let reqDate  = formatDate(date,DATE_FORMAT,this.locale);

    console.log(date)
    console.log(reqDate)
    return this.http.post(TRN_URL_ALL,
      {
      date : reqDate,
      user_id : this.currentUserId
    })
  }

  createTrn(trn: Trn) : Observable<any>{
    return this.http.post(TRN_URL_CREATE,trn)
  }

  deleteTrn(id: number): Observable<any> {
    return this.http.delete(TRN_URL_DELETE + '/' + id)
  }

  updateTrn(trn: Trn): Observable<any>{
    return this.http.post(TRN_URL_UPDATE,trn)
  }
}
