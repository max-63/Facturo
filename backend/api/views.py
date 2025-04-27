import binascii
import os
import hashlib
from rest_framework import viewsets
from .models import Client, Facture, LigneFacture, Depense, Paiement, ParametresEntreprise, Users
from .serializers import *
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny  # Permet à tout le monde d'accéder sans authentification
from rest_framework.exceptions import PermissionDenied


class ClientViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]  # Permet l'accès à tous, même sans être authentifié
    serializer_class = ClientSerializer  # Pour tout le monde, sans restriction
    queryset = Client.objects.all()

class FactureViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]  # Permet l'accès à tous, même sans être authentifié
    serializer_class = FactureSerializer
    queryset = Facture.objects.all()


class LigneFactureViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]  # Permet l'accès à tous, même sans être authentifié
    serializer_class = LigneFactureSerializer
    queryset = LigneFacture.objects.all()


class DepenseViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]  # Permet l'accès à tous, même sans être authentifié
    serializer_class = DepenseSerializer
    queryset = Depense.objects.all()

class PaiementViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]  # Permet l'accès à tous, même sans être authentifié
    serializer_class = PaiementSerializer
    queryset = Paiement.objects.all()

# Classe ParametresEntrepriseViewSet
class ParametresEntrepriseViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]  # Permet l'accès à tous, même sans être authentifié
    serializer_class = ParametresEntrepriseSerializer
    queryset = ParametresEntreprise.objects.all()


# Classe UsersViewSet
class UsersViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]  # Permet l'accès à tous, même sans être authentifié
    serializer_class = UserSerializer
    queryset = Users.objects.all()

# Authentification et gestion des utilisateurs

@api_view(['GET'])
def get_salt(request):
    username = request.GET.get('username')
    try:
        user = Users.objects.get(username=username)
        return JsonResponse({'salt': user.salt})
    except Users.DoesNotExist:
        return JsonResponse({'error': 'Utilisateur non trouvé'}, status=404)


def hash_password(password: str, salt: str) -> str:
    return hashlib.sha256((password + salt).encode()).hexdigest()


@api_view(['POST'])
def register_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')

    if not username or not password or not email:
        return Response({'error': 'Tous les champs sont requis'}, status=status.HTTP_400_BAD_REQUEST)

    if Users.objects.filter(username=username).exists():
        return Response({'error': 'Nom d\'utilisateur déjà pris'}, status=status.HTTP_400_BAD_REQUEST)

    salt = binascii.b2a_hex(os.urandom(6)).decode()
    hashed_password = hash_password(password, salt)

    user = Users.objects.create(
        username=username,
        password=hashed_password,
        salt=salt,
        email=email,
        is_active=False
    )
    user.save()

    return Response({'message': 'Utilisateur créé avec succès'}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({'error': 'Tous les champs sont requis'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = Users.objects.get(username=username)
    except Users.DoesNotExist:
        return Response({'error': 'Nom d\'utilisateur introuvable'}, status=status.HTTP_404_NOT_FOUND)

    hashed_input_password = hash_password(password, user.salt)

    if hashed_input_password == user.password:
        user.is_active = True
        user.save()
        return Response({'message': 'Connexion réussie ✅'}, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Mot de passe incorrect'}, status=status.HTTP_401_UNAUTHORIZED)


from rest_framework_simplejwt.views import TokenObtainPairView

class CustomTokenObtainPairView(TokenObtainPairView):
    # Tu peux personnaliser ici le comportement ou le serializer utilisé pour obtenir le token
    pass
