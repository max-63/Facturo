import { Injectable } from '@angular/core';
import {
  HttpInterceptor, HttpRequest, HttpHandler,
  HttpEvent, HttpErrorResponse, HttpClient
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Exclure login et register de l’ajout du token
    if (req.url.endsWith('/api/login/') || req.url.endsWith('/api/register/') || req.url.endsWith('/api/token/refresh')) {
      console.log('Requête vers login/register, pas d’ajout de token');
      return next.handle(req);
    }

    const token = localStorage.getItem('jtw_token');
    console.log('Token récupéré :', token);

    let authReq = req;
    if (token) {
      authReq = this.addTokenHeader(req, token);
      console.log('Requête modifiée avec token :', authReq);
    } else {
      console.log('Pas de token trouvé');
    }

    return next.handle(authReq).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          // Si 401, essayer de rafraîchir le token
          return this.handle401Error(authReq, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addTokenHeader(request: HttpRequest<any>, token: string) {
    return request.clone({
      headers: request.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        console.error('Pas de refresh token, impossible de rafraîchir');
        return throwError(() => new Error('Pas de refresh token'));
      }

      // Appel API pour rafraîchir le token
      return this.http.post<any>('http://127.0.0.1:8000/api/token/refresh/', { refresh: refreshToken }).pipe(
        switchMap(response => {
          this.isRefreshing = false;
          localStorage.setItem('jtw_token', response.access);
          this.refreshTokenSubject.next(response.access);
          return next.handle(this.addTokenHeader(request, response.access));
        }),
        catchError(err => {
          this.isRefreshing = false;
          // Ici, tu peux gérer la déconnexion ou redirection si besoin
          console.error('Erreur lors du refresh token', err);
          return throwError(() => err);
        })
      );
    } else {
      // Si on est déjà en train de rafraîchir, on attend que ça finisse
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => next.handle(this.addTokenHeader(request, token!)))
      );
    }
  }
}
