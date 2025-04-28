import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Définition des interfaces
export interface Client {
  id: number;
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  date_ajout: string;
}

export interface Facture {
  id: number;
  numero: string;
  montant_total: number;
  date_emission: string;
  date_echeance: string;
  statut: string;
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

export interface Paiement {
  id: number;
  montant: string;
  date_paiement: string;
  moyen: string;
  facture: number;
}

export interface Entreprise {
  id: number;
  nom_complet_gerant: string;
  nom_entreprise: string;
  siret: string;
  adresse: string;
  email_contact: string;
  telephone_contact: string;
  logo: string;
}

export interface Users {
  id: number;
  username: string;
  salt: string;
  password: string;
  email: string;
  is_active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}  

  // Clients
  getClients(username: string): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}/clients?username=${username}`);
  }

  // Factures
  getFactures(username: string): Observable<Facture[]> {
    return this.http.get<Facture[]>(`${this.apiUrl}/factures?username=${username}`);
  }

  // Dépenses
  getDepenses(username: string): Observable<Depense[]> {
    return this.http.get<Depense[]>(`${this.apiUrl}/depenses?username=${username}`);
  }

  // Paiements
  getPaiements(username: string): Observable<Paiement[]> {
    return this.http.get<Paiement[]>(`${this.apiUrl}/paiements?username=${username}`);
  }

  // Paramètres entreprise
  getParametresEntreprise(username: string): Observable<Entreprise[]> {
    return this.http.get<Entreprise[]>(`${this.apiUrl}/parametres?username=${username}`);
  }

  // Récupérer le salt pour un utilisateur
  getPasswordSalt(username: string): Observable<{ salt: string }> {
    return this.http.get<{ salt: string }>(`${this.apiUrl}/get_salt?username=${username}`);
  }
}
