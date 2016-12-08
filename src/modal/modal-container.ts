import {NgbModalStack} from './modal-stack';
import {
  Directive,
  Injector,
  ReflectiveInjector,
  Renderer,
  TemplateRef,
  ViewContainerRef,
  ComponentFactoryResolver,
  ComponentFactory,
  ComponentRef
} from '@angular/core';

import {isDefined, isString} from '../util/util';
import {ContentRef} from '../util/popup';

import {NgbModalBackdrop} from './modal-backdrop';
import {NgbModalWindow} from './modal-window';
import {NgbActiveModal, NgbModalRef} from './modal-ref';

@Directive({selector: 'template[ngbModalContainer]'})
export class NgbModalContainer {
  private _backdropFactory: ComponentFactory<NgbModalBackdrop>;
  private _windowFactory: ComponentFactory<NgbModalWindow>;

  constructor(
      private _injector: Injector, private _renderer: Renderer, private _viewContainerRef: ViewContainerRef,
      private _componentFactoryResolver: ComponentFactoryResolver, private ngbModalStack: NgbModalStack) {
    this._backdropFactory = _componentFactoryResolver.resolveComponentFactory(NgbModalBackdrop);
    this._windowFactory = _componentFactoryResolver.resolveComponentFactory(NgbModalWindow);
    ngbModalStack.registerContainer(this);
  }

  open(moduleCFR: ComponentFactoryResolver, contentInjector: Injector, content: string | TemplateRef<any>, options):
      NgbModalRef {
    const activeModal = new NgbActiveModal();
    const contentRef = this._getContentRef(moduleCFR, contentInjector, content, activeModal);
    let windowCmptRef: ComponentRef<NgbModalWindow>;
    let backdropCmptRef: ComponentRef<NgbModalBackdrop>;
    let ngbModalRef: NgbModalRef;

    if (options.backdrop !== false) {
      backdropCmptRef = this._viewContainerRef.createComponent(this._backdropFactory, 0, this._injector);
      backdropCmptRef.instance.elevation = this.ngbModalStack.getElevation();
    }

    windowCmptRef = this._viewContainerRef.createComponent(this._windowFactory, 0, this._injector, contentRef.nodes);

    ngbModalRef = new NgbModalRef(this._viewContainerRef, windowCmptRef, contentRef, backdropCmptRef);

    activeModal.close = (result: any) => {
      ngbModalRef.close(result);
      this.ngbModalStack.removeTopmostFromStack();
    };
    activeModal.dismiss = (reason: any) => {
      ngbModalRef.dismiss(reason);
      this.ngbModalStack.removeTopmostFromStack();
    };

    this._applyWindowOptions(windowCmptRef.instance, options);

    return ngbModalRef;
  }

  private _applyWindowOptions(windowInstance: NgbModalWindow, options: Object): void {
    ['backdrop', 'keyboard', 'size', 'windowClass'].forEach((optionName: string) => {
      if (isDefined(options[optionName])) {
        windowInstance[optionName] = options[optionName];
      }
    });
  }

  private _getContentRef(
      moduleCFR: ComponentFactoryResolver, contentInjector: Injector, content: any,
      context: NgbActiveModal): ContentRef {
    if (!content) {
      return new ContentRef([]);
    } else if (content instanceof TemplateRef) {
      const viewRef = this._viewContainerRef.createEmbeddedView(<TemplateRef<NgbActiveModal>>content, context);
      return new ContentRef([viewRef.rootNodes], viewRef);
    } else if (isString(content)) {
      return new ContentRef([[this._renderer.createText(null, `${content}`)]]);
    } else {
      const contentCmptFactory = moduleCFR.resolveComponentFactory(content);
      const modalContentInjector =
          ReflectiveInjector.resolveAndCreate([{provide: NgbActiveModal, useValue: context}], contentInjector);
      const componentRef = this._viewContainerRef.createComponent(contentCmptFactory, 0, modalContentInjector);
      return new ContentRef([[componentRef.location.nativeElement]], componentRef.hostView, componentRef);
    }
  }
}
