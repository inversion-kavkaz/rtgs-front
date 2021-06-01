import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {Balance} from "../model/balance";


const BALANCE_API = 'http://localhost:5000/balance/get';


@Injectable({
  providedIn: 'root'
})
export class BalanceService {

  constructor(private http: HttpClient) { }


  getBalance(data: any): Observable<Balance> {
    return this.http.post<Balance>(BALANCE_API, data)
  }
}
