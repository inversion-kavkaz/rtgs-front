import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

const AUTH_API = 'http://localhost:5000/api/auth/';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  public login(user: any): Observable<any> {
    return this.http.post(AUTH_API + 'signin', {
      login: user.login,
      password: user.password
    });
  }

  public register(user: any): Observable<any> {
    return this.http.post(AUTH_API + 'signup', user);
  }
}
