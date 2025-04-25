# backend/api/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register('clients', ClientViewSet)
router.register('factures', FactureViewSet)
router.register('lignes', LigneFactureViewSet)
router.register('depenses', DepenseViewSet)
router.register('paiements', PaiementViewSet)
router.register('parametres', ParametresEntrepriseViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
