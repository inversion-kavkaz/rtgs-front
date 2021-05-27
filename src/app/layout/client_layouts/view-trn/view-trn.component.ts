import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

@Component({
  selector: 'app-view-trn',
  templateUrl: './view-trn.component.html',
  styleUrls: ['./view-trn.component.scss']
})
export class ViewTrnComponent implements OnInit {


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
  }

  ngOnInit(): void {
  }

}
