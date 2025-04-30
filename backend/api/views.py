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
def update_lignes_facture(request):
    try:
        lignes_data = request.data.get('lignes')  # tableau de lignes modifiées
        print(lignes_data)

        if not lignes_data or not isinstance(lignes_data, list):
            return Response({'error': 'Données invalides ou manquantes'}, status=status.HTTP_400_BAD_REQUEST)

        for ligne in lignes_data:
            ligne_id = ligne.get('id')
            try:
                obj = LigneFacture.objects.get(id=ligne_id)

                obj.nom_produit = ligne.get('nom_produit', obj.nom_produit)
                obj.description = ligne.get('description', obj.description)
                obj.quantite = ligne.get('quantite', obj.quantite)
                obj.prix_unitaire = ligne.get('prix_unitaire', obj.prix_unitaire)
                obj.tva = ligne.get('tva', obj.tva)
                obj.save()

            except LigneFacture.DoesNotExist:
                continue  # Ignore si la ligne n'existe pas

        return Response({'message': 'Lignes de facture mises à jour avec succès ✅'}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)








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
