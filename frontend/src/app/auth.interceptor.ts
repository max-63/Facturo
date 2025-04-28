import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('jtw_token');  // Récupérer le token du localStorage

    if (token) {
      console.log('Token found:', token);  // Vérifie si le token est bien récupéré

      // Ajouter le token dans l'en-tête de la requête
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    } else {
      console.log('Token not found');
    }

    return next.handle(request);
  }
}
