# Gerador de formulários de consulta

> Crie, valide e imprima formulários de consentimento para tatuagem e piercing. Tudo roda no navegador, portanto nenhum dado de saúde do cliente sai do dispositivo.

[![License](https://img.shields.io/github/license/Poli-International/form-builder)](LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/Poli-International/form-builder)](https://github.com/Poli-International/form-builder/commits/master)
[![GitHub Stars](https://img.shields.io/github/stars/Poli-International/form-builder?style=social)](https://github.com/Poli-International/form-builder/stargazers)

**No ar:** <https://poliinternational.com/form-builder/> · **Manual:** [`documentation.html`](documentation.html)

[🇬🇧 English](README.md) · [🇫🇷 Français](README.fr.md) · [🇮🇹 Italiano](README.it.md) · [🇩🇪 Deutsch](README.de.md) · [🇪🇸 Español](README.es.md) · [🇳🇱 Nederlands](README.nl.md) · 🇵🇹 Português

![O editor: paleta de campos, área de trabalho e propriedades do campo](docs/screenshots/01-drag-drop-consent-form-builder-field-properties.jpg)

---

## O que ele faz

O estúdio escolhe um modelo, edita em uma área de arrastar e soltar e entrega ao cliente um tablet ou uma folha impressa. Sem conta, sem servidor e sem assinatura.

- **8 modelos** — consentimento de tatuagem, consentimento de piercing, anamnese médica, acordo de projeto em várias sessões, consentimento de menor com autorização do responsável, avaliação de cobertura e retrabalho, maquiagem definitiva e tatuagem cosmética, além de um formulário em branco.
- **17 tipos de campo** em cinco categorias, incluindo um mapa anatômico do corpo para marcar a posição e o envio de documento de identidade.
- **Lógica condicional** para que as perguntas de acompanhamento apareçam apenas quando forem pertinentes.
- **Verificador de integridade de dados** que pontua o formulário e relata dependências lógicas circulares, campos de escolha sem opções, rótulos de opção duplicados, limites de validação invertidos, expressões regulares inválidas e aliases de CRM duplicados.
- **Alertas automáticos de segurança médica**, gerados a partir das próprias declarações do cliente.
- **Captura de assinatura digital** com data e exportação em PDF com a sua marca.
- **Modo quiosque em tablet** e cartaz QR imprimível para a recepção.
- **Importação em massa por CSV** e mapa de IDs de campo (JSON / CSV / exemplo de payload de webhook) para integrar o formulário a um CRM.
- **7 idiomas** — inglês, francês, italiano, alemão, espanhol, holandês e português. Trocar de idioma traduz o editor *e* o formulário que está sendo montado.

| | |
|---|---|
| ![Visão do cliente com um alerta de segurança médica](docs/screenshots/02-medical-safety-callouts-client-consent-view.jpg) | ![Verificador de integridade de dados](docs/screenshots/03-form-data-integrity-logic-checker-diagnostics.jpg) |
| Visão do cliente: medidor de conclusão e alerta automático gerado por uma alergia a látex declarada. | Verificador de integridade: diagnóstico pontuado, com ir para o campo e correção rápida. |

## Privacidade

Esta é a restrição de projeto em torno da qual toda a ferramenta foi construída, e vale a pena ser preciso.

A única requisição de rede da aplicação é o carregamento do seu próprio `i18n.json`. Sem análise de uso, sem telemetria e sem endpoint de envio. Formulários, respostas dos clientes, assinaturas e PDFs gerados são criados e guardados no armazenamento local do navegador e nunca são transmitidos.

As consequências práticas:

- Os rascunhos não sincronizam entre máquinas ou navegadores, e uma janela anônima não vê nada.
- Limpar os dados do site os apaga em definitivo. Não existe cópia no servidor.
- Como os registros permanecem no dispositivo, **o estúdio continua sendo o controlador dos dados**. As obrigações sob a LGPD, o GDPR, a PDPA ou a legislação local de prontuários não mudam, e a guarda dos PDFs exportados é responsabilidade do estúdio.

## Como executar

Sem etapa de build e sem dependências. São arquivos estáticos: sirva o diretório por HTTP.

```bash
git clone https://github.com/Poli-International/form-builder.git
cd form-builder
python -m http.server 8080
# depois abra http://localhost:8080/
```

Qualquer servidor estático serve (`npx serve`, `php -S`, nginx, GitHub Pages). Abrir `index.html` direto do sistema de arquivos costuma funcionar, mas alguns navegadores bloqueiam `fetch()` em `file://`, o que deixa a interface sem tradução — prefira servir por HTTP.

### Incorporar no seu próprio site

```html
<iframe src="https://poliinternational.com/tools/form-builder/index.html"
        width="100%" height="1000" frameborder="0"
        style="border-radius:12px;"></iframe>
```

Ou hospede este repositório você mesmo e aponte o iframe para a sua cópia. A caixa *Opções → Incorporar / Código QR* da ferramenta gera tanto o trecho quanto um cartaz QR imprimível.

## Bibliotecas de terceiros

Incluídas em `js/vendor/` com versões fixadas e servidas localmente em vez de por um CDN, para que a ferramenta funcione atrás de uma Content-Security-Policy restritiva e não quebre quando uma tag `@latest` muda na origem.

| Biblioteca | Versão | Usada para |
|---|---|---|
| [SortableJS](https://github.com/SortableJS/Sortable) | 1.15.6 | Arrastar e soltar |
| [jsPDF](https://github.com/parallax/jsPDF) | 2.5.1 | Exportação de PDF vetorial |
| [signature_pad](https://github.com/szimek/signature_pad) | 4.1.7 | Captura de assinatura |
| [D3](https://github.com/d3/d3) | 7.9.0 | Gráfico de tendência de envios |

Para atualizar uma delas, baixe a nova versão em `js/vendor/` e ajuste o número nesta tabela. Não troque o caminho local por uma URL de CDN.

## Documentação

| Documento | Conteúdo |
|---|---|
| [`documentation.html`](documentation.html) | Manual do usuário completo, também acessível no aplicativo em *Opções → Documentação* |
| [`docs/USER-GUIDE.md`](docs/USER-GUIDE.md) | Passo a passo recurso por recurso |
| [`docs/TECHNICAL-DOCS.md`](docs/TECHNICAL-DOCS.md) | Arquitetura, esquemas de dados e detalhamento dos módulos |
| [`docs/TEMPLATE-GUIDE.md`](docs/TEMPLATE-GUIDE.md) | Referência do esquema de modelos para criar os seus |

## Uma observação sobre os modelos

Os modelos de consentimento incluídos são um **apoio à redação, não aconselhamento jurídico**. As exigências variam por país, estado e município. Peça a revisão do texto final a alguém qualificado na sua jurisdição antes de usá-lo com clientes.

O mesmo vale para assinaturas eletrônicas: são amplamente reconhecidas, mas o padrão de prova e as exigências de guarda variam. Trate um PDF exportado como trataria um formulário de papel assinado.

## Como contribuir

Veja [CONTRIBUTING.md](CONTRIBUTING.md). Relatos de bugs e contribuições de modelos vindos de estúdios em operação são especialmente bem-vindos: os modelos melhoram mais rápido quando quem de fato faz a recepção nos diz o que está faltando.

## Licença

[MIT](LICENSE) © Poli International Ltd.

Feito pela [Poli International](https://poliinternational.com/), fabricante das joias corporais BioFlex®, ao lado de um conjunto de [ferramentas profissionais gratuitas](https://poliinternational.com/tools/) para tatuadores, body piercers e donos de estúdio.
