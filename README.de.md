# Beratungs-Formulargenerator

> Einwilligungsformulare für Tätowierungen und Piercings erstellen, prüfen und drucken. Alles läuft im Browser, es verlassen also keine Gesundheitsdaten von Kundinnen und Kunden das Gerät.

[![License](https://img.shields.io/github/license/Poli-International/form-builder)](LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/Poli-International/form-builder)](https://github.com/Poli-International/form-builder/commits/master)
[![GitHub Stars](https://img.shields.io/github/stars/Poli-International/form-builder?style=social)](https://github.com/Poli-International/form-builder/stargazers)

**Live:** <https://poliinternational.com/form-builder/> · **Handbuch:** [`documentation.html`](documentation.html)

[🇬🇧 English](README.md) · [🇫🇷 Français](README.fr.md) · [🇮🇹 Italiano](README.it.md) · 🇩🇪 Deutsch · [🇪🇸 Español](README.es.md) · [🇳🇱 Nederlands](README.nl.md) · [🇵🇹 Português](README.pt.md)

![Der Editor: Feldpalette, Arbeitsfläche und Feldeigenschaften](docs/screenshots/01-drag-drop-consent-form-builder-field-properties.jpg)

---

## Was es leistet

Das Studio wählt eine Vorlage, passt sie per Drag-and-drop an und reicht der Kundschaft ein Tablet oder einen Ausdruck. Kein Konto, kein Backend, kein Abonnement.

- **8 Vorlagen** — Tätowierungs-Einwilligung, Piercing-Einwilligung, medizinische Anamnese, Rahmenvereinbarung für Projekte über mehrere Sitzungen, Einwilligung für Minderjährige mit Zustimmung der Erziehungsberechtigten, Bewertung von Cover-ups und Überarbeitungen, Permanent-Make-up und kosmetische Tätowierung sowie ein leeres Formular.
- **17 Feldtypen** in fünf Kategorien, darunter eine anatomische Körperkarte zum Markieren der Platzierung und ein Upload für Ausweis oder Dokument.
- **Bedingte Logik**, damit Folgefragen nur dann erscheinen, wenn sie relevant sind.
- **Datenintegritätsprüfung**, die das Formular bewertet und zirkuläre Logikabhängigkeiten, Auswahlfelder ohne Optionen, doppelte Optionsbezeichnungen, vertauschte Validierungsgrenzen, ungültige reguläre Ausdrücke und doppelte CRM-Aliasse meldet.
- **Automatische medizinische Sicherheitshinweise**, ausgelöst durch die Angaben der Kundschaft selbst.
- **Digitale Unterschriftserfassung** mit Datum und PDF-Export im eigenen Branding.
- **Tablet-Kioskmodus** und druckbares QR-Schild für die Aufnahme am Empfang.
- **CSV-Massenimport** und eine Feld-ID-Karte (JSON / CSV / Beispiel-Webhook-Payload), um das Formular an ein CRM anzubinden.
- **7 Sprachen** — Englisch, Französisch, Italienisch, Deutsch, Spanisch, Niederländisch, Portugiesisch. Der Sprachwechsel übersetzt den Editor *und* das gerade erstellte Formular.

| | |
|---|---|
| ![Kundenansicht mit einem medizinischen Sicherheitshinweis](docs/screenshots/02-medical-safety-callouts-client-consent-view.jpg) | ![Datenintegritätsprüfung](docs/screenshots/03-form-data-integrity-logic-checker-diagnostics.jpg) |
| Kundenansicht: Fortschrittsanzeige und automatischer Hinweis aufgrund einer angegebenen Latexallergie. | Integritätsprüfung: bewertete Diagnose mit Sprung zum Feld und Schnellkorrektur. |

## Datenschutz

Das ist die Entwurfsvorgabe, um die herum das gesamte Werkzeug gebaut ist, und sie verdient Genauigkeit.

Die einzige Netzwerkanfrage der Anwendung ist das Laden ihrer eigenen `i18n.json`. Keine Analyse, keine Telemetrie, kein Endpunkt zum Absenden. Formulare, Antworten, Unterschriften und erzeugte PDFs entstehen im lokalen Speicher des Browsers und werden nie übertragen.

Die praktischen Folgen:

- Entwürfe werden nicht zwischen Rechnern oder Browsern synchronisiert, und ein privates Fenster sieht nichts davon.
- Das Löschen der Websitedaten entfernt sie endgültig. Es gibt keine serverseitige Kopie.
- Da die Daten auf dem Gerät bleiben, **bleibt das Studio der Verantwortliche**. Pflichten nach DSGVO, PDPA oder örtlichem Gesundheitsdatenrecht ändern sich dadurch nicht, und die Aufbewahrung der exportierten PDFs liegt beim Studio.

## Ausführen

Kein Build-Schritt und keine Abhängigkeiten. Es sind statische Dateien; das Verzeichnis über HTTP ausliefern.

```bash
git clone https://github.com/Poli-International/form-builder.git
cd form-builder
python -m http.server 8080
# dann http://localhost:8080/ öffnen
```

Jeder statische Server genügt (`npx serve`, `php -S`, nginx, GitHub Pages). `index.html` direkt aus dem Dateisystem zu öffnen funktioniert meist, aber manche Browser blockieren `fetch()` auf `file://`, wodurch die Oberfläche unübersetzt bleibt — besser über HTTP ausliefern.

### Auf der eigenen Website einbetten

```html
<iframe src="https://poliinternational.com/tools/form-builder/index.html"
        width="100%" height="1000" frameborder="0"
        style="border-radius:12px;"></iframe>
```

Oder dieses Repository selbst hosten und den iframe auf die eigene Kopie richten. Der Dialog *Optionen → Einbetten / QR-Code* erzeugt sowohl den Codeausschnitt als auch ein druckbares QR-Schild.

## Bibliotheken von Drittanbietern

Unter `js/vendor/` in festen Versionen mitgeliefert und lokal statt über ein CDN ausgeliefert, damit das Werkzeug hinter einer strengen Content-Security-Policy funktioniert und nicht bricht, wenn sich ein `@latest`-Tag stromaufwärts ändert.

| Bibliothek | Version | Verwendet für |
|---|---|---|
| [SortableJS](https://github.com/SortableJS/Sortable) | 1.15.6 | Drag-and-drop |
| [jsPDF](https://github.com/parallax/jsPDF) | 2.5.1 | Vektor-PDF-Export |
| [signature_pad](https://github.com/szimek/signature_pad) | 4.1.7 | Unterschriftserfassung |
| [D3](https://github.com/d3/d3) | 7.9.0 | Diagramm der Eingangsentwicklung |

Zum Aktualisieren den neuen Build nach `js/vendor/` laden und die Version in dieser Tabelle anpassen. Den lokalen Pfad nicht durch eine CDN-URL ersetzen.

## Dokumentation

| Dokument | Inhalt |
|---|---|
| [`documentation.html`](documentation.html) | Vollständiges Benutzerhandbuch, auch in der Anwendung über *Optionen → Dokumentation* erreichbar |
| [`docs/USER-GUIDE.md`](docs/USER-GUIDE.md) | Rundgang Funktion für Funktion |
| [`docs/TECHNICAL-DOCS.md`](docs/TECHNICAL-DOCS.md) | Architektur, Datenschemata, Modulübersicht |
| [`docs/TEMPLATE-GUIDE.md`](docs/TEMPLATE-GUIDE.md) | Schemareferenz zum Erstellen eigener Vorlagen |

## Hinweis zu den Vorlagen

Die mitgelieferten Einwilligungsvorlagen sind eine **Formulierungshilfe, keine Rechtsberatung**. Die Anforderungen unterscheiden sich nach Land, Bundesland und Gemeinde. Lassen Sie den endgültigen Wortlaut vor dem Einsatz von einer in Ihrer Rechtsordnung qualifizierten Person prüfen.

Dasselbe gilt für elektronische Unterschriften: Sie sind weithin anerkannt, aber Beweismaß und Aufbewahrungspflichten unterscheiden sich. Behandeln Sie ein exportiertes PDF wie ein unterschriebenes Papierformular.

## Mitwirken

Siehe [CONTRIBUTING.md](CONTRIBUTING.md). Fehlerberichte und Vorlagenbeiträge aus dem laufenden Studiobetrieb sind besonders willkommen: Die Vorlagen werden am schnellsten besser, wenn jemand, der die Aufnahme tatsächlich macht, uns sagt, was fehlt.

## Lizenz

[MIT](LICENSE) © Poli International Ltd.

Entwickelt von [Poli International](https://poliinternational.com/), Hersteller des BioFlex®-Körperschmucks, neben einer Reihe [kostenloser Profi-Werkzeuge](https://poliinternational.com/tools/) für Tätowierer, Piercer und Studioinhaber.
