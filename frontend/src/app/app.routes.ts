import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component'; // Ton dashboard
import { LoginRegisterComponent } from './login-register/login-register.component'; // <-- Import ton composant register/login
import { AuthGuard } from './auth.guard';  // Import du guard

export const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },   // Dashboard
  { path: 'account', component: LoginRegisterComponent }, // <-- Ajoute ta page Register
  { path: '', redirectTo: '/account', pathMatch: 'full' }, // <-- Redirige par défaut vers register (tu peux changer)
  { path: '**', redirectTo: '/dashboard' },                // Route catch-all vers dashboard
];
