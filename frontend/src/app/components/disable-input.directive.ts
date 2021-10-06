//disable-input.directive.ts
import { Directive, ElementRef, Input, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appDisableInput]'
})
export class DisableInputDirective {
  constructor(private el: ElementRef) { }

  @Input('appDisableInput') isDisabled: boolean;
  
  ngOnChanges(changes: SimpleChanges) {
    let chng = changes["isDisabled"];
    this.el.nativeElement.disabled = chng.currentValue;
  }
}
