# GRH - Gestion des congés et absences

Application web simple de gestion des congés et absences pour les employés.

## Stack technique

- **Frontend** : Vue 3 (Composition API + `<script setup>`), Vite, Vue Router
- **Backend** : Node.js, Express, JWT
- **Base de données** : MongoDB (Mongoose)

## Structure du projet

```
GRH/
├── frontend/   # Application Vue 3
└── backend/    # API Express
```

## Prérequis

- Node.js (v18 ou plus)
- MongoDB (local ou distant, ex: MongoDB Atlas)

## Lancer le backend

```bash
cd backend
cp .env.example .env
```

Remplir `.env` avec votre URI MongoDB et un secret JWT, puis :

```bash
npm install
npm run dev
```

Le serveur démarre par défaut sur `http://localhost:5000`.

## Lancer le frontend

```bash
cd frontend
npm install
npm run dev
```

L'application est accessible sur `http://localhost:5173`.

## Créer un compte de test

Aucune page d'inscription n'existe encore côté interface. Pour créer un premier utilisateur, envoyez une requête vers la route d'inscription :

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nom":"Jean Dupont","email":"jean@example.com","password":"123456","role":"employe"}'
```

Connectez-vous ensuite sur `/login` avec cet email et ce mot de passe.

## Fonctionnalités actuelles

- Connexion (JWT)
- Tableau de bord employé (soldes de congés + demandes récentes)
- Création d'une nouvelle demande de congé (calcul automatique des jours ouvrés)
- Liste des demandes de l'employé connecté

Les espaces manager, RH et le calendrier ne sont pas encore développés.
