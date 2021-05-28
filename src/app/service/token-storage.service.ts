import {Injectable} from '@angular/core';
import {User} from "../model/user";

const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';
const BANK_KEY = 'auth-bank';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {

  constructor() {
  }

  public saveToken(token: string): void {
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.setItem(TOKEN_KEY, token);
  }

  public getToken(): string {
    return <string>sessionStorage.getItem(TOKEN_KEY);
  }

  public saveUser(user: any): void {
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  public getUser(): User {
    return JSON.parse(<string>sessionStorage.getItem(USER_KEY));
  }

  public saveBank(bank: any): void {
    window.sessionStorage.removeItem(BANK_KEY);
    window.sessionStorage.setItem(BANK_KEY, JSON.stringify(bank));
  }

  public getBank(): any {
    return JSON.parse(<string>sessionStorage.getItem(BANK_KEY));
  }



  logOut(): void {
    window.sessionStorage.clear();
    window.location.reload();
  }
}
