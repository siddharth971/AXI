// client/src/app/app.component.ts
import { Component } from '@angular/core';
import { AxiInterface3DComponent } from './components/axi-interface-3d/axi-interface-3d.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AxiInterface3DComponent],
  template: `<app-axi-interface-3d />`,
  styles: [`
    :host {
      display: block;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
    }
  `]
})
export class App { }
