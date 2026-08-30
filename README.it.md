# Generatore di moduli di consultazione

> Crea, valida e stampa moduli di consenso per tatuaggi e piercing. Tutto gira nel browser: nessun dato sanitario del cliente lascia il dispositivo.

[![License](https://img.shields.io/github/license/Poli-International/form-builder)](LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/Poli-International/form-builder)](https://github.com/Poli-International/form-builder/commits/master)
[![GitHub Stars](https://img.shields.io/github/stars/Poli-International/form-builder?style=social)](https://github.com/Poli-International/form-builder/stargazers)

**Online:** <https://poliinternational.com/form-builder/> · **Manuale:** [`documentation.html`](documentation.html)

[🇬🇧 English](README.md) · [🇫🇷 Français](README.fr.md) · 🇮🇹 Italiano · [🇩🇪 Deutsch](README.de.md) · [🇪🇸 Español](README.es.md) · [🇳🇱 Nederlands](README.nl.md) · [🇵🇹 Português](README.pt.md)

![L'editor: palette dei campi, area di lavoro e proprietà del campo](docs/screenshots/01-drag-drop-consent-form-builder-field-properties.jpg)

---

## Che cosa fa

Lo studio sceglie un modello, lo modifica su un'area di lavoro drag-and-drop e consegna al cliente un tablet o un foglio stampato. Nessun account, nessun backend, nessun abbonamento.

- **8 modelli** — consenso tatuaggio, consenso piercing, anamnesi medica, accordo per progetti multi-sessione, consenso per minori con autorizzazione del tutore, valutazione di coperture e rilavorazioni, trucco permanente e tatuaggio estetico, più un modulo vuoto.
- **17 tipi di campo** in cinque categorie, tra cui una mappa anatomica del corpo per segnare la posizione e il caricamento di un documento d'identità.
- **Logica condizionale**: le domande di approfondimento compaiono solo quando sono pertinenti.
- **Verifica dell'integrità dei dati** che assegna un punteggio al modulo e segnala dipendenze logiche circolari, campi a scelta senza opzioni, etichette di opzione duplicate, limiti di validazione invertiti, espressioni regolari non valide e alias CRM duplicati.
- **Avvisi di sicurezza clinica automatici**, generati dalle dichiarazioni del cliente stesso.
- **Acquisizione della firma digitale** con data, ed esportazione PDF personalizzata con il vostro marchio.
- **Modalità chiosco su tablet** e cartello QR stampabile per l'accettazione alla reception.
- **Importazione CSV in blocco** e mappa degli ID dei campi (JSON / CSV / payload webhook di esempio) per collegare il modulo a un CRM.
- **7 lingue** — inglese, francese, italiano, tedesco, spagnolo, olandese, portoghese. Cambiare lingua traduce l'editor *e* il modulo che si sta costruendo.

| | |
|---|---|
| ![Vista cliente con un avviso di sicurezza clinica](docs/screenshots/02-medical-safety-callouts-client-consent-view.jpg) | ![Verifica dell'integrità dei dati](docs/screenshots/03-form-data-integrity-logic-checker-diagnostics.jpg) |
| Vista cliente: indicatore di completamento e avviso automatico generato da un'allergia al lattice dichiarata. | Verifica dell'integrità: diagnostica con punteggio, salto al campo e correzione rapida. |

## Riservatezza

È il vincolo progettuale attorno a cui è costruito l'intero strumento, e vale la pena essere precisi.

L'unica richiesta di rete dell'applicazione è il caricamento del proprio `i18n.json`. Nessuna analitica, nessuna telemetria, nessun endpoint di invio. Moduli, risposte dei clienti, firme e PDF generati vengono creati e conservati nella memoria locale del browser e non vengono mai trasmessi.

Conseguenze pratiche:

- Le bozze non si sincronizzano tra macchine o browser e una finestra anonima non vede nulla.
- Cancellare i dati del sito le elimina definitivamente. Non esiste alcuna copia lato server.
- Poiché i dati restano sul dispositivo, **lo studio rimane il titolare del trattamento**. Gli obblighi previsti da GDPR, PDPA o dalla normativa locale sui dati sanitari non cambiano, e la conservazione dei PDF esportati è responsabilità dello studio.

## Come avviarlo

Nessuna fase di build e nessuna dipendenza. Sono file statici: servi la cartella via HTTP.

```bash
git clone https://github.com/Poli-International/form-builder.git
cd form-builder
python -m http.server 8080
# poi apri http://localhost:8080/
```

Va bene qualsiasi server statico (`npx serve`, `php -S`, nginx, GitHub Pages). Aprire `index.html` direttamente dal filesystem di solito funziona, ma alcuni browser bloccano `fetch()` su `file://`, lasciando l'interfaccia non tradotta: meglio servirlo via HTTP.

### Incorporarlo nel tuo sito

```html
<iframe src="https://poliinternational.com/tools/form-builder/index.html"
        width="100%" height="1000" frameborder="0"
        style="border-radius:12px;"></iframe>
```

Oppure ospita tu stesso questo repository e punta l'iframe alla tua copia. La finestra *Opzioni → Incorpora / Codice QR* dello strumento genera sia il codice sia un cartello QR stampabile.

## Librerie di terze parti

Incluse in `js/vendor/` a versioni fissate e servite localmente anziché da un CDN, così che lo strumento funzioni dietro una Content-Security-Policy restrittiva e non si rompa quando un tag `@latest` a monte cambia.

| Libreria | Versione | Usata per |
|---|---|---|
| [SortableJS](https://github.com/SortableJS/Sortable) | 1.15.6 | Drag and drop |
| [jsPDF](https://github.com/parallax/jsPDF) | 2.5.1 | Esportazione PDF vettoriale |
| [signature_pad](https://github.com/szimek/signature_pad) | 4.1.7 | Acquisizione firma |
| [D3](https://github.com/d3/d3) | 7.9.0 | Grafico dell'andamento degli invii |

Per aggiornarne una, scarica la nuova build in `js/vendor/` e aggiorna la versione in questa tabella. Non sostituire il percorso locale con un URL di CDN.

## Documentazione

| Documento | Contenuto |
|---|---|
| [`documentation.html`](documentation.html) | Manuale utente completo, raggiungibile anche nell'app da *Opzioni → Documentazione* |
| [`docs/USER-GUIDE.md`](docs/USER-GUIDE.md) | Panoramica funzione per funzione |
| [`docs/TECHNICAL-DOCS.md`](docs/TECHNICAL-DOCS.md) | Architettura, schemi dati, dettaglio dei moduli |
| [`docs/TEMPLATE-GUIDE.md`](docs/TEMPLATE-GUIDE.md) | Riferimento dello schema dei modelli per crearne di propri |

## Una nota sui modelli

I modelli di consenso inclusi sono un **ausilio alla stesura, non una consulenza legale**. I requisiti di consenso variano per paese, regione e comune. Fai rivedere il testo finale da una persona qualificata nella tua giurisdizione prima di usarlo con i clienti.

Lo stesso vale per le firme elettroniche: sono ampiamente riconosciute, ma lo standard probatorio e gli obblighi di conservazione variano. Tratta un PDF esportato come tratteresti un modulo cartaceo firmato.

## Contribuire

Vedi [CONTRIBUTING.md](CONTRIBUTING.md). Segnalazioni di bug e contributi ai modelli da studi realmente operativi sono particolarmente graditi: i modelli migliorano più in fretta quando chi gestisce davvero l'accettazione ci dice che cosa manca.

## Licenza

[MIT](LICENSE) © Poli International Ltd.

Realizzato da [Poli International](https://poliinternational.com/), produttore dei gioielli per il corpo BioFlex®, insieme a una suite di [strumenti professionali gratuiti](https://poliinternational.com/tools/) per tatuatori, piercer e titolari di studio.
