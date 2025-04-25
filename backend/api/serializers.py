# backend/api/serializers.py

from rest_framework import serializers
from .models import Client, Facture, LigneFacture, Depense, Paiement, ParametresEntreprise

class ClientSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='nom')  # Renommer 'nom' en 'name'
    
    class Meta:
        model = Client
        fields = ['id', 'name', 'email', 'telephone', 'adresse', 'date_ajout']

class FactureSerializer(serializers.ModelSerializer):
    client_nom = serializers.CharField(source='client.nom', read_only=True)

    class Meta:
        model = Facture
        fields = ['id', 'numero', 'date_emission', 'date_echeance', 'statut', 'montant_total', 'client_nom']


class LigneFactureSerializer(serializers.ModelSerializer):
    class Meta:
        model = LigneFacture
        fields = '__all__'

class DepenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Depense
        fields = '__all__'

class PaiementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paiement
        fields = '__all__'

class ParametresEntrepriseSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParametresEntreprise
        fields = '__all__'
