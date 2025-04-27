import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';  // Import du service AuthService
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    if (this.authService.isAuthenticated()) {
      return true;  // L'utilisateur est authentifié, autorise l'accès
    } else {
      this.router.navigate(['/account']);  // Redirige l'utilisateur vers la page de login
      return false;  // Empêche l'accès à la route
    }
  }
}
