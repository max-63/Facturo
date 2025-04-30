import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { forkJoin } from 'rxjs';
import { ApiService, Paiement } from '../api.service'; // Assurez-vous que ApiService existe et contient les méthodes getClients et getFactures
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Client, Facture, Depense, Entreprise } from '../api.service'; // Les interfaces sont déjà importées
import { Router } from '@angular/router';


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

  username: string | null = null;
  ngOnInit(): void {
    this.username = localStorage.getItem('username');
    if (this.username) {
      this.loadData();
    } else {
      console.error('Username non trouvé dans localStorage.');
    }
  }
  constructor(private apiService: ApiService, private router: Router) { }

  loadData(): void {
    if (this.username !== null) {
      forkJoin({
        clients: this.apiService.getClients(this.username),
      }).subscribe({
        next: (results) => {
          this.clients = results.clients;
        },
        error: (error) => {
          console.error('Erreur lors de la récupération des données:', error);
        }
      });
    }
  }
}