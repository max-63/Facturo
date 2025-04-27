# backend/api/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *  # Importation de toutes les vues
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import CustomTokenObtainPairView

router = DefaultRouter()
router.register('clients', ClientViewSet, basename='client')
router.register('factures', FactureViewSet, basename='facture')
router.register('lignes', LigneFactureViewSet, basename='lignefacture')
router.register('depenses', DepenseViewSet, basename='depense')
router.register('paiements', PaiementViewSet, basename='paiement')
router.register('parametres', ParametresEntrepriseViewSet, basename='parametre')
router.register('users', UsersViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
    path('get_salt/', get_salt, name='get_salt'),
    path('register/', register_user, name='register_user'),
    path('login/', login_user, name='login_user'),  # Route pour la connexion
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
