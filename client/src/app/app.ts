// client/src/app/app.component.ts
import { Component } from '@angular/core';
import { AxiInterfaceComponent } from './components/axi-interface/axi-interface.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AxiInterfaceComponent],
  template: `<main class="app-container"><app-axi-interface /></main>`,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: #020617; /* slate-950 */
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding-top: 2rem;
    }
  `]
})
export class App { }