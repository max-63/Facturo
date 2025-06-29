from .models import Client, Facture, LigneFacture, Depense, Paiement, ParametresEntreprise
from django.contrib.auth.models import User
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.decorators import api_view, authentication_classes, permission_classes
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def getClients(request):
    user = request.user  # Récupère directement l'utilisateur connecté
    clients = Client.objects.filter(appartient_a_user=user.id)
    return JsonResponse(list(clients.values()), safe=False, status=200)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def getFactures(request):
    user = request.user
    factures = Facture.objects.filter(client__appartient_a_user=user.id)
    return JsonResponse(list(factures.values()), safe=False, status=200)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def getLigneFacture(request):
    user = request.user
    lignes = LigneFacture.objects.filter(facture__client__appartient_a_user=user.id)
    return JsonResponse(list(lignes.values()), safe=False, status=200)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def getDepenses(request):
    user = request.user
    depenses = Depense.objects.filter(appartient_a_user=user.id)
    return JsonResponse(list(depenses.values()), safe=False, status=200)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def getPaiements(request):
    user = request.user
    paiements = Paiement.objects.filter(facture__client__appartient_a_user=user.id)
    return JsonResponse(list(paiements.values()), safe=False, status=200)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def getParametresEntreprise(request):
    user = request.user
    parametres = ParametresEntreprise.objects.filter(appartient_a_user=user.id)
    return JsonResponse(list(parametres.values()), safe=False, status=200)


@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def update_facture(request, facture_id):
    try:
        facture = Facture.objects.get(id=facture_id)
    except Facture.DoesNotExist:
        return Response({'error': 'Facture non trouvée'}, status=status.HTTP_404_NOT_FOUND)

    data = request.data
    
    # Mise à jour de la facture
    facture.numero = data.get('numero', facture.numero)
    facture.date_emission = data.get('date_emission', facture.date_emission)
    facture.date_echeance = data.get('date_echeance', facture.date_echeance)
    facture.statut = data.get('statut', facture.statut)

    client_id = data.get('client_id')
    if client_id:
        try:
            client = Client.objects.get(id=client_id)
            facture.client = client
        except Client.DoesNotExist:
            return Response({'error': 'Client non trouvé'}, status=status.HTTP_400_BAD_REQUEST)

    facture.save()

    lignes_data = data.get('lignes', [])
    for ligne_data in lignes_data:
        ligne_id = ligne_data.get('id')
        try:
            ligne = LigneFacture.objects.get(id=ligne_id, facture=facture)
            ligne.nom_produit = ligne_data.get('produit', ligne.nom_produit)
            ligne.description = ligne_data.get('description', ligne.description)
            ligne.quantite = ligne_data.get('quantite', ligne.quantite)
            ligne.prix_unitaire = ligne_data.get('prix_unitaire', ligne.prix_unitaire)
            ligne.tva = ligne_data.get('tva', ligne.tva)
            ligne.save()
        except LigneFacture.DoesNotExist:
            LigneFacture.objects.create(
                facture=facture,
                nom_produit=ligne_data.get('produit'),
                description=ligne_data.get('description'),
                quantite=ligne_data.get('quantite'),
                prix_unitaire=ligne_data.get('prix_unitaire'),
                tva=ligne_data.get('tva')
            )

    return Response({'success': 'Facture mise à jour avec succès!'}, status=status.HTTP_200_OK)



@api_view(['POST'])
def register_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')

    # Vérifier que tous les champs sont présents
    if not username or not password or not email:
        return Response({'error': 'Tous les champs sont requis'}, status=status.HTTP_400_BAD_REQUEST)

    # Vérifier si le nom d'utilisateur existe déjà
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Nom d\'utilisateur déjà pris'}, status=status.HTTP_400_BAD_REQUEST)

    # Création de l'utilisateur avec un mot de passe sécurisé (automatique via create_user)
    user = User.objects.create_user(username=username, password=password, email=email)
    user.save()

    # Retourner une réponse de succès
    return Response({'message': 'Utilisateur créé avec succès. Un email de confirmation vous a été envoyé.'}, status=status.HTTP_201_CREATED)

from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.middleware.csrf import get_token
@api_view(['POST'])
@csrf_exempt
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({'error': 'Tous les champs sont requis'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(username=username)  # Utilisation du modèle User de Django
    except User.DoesNotExist:
        return Response({'error': 'Nom d\'utilisateur introuvable'}, status=status.HTTP_404_NOT_FOUND)

    # Vérifier le mot de passe
    if user.check_password(password):  # Utilisation de la méthode check_password de Django
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        csrf_token = get_token(request)

        return Response({
            'message': 'Connexion réussie ✅',
            'access_token': access_token,
            'refresh_token': str(refresh),
            'username': user.username,
            'csrf_token': csrf_token  # <<< on l'ajoute dans la réponse JSON
        }, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Mot de passe incorrect'}, status=status.HTTP_401_UNAUTHORIZED)


from rest_framework_simplejwt.views import TokenObtainPairView

class CustomTokenObtainPairView(TokenObtainPairView):
    # Tu peux personnaliser ici le comportement ou le serializer utilisé pour obtenir le token
    pass
