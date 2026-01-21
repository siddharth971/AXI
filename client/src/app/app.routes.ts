import { Routes } from '@angular/router';
import { AxiInterfaceComponent } from './components/axi-interface/axi-interface.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', component: AxiInterfaceComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: '**', redirectTo: '' },
];
