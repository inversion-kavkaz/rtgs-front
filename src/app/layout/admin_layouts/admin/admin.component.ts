import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import {TokenStorageService} from "../../../service/token-storage.service";
import {NotificationService} from "../../../service/notification.service";
import {Router} from "@angular/router";
import {Bank} from "../../../model/bank";
import {User} from "../../../model/user";
import {UserService} from "../../../service/user.service";
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {EditUserComponent} from "../edit-user/edit-user.component";
import {AddUserComponent} from "../add-user/add-user.component";
import {AuthService} from "../../../service/auth.service";

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  currentBank: Bank
  currentUser: User
  bankUsers: User[] = []

  displayedColumns: string[] = ['position', 'ename', 'login', 'roles', 'createdDate','delete', 'edit']
  dataSource: MatTableDataSource<User>  = new MatTableDataSource()

//  @ViewChild(MatSort) sort: MatSort

  ngAfterViewInit() {
//    this.dataSource.sort = this.sort;
  }

  constructor(private authService: AuthService,
              private notificationService: NotificationService,
              private router: Router,
              private userService: UserService,
              private dialog: MatDialog,
              private tokenStorage: TokenStorageService,
  ) {
    this.currentBank = this.tokenStorage.getBank()
    this.currentUser = this.tokenStorage.getUser()

    this.loadAllUser()

  }

  loadAllUser(){
    this.userService.getAllUsers().subscribe(data => {
      this.bankUsers = data
      this.dataSource = new MatTableDataSource(this.bankUsers);
    })

  }
  ngOnInit(): void {
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  logout() {
    this.tokenStorage.logOut()
  }

  delClick(id: number) {
    const userName = (<User>this.bankUsers.find(u => u.id === id)).ename
    const result = confirm('Do you really want to delete user ' + userName + ' ?');
    if(result)
      this.userService.removeUser(id).subscribe(res => {
      this.notificationService.showSnackBar('User success deleted!')
      const index = this.dataSource.data.findIndex(u => u.id === id)
      this.dataSource.data.splice(index, 1);
      this.dataSource._updateChangeSubscription();
      }, error => {
      this.notificationService.showSnackBar(error.message)
    })

  }

  editClick(userId: any) {
    const dialogUserEditConfig = new MatDialogConfig();
    dialogUserEditConfig.width = '50%';
    const currentUser = this.bankUsers.find(u => u.id == userId)
    dialogUserEditConfig.data = {
      user: currentUser
    };
    this.dialog.open(EditUserComponent, dialogUserEditConfig).afterClosed()
      .subscribe( result => {
        if(result != undefined && result.res != 0)
          this.loadAllUser()
      });
  }

  addUser() {
    const AddDialogUserEditConfig = new MatDialogConfig();
    AddDialogUserEditConfig.width = '50%';
    this.dialog.open(AddUserComponent, AddDialogUserEditConfig).afterClosed()
      .subscribe(result => {
        if(result != undefined && result.res != 0)
          this.loadAllUser()
      });
  }
}
