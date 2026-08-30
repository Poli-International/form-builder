# Contributing to the Consultation Form Builder

Thank you for your interest in contributing to the Consultation Form Builder! This tool is part of the Poli International Widget Suite, built for the body art community.

## 🎯 Ways to Contribute

### 1. New Form Components

Add more useful form elements for artists and piercers.

### 2. Form Templates

Submit new templates for common studio documents.

### 3. Report Bugs

Found a bug? Please open an issue.

## 🛠️ Development Setup

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/Poli-International/form-builder.git
   cd form-builder
   ```

2. **No build process**
   Pure HTML/CSS/JS with no dependencies to install. Serve the directory over
   HTTP and open it:

   ```bash
   python -m http.server 8080   # then http://localhost:8080/
   ```

   Serve it rather than opening `index.html` off the filesystem: some browsers
   block `fetch()` on `file://`, which leaves the interface untranslated.

---

## Two hard rules

These are easy to break by accident and both would undo the point of the tool.

1. **Never add a network request.** The only fetch in the application is its own
   `i18n.json`. No analytics, no telemetry, no submission endpoint, no font or
   script loaded from a third party at runtime. Client health data staying on the
   device is the promise the tool is built on, and it is stated on the
   client-facing form itself.

2. **Never replace a vendored library with a CDN URL.** `js/vendor/` exists
   because the deployment runs under a Content-Security-Policy that permits
   scripts from `'self'` only. A CDN `<script>` is silently blocked in
   production, which previously took out drag-and-drop, PDF export, signature
   capture and the analytics chart at once. Pin exact versions; never `@latest`.

## Adding or changing translated text

Strings live in `i18n.json` under seven language keys. When you add one:

- Add the key to **all seven** languages, not just `en`.
- Keep the `{placeholder}` tokens identical across languages, and make sure the
  name you pass in code matches the token in the string. A mismatch renders the
  raw `{token}` to the user.
- Field labels inside templates are translated separately, through the
  string-keyed dictionary in `js/form-translator.js`. If you change a label in
  `js/templates.js` you must change the matching key there in the same commit,
  or that string silently stops translating.

---

**Part of:** [Poli International Widget Suite](https://poliinternational.com/tools/)  
**License:** MIT  
**Maintained by:** Poli International Co., Ltd.
