import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {EditUserComponent} from "../admin_layouts/edit-user/edit-user.component";

@Component({
  selector: 'app-filter-layout',
  templateUrl: './filter-layout.component.html',
  styleUrls: ['./filter-layout.component.scss']
})
export class FilterLayoutComponent implements OnInit {

  filterGroup: FormGroup;
  startDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDay())
  endDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDay())

  constructor(
    private dialogRef: MatDialogRef<FilterLayoutComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,

  ) {

    this.filterGroup = new FormGroup({
      start: new FormControl(),
      end: new FormControl(),
      status: new FormControl()
    });

  }

  ngOnInit(): void {
  }

  submit() {
    this.data.filter.startDate = this.filterGroup.value.start
    this.data.filter.endDate = this.filterGroup.value.end
    this.data.filter.status = this.filterGroup.value.status

    this.closeDialog(1)
  }

  closeDialog(number: number) {
    this.dialogRef.close(number)
  }
}
