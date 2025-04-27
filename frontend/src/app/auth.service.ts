import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private apiUrl = 'http://127.0.0.1:8000/api';  // Change l'URL selon ton API

  constructor(private router: Router, private http: HttpClient) {}

  // Vérifie si l'utilisateur est authentifié
  isAuthenticated(): boolean {
    return localStorage.getItem('auth_token') !== null;
  }

  // Inscrire un nouvel utilisateur
  register(username: string, email: string, password: string): Observable<any> {
    const body = { username, email, password };
    return this.http.post(`${this.apiUrl}/register/`, body)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Se connecter
  login(username: string, password: string): Observable<any> {
    const body = { username, password };
    return this.http.post(`${this.apiUrl}/login/`, body)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Sauvegarder le token après la connexion
  saveToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  // Déconnexion
  logout(): void {
    localStorage.removeItem('auth_token');
    this.router.navigate(['/login']);
  }

  // En-têtes HTTP avec le token d'authentification
  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Gestion des erreurs
  private handleError(error: any): Observable<any> {
    console.error('Une erreur s\'est produite', error);
    throw error;  // Tu peux personnaliser cette fonction pour gérer mieux les erreurs
  }
}
