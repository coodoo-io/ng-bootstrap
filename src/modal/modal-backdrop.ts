import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'ngb-modal-backdrop',
  template: '',
  host: {'class': 'modal-backdrop fade in', '[style.zIndex]': 'zIndex'}
})
export class NgbModalBackdrop implements OnInit {
  @Input() elevation: number;
  zIndex: number = 1040;  // Bootstrap Default-Value

  constructor() {}

  ngOnInit() {
    if (this.elevation > 0) {
      this.zIndex = this.zIndex + this.elevation * 20 + 1;
    }
  }
}
