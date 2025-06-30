import { Component, OnInit } from '@angular/core';
import { ApiService, Paiement } from '../api.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Client, Facture, Depense, LigneFacture } from '../api.service';
import { ArcElement, CategoryScale, Chart, LinearScale, LineController, LineElement, PointElement, DoughnutController, PieController, BarController, BarElement, Tooltip, Legend, Title } from 'chart.js';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FacturesPageComponent } from '../factures-page/factures-page.component';
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
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [CommonModule, RouterModule, SidebarComponent],
})
export class DashboardComponent implements OnInit {

  clients: Client[] = [];
  factures: Facture[] = [];
  depenses: Depense[] = [];
  paiements: Paiement[] = [];
  ligneFactures: LigneFacture[] = [];
  factureCount = {
    payee: 0,
    envoyee: 0,
    brouillon: 0
  };
  token: string | null = null;

  constructor(private readonly apiService: ApiService) {  }

  ngOnInit(): void {
    this.token = localStorage.getItem('jtw_token');
    if (this.token) {
      this.loadData();
    } else {
      console.error('Username non trouvé dans localStorage.');
    }

    if (localStorage.getItem('notif-success') === 'true') {
      console.log('Notif success');
    }


  }

  // Normaliser et enlever les accents
  removeAccents(text: string): string {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  // Charger les données (clients, factures, paiements, dépenses)
  loadData(): void {
    if (this.token !== null) {
      forkJoin({
        clients: this.apiService.getClients(),
        factures: this.apiService.getFactures(),
        depenses: this.apiService.getDepenses(),
        paiements: this.apiService.getPaiements(),
        ligneFactures: this.apiService.getLigneFacture()
      }).subscribe({
        next: (results) => {
          this.clients = results.clients;
          this.factures = results.factures;
          this.depenses = results.depenses;
          this.paiements = results.paiements;
          this.ligneFactures = results.ligneFactures;

          // Comptage des factures par statut
          this.countFacturesByStatut();

          // Création des graphiques après chargement des données
          this.createChartPie();
          this.createChartBar();
        },
        error: (error) => {
          console.error('Erreur lors de la récupération des données:', error);
        }
      });
    }
  }


  countFacturesByStatut(): void {
    if (Array.isArray(this.factures)) {
      this.factureCount.payee = this.factures.filter(facture => this.removeAccents(facture.statut) === 'payee').length;
      this.factureCount.envoyee = this.factures.filter(facture => this.removeAccents(facture.statut) === 'envoyee').length;
      this.factureCount.brouillon = this.factures.filter(facture => this.removeAccents(facture.statut) === 'brouillon').length;
    } else {
      console.warn('Les données des factures ne sont pas un tableau');
    }
  }

  // Calculer le total des factures envoyées ou payées
  // calculateTotal(): number {
  //   let montant_total_final = 0;
  //   for (let facture of this.factures) {
  //     if (facture.statut === 'envoyée' || facture.statut === 'payée') {
  //       montant_total_final += parseFloat(facture.montant_total.toString());
  //     }
  //   }
  //   return montant_total_final;
  // }

  calculateTotal(): number {
    let totalTtc = 0;
    for (let facture of this.factures) {
      totalTtc += this.getMontantTtcFacture(facture.id);
    }
    return totalTtc;
  }
  getMontantTtcFacture(id: number): number {
    // Filtrer les lignes de la facture par l'ID de la facture
    const lignesFacture = this.ligneFactures.filter(l => l.facture_id === id);

    // Calculer le montant total TTC
    let totalTtc = 0;

    // Boucle sur les lignes pour calculer le montant TTC de chaque ligne
    for (let ligne of lignesFacture) {
      const montantHt = ligne.prix_unitaire * ligne.quantite; // Montant HT
      const montantTtc = montantHt * (1 + ligne.tva / 100); // Montant TTC (avec TVA)
      totalTtc += montantTtc; // Additionner les montants TTC de chaque ligne
    }

    // Retourner le montant total TTC de la facture
    return totalTtc;
  }

  // Créer un graphique en secteurs pour les factures
  createChartPie(): void {
    const ctx = document.getElementById('Chart-factures') as HTMLCanvasElement;
    if (ctx) {
      const PieChart = new Chart(ctx, {
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
                label: (tooltipItem) => {
                  return tooltipItem.label + ': ' + tooltipItem.raw + ' factures';
                }
              }
            }
          }
        }
      });
    }
  }

  // Créer un graphique en barres pour les dépenses et paiements
  createChartBar(): void {
    const ctx2 = document.getElementById("depenses_graphique") as HTMLCanvasElement;
    if (ctx2) {
      // Agréger les dépenses et paiements par mois
      const monthlyExpenses = this.aggregateExpensesByMonth(this.depenses);
      const monthlyPaiements = this.aggregatePaiementsByMonth(this.paiements);

      // Fusionner et trier les mois
      const allMonths = new Set([...Object.keys(monthlyExpenses), ...Object.keys(monthlyPaiements)]);
      const labels = Array.from(allMonths).sort();

      // Créer les données des dépenses et paiements
      const expensesData = labels.map(month => monthlyExpenses[month] || 0);
      const paiementsData = labels.map(month => monthlyPaiements[month] || 0);

      new Chart(ctx2, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Dépenses par mois',
              data: expensesData,
              backgroundColor: 'rgba(255, 187, 0, 0.2)',
              borderColor: 'rgb(255, 187, 0)',
              borderWidth: 1
            },
            {
              label: 'Paiements par mois',
              data: paiementsData,
              backgroundColor: 'rgba(120, 255, 108, 0.2)',
              borderColor: 'rgb(120, 255, 108)',
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
                label: (tooltipItem) => {
                  return tooltipItem.label + ': ' + tooltipItem.raw + ' €';
                }
              }
            }
          },
          scales: {
            y: {
              ticks: {
                display: false
              },
              grid: {
                display: false
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      });
    }
  }

  // Agréger les dépenses par mois
  aggregateExpensesByMonth(expenses: Depense[]): { [key: string]: number } {
    const monthlyExpenses: { [key: string]: number } = {};
    expenses.forEach(depense => {
      const month = depense.date.substring(0, 7); // Extrait le mois 'YYYY-MM'
      monthlyExpenses[month] = (monthlyExpenses[month] || 0) + parseFloat(depense.montant || '0');
    });
    return monthlyExpenses;
  }

  // Agréger les paiements par mois
  aggregatePaiementsByMonth(paiements: Paiement[]): { [key: string]: number } {
    const monthlyPaiements: { [key: string]: number } = {};
    paiements.forEach(paiement => {
      const month = paiement.date_paiement.substring(0, 7); // Extrait le mois 'YYYY-MM'
      monthlyPaiements[month] = (monthlyPaiements[month] || 0) + parseFloat(paiement.montant.replace('€', '').replace(',', '.'));
    });
    return monthlyPaiements;
  }

}
