from django.db import models
from django.contrib.auth.models import User


class Client(models.Model):
    appartient_a_user = models.ForeignKey(User, on_delete=models.CASCADE)
    nom = models.CharField(max_length=100)
    email = models.EmailField(blank=True)
    telephone = models.CharField(max_length=20, blank=True)
    adresse = models.TextField(blank=True)
    date_ajout = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nom

class Facture(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    numero = models.CharField(max_length=20, unique=True)
    date_emission = models.DateField()
    date_echeance = models.DateField()
    statut = models.CharField(max_length=20, choices=[
        ('brouillon', 'Brouillon'),
        ('envoyée', 'Envoyée'),
        ('payée', 'Payée'),
    ])
    def __str__(self):
        return f"Facture {self.numero}"
    
class LigneFacture(models.Model):
    nom_produit = models.CharField(max_length=200)
    facture = models.ForeignKey(Facture, related_name='lignes', on_delete=models.CASCADE)
    description = models.CharField(max_length=200)
    quantite = models.IntegerField()
    prix_unitaire = models.DecimalField(max_digits=10, decimal_places=2)
    tva = models.FloatField()
    def __str__(self):
        return self.description

class Depense(models.Model):
    appartient_a_user = models.ForeignKey(User, on_delete=models.CASCADE)
    categorie = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    fournisseur = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.categorie

class Paiement(models.Model):
    facture = models.ForeignKey(Facture, on_delete=models.CASCADE)
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    date_paiement = models.DateField()
    moyen = models.CharField(max_length=50)  # Ex: Virement, CB, Espèces

    def __str__(self):
        return f"Paiement de {self.montant} pour la facture {self.facture}"

class ParametresEntreprise(models.Model):
    appartient_a_user = models.ForeignKey(User, on_delete=models.CASCADE)
    nom_complet_gerant = models.CharField(max_length=200)
    nom_entreprise = models.CharField(max_length=100)
    siret = models.CharField(max_length=14)
    adresse = models.TextField()
    email_contact = models.EmailField()
    telephone_contact = models.CharField(max_length=20, null=True, blank=True)
    logo = models.ImageField(upload_to='logos/', null=True, blank=True)

    def __str__(self):
        return self.nom_entreprise
