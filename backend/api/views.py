from .models import Client, Facture, LigneFacture, Depense, Paiement, ParametresEntreprise
from django.contrib.auth.models import User
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt


def getClients(request):
    username = request.GET.get('username')  # Utiliser 'username' correctement
    try:
        user = User.objects.get(username=username)  # Utiliser le champ 'username'
        clients = Client.objects.filter(appartient_a_user=user.id)  # Filtrer par l'ID de l'utilisateur
        return JsonResponse(list(clients.values()), safe=False, status=200)
    except User.DoesNotExist:
        return JsonResponse({'error': 'Utilisateur non trouvé'}, status=404)

def getFactures(request):
    username = request.GET.get('username')
    try:
        user = User.objects.get(username=username)
        factures = Facture.objects.filter(client__appartient_a_user=user.id)  # Utilisation de l'ID de l'utilisateur
        return JsonResponse(list(factures.values()), safe=False, status=200)
    except User.DoesNotExist:
        return JsonResponse({'error': 'Utilisateur non trouvé'}, status=404)


def getLigneFacture(request):
    username = request.GET.get('username')
    try:
        user = User.objects.get(username=username)
        lignes = LigneFacture.objects.filter(facture__client__appartient_a_user=user.id)  # Filtrer par l'ID de l'utilisateur
        return JsonResponse(list(lignes.values()), safe=False, status=200)
    except User.DoesNotExist:
        return JsonResponse({'error': 'Utilisateur non trouvé'}, status=404)


def getDepenses(request):
    username = request.GET.get('username')
    try:
        user = User.objects.get(username=username)
        depenses = Depense.objects.filter(appartient_a_user=user.id)  # Utilisation de l'ID de l'utilisateur
        return JsonResponse(list(depenses.values()), safe=False,status=200)
    except User.DoesNotExist:
        return JsonResponse({'error': 'Utilisateur non trouvé'}, status=404)

def getPaiements(request):
    username = request.GET.get('username')
    try:
        user = User.objects.get(username=username)
        paiements = Paiement.objects.filter(facture__client__appartient_a_user=user.id)  # Filtrer par ID de l'utilisateur
        return JsonResponse(list(paiements.values()), safe=False, status=200)
    except User.DoesNotExist:
        return JsonResponse({'error': 'Utilisateur non trouvé'}, status=404)


def getParametresEntreprise(request):
    username = request.GET.get('username')
    try:
        user = User.objects.get(username=username)
        parametres = ParametresEntreprise.objects.filter(appartient_a_user=user.id)  # Filtrer par ID de l'utilisateur
        return JsonResponse(list(parametres.values()), safe=False, status=200)
    except User.DoesNotExist:
        return JsonResponse({'error': 'Utilisateur non trouvé'}, status=404)








@api_view(['POST'])
def update_facture(request, facture_id):
    try:
        # Récupérer la facture principale
        facture = Facture.objects.get(id=facture_id)
    except Facture.DoesNotExist:
        return Response({'error': 'Facture non trouvée'}, status=status.HTTP_404_NOT_FOUND)

    # Récupérer les données de la requête
    data = request.data
    print(data)  # Juste pour debugger et vérifier les données envoyées
    
    # 1. Mise à jour des informations de la facture
    facture.numero = data.get('numero', facture.numero)
    facture.date_emission = data.get('date_emission', facture.date_emission)
    facture.date_echeance = data.get('date_echeance', facture.date_echeance)
    facture.statut = data.get('statut', facture.statut)

    # Vérification et mise à jour du client
    client_id = data.get('client_id')
    if client_id:
        try:
            client = Client.objects.get(id=client_id)
            facture.client = client
        except Client.DoesNotExist:
            return Response({'error': 'Client non trouvé'}, status=status.HTTP_400_BAD_REQUEST)

    # Sauvegarder les changements de la facture principale
    facture.save()

    # 2. Mise à jour des lignes de la facture
    lignes_data = data.get('lignes', [])
    for ligne_data in lignes_data:
        ligne_id = ligne_data.get('id')
        try:
            # Trouver la ligne existante
            ligne = LigneFacture.objects.get(id=ligne_id, facture=facture)
            ligne.nom_produit = ligne_data.get('produit', ligne.nom_produit)
            ligne.description = ligne_data.get('description', ligne.description)
            ligne.quantite = ligne_data.get('quantite', ligne.quantite)
            ligne.prix_unitaire = ligne_data.get('prix_unitaire', ligne.prix_unitaire)
            ligne.tva = ligne_data.get('tva', ligne.tva)
            ligne.save()
        except LigneFacture.DoesNotExist:
            # Si la ligne n'existe pas, créer une nouvelle ligne
            LigneFacture.objects.create(
                facture=facture,
                produit=ligne_data.get('produit'),
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
            'username': user.username,
            'csrf_token': csrf_token  # <<< on l'ajoute dans la réponse JSON
        }, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Mot de passe incorrect'}, status=status.HTTP_401_UNAUTHORIZED)


from rest_framework_simplejwt.views import TokenObtainPairView

class CustomTokenObtainPairView(TokenObtainPairView):
    # Tu peux personnaliser ici le comportement ou le serializer utilisé pour obtenir le token
    pass
