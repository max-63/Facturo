import { Component, OnInit } from '@angular/core';
import { ApiService, Paiement } from '../api.service'; // Assurez-vous que ApiService existe et contient les méthodes getClients et getFactures
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Client, Facture, Depense } from '../api.service'; // Les interfaces sont déjà importées
import { ArcElement, CategoryScale, Chart, LinearScale, LineController, LineElement, PointElement, DoughnutController, PieController, BarController, BarElement,Tooltip, Legend, Title } from 'chart.js';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { forkJoin } from 'rxjs';

Chart.register([
  CategoryScale,
  LineController,
  BarController,
  LineElement,
  LinearScale,
  PointElement,
  BarElement,
  PieController, DoughnutController,
  ArcElement,
  Tooltip, Legend, Title
]);


@Component({
  selector: 'app-dashboard',
  standalone: true, // ✅ ESSENTIEL
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [CommonModule, RouterModule, SidebarComponent]
})
export class DashboardComponent implements OnInit {

  clients: Client[] = [];
  factures: Facture[] = [];
  depenses: Depense[] = [];
  paiements: Paiement[] = [];
  factureCount = {
    payee: 0,
    envoyee: 0,
    brouillon: 0
  };

  constructor(private apiService: ApiService) { }

  
  ngOnInit(): void {
    this.loadData();
  }
  loadData(): void {
    // Utilise forkJoin pour attendre que toutes les données soient récupérées avant de procéder
    forkJoin({
      clients: this.apiService.getClients(),
      factures: this.apiService.getFactures(),
      depenses: this.apiService.getDepenses(),
      paiements: this.apiService.getPaiements()
    }).subscribe({
      next: (results) => {
        // Une fois que toutes les données sont récupérées
        this.clients = results.clients;
        this.factures = results.factures;
        this.depenses = results.depenses;
        this.paiements = results.paiements;

        // Après que toutes les données soient chargées, on procède à la création des graphiques
        this.countFacturesByStatut();
        this.createChartPie();
        this.createChartBar();
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des données:', error);
      }
    });
  }

  // Charger les clients depuis l'API
  loadClients(): void {
    this.apiService.getClients().subscribe(
      (data: Client[]) => {
        this.clients = data;
      },
      error => {
        console.error('Erreur lors de la récupération des clients', error);
      }
    );
  }

  // Charger les factures depuis l'API
  loadFactures(): void {
    this.apiService.getFactures().subscribe(
      (data: Facture[]) => {
        this.factures = data;
        this.countFacturesByStatut();
        this.createChartPie();
      },
      error => {
        console.error('Erreur lors de la récupération des factures', error);
      }
    );
  }

  loadDepenses(): void {
    this.apiService.getDepenses().subscribe(
      (data: Depense[]) => {
        this.depenses = data;
        this.loadPaiments();
        this.createChartBar();
      },
      error => {
        console.error('Erreur lors de la récupération des factures', error);
      }
    )
  }


  loadPaiments(): void {
    this.apiService.getPaiements().subscribe(
      (data: Paiement[]) => {
        this.paiements = data;
      },
      error => {
        console.error('Erreur lors de la récupération des paiements', error);
      }
    );
  }
  


  // Compter les factures par statut
  countFacturesByStatut(): void {
    this.factureCount.payee = this.factures.filter(facture => facture.statut === 'payée').length;
    this.factureCount.envoyee = this.factures.filter(facture => facture.statut === 'envoyée').length;
    this.factureCount.brouillon = this.factures.filter(facture => facture.statut === 'brouillon').length;
  }

  // Ajouter à ton composant TypeScript
  calculateTotal(): number {
    let montant_total_final = 0;
    for (let facture of this.factures) {
      // Vérifie si la facture est envoyée ou payée
      if (facture.statut === 'envoyée' || facture.statut === 'payée') {
        montant_total_final += parseFloat(facture.montant_total.toString());
      }
    }
    return montant_total_final;
  }
  
  


  // Créer un graphique en secteurs
  createChartPie(): void {
    const ctx = document.getElementById('Chart-factures') as HTMLCanvasElement;
    if (ctx) {
      var PieChart = new Chart("Chart-factures", {
        type: 'pie',
        data: {
          labels: ['Factures envoyées', 'Factures brouillons'],
          datasets: [{
            label: 'Statut des factures',
            data: [this.factureCount.envoyee, this.factureCount.brouillon],
            backgroundColor: [
              'rgb(255, 118, 148)',
              'rgb(54, 163, 235)',
            ],
            borderColor: [
              'rgb(201, 70, 99)',
              'rgba(54, 162, 235, 1)',
            ],
            borderWidth: 1
          }]
        },
        options: {
          animation: true,
          responsive: true,
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                color: 'rgb(0, 0, 0)',
                font: {
                  size: 14,
                }
              }
            },
            title: {
              text: 'Statut des factures',
              font: {
                size: 20
              },
              color: 'rgb(0, 0, 0)',
              display: true,
            },
            tooltip: {
              callbacks: {
                label: function(tooltipItem) {
                  return tooltipItem.label + ': ' + tooltipItem.raw + ' factures';
                }
              }
            }
          }
        }
      });
    }
  }


  createChartBar(): void {
    const ctx2 = document.getElementById("depenses_graphique") as HTMLCanvasElement;
    if (ctx2) {
      // Agréger les dépenses par mois
      const monthlyExpenses = this.aggregateExpensesByMonth(this.depenses);
      const monthlyPaiements = this.aggregatePaiementsByMonth(this.paiements);

  
      // Extraire les labels (mois) et les montants
      const labels = Object.keys(monthlyExpenses); // Les mois sous forme de clé
      const expensesData = Object.values(monthlyExpenses); // Les totaux des dépenses pour chaque mois
      const paiementsData = Object.values(monthlyPaiements);
  
      // Si les labels et les données sont corrects, continue avec la création du graphique
      new Chart(ctx2, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Dépenses par mois',
              data: expensesData,
              backgroundColor: 'rgba(255, 187, 0, 0.2)', // Couleur des barres
              borderColor: 'rgb(255, 187, 0)', // Bord des barres
              borderWidth: 1
            },
            {
              label: 'Paiements par mois',
              data: paiementsData,
              backgroundColor: 'rgba(120, 255, 108, 0.2)', // Couleur des barres pour les paiements
              borderColor: 'rgb(120, 255, 108)', // Bord des barres pour les paiements
              borderWidth: 1,
            },
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                color: 'rgb(0, 0, 0)',
                font: {
                  size: 14,
                }
              }
            },
            title: {
              text: 'Dépenses et Paiements mensuels',
              font: {
                size: 20
              },
              color: 'rgb(0, 0, 0)',
              display: true,
            },
            tooltip: {
              callbacks: {
                label: function(tooltipItem) {
                  return tooltipItem.label + ': ' + tooltipItem.raw + ' €';
                }
              }
            }
          },
          scales: {
            y: {
              ticks: {
                display: false // ❌ Masquer les ticks
              },
              grid: {
                display: false // ❌ Optionnel : masque la grille horizontale
              }
            },
            x: {
              grid: {
                display: false // ❌ Optionnel : masque la grille verticale
              }
            }
          }
        }
      });
    } else {
      console.error('Élément canvas pour depenses_graphique introuvable');
    }
  }

  aggregateExpensesByMonth(expenses: Depense[]): { [key: string]: number } {
    const monthlyExpenses: { [key: string]: number } = {};
  
    expenses.forEach(depense => {
      const month = depense.date.substring(0, 7); // Extrait le mois 'YYYY-MM'
      if (!monthlyExpenses[month]) {
        monthlyExpenses[month] = 0;
      }
      // Conversion explicite de depense.montant en nombre
      monthlyExpenses[month] += isNaN(parseFloat(depense.montant)) ? 0 : parseFloat(depense.montant);
    });
  
    return monthlyExpenses;
  }

  aggregatePaiementsByMonth(paiements: Paiement[]): { [key: string]: number } {
    const monthlyPaiements: { [key: string]: number } = {};
  
    paiements.forEach(paiement => {
      const month = paiement.date_paiement.substring(0, 7); // Extrait le mois 'YYYY-MM'
      if (!monthlyPaiements[month]) {
        monthlyPaiements[month] = 0;
      }
  
      monthlyPaiements[month] += isNaN(parseFloat(paiement.montant)) ? 0 : parseFloat(paiement.montant);
    });
    return monthlyPaiements;
  }
}
