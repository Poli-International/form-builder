# Generador de formularios de consulta

> Cree, valide e imprima formularios de consentimiento para tatuaje y perforación. Todo funciona en el navegador, de modo que ningún dato de salud del cliente sale del dispositivo.

[![License](https://img.shields.io/github/license/Poli-International/form-builder)](LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/Poli-International/form-builder)](https://github.com/Poli-International/form-builder/commits/master)
[![GitHub Stars](https://img.shields.io/github/stars/Poli-International/form-builder?style=social)](https://github.com/Poli-International/form-builder/stargazers)

**En línea:** <https://poliinternational.com/form-builder/> · **Manual:** [`documentation.html`](documentation.html)

[🇬🇧 English](README.md) · [🇫🇷 Français](README.fr.md) · [🇮🇹 Italiano](README.it.md) · [🇩🇪 Deutsch](README.de.md) · 🇪🇸 Español · [🇳🇱 Nederlands](README.nl.md) · [🇵🇹 Português](README.pt.md)

![El editor: paleta de campos, lienzo y propiedades del campo](docs/screenshots/01-drag-drop-consent-form-builder-field-properties.jpg)

---

## Qué hace

El estudio elige una plantilla, la edita en un lienzo de arrastrar y soltar, y le entrega al cliente una tableta o una hoja impresa. Sin cuenta, sin servidor y sin suscripción.

- **8 plantillas** — consentimiento de tatuaje, consentimiento de perforación, historial médico, acuerdo de proyecto de varias sesiones, consentimiento de menores con autorización del tutor, evaluación de cobertura y retoque, micropigmentación y tatuaje cosmético, más un formulario en blanco.
- **17 tipos de campo** en cinco categorías, incluido un mapa anatómico del cuerpo para marcar la ubicación y la carga de documento de identidad.
- **Lógica condicional** para que las preguntas de seguimiento aparezcan solo cuando son pertinentes.
- **Verificador de integridad de datos** que puntua el formulario e informa de dependencias lógicas circulares, campos de elección sin opciones, etiquetas de opción duplicadas, límites de validación invertidos, expresiones regulares no válidas y alias de CRM duplicados.
- **Avisos de seguridad médica automáticos**, generados a partir de las propias declaraciones del cliente.
- **Captura de firma digital** con fecha, y exportación a PDF con su marca.
- **Modo quiosco en tableta** y cartel QR imprimible para la recepción.
- **Importación masiva por CSV** y mapa de identificadores de campo (JSON / CSV / carga útil de webhook de ejemplo) para conectar el formulario a un CRM.
- **7 idiomas** — inglés, francés, italiano, alemán, español, neerlandés y portugués. Cambiar de idioma traduce el editor *y* el formulario que se está construyendo.

| | |
|---|---|
| ![Vista del cliente con un aviso de seguridad médica](docs/screenshots/02-medical-safety-callouts-client-consent-view.jpg) | ![Verificador de integridad de datos](docs/screenshots/03-form-data-integrity-logic-checker-diagnostics.jpg) |
| Vista del cliente: medidor de finalización y aviso automático generado por una alergia al látex declarada. | Verificador de integridad: diagnóstico puntuado, con salto al campo y corrección rápida. |

## Privacidad

Esta es la restricción de diseño sobre la que se construye toda la herramienta, y conviene ser preciso.

La única petición de red de la aplicación es la carga de su propio `i18n.json`. Sin analítica, sin telemetría y sin punto de envío. Los formularios, las respuestas de los clientes, las firmas y los PDF generados se crean y se guardan en el almacenamiento local del navegador y nunca se transmiten.

Consecuencias prácticas:

- Los borradores no se sincronizan entre equipos ni navegadores, y una ventana privada no ve nada.
- Borrar los datos del sitio los elimina de forma permanente. No existe copia en el servidor.
- Como los registros permanecen en el dispositivo, **el estudio sigue siendo el responsable del tratamiento**. Las obligaciones derivadas del RGPD, la PDPA o la normativa local sobre historiales de salud no cambian, y la conservación de los PDF exportados corresponde al estudio.

## Cómo ejecutarlo

Sin paso de compilación y sin dependencias. Son archivos estáticos: sirva el directorio por HTTP.

```bash
git clone https://github.com/Poli-International/form-builder.git
cd form-builder
python -m http.server 8080
# después abra http://localhost:8080/
```

Sirve cualquier servidor estático (`npx serve`, `php -S`, nginx, GitHub Pages). Abrir `index.html` directamente desde el sistema de archivos suele funcionar, pero algunos navegadores bloquean `fetch()` en `file://`, lo que deja la interfaz sin traducir: mejor servirlo por HTTP.

### Incrustarlo en su propio sitio

```html
<iframe src="https://poliinternational.com/tools/form-builder/index.html"
        width="100%" height="1000" frameborder="0"
        style="border-radius:12px;"></iframe>
```

O aloje usted mismo este repositorio y apunte el iframe a su propia copia. El diálogo *Opciones → Incrustar / Código QR* genera tanto el fragmento como un cartel QR imprimible.

## Bibliotecas de terceros

Incluidas en `js/vendor/` con versiones fijadas y servidas localmente en lugar de desde un CDN, para que la herramienta funcione tras una Content-Security-Policy estricta y no se rompa cuando una etiqueta `@latest` cambia río arriba.

| Biblioteca | Versión | Se usa para |
|---|---|---|
| [SortableJS](https://github.com/SortableJS/Sortable) | 1.15.6 | Arrastrar y soltar |
| [jsPDF](https://github.com/parallax/jsPDF) | 2.5.1 | Exportación a PDF vectorial |
| [signature_pad](https://github.com/szimek/signature_pad) | 4.1.7 | Captura de firma |
| [D3](https://github.com/d3/d3) | 7.9.0 | Gráfico de tendencia de envíos |

Para actualizar una, descargue la nueva compilación en `js/vendor/` y corrija la versión en esta tabla. No sustituya la ruta local por una URL de CDN.

## Documentación

| Documento | Contenido |
|---|---|
| [`documentation.html`](documentation.html) | Manual de usuario completo, también accesible en la aplicación desde *Opciones → Documentación* |
| [`docs/USER-GUIDE.md`](docs/USER-GUIDE.md) | Recorrido función por función |
| [`docs/TECHNICAL-DOCS.md`](docs/TECHNICAL-DOCS.md) | Arquitectura, esquemas de datos y desglose de módulos |
| [`docs/TEMPLATE-GUIDE.md`](docs/TEMPLATE-GUIDE.md) | Referencia del esquema de plantillas para crear las suyas |

## Una nota sobre las plantillas

Las plantillas de consentimiento incluidas son una **ayuda a la redacción, no asesoramiento jurídico**. Los requisitos varían según el país, la región y el municipio. Haga revisar la redacción final por alguien cualificado en su jurisdicción antes de usarla con clientes.

Lo mismo se aplica a las firmas electrónicas: están ampliamente reconocidas, pero el estándar probatorio y los requisitos de conservación varían. Trate un PDF exportado como trataría un formulario en papel firmado.

## Contribuir

Consulte [CONTRIBUTING.md](CONTRIBUTING.md). Los informes de errores y las aportaciones de plantillas desde estudios en activo son especialmente bienvenidos: las plantillas mejoran más rápido cuando quien realmente gestiona la recepción nos dice qué falta.

## Licencia

[MIT](LICENSE) © Poli International Ltd.

Creado por [Poli International](https://poliinternational.com/), fabricante de la joyería corporal BioFlex®, junto a un conjunto de [herramientas profesionales gratuitas](https://poliinternational.com/tools/) para tatuadores, perforadores y titulares de estudio.
