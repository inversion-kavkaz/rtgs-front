import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {TokenStorageService} from "./token-storage.service";

const USER_DELETE = 'http://localhost:5000/user/delete';
const USER_GETALL = 'http://localhost:5000/user/all';
const USER_UPDATE = 'http://localhost:5000/user/update';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  bankId: number

  constructor(private http: HttpClient, private tokenStorage: TokenStorageService) {
    this.bankId = this.tokenStorage.getUser().bank.id
  }

  public getAllUsers(): Observable<any> {
    return this.http.get(USER_GETALL + '/' + this.bankId)
  }

  public removeUser(userId: number) {
    return this.http.delete(USER_DELETE + '/' + userId)
  }

  public updateUser(user: any) :Observable<any> {
    return this.http.post(USER_UPDATE,user)
  }


}
