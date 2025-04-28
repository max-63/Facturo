from rest_framework import serializers
from .models import Client, Facture, LigneFacture, Depense, Paiement, ParametresEntreprise

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'

class FactureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Facture
        fields = '__all__'

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
