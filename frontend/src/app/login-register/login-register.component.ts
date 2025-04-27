import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService, Users } from '../api.service';
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

  constructor(private apiService: ApiService, private router: Router, private authService: AuthService) {} // 👈 ajoute Router ici

  register() {
    const data = {
      username: this.registerUsername,
      email: this.registerEmail,
      password: this.registerPassword
    };

    this.apiService.registerUser(data).subscribe({
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
    const credentials = {
      username: this.loginUsername,
      password: this.loginPassword
    };

    this.apiService.loginUser(credentials).subscribe({
      next: (response) => {
        console.log('Login success:', response);
        alert('Connexion réussie ✅');
        this.authService.saveToken(response.token);  // Sauvegarde du token
        this.router.navigate(['/dashboard']); // 👈 Redirection ici
      },
      error: (error) => {
        console.error('Login error:', error);
        alert('Erreur lors de la connexion ❌');
      }
    });
  }
}
