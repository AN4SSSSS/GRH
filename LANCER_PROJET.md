## 1. MongoDB

```
brew services start mongodb-community
```

## 2. Backend Express

```
cd backend
npm run dev
```

## 3. Frontend Vue

```
cd frontend
npm run dev
```

## URLs
- Frontend : http://localhost:5175
- Backend API : http://localhost:5001/api

## Comptes test
Connexion par nom d'utilisateur (pas email) :
- Manager1 : manager1 / pass123 → équipe : test1, test2
- Manager2 : manager2 / pass123 → équipe : test3, test4
- Employé test1 / pass123 (équipe manager1)
- Employé test2 / pass123 (équipe manager1)
- Employé test3 / pass123 (équipe manager2)
- Employé test4 / pass123 (équipe manager2)
- RH : rh / pass123
- Admin (gestion du site, comptes, BD) : admin / pass123

## Voir la base de données
MongoDB Compass → connexion : `mongodb://localhost:27017/grh`
