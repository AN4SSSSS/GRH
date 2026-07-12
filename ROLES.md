# Rôles et fonctionnalités

## Employé
- Consulter son tableau de bord (soldes de congés par type)
- Faire une nouvelle demande de congé (calcul auto des jours ouvrés)
- Vérification automatique du solde disponible avant envoi
- Consulter l'historique de ses demandes (avec filtres statut/type)
- Annuler une demande en attente ou déjà approuvée
- Consulter le calendrier des absences de ses collègues (même manager)
- Consulter et modifier sa fiche profil (téléphone), voir/ajouter ses documents (CV, CIN, contrat...)

## Manager
- Valider ou refuser les demandes de son équipe (commentaire obligatoire si refus)
- Blocage automatique si trop de membres de l'équipe sont absents en même temps (quota configurable)
- Consulter les soldes de congés de chaque membre de son équipe
- Consulter le calendrier des absences de son équipe
- Consulter et modifier sa fiche profil

## RH
- Gérer les employés/managers/RH : liste, création de comptes, modification de fiche, désactivation
- Consulter et modifier la fiche de n'importe quel employé/manager/RH (accès complet)
- Tableau de bord global : indicateurs (comptes actifs, demandes par statut), répartition par type de congé
- Exporter les demandes en CSV
- Paramétrer les types de congés (libellé, solde annuel)
- Paramétrer les jours fériés
- Paramétrer le quota d'absents simultanés
- Consulter le calendrier des absences de toute l'entreprise
- **Ne peut pas** voir, modifier, désactiver ou créer un compte admin (protégé, réservé à l'admin)

## Admin
- Tout ce que fait le RH (employés, paramétrage, calendrier global)
- Gérer TOUS les comptes, y compris manager/RH/admin (le RH ne gère que les employés)
- Changer le rôle de n'importe quel compte
- Supprimer définitivement un compte (le RH peut seulement désactiver)
- Tableau de bord système : nombre de comptes par rôle, demandes par statut, état de connexion MongoDB, uptime serveur

## Commun aux 4 rôles
- Connexion par nom d'utilisateur + mot de passe (JWT)
- Chaque rôle ne voit que ses propres pages (sidebar + garde de navigation + API protégée par rôle)
