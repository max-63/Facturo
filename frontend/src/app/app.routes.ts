import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component'; // Ton dashboard
import { LoginRegisterComponent } from './login-register/login-register.component'; // <-- Import ton composant register/login
import { AuthGuard } from './auth.guard';  // Import du guard
import { ClientsPageComponent } from './clients-page/clients-page.component';
import { FacturesPageComponent } from './factures-page/factures-page.component';
import { FacturesImpayeesComponent } from './factures-impayees/factures-impayees.component';
import { FacturesPayeesComponent } from './factures-payees/factures-payees.component';
import { FacturesEnvoyeesComponent } from './factures-envoyees/factures-envoyees.component';
import { FacturesBrouillonComponent } from './factures-brouillon/factures-brouillon.component';
import { FacturesArchiveesComponent } from './factures-archivees/factures-archivees.component';

export const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },   // Dashboard
  { path: 'account', component: LoginRegisterComponent }, // <-- Ajoute ta page Register
  { path: '', redirectTo: '/account', pathMatch: 'full' }, // <-- Redirige par défaut vers register (tu peux changer)
  { path: 'clients', component: ClientsPageComponent, canActivate: [AuthGuard] }, // <-- Ajoute ta page Clients
  { path: 'factures', component: FacturesPageComponent, canActivate: [AuthGuard] },
  { path: 'factures/impayees', component: FacturesImpayeesComponent, canActivate: [AuthGuard] },
  { path: 'factures/payees', component: FacturesPayeesComponent, canActivate: [AuthGuard] },
  { path: 'factures/envoyees', component: FacturesEnvoyeesComponent, canActivate: [AuthGuard] },
  { path: 'factures/brouillon', component: FacturesBrouillonComponent, canActivate: [AuthGuard] },
  { path: 'factures/archivees', component: FacturesArchiveesComponent, canActivate: [AuthGuard] },
];
