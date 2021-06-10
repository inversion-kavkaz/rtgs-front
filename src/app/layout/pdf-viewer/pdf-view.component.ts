import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-view.component.html',
  styleUrls: ['./pdf-view.component.scss']
})
export class PdfViewComponent implements OnInit {
  public service: string
  public document: string = 'PDF_Succinctly.pdf';

  constructor(
    @Inject(MAT_DIALOG_DATA) public src: any,
  ) {
    console.log(src.src)
    this.service = src.src
  }

  ngOnInit(): void {
  }

}
