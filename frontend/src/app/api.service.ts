// src/app/api.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Définition des types des objets (dictionnaires, tableaux)
export interface Client {
  id: number;
  name: string; // Correspond au champ 'nom' de l'API Django
  email: string;
  telephone: string; // Ajouté ici pour correspondre au modèle Django
  adresse: string; // Ajouté ici pour correspondre au modèle Django
  date_ajout: string; // Ajouté pour correspondre à la date d'ajout du client
}

export interface Facture {
  id: number;
  numero: string;  // Peut-être ajouté pour correspondre à la facture Django
  montant_total: number; // Vérifie que le champ 'montant_total' est bien renvoyé
  date_emission: string; // Correspond à 'date_emission' de Django
  date_echeance: string;  // Ajouté pour correspondre au modèle Django
  statut: string; // Ajouté pour correspondre au modèle Django
  client_id: number;
}

export interface Depense {
  id: number;
  categorie: string;
  description: string;
  montant: string;
  date: string;
  fournisseur: string;
}

export interface Paiement{
  id: number;
  montant: string;
  date_paiement: string;
  moyen: string;
  facture: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = 'http://127.0.0.1:8000/api';  // URL de ton API Django

  constructor(private http: HttpClient) { }

  // Récupérer tous les clients
  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}/clients/`);
  }

  // Récupérer toutes les factures
  getFactures(): Observable<Facture[]> {
    return this.http.get<Facture[]>(`${this.apiUrl}/factures/`);
  }

  getDepenses(): Observable<Depense[]> {
    return this.http.get<Depense[]>(`${this.apiUrl}/depenses/`)
  }

  getPaiements(): Observable<Paiement[]> {
    return this.http.get<Paiement[]>(`${this.apiUrl}/paiements/`)
  }

  // Ajouter un client
  addClient(client: Client): Observable<Client> {
    return this.http.post<Client>(`${this.apiUrl}/clients/`, client);
  }

  // Ajouter une facture
  addFacture(facture: Facture): Observable<Facture> {
    return this.http.post<Facture>(`${this.apiUrl}/factures/`, facture);
  }
}
