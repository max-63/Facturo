# backend/api/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *  # Importation de toutes les vues
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


urlpatterns = [
    path('register/', register_user, name='register_user'),
    path('login/', login_user, name='login_user'),  # Route pour la connexion
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('clients/', getClients, name='get_clients'),
    path('factures', getFactures, name='get_factures'),
    path('depenses', getDepenses, name='get_depenses'),
    path('paiements', getPaiements, name='get_paiements'),
    path('entreprise', getParametresEntreprise, name='get_parametres_entreprise'),
    path('ligne_facture', getLigneFacture, name='get_ligne_facture'),
    path('update_lignes_facture', update_lignes_facture, name='update_facture'),
]
