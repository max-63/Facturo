import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';
import { FormsModule } from '@angular/forms'; // Import important pour ngModel
import { AuthService } from '../auth.service';  // Import du service AuthService

@Component({
  selector: 'app-login-register',
  imports: [FormsModule],
  templateUrl: './login-register.component.html',
  styleUrls: ['./login-register.component.css']
})
export class LoginRegisterComponent {
  registerUsername = '';
  registerEmail = '';
  registerPassword = '';

  loginUsername = '';
  loginPassword = '';
  polipop: any;

  constructor(private readonly apiService: ApiService, private readonly router: Router, private readonly authService: AuthService) {} // 👈 ajoute Router ici

  register() {
    this.authService.register(this.registerUsername, this.registerEmail, this.registerPassword).subscribe({
      next: (response) => {
        console.log('Register success:', response);
        alert('Inscription réussie ✅');
      },
      error: (error) => {
        console.error('Register error:', error);
        alert('Erreur lors de l\'inscription ❌');
      }
    });
  }

  login() {


    this.authService.login(this.loginUsername, this.loginPassword).subscribe({
      next: (response) => {
        console.log('Login success:', response);
        localStorage.setItem('username', response.username);  // Sauvegarder le username dans le localStorage
        localStorage.setItem('jtw_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
        localStorage.setItem('csrftoken', response.csrf_token);
        localStorage.setItem('notif-success', 'true');

        this.router.navigate(['/dashboard']);  // Rediriger après la connexion
      },
      error: (error) => {
        console.error('Login error:', error);
        alert('Erreur lors de la connexion ❌');
      }
    });
  }
}
