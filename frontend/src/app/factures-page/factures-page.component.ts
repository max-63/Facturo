import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NgModule } from '@angular/core';
import { ApiService, Facture, LigneFacture, Client } from '../api.service';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-factures-page',
  imports: [RouterModule, SidebarComponent, CommonModule, FormsModule],
  templateUrl: './factures-page.component.html',
  styleUrl: './factures-page.component.css',
})
export class FacturesPageComponent implements OnInit {
  factures: Facture[] = [];
  ligneFactures: LigneFacture[] = [];
  clients: Client[] = [];

  constructor(private apiService: ApiService) {}

  username: string | null = null;
  ngOnInit(): void {
    this.username = localStorage.getItem('username');
    if (this.username) {
      this.loadData();
    } else {
      console.error('Username non trouvé dans localStorage.');
    }
  }
  getLignesFactures(facture: Facture): LigneFacture[] {
    return this.ligneFactures.filter((l) => l.facture_id === facture.id);
  }

  getclientNamebyId(id: number): string {
    const client = this.clients.find((c) => c.id === id);
    return client ? client.nom : 'Client inconnu';
  }

  getMontantTotalHT(prix_unitaire: number, quantite: number): number {
    return prix_unitaire * quantite;
  }
  getMontantTotalFacture(id: number): number {
    //trouyver toutes les lignes factures de la facture
    const lignesFacture = this.ligneFactures.filter((l) => l.facture_id === id);
    // calcumler le montant total de chaque ligne factue : quantite x prix unitaire, puis les additionner
    return lignesFacture.reduce(
      (total, ligne) =>
        total + this.getMontantTotalHT(ligne.prix_unitaire, ligne.quantite),
      0
    );
  }

  getMontantTtcFacture(id: number): number {
    // Filtrer les lignes de la facture par l'ID de la facture
    const lignesFacture = this.ligneFactures.filter((l) => l.facture_id === id);

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

  // onDbClickFacture(id: number):void {
  //   const montantTotalFacture = this.getMontantTotalFacture(id);
  //   const montantTtcFacture = this.getMontantTtcFacture(id);
  //   const clientName = this.getclientNamebyId(this.factures.find(f => f.id === id)?.client_id || 0);
  //   const date_echeance = this.factures.find(f => f.id === id)?.date_echeance;
  //   const date_emission = this.factures.find(f => f.id === id)?.date_emission;
  //   const statut = this.factures.find(f => f.id === id)?.statut;
  //   const facture_name = this.factures.find(f => f.id === id)?.numero;
  //   let montant_HT = 0;
  //   const LignesFactures = this.ligneFactures.filter(l => l.facture_id === id);
  //   for (let ligne of LignesFactures) {
  //     montant_HT += ligne.prix_unitaire * ligne.quantite;
  //   }

  //   const lignesHtml = LignesFactures.map(ligne => {
  //     const montantHT = this.getMontantTotalHT(ligne.quantite, ligne.prix_unitaire);
  //     const montantTTC = montantHT + (montantHT * ligne.tva) / 100;

  //     return `
  //       <tr>
  //         <td>${ligne.nom_produit}</td>
  //         <td>${ligne.description}</td>
  //         <td>${ligne.quantite}</td>
  //         <td>${ligne.prix_unitaire} €</td>
  //         <td>${ligne.tva} %</td>
  //         <td>${montantHT.toFixed(2)} €</td>
  //         <td>${montantTTC.toFixed(2)} €</td>
  //       </tr>
  //     `;
  //   }).join('');

  //   // Swal.fire({
  //   //   title: `Facture ${facture_name}`,
  //   //   html: `
  //   //     <table>
  //   //       <thead>
  //   //         <tr class="table-primary>
  //   //           <th>${facture_name}</th>
  //   //           <th>${montant_HT} €</th>
  //   //           <th>${montantTtcFacture} €</th>
  //   //           <th>Date d'émission ${date_emission}</th>
  //   //           <th>Date d' écheance${date_echeance}</th>
  //   //           <th>${statut}</th>
  //   //           <th>${clientName}</th>
  //   //         </tr>
  //   //       </thead>
  //   //       <tbody>
  //   //         <tr>
  //   //           <td colspan="7">Lignes de la facture</td>
  //   //         </tr>
  //   //         <tr ngFor="let ligne of LignesFactures">
  //   //           ${lignesHtml}
  //   //         </tr>
  //   //       </tbody>
  //   //     </table>
  //   //   `,
  //   //   showCancelButton: false,
  //   //   showCloseButton: true,
  //   //   showConfirmButton: false,
  //   //   width: '70%',
  //   // });

  // }

  onDbClickFacture(id: number): void {
    const facture = this.factures.find((f) => f.id === id);
    const lignes = this.ligneFactures.filter((l) => l.facture_id === id);

    if (!facture) return;

    const clientName = this.getclientNamebyId(facture.client_id);
    const numero = facture.numero;
    const montantTTC = this.getMontantTtcFacture(id);
    let montant_HT = 0;

    lignes.forEach((l) => (montant_HT += l.quantite * l.prix_unitaire));

    // Construire le HTML du formulaire
    let html = `
    <form id="form-facture-${id}">
      <table class="table table-bordered table-sm">
        <thead class="table-light">
          <tr>
            <th colspan="7">
              Facture <strong>${numero}</strong> — Client : ${clientName}<br>
              Date émission : ${facture.date_emission} | Échéance : ${facture.date_echeance} | Statut : ${facture.statut}
            </th>
          </tr>
          <tr>
            <th>Produit</th>
            <th>Description</th>
            <th>Quantité</th>
            <th>Prix unitaire (€)</th>
            <th>TVA (%)</th>
            <th>Montant HT</th>
            <th>Montant TTC</th>
          </tr>
        </thead>
        <tbody>
  `;

    lignes.forEach((ligne, i) => {
      const montantHT = ligne.quantite * ligne.prix_unitaire;
      const montantTTC = montantHT + (montantHT * ligne.tva) / 100;
      html += `
      
      <tr>
        <td>
        <input type="hidden" name="id_${i}" value="${ligne.id}" /> <!-- ID caché -->
        <input class="form-control form-control-sm" name="produit_${i}" value="${
        ligne.nom_produit
      }" /></td>
        <td><input class="form-control form-control-sm" name="description_${i}" value="${
        ligne.description
      }" /></td>
        <td><input type="number" step="1" class="form-control form-control-sm" name="quantite_${i}" value="${
        ligne.quantite
      }" /></td>
        <td><input type="number" step="0.01" class="form-control form-control-sm" name="prix_unitaire_${i}" value="${
        ligne.prix_unitaire
      }" /></td>
        <td><input type="number" step="0.1" class="form-control form-control-sm" name="tva_${i}" value="${
        ligne.tva
      }" /></td>
        <td>${montantHT.toFixed(2)} €</td>
        <td>${montantTTC.toFixed(2)} €</td>
      </tr>
    `;
    });

    html += `
        </tbody>
      </table>
    </form>
  `;

    Swal.fire({
      title: `🧾 Modifier Facture #${numero}`,
      html: html,
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: '💾 Enregistrer',
      cancelButtonText: '❌ Fermer',
      width: '70%',
      didOpen: () => {
        const form = document.getElementById('form-facture-' + id)!;

        function updateMontants() {
          console.log("🧠 Recalcul des montants...");
          const rows = form.querySelectorAll('tbody tr');
          rows.forEach((row, i) => {
            const quantiteInput = form.querySelector(`[name=quantite_${i}]`) as HTMLInputElement;
            const prixInput = form.querySelector(`[name=prix_unitaire_${i}]`) as HTMLInputElement;
            const tvaInput = form.querySelector(`[name=tva_${i}]`) as HTMLInputElement;
        
            if (!quantiteInput || !prixInput || !tvaInput) return;
        
            const quantite = parseFloat(quantiteInput.value) || 0;
            const prix = parseFloat(prixInput.value) || 0;
            const tva = parseFloat(tvaInput.value) || 0;
        
            const montantHT = quantite * prix;
            const montantTTC = montantHT + (montantHT * tva) / 100;
        
            const htCell = row.querySelectorAll('td')[5];
            const ttcCell = row.querySelectorAll('td')[6];
            if (htCell) htCell.innerHTML = `${montantHT.toFixed(2)} €`;
            if (ttcCell) ttcCell.innerHTML = `${montantTTC.toFixed(2)} €`;
          });
        }
        

        // Écoute les inputs
        form.querySelectorAll('input').forEach((input) => {
          if (
            input.name.includes('quantite_') ||
            input.name.includes('prix_unitaire_') ||
            input.name.includes('tva_')
          ) {
            input.addEventListener('input', updateMontants);
          }
        });

        updateMontants(); // Premier calcul
      },
      preConfirm: () => {
        const form = document.getElementById(`form-facture-${id}`) as HTMLFormElement;
        console.log('🧾 Formulaire trouvé ?', form);

        const formData = new FormData(form);

        const updatedFacture = {
          numero: formData.get('numero') as string,
          date_emission: formData.get('date_emission') as string,
          date_echeance: formData.get('date_echeance') as string,
          statut: formData.get('statut') as string,
          lignes: lignes.map((_, i) => ({
            id: Number(formData.get(`id_${i}`)),  // Récupère l'ID de la ligne
            facture_id: id,
            nom_produit: formData.get(`produit_${i}`) as string,
            description: formData.get(`description_${i}`) as string,
            quantite: Number(formData.get(`quantite_${i}`)),
            prix_unitaire: Number(formData.get(`prix_unitaire_${i}`)),
            tva: Number(formData.get(`tva_${i}`)),
          })),
        };
        console.log(updatedFacture.lignes);

        // Mettre à jour les lignes de facture via l'API
        this.apiService.updateLignesFacture(updatedFacture.lignes).subscribe(
          (response) => {
            Swal.fire({
              icon: 'success',
              title: 'Facture modifiée avec succès! ',
            });
          },
          (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: error.message,
            });
          }
        );
      },
    });
  }

  loadData(): void {
    if (this.username !== null) {
      forkJoin({
        factures: this.apiService.getFactures(this.username),
        ligneFacture: this.apiService.getLigneFacture(this.username),
        clients: this.apiService.getClients(this.username),
      }).subscribe({
        next: (results) => {
          this.factures = results.factures;
          this.ligneFactures = results.ligneFacture;
          this.clients = results.clients;
        },
        error: (error) => {
          console.error('Erreur lors de la récupération des données:', error);
        },
      });
    }
  }
}
