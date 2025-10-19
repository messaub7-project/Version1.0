# messAub

**messAub** est une application web de gestion d'événements et de messagerie en temps réel avec Firebase. Elle propose une interface pour les **administrateurs** et les **utilisateurs**, permettant de créer des événements, envoyer et lire des messages, tout en respectant la confidentialité des utilisateurs.

---

## Fonctionnalités

### Côté Administrateur
- Création et suppression d'événements.
- Consultation des messages de tous les utilisateurs pour chaque événement.
- Affichage des adresses e-mails des utilisateurs ou possibilité de les masquer (option “Masquer/afficher emails”).
- Bouton **Voir messages** pour lire les messages d’un événement spécifique.
- Gestion professionnelle des messages (messages supprimés affichés en gris).

### Côté Utilisateur
- Consultation des événements disponibles.
- Envoi de messages uniquement après avoir sélectionné un événement.
- Les messages et adresses e-mails apparaissent barrés pour préserver la confidentialité.
- Messages en temps réel avec mise à jour instantanée.

### Commun
- Authentification avec Firebase (Inscription / Connexion / Déconnexion).
- Gestion des messages en temps réel via Firestore.
- Responsive design optimisé pour mobile et desktop.
- Masquage dynamique des e-mails côté administrateur.

---

## Installation

1. Cloner le dépôt :

```bash
git clone https://github.com/<votre-utilisateur>/messAub.git
