import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NgModule } from '@angular/core';
import { ApiService, Facture, LigneFacture, Client, Entreprise } from '../api.service';
import { flatMap, forkJoin } from 'rxjs';
import Swal from 'sweetalert2'
import Polipop from 'polipop';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  entreprise: Entreprise[] = [];

  constructor(private apiService: ApiService) {}

  token: string | null = null;
  ngOnInit(): void {
    this.token = localStorage.getItem('jtw_token');
    if (this.token) {
      this.loadData();
    } else {
      console.error('token non trouvé dans localStorage.');
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


  onDbClickFacture(id: number): void {
    const facture = this.factures.find((f) => f.id === id);
    const lignes = this.ligneFactures.filter((l) => l.facture_id === id);

    if (!facture) return;

    const clientName = this.getclientNamebyId(facture.client_id);
    const numero = facture.numero;
    const montantTTC = this.getMontantTtcFacture(id);
    let montant_HT = 0;
    let css_pre = `/* === SweetAlert Custom Form Styling === */
      form {
        font-family: "Segoe UI", sans-serif;
        font-size: 14px;
      }

      table.table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
      }

      .table thead {
        background-color: #f1c40f;
        color: black;
      }

      .table thead th {
        padding: 10px;
        text-align: left;
      }

      .table-sm thead th {
        background-color: #85c1e9;
        color: white;
      }

      .table-sm td {
        background-color: #85c1e9;
        padding: 8px;
        vertical-align: top;
      }

      .table-light {
        background-color: #85c1e9 !important;
      }

      .table-light td {
        background-color: #85c1e9 !important;
      }

      input.form-control,
      select.form-control {
        width: 100%;
        padding: 5px 8px;
        font-size: 13px;
        border: 1px solid #ccc;
        border-radius: 4px;
      }

      label {
        font-weight: bold;
        display: block;
        margin-bottom: 3px;
        font-size: 13px;
      }

      /* Col structure avec flex au lieu de Bootstrap */
      .row {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }

      .col-md-3 {
        flex: 1 1 calc(25% - 12px);
        min-width: 200px;
      }

      .mt-2 {
        margin-top: 1rem;
      }

      button.btn {
        margin-top: 1rem;
        padding: 8px 12px;
        font-size: 14px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }

      .btn-secondary {
        background-color: #6c757d;
        color: white;
      }

      .btn-secondary:hover {
        background-color: #5a6268;
      }

      /* Responsive adaptation */
      @media screen and (max-width: 768px) {
        .col-md-3 {
          flex: 1 1 100%;
        }

        .table {
          table-layout: fixed;
        }

        .table th,
        .table td {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        input.form-control,
        select.form-control {
          font-size: 12px;
        }

        label {
          font-size: 12px;
        }
      }
`;
    lignes.forEach((l) => (montant_HT += l.quantite * l.prix_unitaire));

    // Construire le HTML du formulaire
    // Construire le HTML du formulaire
    let html = `
    <style>${css_pre}</style>
    <form id="form-facture-${id}">
      <div style="display: none;">
        <input type="hidden" name="id" value="${id}" />
      </div>
      <table class="table table-bordered table-sm">
        <thead class="table-light">
          <tr>
            <th colspan="7">
              <div class="row">
                <div class="col-md-3">
                  <label>Numéro :</label>
                  <input class="form-control form-control-sm" name="numero" value="${numero}" />
                </div>
                <div class="col-md-3">
                  <label>Client :</label>
                  <select class="form-control form-control-sm" name="client_id">
                    ${this.clients.map(c => `
                      <option value="${c.id}" ${c.id === facture.client_id ? 'selected' : ''}>${c.nom}</option>
                    `).join('')}
                  </select>
                </div>
                <div class="col-md-3">
                  <label>Date émission :</label>
                  <input type="date" class="form-control form-control-sm" name="date_emission" value="${facture.date_emission}" />
                </div>
                <div class="col-md-3">
                  <label>Échéance :</label>
                  <input type="date" class="form-control form-control-sm" name="date_echeance" value="${facture.date_echeance}" />
                </div>
                <div class="col-md-3 mt-2">
                  <label>Statut :</label>
                  <select class="form-control form-control-sm" name="statut">
                    <option value="brouillon" ${facture.statut === 'brouillon' ? 'selected' : ''}>Brouillon</option>
                    <option value="payée" ${facture.statut === 'payée' ? 'selected' : ''}>Payée</option>
                    <option value="envoyée" ${facture.statut === 'envoyée' ? 'selected' : ''}>Envoyée</option>
                  </select>
                </div>
              </div>
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
      <button type="button" class="btn btn-secondary" id="btn-previsu-${id}">
    👁️ Prévisualiser la facture
      </button>
      <button type="button" class="btn btn-secondary" id="btn-download-facture-${id}">⬇️ Télécharger PDF</button>
    </form>
  `;

    Swal.fire({
      title: `🧾 Modifier Facture #${numero}`,
      html: html,
      showCancelButton: false,
      showConfirmButton: true,
      confirmButtonText: '💾 Enregistrer',
      cancelButtonText: '❌ Fermer',
      showCloseButton: true,
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
        const btnPrevisu = document.getElementById('btn-previsu-' + id);
        if (btnPrevisu) {
          btnPrevisu.addEventListener('click', () => {
            this.previsualiserfacture(id);
          });
        }
        const btn_download_facture = document.getElementById('btn-download-facture-' + id);
        if (btn_download_facture) {
          btn_download_facture.addEventListener('click', () => {
            this.previsualiserfacture(id);
            this.downloadfacture();
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
          id:  Number(formData.get('id')),
          numero: formData.get('numero') as string,
          date_emission: formData.get('date_emission') as string,
          date_echeance: formData.get('date_echeance') as string,
          statut: formData.get('statut') as string,
          client_id: Number(formData.get('client_id')),
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

        console.log(updatedFacture);

        // Appeler la méthode pour envoyer la facture mise à jour à l'API
        this.apiService.updateFactureAvecLignes(updatedFacture).subscribe(
          (response) => {
            Swal.fire({
              icon: 'success',
              title: 'Facture modifiée avec succès!',
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
    if (this.token !== null) {
      forkJoin({
        factures: this.apiService.getFactures(),
        ligneFacture: this.apiService.getLigneFacture(),
        clients: this.apiService.getClients(),
        entreprise: this.apiService.getParametresEntreprise(),
      }).subscribe({
        next: (results) => {
          this.factures = results.factures;
          this.ligneFactures = results.ligneFacture;
          this.clients = results.clients;
          this.entreprise = results.entreprise;
        },
        error: (error) => {
          console.error('Erreur lors de la récupération des données:', error);
        },
      });
    }
  }

  previsualiserfacture(id: number) {
    const facture = this.factures.find((f) => f.id === id);
    const client = this.clients.find((c) => c.id === facture?.client_id);
    const client_nom = client?.nom;
    const client_adresse = client?.adresse;
    const client_emial = client?.email;
    const montant_HT = this.getMontantTotalFacture(id);
    const montant_TTC = this.getMontantTtcFacture(id);
    const lignes_facture = this.ligneFactures.filter((l) => l.facture_id === id);
    const entreprise = this.entreprise[0];
    const style = `<style>
      :root {
        --blue: #1E3A8A;
        --yellow: #FACC15;
        --white: #FFFFFF;
        --gray-light: #F9FAFB;
        --gray-dark: #374151;
        --text: #111827;
      }

      body {
        background: var(--gray-light);
        color: var(--text);
        font-family: 'Segoe UI', sans-serif;
        padding: 2rem;
      }

      .invoice-wrapper {
        max-width: 900px;
        margin: auto;
        background: var(--white);
        border-radius: 0px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.05);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        min-height: calc(297mm - 4rem); /* Ajuste la hauteur pour garantir que le footer est en bas */
      }

      header {
        background-color: var(--blue);
        color: var(--white);
        padding: 2rem;
        display: flex;
        justify-content: space-between;
      }

      .company-info {
        font-size: 0.9rem;
        text-align: right;
      }

      .invoice-body {
        padding: 2rem;
        flex: 1; /* Permet de prendre tout l'espace disponible avant d'arriver au footer */
      }

      .section {
        margin-bottom: 2rem;
      }

      .section h2 {
        color: var(--blue);
        margin-bottom: 1rem;
        font-size: 1.1rem;
      }

      .info-box {
        background-color: var(--gray-light);
        padding: 1rem;
        border-radius: 8px;
        font-size: 0.95rem;
      }

      .grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.95rem;
      }

      th {
        background: var(--blue);
        color: var(--white);
        padding: 10px;
        text-align: left;
      }

      td {
        border-bottom: 1px solid #e5e7eb;
        padding: 10px;
      }

      .totals {
        text-align: right;
        margin-top: 1rem;
      }

      .totals div {
        margin-bottom: 5px;
      }

      .totals .total {
        font-weight: bold;
        font-size: 1.2rem;
        color: var(--blue);
      }

      footer {
        background-color: var(--yellow);
        text-align: center;
        padding: 1rem;
        font-size: 0.9rem;
        color: var(--gray-dark);
        position: relative;
        bottom: 0;
        width: 100%;
      }

      @media (max-width: 768px) {
        .grid-2 {
          grid-template-columns: 1fr;
        }

        header {
          flex-direction: column;
          gap: 1rem;
        }

        .company-info {
          text-align: left;
        }
      }

      html, body {
        margin: 0;
        padding: 0;
        background: var(--gray-light);
      }

      .facture-full-modal {
        max-width: none !important;
        padding: 0 !important;
      }

      #facture_pdf {
        width: 100%; /* Assurez-vous qu'il occupe toute la largeur */
        height: 100%; /* Assurez-vous qu'il occupe toute la hauteur */
        margin: 0; /* Supprimer toute marge extérieure */
        padding: 0; /* Supprimer le padding de l'élément PDF */
        box-sizing: border-box; /* Inclure les paddings et bordures dans la taille */
        background: white;
        display: flex;
        flex-direction: column;
        justify-content: space-between; /* Toujours maintenir le footer en bas */
      }

  </style>`;


    const html_facture = `<div id="facture_pdf"> ${style}
    <div class="invoice-wrapper">
      <header>
        <div>
          <h1>Facture</h1>
          <div><strong>N° :</strong>${facture?.numero}</div>
          <div><strong>Date :</strong>${facture?.date_emission}</div>
          <div><strong>Échéance :</strong>${facture?.date_echeance}</div>
        </div>
        <div class="company-info">
          <strong>${entreprise.nom_entreprise}</strong><br>
          ${entreprise.adresse}<br>
          SIRET : ${entreprise.siret}<br>
          ${entreprise.email_contact}<br>
          ${entreprise.telephone_contact}<br>
          ${entreprise.nom_complet_gerant}
        </div>
      </header>

      <div class="invoice-body">
        <div class="section grid-2">
          <div class="info-box">
            <h2>Client</h2>
            ${client_nom}<br>
            ${client_adresse}<br>
            ${client_emial}
          </div>
        </div>

        <div class="section">
          <h2>Détails</h2>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantité</th>
                <th>PU HT</th>
                <th>TVA %</th>
                <th>Montant TVA</th>
                <th>Total TTC</th>
              </tr>
            </thead>
            <tbody>
              ${lignes_facture.map((ligne) => `
                <tr>
                  <td>${ligne.description}</td>
                  <td>${ligne.quantite}</td>
                  <td>${ligne.prix_unitaire} €</td>
                  <td>${ligne.tva}%</td>
                  <td>${(ligne.tva * ligne.prix_unitaire / 100).toFixed(2)} €</td>
                  <td>${((ligne.tva * ligne.prix_unitaire /100 + ligne.prix_unitaire) * ligne.quantite).toFixed(2)} €</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section totals">
          <div>Sous-total HT : ${montant_HT} €</div>
          <div class="total">Total TTC : ${montant_TTC} €</div>
        </div>
      </div>

      <footer>
        Merci pour votre confiance 🙏<br>
        Une question ? Écrivez-nous à ${entreprise.email_contact}
      </footer>
    </div>
    </div>`;

    Swal.fire({
    title: `📄 Aperçu de la facture #${facture?.numero}`,
    html: html_facture,
    showCancelButton: false,
    showConfirmButton: false,
    showCloseButton: true,
    width: '90vw',
    customClass: {
      popup: 'facture-full-modal'
    },
    focusConfirm: false
    });

  }

  downloadfacture(): void {
    //transformer html_facture en pdf et le telecharger
    const pdf = new jsPDF('p', 'mm', 'a4');
    // a finir
  }

}
