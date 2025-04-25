import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component'; //mon component dashboard

export const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent }, // Route vers le dashboard
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }, // Redirige vers le dashboard par défaut
  { path: '**', redirectTo: '/dashboard' }, // Gestion des routes non trouvées
];
