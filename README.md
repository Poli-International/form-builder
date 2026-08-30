# Consultation Form Builder

> Build, validate and print tattoo and piercing consent forms. Everything runs in the browser, so no client health data ever leaves the device.

[![License](https://img.shields.io/github/license/Poli-International/form-builder)](LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/Poli-International/form-builder)](https://github.com/Poli-International/form-builder/commits/master)
[![GitHub Stars](https://img.shields.io/github/stars/Poli-International/form-builder?style=social)](https://github.com/Poli-International/form-builder/stargazers)

**Live:** <https://poliinternational.com/form-builder/> · **Manual:** [`documentation.html`](documentation.html)

![The builder: field palette, canvas and field properties](docs/screenshots/01-drag-drop-consent-form-builder-field-properties.jpg)

---

## What it does

A studio picks a template, edits it on a drag-and-drop canvas, and hands a client
a tablet or a printed sheet. There is no account, no backend and no subscription.

- **8 templates** — tattoo consent, piercing consent, medical history intake,
  multi-session project agreement, minor consent with guardian authorization,
  cover-up and rework assessment, PMU and cosmetic tattoo, plus a blank form.
- **17 field types** across five categories, including an anatomical body map for
  marking placement and a photo ID / document upload.
- **Conditional logic** so follow-up questions appear only when they are relevant.
- **Data integrity checker** that scores the form and reports circular logic
  dependencies, choice fields with no options, duplicate option labels, inverted
  validation bounds, invalid regex patterns and duplicate CRM aliases.
- **Automatic medical safety callouts** raised from the client's own disclosures.
- **Digital signature capture** with signing date, and branded PDF export.
- **Tablet kiosk mode** and a printable QR placard for front-desk intake.
- **CSV bulk import** and a field-ID map (JSON / CSV / sample webhook payload) for
  wiring the form into a CRM.
- **7 languages** — English, French, Italian, German, Spanish, Dutch, Portuguese.
  Switching translates the builder *and* the form being built.

| | |
|---|---|
| ![Client view with a medical safety callout](docs/screenshots/02-medical-safety-callouts-client-consent-view.jpg) | ![Data integrity checker](docs/screenshots/03-form-data-integrity-logic-checker-diagnostics.jpg) |
| Client view: completion meter and an automatic callout from a disclosed latex allergy. | Integrity checker: scored diagnostics with jump-to-field and quick-fix. |

## Privacy

This is the design constraint the whole tool is built around, and it is worth
being precise about.

The only network request the application makes is fetching its own `i18n.json`.
There is no analytics, no telemetry, no form submission endpoint. Forms, client
answers, signatures and generated PDFs are created and stored in the browser's
local storage and never transmitted.

The practical consequences:

- Drafts do not sync between machines or browsers, and a private window sees nothing.
- Clearing site data deletes them permanently. There is no server-side copy.
- Because records stay on the device, **the studio remains the data controller**.
  Obligations under GDPR, PDPA or local health-records law are unchanged, and how
  the exported PDFs are stored is the studio's responsibility.

## Running it

No build step and no dependencies. It is static files; serve the directory over
HTTP.

```bash
git clone https://github.com/Poli-International/form-builder.git
cd form-builder
python -m http.server 8080
# then open http://localhost:8080/
```

Any static server works (`npx serve`, `php -S`, nginx, GitHub Pages). Opening
`index.html` straight off the filesystem mostly works, but browsers block
`fetch()` on `file://` in some configurations, which leaves the interface
untranslated — serve it over HTTP instead.

### Embedding it on your own site

```html
<iframe src="https://poliinternational.com/tools/form-builder/index.html"
        width="100%" height="1000" frameborder="0"
        style="border-radius:12px;"></iframe>
```

Or self-host this repository and point the iframe at your own copy. The tool's
*Options → Embed / QR Code* dialog generates both the snippet and a printable QR
placard.

## Third-party libraries

Vendored under `js/vendor/` at pinned versions and served locally rather than
from a CDN, so the tool works behind a strict Content-Security-Policy and does
not break when an upstream `@latest` tag moves.

| Library | Version | Used for |
|---|---|---|
| [SortableJS](https://github.com/SortableJS/Sortable) | 1.15.6 | Drag and drop |
| [jsPDF](https://github.com/parallax/jsPDF) | 2.5.1 | Vector PDF export |
| [signature_pad](https://github.com/szimek/signature_pad) | 4.1.7 | Signature capture |
| [D3](https://github.com/d3/d3) | 7.9.0 | Submission trend chart |

To update one, download the new build into `js/vendor/` and bump the version in
this table. Do not swap the local path for a CDN URL.

## Documentation

| Document | Contents |
|---|---|
| [`documentation.html`](documentation.html) | Full user manual, also reachable in-app from *Options → Documentation* |
| [`docs/USER-GUIDE.md`](docs/USER-GUIDE.md) | Feature-by-feature walkthrough |
| [`docs/TECHNICAL-DOCS.md`](docs/TECHNICAL-DOCS.md) | Architecture, data schemas, module breakdown |
| [`docs/TEMPLATE-GUIDE.md`](docs/TEMPLATE-GUIDE.md) | Template schema reference for authoring your own |

## A note on the templates

The bundled consent templates are a **drafting aid, not legal advice**. Consent
requirements differ by country, state and municipality. Have the final wording
reviewed by someone qualified in your jurisdiction before using it with clients.

The same applies to electronic signatures: they are widely recognised, but the
standard of proof and the record-keeping requirements vary. Treat an exported PDF
the way you would treat a signed paper form.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Bug reports and template contributions
from working studios are especially welcome — the templates improve fastest when
someone who actually runs intake tells us what is missing.

## License

[MIT](LICENSE) © Poli International Ltd.

Built by [Poli International](https://poliinternational.com/), maker of BioFlex®
body jewelry, alongside a suite of [free professional tools](https://poliinternational.com/tools/)
for tattoo artists, piercers and studio owners.
