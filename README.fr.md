# Générateur de formulaires de consultation

> Créez, validez et imprimez des formulaires de consentement pour le tatouage et le piercing. Tout fonctionne dans le navigateur : aucune donnée de santé du client ne quitte l'appareil.

[![License](https://img.shields.io/github/license/Poli-International/form-builder)](LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/Poli-International/form-builder)](https://github.com/Poli-International/form-builder/commits/master)
[![GitHub Stars](https://img.shields.io/github/stars/Poli-International/form-builder?style=social)](https://github.com/Poli-International/form-builder/stargazers)

**En ligne :** <https://poliinternational.com/form-builder/> · **Manuel :** [`documentation.html`](documentation.html)

[🇬🇧 English](README.md) · 🇫🇷 Français · [🇮🇹 Italiano](README.it.md) · [🇩🇪 Deutsch](README.de.md) · [🇪🇸 Español](README.es.md) · [🇳🇱 Nederlands](README.nl.md) · [🇵🇹 Português](README.pt.md)

![L'éditeur : palette de champs, canevas et propriétés du champ](docs/screenshots/01-drag-drop-consent-form-builder-field-properties.jpg)

---

## À quoi ça sert

Le studio choisit un modèle, le modifie sur un canevas en glisser-déposer, puis tend une tablette ou une feuille imprimée au client. Ni compte, ni serveur, ni abonnement.

- **8 modèles** — consentement tatouage, consentement piercing, questionnaire d'antécédents médicaux, accord de projet multi-séances, consentement d'un mineur avec autorisation du tuteur, évaluation de recouvrement ou de reprise, maquillage permanent et tatouage esthétique, plus un formulaire vierge.
- **17 types de champs** répartis en cinq catégories, dont une carte anatomique du corps pour marquer l'emplacement et un téléversement de pièce d'identité ou de document.
- **Logique conditionnelle** : les questions de suivi n'apparaissent que lorsqu'elles sont pertinentes.
- **Vérificateur d'intégrité des données** qui note le formulaire et signale les dépendances logiques circulaires, les champs de choix sans options, les libellés d'options en double, les bornes de validation inversées, les expressions régulières invalides et les alias CRM en double.
- **Alertes de sécurité médicale automatiques** déclenchées par les déclarations du client lui-même.
- **Capture de signature numérique** avec date de signature, et export PDF à vos couleurs.
- **Mode kiosque tablette** et affichette QR imprimable pour l'accueil.
- **Import CSV en masse** et carte des identifiants de champs (JSON / CSV / exemple de charge utile webhook) pour brancher le formulaire sur un CRM.
- **7 langues** — anglais, français, italien, allemand, espagnol, néerlandais, portugais. Le changement de langue traduit l'éditeur *et* le formulaire en cours de construction.

| | |
|---|---|
| ![Vue client avec une alerte de sécurité médicale](docs/screenshots/02-medical-safety-callouts-client-consent-view.jpg) | ![Vérificateur d'intégrité des données](docs/screenshots/03-form-data-integrity-logic-checker-diagnostics.jpg) |
| Vue client : jauge de complétion et alerte automatique déclenchée par une allergie au latex déclarée. | Vérificateur d'intégrité : diagnostics notés, avec saut vers le champ et correction rapide. |

## Confidentialité

C'est la contrainte de conception autour de laquelle tout l'outil est bâti, et elle mérite d'être précise.

La seule requête réseau de l'application est le chargement de son propre `i18n.json`. Aucune analytique, aucune télémétrie, aucun point d'envoi de formulaire. Les formulaires, les réponses des clients, les signatures et les PDF générés sont créés et conservés dans le stockage local du navigateur et ne sont jamais transmis.

Conséquences pratiques :

- Les brouillons ne se synchronisent ni entre machines ni entre navigateurs, et une fenêtre privée ne voit rien.
- Effacer les données du site les supprime définitivement. Il n'existe aucune copie côté serveur.
- Les enregistrements restant sur l'appareil, **le studio demeure le responsable du traitement**. Les obligations au titre du RGPD, du PDPA ou du droit local sur les dossiers de santé sont inchangées, et la conservation des PDF exportés relève du studio.

## Lancer l'outil

Aucune étape de compilation, aucune dépendance. Ce sont des fichiers statiques : servez le répertoire en HTTP.

```bash
git clone https://github.com/Poli-International/form-builder.git
cd form-builder
python -m http.server 8080
# puis ouvrez http://localhost:8080/
```

N'importe quel serveur statique convient (`npx serve`, `php -S`, nginx, GitHub Pages). Ouvrir `index.html` directement depuis le système de fichiers fonctionne le plus souvent, mais certains navigateurs bloquent `fetch()` sur `file://`, ce qui laisse l'interface non traduite : préférez le HTTP.

### Intégrer l'outil à votre site

```html
<iframe src="https://poliinternational.com/tools/form-builder/index.html"
        width="100%" height="1000" frameborder="0"
        style="border-radius:12px;"></iframe>
```

Ou hébergez ce dépôt vous-même et pointez l'iframe vers votre propre copie. La boîte de dialogue *Options → Intégrer / Code QR* de l'outil génère le code ainsi qu'une affichette QR imprimable.

## Bibliothèques tierces

Embarquées dans `js/vendor/` à des versions figées et servies localement plutôt que depuis un CDN, afin que l'outil fonctionne derrière une Content-Security-Policy stricte et ne casse pas lorsqu'une étiquette `@latest` amont évolue.

| Bibliothèque | Version | Rôle |
|---|---|---|
| [SortableJS](https://github.com/SortableJS/Sortable) | 1.15.6 | Glisser-déposer |
| [jsPDF](https://github.com/parallax/jsPDF) | 2.5.1 | Export PDF vectoriel |
| [signature_pad](https://github.com/szimek/signature_pad) | 4.1.7 | Capture de signature |
| [D3](https://github.com/d3/d3) | 7.9.0 | Graphique de tendance des envois |

Pour en mettre une à jour, téléchargez la nouvelle version dans `js/vendor/` et corrigez le numéro dans ce tableau. Ne remplacez pas le chemin local par une URL de CDN.

## Documentation

| Document | Contenu |
|---|---|
| [`documentation.html`](documentation.html) | Manuel utilisateur complet, également accessible dans l'application via *Options → Documentation* |
| [`docs/USER-GUIDE.md`](docs/USER-GUIDE.md) | Présentation fonctionnalité par fonctionnalité |
| [`docs/TECHNICAL-DOCS.md`](docs/TECHNICAL-DOCS.md) | Architecture, schémas de données, détail des modules |
| [`docs/TEMPLATE-GUIDE.md`](docs/TEMPLATE-GUIDE.md) | Référence du schéma des modèles, pour écrire les vôtres |

## Remarque sur les modèles

Les modèles de consentement fournis sont une **aide à la rédaction, pas un conseil juridique**. Les exigences en matière de consentement varient selon le pays, la région et la commune. Faites relire la formulation finale par une personne qualifiée dans votre juridiction avant de l'utiliser avec des clients.

Il en va de même pour les signatures électroniques : elles sont largement reconnues, mais le niveau de preuve et les obligations de conservation varient. Traitez un PDF exporté comme vous traiteriez un formulaire papier signé.

## Contribuer

Voir [CONTRIBUTING.md](CONTRIBUTING.md). Les rapports de bogues et les contributions de modèles venant de studios en activité sont particulièrement bienvenus : les modèles progressent surtout quand une personne qui gère réellement l'accueil nous dit ce qui manque.

## Licence

[MIT](LICENSE) © Poli International Ltd.

Conçu par [Poli International](https://poliinternational.com/), fabricant des bijoux corporels BioFlex®, aux côtés d'une suite d'[outils professionnels gratuits](https://poliinternational.com/tools/) pour les tatoueurs, les perçeurs et les gérants de studio.
