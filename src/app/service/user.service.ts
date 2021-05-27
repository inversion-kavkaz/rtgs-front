import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {TokenStorageService} from "./token-storage.service";
import {NotificationService} from "./notification.service";
import {AuthService} from "./auth.service";

const USER_DELETE = 'http://localhost:5000/user/delete';
const USER_GETALL = 'http://localhost:5000/user/all';
const USER_UPDATE = 'http://localhost:5000/user/update';
const USER_ROLES = 'http://localhost:5000/api/roles/all';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  public bankId: number
  public roles = []

  constructor(private http: HttpClient,
              private tokenStorage: TokenStorageService,
              private notificationService: NotificationService,
              private authService: AuthService
  ) {
    this.bankId = this.tokenStorage.getBank().id
    this.setRoles()
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

  public getAllRoles() : Observable<any> {
    return this.http.get(USER_ROLES)
  }

  setRoles(){
    this.getAllRoles().subscribe( data => {
      this.roles = data
    }, error => {
      this.notificationService.showSnackBar("Error for load user roles!")
    })
  }

}
