import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Subject} from "rxjs";
import {Bank} from "../model/bank";

const BANK_ALL_API = 'http://localhost:5000/bank/all';


@Injectable({
  providedIn: 'root'
})
export class BankService {


  bankList: Bank[] = []
  listLoaded = new Subject()

  constructor(private http: HttpClient) {
    if(this.bankList.length < 1)
      this.http.get<Bank[]>(BANK_ALL_API).subscribe(data => {
        this.bankList = data
        this.listLoaded.next(1)
        console.log("bank loaded:")
      }, error => {
        console.log("Bank list load error!")
      })
  }

}
