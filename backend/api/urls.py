# backend/api/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *  # Importation de toutes les vues
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register('clients', ClientViewSet)
router.register('factures', FactureViewSet)
router.register('lignes', LigneFactureViewSet)
router.register('depenses', DepenseViewSet)
router.register('paiements', PaiementViewSet)
router.register('parametres', ParametresEntrepriseViewSet)
router.register('users', UsersViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('get_salt/', get_salt, name='get_salt'),
    path('register/', register_user, name='register_user'),
    path('login/', login_user, name='login_user'),  # Route pour la connexion
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # JWT: obtenir un token
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # JWT: rafraîchir le token
]
