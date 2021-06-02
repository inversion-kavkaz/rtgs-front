import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-repoprt',
  templateUrl: './repoprt.component.html',
  styleUrls: ['./repoprt.component.scss']
})
export class RepoprtComponent implements OnInit {
  pdfSrc: any = "http://172.16.0.146:1216/download"
//   pdfSrc: any = {
//     url: 'http://localhost/C:/Users/XDWeloper/Downloads/Счет №00БП-044618 от 2021.04.30 (подписанный) (2).pdf',
//     withCredentials: true
//   }

    constructor() { }

  ngOnInit(): void {
  }

}
