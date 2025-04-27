import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Définition des types des objets (dictionnaires, tableaux)
export interface Client {
  id: number;
  name: string;
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

  getUsers(): Observable<Users[]> {
    return this.http.get<Users[]>(`${this.apiUrl}/users/`)
  }

  getParametresEntreprise(): Observable<Entreprise[]> {
    return this.http.get<Entreprise[]>(`${this.apiUrl}/parametres/`)
  }

  getPasswordSalt(username: string): Observable<{ salt: string }> {
    return this.http.get<{ salt: string }>(`${this.apiUrl}/get_salt?username=${username}`);
  }
  
  registerUser(data: { username: string, password: string, email: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register/`, data);
  }

  loginUser(data: { username: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login/`, data);
  }
}
