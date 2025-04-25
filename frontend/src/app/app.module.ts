// src/app/app.module.ts

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';  // Ton composant principal
import { DashboardComponent } from './dashboard/dashboard.component';  // Composant dashboard
import { HttpClientModule } from '@angular/common/http';  // Pour les appels HTTP
import { RouterModule } from '@angular/router';  // Import de RouterModule pour gérer les routes
import { routes } from './app.routes';  // Import des routes
import { CommonModule } from '@angular/common';  // Importation du CommonModule
import { NgChartsModule  } from 'ng2-charts';
import { SidebarComponent } from './sidebar/sidebar.component';

@NgModule({
  declarations: [
    //pas de composant standalone
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(routes),  // Intégration des routes dans le module
    CommonModule,  // Ajoute CommonModule dans les imports
    NgChartsModule, 
    SidebarComponent,
    DashboardComponent, 
    AppComponent,
  ],
  providers: []
  // bootstrap: [AppComponent]
})
export class AppModule { }
