import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { forkJoin } from 'rxjs';
import { ApiService, Paiement } from '../api.service'; // Assurez-vous que ApiService existe et contient les méthodes getClients et getFactures
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Client, Facture, Depense, Entreprise } from '../api.service'; // Les interfaces sont déjà importées

@Component({
  selector: 'app-clients-page',
  standalone: true, // ✅ ESSENTIEL
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './clients-page.component.html',
  styleUrl: './clients-page.component.css'
})

export class ClientsPageComponent implements OnInit {
  clients: Client[] = [];
  factures: Facture[] = [];
  depenses: Depense[] = [];
  paiements: Paiement[] = [];
  entreprise: Entreprise[] = [];
  ngOnInit(): void {

  }
  constructor(private apiService: ApiService) { }

  loadData(): void {
    // Utilise forkJoin pour attendre que toutes les données soient récupérées avant de procéder
    forkJoin({
      clients: this.apiService.getClients()

    }).subscribe({
      next: (results) => {
        // Une fois que toutes les données sont récupérées
        this.clients = results.clients;


        // Après que toutes les données soient chargées, on procède à la création des graphiques
        
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des données:', error);
      }
    });
  }

  // loadParametresEntreprise(): void {
  //   this.apiService.getParametresEntreprise().subscribe(
  //     (data: Entreprise[]) => {
  //       this.entreprise = data;
  //     },
  //     error => {
  //       console.error('Erreur lors de la récupération des clients', error);
  //     }
  //   );
  // }

  getCleints(): void {

  }
}