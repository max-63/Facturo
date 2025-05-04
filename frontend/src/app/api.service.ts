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

export interface LigneFacture {
  id: number;
  nom_produit: string;
  description: string;
  quantite: number;
  prix_unitaire: number;
  tva: number;
  facture_id: number;
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
    return this.http.get<Entreprise[]>(`${this.apiUrl}/entreprise?username=${username}`);
  }

  getLigneFacture(username: string): Observable<LigneFacture[]> {
    return this.http.get<LigneFacture[]>(`${this.apiUrl}/ligne_facture?username=${username}`);
  }

  updateFactureAvecLignes(facture: any): Observable<any> {
  const url = `${this.apiUrl}/update_facture/${facture.id}/`; // L'URL de ton API pour la mise à jour de la facture
  const headers = new HttpHeaders({
    'Content-Type': 'application/json', // Envoi du JSON
  });

  return this.http.post<any>(url, facture, { headers });
}


}
