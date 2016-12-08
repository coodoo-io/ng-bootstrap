import {Injectable, Injector, ComponentFactoryResolver} from '@angular/core';

import {NgbModalRef} from './modal-ref';
import {NgbModalContainer} from './modal-container';

@Injectable()
export class NgbModalStack {
  private modalContainer: NgbModalContainer;
  private modalRefs: Array<NgbModalRef> = [];

  open(moduleCFR: ComponentFactoryResolver, contentInjector: Injector, content: any, options = {}): NgbModalRef {
    if (!this.modalContainer) {
      throw new Error(
          'Missing modal container, add <template ngbModalContainer></template> to one of your application templates.');
    }

    let modalRef = this.modalContainer.open(moduleCFR, contentInjector, content, options);
    this.addToStack(modalRef);
    return modalRef;
  }

  public addToStack(modalRef: NgbModalRef): void { this.modalRefs.push(modalRef); };

  public removeTopmostFromStack() { this.modalRefs.pop(); };

  public getElevation() {
    console.log(this.modalRefs.length);
    return this.modalRefs.length;
  }

  registerContainer(modalContainer: NgbModalContainer) { this.modalContainer = modalContainer; }
}
