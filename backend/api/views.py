# backend/api/views.py

from rest_framework import viewsets
from .models import Client, Facture, LigneFacture, Depense, Paiement, ParametresEntreprise
from .serializers import *

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer

class FactureViewSet(viewsets.ModelViewSet):
    queryset = Facture.objects.all()
    serializer_class = FactureSerializer

class LigneFactureViewSet(viewsets.ModelViewSet):
    queryset = LigneFacture.objects.all()
    serializer_class = LigneFactureSerializer

class DepenseViewSet(viewsets.ModelViewSet):
    queryset = Depense.objects.all()
    serializer_class = DepenseSerializer

class PaiementViewSet(viewsets.ModelViewSet):
    queryset = Paiement.objects.all()
    serializer_class = PaiementSerializer

class ParametresEntrepriseViewSet(viewsets.ModelViewSet):
    queryset = ParametresEntreprise.objects.all()
    serializer_class = ParametresEntrepriseSerializer
