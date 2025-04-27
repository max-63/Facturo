import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';



interface DecodedToken {
  username: string;
  exp: number;  // Tu peux ajouter d'autres champs du token si besoin
}


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


  // Déconnexion
  logout(): void {
    localStorage.removeItem('auth_token');
    this.router.navigate(['/login']);
  }


  // Gestion des erreurs
  private handleError(error: any): Observable<any> {
    console.error('Une erreur s\'est produite', error);
    throw error;  // Tu peux personnaliser cette fonction pour gérer mieux les erreurs
  }

}
