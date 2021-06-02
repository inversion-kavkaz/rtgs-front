import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-repoprt',
  templateUrl: './repoprt.component.html',
  styleUrls: ['./repoprt.component.scss']
})
export class RepoprtComponent implements OnInit {
  pdfSrc: any = "file:///C:/Users/XDWeloper/Downloads/%D0%A1%D1%87%D0%B5%D1%82%20%E2%84%9600%D0%91%D0%9F-044618%20%D0%BE%D1%82%202021.04.30%20(%D0%BF%D0%BE%D0%B4%D0%BF%D0%B8%D1%81%D0%B0%D0%BD%D0%BD%D1%8B%D0%B9)%20(2).pdf"
//   pdfSrc: any = {
//     url: 'http://localhost/C:/Users/XDWeloper/Downloads/Счет №00БП-044618 от 2021.04.30 (подписанный) (2).pdf',
//     withCredentials: true
//   }

    constructor() { }

  ngOnInit(): void {
  }

}
