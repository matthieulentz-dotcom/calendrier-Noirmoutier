# Cahier des charges — Calendrier partagé maison de Noirmoutier

## 1. Contexte et objectif

Application web permettant à un groupe de 6 à 7 personnes de gérer l'occupation d'une maison de vacances à Noirmoutier (Vendée). Chaque utilisateur peut déclarer ses périodes d'occupation avec deux niveaux de confirmation : option (provisoire) et réservation confirmée. Plusieurs personnes peuvent occuper la maison simultanément.

---

## 2. Utilisateurs

- **Membres** (6–7 personnes) : accès en lecture et écriture sur leurs propres réservations
- **Administrateur** (1 personne désignée) : accès complet — peut valider, modifier ou supprimer toute réservation

Pas de système d'authentification complexe : chaque utilisateur sélectionne son prénom dans une liste fixe au moment de la connexion. L'admin s'identifie par un mot de passe simple en plus du prénom.

Liste des prénoms configurée en dur dans l'application (modifiable dans le code).

---

## 3. Fonctionnalités

### 3.1 Vue calendrier

- Affichage mensuel par défaut, avec navigation mois par mois
- Vue annuelle optionnelle (aperçu des 12 mois)
- Chaque période réservée est affichée sous forme de bandeau coloré sur les jours concernés, avec le prénom du membre
- Plusieurs bandeaux peuvent se superposer sur le même jour (occupation simultanée autorisée)

### 3.2 Statuts des réservations

Deux statuts distincts, visuellement différenciés par la couleur :

| Statut | Couleur suggérée | Description |
|---|---|---|
| **Option** | Jaune / orange pâle | Période provisoire, non encore confirmée |
| **Confirmé** | Vert | Période confirmée, l'utilisateur sera présent |

### 3.3 Créer une réservation

1. L'utilisateur sélectionne une plage de dates (date de début + date de fin) via un date-picker ou en cliquant-glissant sur le calendrier
2. Il choisit le statut : Option ou Confirmé
3. Il peut ajouter une note optionnelle (ex : "avec les enfants", "week-end seulement")
4. La réservation apparaît immédiatement sur le calendrier

### 3.4 Modifier / supprimer une réservation

- Un membre peut **modifier ou supprimer uniquement ses propres réservations**
- L'admin peut **modifier ou supprimer n'importe quelle réservation**
- Un membre peut passer sa propre réservation de "Option" à "Confirmé" (et inversement)

### 3.5 Panneau d'administration

Accessible uniquement à l'admin (après saisie du mot de passe) :

- Liste de toutes les réservations avec filtres (par personne, par statut, par période)
- Boutons de modification et suppression pour chaque entrée
- Gestion de la liste des membres (ajout / suppression de prénoms)
- Réinitialisation du calendrier (suppression de toutes les réservations passées)

---

## 4. Interface

- Application **responsive** : utilisable sur ordinateur (PC/Mac) et sur smartphone (iOS/Android)
- Interface en **français**
- Pas de compte à créer, pas d'email requis — accès immédiat via sélection du prénom
- Design simple, lisible, épuré — pas besoin d'animations complexes
- Le calendrier doit être lisible d'un coup d'œil : qui est là, quand, et à quel statut

---

## 5. Stack technique recommandée (pour Claude Code)

L'application doit être réalisable et déployable via **Claude Code** sans infrastructure externe complexe.

**Option recommandée : application React + stockage local fichier JSON**

- **Frontend** : React (ou Vanilla JS/HTML/CSS si plus simple), sans framework lourd
- **Backend** : Node.js avec Express — serveur HTTP léger
- **Stockage** : fichier `data.json` local sur le serveur (pas de base de données)
- **Déploiement** : exécution locale via `node server.js` ou `npm start`, accessible sur `localhost:3000`

> Alternative acceptable si Claude Code le propose : application entièrement statique (HTML/CSS/JS) avec données stockées dans `localStorage` du navigateur — mais cette option ne permet pas le partage entre appareils.

**Pour un partage réel entre les 6–7 personnes**, le serveur Node.js avec fichier JSON est préférable, déployé sur une machine accessible (ex : un VPS, un Raspberry Pi sur le réseau local, ou un service comme Railway / Render).

---

## 6. Données stockées

Chaque réservation contient :

```json
{
  "id": "uuid",
  "membre": "Sophie",
  "debut": "2026-07-12",
  "fin": "2026-07-19",
  "statut": "option" | "confirme",
  "note": "avec les enfants",
  "createdAt": "2026-04-06T10:00:00Z"
}
```

Configuration de l'application (fichier `config.json`) :

```json
{
  "membres": ["Sophie", "Marc", "Julie", "Thomas", "Lucie", "Paul", "Anne"],
  "adminPassword": "motdepasse123"
}
```

---

## 7. Règles métier

1. **Pas de blocage automatique** : plusieurs personnes peuvent réserver les mêmes dates — c'est à l'admin (ou au groupe) de gérer les conflits éventuels
2. **Pas de limite de durée** par réservation
3. **Pas de notification automatique** (emails, push) — fonctionnalité hors scope pour la V1
4. **L'admin** est la seule personne pouvant supprimer les réservations des autres
5. Les réservations passées restent visibles (archivage implicite)

---

## 8. Hors scope (V1)

- Notifications par email ou SMS
- Authentification sécurisée (OAuth, JWT, etc.)
- Gestion des conflits automatique (blocage de dates)
- Historique des modifications
- Application mobile native (iOS/Android)
- Gestion de plusieurs maisons

---

## 9. Critères de succès

- Un membre non-technique peut créer une réservation en moins de 30 secondes
- Le calendrier est lisible sur mobile sans zoom
- Les données persistent entre les sessions (pas de perte au rechargement)
- L'admin peut gérer l'ensemble des réservations sans manipuler de fichiers manuellement
