import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-label',
  imports: [],
  template: `
    <label [for]="name">{{description}} @if(required){
      <span class="text-red-500">*</span>
    }
    </label>
  `,
  styles: ''
})
export class LabelComponent {
  @Input() name: string = ""
  @Input() description: string = ""
  @Input() required: boolean = false
}
