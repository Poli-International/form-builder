/**
 * Poli International - Studio Consultation Form Automated Translator
 * Translates Form Schema (Titles, Labels, Placeholders, Descriptions, Options, Help Texts)
 * Supports: English (en), French (fr), Italian (it), German (de), Spanish (es), Dutch (nl), Portuguese (pt)
 */

(function () {
    'use strict';

    const TRANSLATION_DICTIONARY = {
    "Address, Phone, Email & Permit #": {
        "en": "Address, Phone, Email & Permit #",
        "fr": "Adresse, Téléphone, Email & N° d'autorisation",
        "it": "Indirizzo, Telefono, Email e N° di autorizzazione",
        "de": "Adresse, Telefon, E-Mail & Genehmigungs-Nr.",
        "es": "Dirección, Teléfono, Correo y N° de permiso",
        "nl": "Adres, Telefoon, E-mail & Vergunning nr.",
        "pt": "Endereço, Telefone, E-mail e N° de licença"
},
    "Physician Name, Clinic & Clearance Date": {
        "en": "Physician Name, Clinic & Clearance Date",
        "fr": "Nom du médecin, Clinique & Date d'autorisation",
        "it": "Nome del medico, Clinica e Data di autorizzazione",
        "de": "Arztname, Klinik & Datum der Freigabe",
        "es": "Nombre del médico, Clínica y Fecha de autorización",
        "nl": "Naam arts, Kliniek & Datum goedkeuring",
        "pt": "Nome do médico, Clínica e Data de autorização"
},
    "Tattoo Design & Procedure Specifications": {
        "en": "Tattoo Design & Procedure Specifications",
        "fr": "Spécifications du motif et de la procédure de tatouage",
        "it": "Specifiche del disegno e della procedura del tatuaggio",
        "de": "Spezifikationen für Tattoo-Design & Verfahren",
        "es": "Especificaciones del diseño y procedimiento de tatuaje",
        "nl": "Specificaties voor tattoo-ontwerp & procedure",
        "pt": "Especificações do desenho e procedimento de tatuagem"
},
    "Description of Tattoo Design / Concept": {
        "en": "Description of Tattoo Design / Concept",
        "fr": "Description du motif / concept de tatouage",
        "it": "Descrizione del disegno / concetto del tatuaggio",
        "de": "Beschreibung des Tattoo-Designs / Konzepts",
        "es": "Descripción del diseño / concepto del tatuaje",
        "nl": "Beschrijving van tattoo-ontwerp / concept",
        "pt": "Descrição do desenho / conceito da tatuagem"
},
    "Exact Anatomical Placement": {
        "en": "Exact Anatomical Placement",
        "fr": "Emplacement anatomique exact",
        "it": "Posizione anatomica esatta",
        "de": "Genaue anatomische Platzierung",
        "es": "Ubicación anatómica exacta",
        "nl": "Exacte anatomische plaatsing",
        "pt": "Localização anatômica exata"
},
    "Approximate Dimensions (Width x Height)": {
        "en": "Approximate Dimensions (Width x Height)",
        "fr": "Dimensions approximatives (Largeur x Hauteur)",
        "it": "Dimensioni approssimative (Larghezza x Altezza)",
        "de": "Ungefähre Abmessungen (Breite x Höhe)",
        "es": "Dimensiones aproximadas (Ancho x Alto)",
        "nl": "Geschatte afmetingen (Breedte x Hoogte)",
        "pt": "Dimensões aproximadas (Largura x Altura)"
},
    "Color Palette Preference": {
        "en": "Color Palette Preference",
        "fr": "Préférence de palette de couleurs",
        "it": "Preferenza per la tavolozza dei colori",
        "de": "Farbpaletten-Präferenz",
        "es": "Preferencia de paleta de colores",
        "nl": "Voorkeur voor kleurenpalet",
        "pt": "Preferência de paleta de cores"
},
    "I confirm that I will inspect and approve the placement, size, and spelling of the stencil before ink application begins.": {
        "en": "I confirm that I will inspect and approve the placement, size, and spelling of the stencil before ink application begins.",
        "fr": "Je confirme que j'inspecterai et approuverai l'emplacement, la taille et l'orthographe du stencil avant le début de l'encrage.",
        "it": "Confermo che ispezionerò e approverò il posizionamento, le dimensioni e l'ortografia dello stencil prima di iniziare l'applicazione dell'inchiostro.",
        "de": "Ich bestätige, dass ich Platzierung, Größe und Rechtschreibung der Schablone vor Beginn der Tätowierung überprüfe und genehmige.",
        "es": "Confirmo que inspeccionaré y aprobaré la ubicación, el tamaño y la ortografía de la plantilla antes de que comience la aplicación de tinta.",
        "nl": "Ik bevestig dat ik de plaatsing, grootte en spelling van de stencil zal inspecteren en goedkeuren voordat het tatoeëren begint.",
        "pt": "Confirmo que irei inspecionar e aprovar o posicionamento, tamanho e ortografia do decalque antes de iniciar a aplicação de tinta."
},
    "Legal Waiver, Capacity of Reflection & Aftercare Agreement": {
        "en": "Legal Waiver, Capacity of Reflection & Aftercare Agreement",
        "fr": "Décharge légale, capacité de réflexion & accord de soins post-procédure",
        "it": "Liberatoria legale, capacità di riflessione e accordo di cura post-trattamento",
        "de": "Haftungsverzicht, Reflexionsfähigkeit & Nachsorgevereinbarung",
        "es": "Descargo legal, capacidad de reflexión y acuerdo de cuidados posteriores",
        "nl": "Juridische vrijwaring, reflectievermogen & nazorgovereenkomst",
        "pt": "Isenção legal, capacidade de discernimento e termo de cuidados pós-procedimento"
},
    "I certify that I am at least 18 years of age and have provided valid government-issued photographic identification.": {
        "en": "I certify that I am at least 18 years of age and have provided valid government-issued photographic identification.",
        "fr": "J'atteste avoir au moins 18 ans et avoir fourni une pièce d'identité officielle valide avec photo.",
        "it": "Dichiaro di avere almeno 18 anni e di aver fornito un documento di identità valido rilasciato dal governo con foto.",
        "de": "Ich bestätige, dass ich mindestens 18 Jahre alt bin und einen gültigen amtlichen Lichtbildausweis vorgelegt habe.",
        "es": "Certifico que tengo al menos 18 años y he proporcionado una identificación oficial con fotografía válida.",
        "nl": "Ik verklaar dat ik ten minste 18 jaar oud ben en een geldig door de overheid uitgegeven legitimatiebewijs met foto heb verstrekt.",
        "pt": "Declaro que tenho pelo menos 18 anos de idade e apresentei um documento de identidade oficial válido com foto."
},
    "DECLARATION OF CAPACITY: I declare and affirm that I am in full capacity of my own mental reflection, judgment, and free will, and that I am NOT under the influence of alcohol, drugs, or mind-altering medications.": {
        "en": "DECLARATION OF CAPACITY: I declare and affirm that I am in full capacity of my own mental reflection, judgment, and free will, and that I am NOT under the influence of alcohol, drugs, or mind-altering medications.",
        "fr": "DÉCLARATION DE CAPACITÉ : Je déclare et affirme être en pleine possession de mes facultés de discernement, de jugement et de libre arbitre, et ne PAS être sous l'influence d'alcool, de drogues ou de médicaments altérant l'esprit.",
        "it": "DICHIARAZIONE DI CAPACITÀ: Dichiaro e affermo di essere nel pieno possesso delle mie facoltà mentali, di giudizio e di libero arbitrio, e di NON essere sotto l'effetto di alcol, droghe o farmaci che alterano la mente.",
        "de": "FÄHIGKEITSERKLÄRUNG: Ich erkläre und bestätige, dass ich im Vollbesitz meiner geistigen Kräfte, Urteilsfähigkeit und meines freien Willens bin und NICHT unter dem Einfluss von Alkohol, Drogen oder bewusstseinsverändernden Medikamenten stehe.",
        "es": "DECLARACIÓN DE CAPACIDAD: Declaro y afirmo que estoy en plena capacidad de reflexión mental, juicio y libre albedrío, y que NO estoy bajo la influencia de alcohol, drogas o medicamentos que alteren la mente.",
        "nl": "BEKWAAMHEIDSVERKLARING: Ik verklaar en bevestig dat ik volledig wilsbekwaam ben, over mijn eigen oordeelsvermogen beschik en NIET onder invloed ben van alcohol, drugs of geestverruimende medicijnen.",
        "pt": "DECLARAÇÃO DE CAPACIDADE: Declaro e afirmo que estou em plena posse de minhas faculdades mentais, julgamento e livre arbítrio, e que NÃO estou sob a influência de álcool, drogas ou medicamentos que alterem a mente."
},
    "PRE-PROCEDURE AFTERCARE CONFIRMATION: I confirm that prior to this procedure, I have received comprehensive verbal and written advice on aftercare, hygiene, and healing instructions from the artist.": {
        "en": "PRE-PROCEDURE AFTERCARE CONFIRMATION: I confirm that prior to this procedure, I have received comprehensive verbal and written advice on aftercare, hygiene, and healing instructions from the artist.",
        "fr": "CONFIRMATION DES SOINS PRÉALABLES : Je confirme qu'avant cette procédure, j'ai reçu des conseils verbaux et écrits complets sur les soins, l'hygiène et la cicatrisation de la part du praticien.",
        "it": "CONFERMA DELLE CURE PRE-PROCEDURA: Confermo che prima di questa procedura ho ricevuto consigli verbali e scritti completi su cura post-trattamento, igiene e istruzioni di guarigione dall'artista.",
        "de": "BESTÄTIGUNG DER NACHSORGE VOR DEM EINGRIFF: Ich bestätige, dass ich vor diesem Eingriff umfassende mündliche und schriftliche Anweisungen zu Nachsorge, Hygiene und Heilung vom Künstler erhalten habe.",
        "es": "CONFIRMACIÓN DE CUIDADOS PREVIOS: Confirmo que antes de este procedimiento, he recibido asesoramiento verbal y escrito completo sobre cuidados posteriores, higiene e instrucciones de cicatrización por parte del artista.",
        "nl": "BEVESTIGING VAN NAZORG VOORAF: Ik bevestig dat ik voorafgaand aan deze ingreep uitgebreid mondeling en schriftelijk advies heb ontvangen over nazorg, hygiëne en genezingsinstructies van de artiest.",
        "pt": "CONFIRMAÇÃO DE CUIDADOS PRÉ-PROCEDIMENTO: Confirmo que, antes deste procedimento, recebi orientações verbais e escritas abrangentes sobre cuidados posteriores, higiene e cicatrização do profissional."
},
    "I understand the inherent risks of tattooing including temporary swelling, redness, infection, allergic reaction, scarring, and permanent skin alteration.": {
        "en": "I understand the inherent risks of tattooing including temporary swelling, redness, infection, allergic reaction, scarring, and permanent skin alteration.",
        "fr": "Je comprends les risques inhérents au tatouage, notamment le gonflement temporaire, les rougeurs, l'infection, les réactions allergiques, les cicatrices et l'altération cutanée permanente.",
        "it": "Comprendo i rischi intrinseci del tatuaggio, inclusi gonfiore temporaneo, arrossamento, infezione, reazione allergica, cicatrici e alterazione cutanea permanente.",
        "de": "Ich verstehe die inhärenten Risiken des Tätowierens, einschließlich vorübergehender Schwellung, Rötung, Infektion, allergischer Reaktion, Narbenbildung und dauerhafter Hautveränderung.",
        "es": "Entiendo los riesgos inherentes del tatuaje, incluidos hinchazón temporal, enrojecimiento, infección, reacción alérgica, cicatrización y alteración cutánea permanente.",
        "nl": "Ik begrijp de inherente risico's van tatoeëren, waaronder tijdelijke zwelling, roodheid, infectie, allergische reactie, littekenvorming en permanente huidverandering.",
        "pt": "Compreendo os riscos inerentes da tatuagem, incluindo inchaço temporário, vermelhidão, infecção, reação alérgica, cicatrizes e alteração permanente da pele."
},
    "I grant permission for photographs of the completed artwork to be taken and used for studio portfolio, educational, or promotional purposes.": {
        "en": "I grant permission for photographs of the completed artwork to be taken and used for studio portfolio, educational, or promotional purposes.",
        "fr": "J'autorise la prise de photographies de l'œuvre terminée et leur utilisation pour le portfolio du studio, à des fins éducatives ou promotionnelles.",
        "it": "Autorizzo a scattare fotografie dell'opera completata e a utilizzarle per il portfolio dello studio, a scopo educativo o promozionale.",
        "de": "Ich erteile die Erlaubnis, Fotos des fertigen Kunstwerks aufzunehmen und für das Studio-Portfolio sowie für Bildungs- oder Werbezwecke zu verwenden.",
        "es": "Doy permiso para que se tomen fotografías de la obra completada y se utilicen para el portafolio del estudio, fines educativos o promocionales.",
        "nl": "Ik geef toestemming om foto's te maken van het voltooide kunstwerk en deze te gebruiken voor het portfolio van de studio, educatieve of promotionele doeleinden.",
        "pt": "Autorizo a captura de fotografias do trabalho concluído e seu uso no portfólio do estúdio, para fins educacionais ou promocionais."
},
    "Formal Client Signature & Date": {
        "en": "Formal Client Signature & Date",
        "fr": "Signature formelle du client & Date",
        "it": "Firma formale del cliente e Data",
        "de": "Formelle Kundenunterschrift & Datum",
        "es": "Firma formal del cliente y Fecha",
        "nl": "Formele handtekening van de klant & Datum",
        "pt": "Assinatura formal do cliente e Data"
},
    "Client Signature (Sound Mind & Legal Acknowledgment)": {
        "en": "Client Signature (Sound Mind & Legal Acknowledgment)",
        "fr": "Signature du client (Consentement éclairé & reconnaissance légale)",
        "it": "Firma del cliente (Consenso informato e presa d'atto legale)",
        "de": "Kundenunterschrift (Freier Wille & rechtliche Anerkennung)",
        "es": "Firma del cliente (Pleno uso de facultades y reconocimiento legal)",
        "nl": "Handtekening van de klant (Wilsbekwaam & juridische erkenning)",
        "pt": "Assinatura do cliente (Plena capacidade mental e reconhecimento legal)"
},
    "Signature Date": {
        "en": "Signature Date",
        "fr": "Date de la signature",
        "it": "Data della firma",
        "de": "Datum der Unterschrift",
        "es": "Fecha de la firma",
        "nl": "Datum van ondertekening",
        "pt": "Data da assinatura"
},
    "Studio Address, Phone & Health Permit": {
        "en": "Studio Address, Phone & Health Permit",
        "fr": "Adresse du studio, Téléphone & Autorisation sanitaire",
        "it": "Indirizzo dello studio, Telefono e Permesso sanitario",
        "de": "Studio-Adresse, Telefon & Gesundheitsgenehmigung",
        "es": "Dirección del estudio, Teléfono y Permiso sanitario",
        "nl": "Studio-adres, Telefoon & Gezondheidsvergunning",
        "pt": "Endereço do estúdio, Telefone e Licença sanitária"
},
    "qualified professional piercer Name": {
        "en": "qualified professional piercer Name",
        "fr": "Nom du perceur professionnel qualifié",
        "it": "Nome del piercer professionista qualificato",
        "de": "Name des qualifizierten professionellen Piercers",
        "es": "Nombre del piercer profesional calificado",
        "nl": "Naam van de gekwalificeerde professionele piercer",
        "pt": "Nome do piercer profissional qualificado"
},
    "Emergency Contact Name & Phone": {
        "en": "Emergency Contact Name & Phone",
        "fr": "Nom & Téléphone du contact d'urgence",
        "it": "Nome e Telefono del contatto di emergenza",
        "de": "Name & Telefon des Notfallkontakts",
        "es": "Nombre y Teléfono del contacto de emergencia",
        "nl": "Naam en telefoon van noodcontact",
        "pt": "Nome e Telefone do contato de emergência"
},
    "Medical History & Health Check": {
        "en": "Medical History & Health Check",
        "fr": "Antécédents médicaux & Bilan de santé",
        "it": "Anamnesi medica e Controllo dello stato di salute",
        "de": "Medizinische Anamnese & Gesundheitsprüfung",
        "es": "Historial médico y Evaluación de salud",
        "nl": "Medische geschiedenis en Gezondheidscontrole",
        "pt": "Histórico médico e Avaliação de saúde"
},
    "Physician Authorization Disclosure": {
        "en": "Physician Authorization Disclosure",
        "fr": "Déclaration d'autorisation médicale",
        "it": "Dichiarazione di autorizzazione del medico",
        "de": "Erklärung zur ärztlichen Genehmigung",
        "es": "Declaración de autorización médica",
        "nl": "Verklaring van medische toestemming",
        "pt": "Declaração de autorização médica"
},
    "Do any of your medical conditions require doctor authorization?": {
        "en": "Do any of your medical conditions require doctor authorization?",
        "fr": "L'un de vos problèmes médicaux nécessite-t-il une autorisation médicale préalable ?",
        "it": "Qualcuna delle sue condizioni mediche richiede l'autorizzazione di un medico?",
        "de": "Erfordert eine Ihrer Erkrankungen eine vorherige ärztliche Genehmigung?",
        "es": "¿Alguna de sus condiciones médicas requiere autorización de un médico?",
        "nl": "Vereist een van uw medische aandoeningen toestemming van een arts?",
        "pt": "Alguma de suas condições médicas requer autorização de um médico?"
},
    "Conch / Tragus / Rook / Daith": {
        "en": "Conch / Tragus / Rook / Daith",
        "fr": "Conch / Tragus / Rook / Daith",
        "it": "Conch / Tragus / Rook / Daith",
        "de": "Conch / Tragus / Rook / Daith",
        "es": "Conch / Tragus / Rook / Daith",
        "nl": "Conch / Tragus / Rook / Daith",
        "pt": "Conch / Tragus / Rook / Daith"
},
    "Side / Placement": {
        "en": "Side / Placement",
        "fr": "Côté / Emplacement",
        "it": "Lato / Posizionamento",
        "de": "Seite / Platzierung",
        "es": "Lado / Ubicación",
        "nl": "Zijde / Plaatsing",
        "pt": "Lado / Posicionamento"
},
    "Consent, Capacity of Reflection & Aftercare Acknowledgment": {
        "en": "Consent, Capacity of Reflection & Aftercare Acknowledgment",
        "fr": "Consentement, capacité de réflexion & accusé de réception des soins",
        "it": "Consenso, capacità di riflessione e presa d'atto delle cure",
        "de": "Einwilligung, Reflexionsfähigkeit & Bestätigung der Nachsorge",
        "es": "Consentimiento, capacidad de reflexión y reconocimiento de cuidados",
        "nl": "Toestemming, reflectievermogen & erkenning van nazorg",
        "pt": "Consentimento, capacidade de discernimento e termo de cuidados"
},
    "Date": {
        "en": "Date",
        "fr": "Date",
        "it": "Data",
        "de": "Datum",
        "es": "Fecha",
        "nl": "Datum",
        "pt": "Data"
},
    "Studio & Clinical Practitioner Information": {
        "en": "Studio & Clinical Practitioner Information",
        "fr": "Informations sur le studio et le praticien clinicien",
        "it": "Informazioni sullo studio e sul professionista",
        "de": "Informationen zu Studio & klinischem Behandler",
        "es": "Información del estudio y profesional clínico",
        "nl": "Informatie over studio & klinisch behandelaar",
        "pt": "Informações do estúdio e do profissional clínico"
},
    "Consulting Artist / Practitioner Name": {
        "en": "Consulting Artist / Practitioner Name",
        "fr": "Nom de l'artiste consultant / praticien",
        "it": "Nome dell'artista / professionista consulente",
        "de": "Name des beratenden Künstlers / Behandlers",
        "es": "Nombre del artista / profesional consultor",
        "nl": "Naam van adviserende artiest / behandelaar",
        "pt": "Nome do artista / profissional consultor"
},
    "Licensed Practitioner Name": {
        "en": "Licensed Practitioner Name",
        "fr": "Nom du praticien agréé",
        "it": "Nome del professionista autorizzato",
        "de": "Name des lizenzierten Behandlers",
        "es": "Nombre del profesional con licencia",
        "nl": "Naam van bevoegde behandelaar",
        "pt": "Nome do profissional habilitado"
},
    "Surface / Microdermal": {
        "en": "Surface / Microdermal",
        "fr": "Surface / Microdermal",
        "it": "Surface / Microdermal",
        "de": "Surface / Microdermal",
        "es": "Superficie / Microdermal",
        "nl": "Surface / Microdermal",
        "pt": "Superfície / Microdermal"
},
    "Ombré / Powder Brows": {
        "en": "Ombré / Powder Brows",
        "fr": "Sourcils Ombré / Powder Brows",
        "it": "Sopracciglia Ombré / Powder Brows",
        "de": "Ombré- / Puder-Augenbrauen",
        "es": "Cejas Ombré / Powder Brows",
        "nl": "Ombré / Powder Brows",
        "pt": "Sobrancelhas Ombré / Powder Brows"
},
    "Navel": {
        "en": "Navel",
        "fr": "Nombril",
        "it": "Ombelico",
        "de": "Bauchnabel",
        "es": "Ombligo",
        "nl": "Navel",
        "pt": "Umbigo"
},
    "Lip / Labret / Medusa": {
        "en": "Lip / Labret / Medusa",
        "fr": "Lèvre / Labret / Medusa",
        "it": "Labbro / Labret / Medusa",
        "de": "Lippe / Labret / Medusa",
        "es": "Labio / Labret / Medusa",
        "nl": "Lip / Labret / Medusa",
        "pt": "Lábio / Labret / Medusa"
},
    "Studio & Client Details": {
        "en": "Studio & Client Details",
        "fr": "Détails du studio & du client",
        "it": "Dettagli dello studio e del cliente",
        "de": "Details zu Studio & Kunde",
        "es": "Detalles del estudio y cliente",
        "nl": "Gegevens van studio & klant",
        "pt": "Detalhes do estúdio e do cliente"
},
    "[Section Title]": {
        "en": "[Section Title]",
        "fr": "[Titre de la section]",
        "it": "[Titolo della sezione]",
        "de": "[Abschnittstitel]",
        "es": "[Título de la sección]",
        "nl": "[Sectietitel]",
        "pt": "[Título da Seção]"
},
    "section.new_section_title": {
        "en": "[Section Title]",
        "fr": "[Titre de la section]",
        "it": "[Titolo della sezione]",
        "de": "[Abschnittstitel]",
        "es": "[Título de la sección]",
        "nl": "[Sectietitel]",
        "pt": "[Título da Seção]"
},
    "New Consultation Section": {
        "en": "[Section Title]",
        "fr": "[Titre de la section]",
        "it": "[Titolo della sezione]",
        "de": "[Abschnittstitel]",
        "es": "[Título de la sección]",
        "nl": "[Sectietitel]",
        "pt": "[Título da Seção]"
},
    "Start from scratch to build custom forms for your studio.": {
        "en": "Start from scratch to build custom forms for your studio.",
        "fr": "Partez de zéro pour créer des formulaires personnalisés pour votre studio.",
        "it": "Parti da zero per creare moduli personalizzati per il tuo studio.",
        "de": "Beginnen Sie von Grund auf, um individuelle Formulare für Ihr Studio zu erstellen.",
        "es": "Comience desde cero para crear formularios personalizados para su estudio.",
        "nl": "Begin vanaf nul om aangepaste formulieren te maken voor uw studio.",
        "pt": "Comece do zero para criar formulários personalizados para o seu estúdio."
},
    "Client legal name": {
        "en": "Client legal name",
        "fr": "Nom légal du client",
        "it": "Nome legale del cliente",
        "de": "Offizieller Name des Kunden",
        "es": "Nombre legal del cliente",
        "nl": "Officiële naam van de klant",
        "pt": "Nome legal do cliente"
},

    "Tattoo Consent & Release Agreement": {
        "en": "Tattoo Consent & Release Agreement",
        "fr": "Accord de consentement et décharge pour tatouage",
        "it": "Accordo di consenso informato e liberatoria per tatuaggio",
        "de": "Tattoo-Einwilligung & Haftungsfreistellung",
        "es": "Acuerdo de consentimiento y descargo para tatuaje",
        "nl": "Toestemmings- en vrijwaringsovereenkomst voor tatoeage",
        "pt": "Termo de consentimento e isenção de responsabilidade para tatuagem"
    },
    "Piercing Consent & Release": {
        "en": "Piercing Consent & Release",
        "fr": "Accord de consentement et décharge pour piercing",
        "it": "Consenso informato e liberatoria per piercing",
        "de": "Piercing-Einwilligung & Freistellung",
        "es": "Consentimiento y descargo para piercing",
        "nl": "Toestemming en vrijwaring voor piercing",
        "pt": "Consentimento e isenção para piercing"
    },
    "Medical History & Health Screening Intake": {
        "en": "Medical History & Health Screening Intake",
        "fr": "Antécédents médicaux et bilan de santé",
        "it": "Anamnesi medica e valutazione dello stato di salute",
        "de": "Medizinische Anamnese & Gesundheitsprüfung",
        "es": "Historial médico y evaluación de salud",
        "nl": "Medische geschiedenis en gezondheidsscreening",
        "pt": "Histórico médico e triagem de saúde"
    },
    "Multi-Session Tattoo Project Master Agreement": {
        "en": "Multi-Session Tattoo Project Master Agreement",
        "fr": "Contrat cadre pour projet de tatouage multi-séances",
        "it": "Accordo quadro per progetto di tatuaggio multi-sessione",
        "de": "Rahmenvereinbarung für mehrteilige Tattoo-Projekte",
        "es": "Acuerdo marco para proyecto de tatuaje multisesión",
        "nl": "Hoofdovereenkomst voor tatoeageproject met meerdere sessies",
        "pt": "Contrato mestre para projeto de tatuagem em várias sessões"
    },
    "Minor Consent & Legal Guardian Authorization Form": {
        "en": "Minor Consent & Legal Guardian Authorization Form",
        "fr": "Consentement pour mineur et autorisation du tuteur légal",
        "it": "Modulo di consenso per minorenni e autorizzazione del tutore legale",
        "de": "Einwilligung für Minderjährige & Vollmacht des Erziehungsberechtigten",
        "es": "Formulario de consentimiento para menores y autorización de tutor legal",
        "nl": "Toestemming voor minderjarigen en machtiging wettelijke voogd",
        "pt": "Formulário de consentimento de menor e autorização de responsável legal"
    },
    "Cover-Up & Rework Assessment Form": {
        "en": "Cover-Up & Rework Assessment Form",
        "fr": "Formulaire d'évaluation pour recouvrement et retouche",
        "it": "Modulo di valutazione per cover-up e rilavorazione",
        "de": "Bewertungsformular für Cover-Up & Überarbeitung",
        "es": "Formulario de evaluación para cover-up y retoque",
        "nl": "Beoordelingsformulier voor cover-up en revisie",
        "pt": "Formulário de avaliação para cobertura e retrabalho"
    },
    "PMU & Cosmetic Tattoo Consultation": {
        "en": "PMU & Cosmetic Tattoo Consultation",
        "fr": "Consultation pour maquillage permanent et tatouage esthétique",
        "it": "Consulenza per trucco permanente (PMU) e tatuaggio estetico",
        "de": "Beratung für Permanent-Make-up & kosmetische Tätowierung",
        "es": "Consulta para micropigmentación y tatuaje cosmético",
        "nl": "Consultatie voor permanente make-up en cosmetische tatoeage",
        "pt": "Consulta para maquiagem definitiva e tatuagem estética"
    },
    "Blank Custom Form": {
        "en": "Blank Custom Form",
        "fr": "Formulaire personnalisé vierge",
        "it": "Modulo personalizzato vuoto",
        "de": "Leeres benutzerdefiniertes Formular",
        "es": "Formulario personalizado en blanco",
        "nl": "Leeg aangepast formulier",
        "pt": "Formulário personalizado em branco"
    },
    "Emergency Contact (Name & Phone)": {
        "en": "Emergency Contact (Name & Phone)",
        "fr": "Contact d'urgence (Nom & Téléphone)",
        "it": "Contatto di emergenza (Nome e Telefono)",
        "de": "Notfallkontakt (Name & Telefon)",
        "es": "Contacto de emergencia (Nombre y Teléfono)",
        "nl": "Noodcontact (Naam en telefoon)",
        "pt": "Contato de emergência (Nome e Telefone)"
},
    "Pairs with Intake Profile": {
        "en": "Pairs with Intake Profile",
        "fr": "Complète le profil d'admission",
        "it": "Si abbina al profilo iniziale",
        "de": "Ergänzt das Aufnahmeprofil",
        "es": "Se combina con el perfil de ingreso",
        "nl": "Past bij intake-profiel",
        "pt": "Combina com o perfil de entrada"
},
    "Known Medical Conditions & Allergies": {
        "en": "Known Medical Conditions & Allergies",
        "fr": "Affections médicales connues et allergies",
        "it": "Condizioni mediche note e allergie",
        "de": "Bekannte Vorerkrankungen & Allergien",
        "es": "Afecciones médicas conocidas y alergias",
        "nl": "Bekende medische aandoeningen en allergieën",
        "pt": "Condições médicas conhecidas e alergias"
},
    "Safety Best Practice": {
        "en": "Safety Best Practice",
        "fr": "Bonne pratique de sécurité",
        "it": "Migliore pratica di sicurezza",
        "de": "Sicherheits-Best-Practice",
        "es": "Mejor práctica de seguridad",
        "nl": "Beste veiligheidspraktijk",
        "pt": "Melhor prática de segurança"
},
    "I confirm all information provided is accurate and agree to studio policies.": {
        "en": "I confirm all information provided is accurate and agree to studio policies.",
        "fr": "Je confirme que toutes les informations fournies sont exactes et j'accepte les règles du studio.",
        "it": "Confermo che tutte le informazioni fornite sono accurate e accetto le politiche dello studio.",
        "de": "Ich bestätige die Richtigkeit aller Angaben und stimme den Studio-Richtlinien zu.",
        "es": "Confirmo que toda la información proporcionada es precisa y acepto las políticas del estudio.",
        "nl": "Ik bevestig dat alle verstrekte informatie juist is en ga akkoord met het beleid van de studio.",
        "pt": "Confirmo que todas as informações fornecidas são precisas e concordo com as políticas do estúdio."
},
    "Legal Consent Shield": {
        "en": "Legal Consent Shield",
        "fr": "Protection du consentement légal",
        "it": "Tutela del consenso legale",
        "de": "Rechtlicher Einwilligungsschutz",
        "es": "Protección de consentimiento legal",
        "nl": "Juridische toestemmingsbescherming",
        "pt": "Proteção de consentimento legal"
},
    "Core Identity Requirement": {
        "en": "Core Identity Requirement",
        "fr": "Exigence d'identité principale",
        "it": "Requisito di identità fondamentale",
        "de": "Grundlegende Identitätsanforderung",
        "es": "Requisito de identidad fundamental",
        "nl": "Basis identiteitsvereiste",
        "pt": "Requisito de identidade fundamental"
},
    "Essential for Legal Consent": {
        "en": "Essential for Legal Consent",
        "fr": "Essentiel pour le consentement légal",
        "it": "Essenziale per il consenso legale",
        "de": "Unerlässlich für die rechtliche Einwilligung",
        "es": "Esencial para el consentimiento legal",
        "nl": "Essentieel voor juridische toestemming",
        "pt": "Essencial para consentimento legal"
},
    "Pairs with Street Address": {
        "en": "Pairs with Street Address",
        "fr": "Complète l'adresse postale",
        "it": "Si abbina all'indirizzo",
        "de": "Ergänzt die Straßenadresse",
        "es": "Se combina con la dirección",
        "nl": "Past bij straatadres",
        "pt": "Combina com o endereço"
},
    "Intake Essential": {
        "en": "Intake Essential",
        "fr": "Essentiel pour l'admission",
        "it": "Essenziale per l'ammissione",
        "de": "Aufnahme-Grundlage",
        "es": "Esencial para el ingreso",
        "nl": "Intake-essentieel",
        "pt": "Essencial para a entrada"
},
    "Consent Essential": {
        "en": "Consent Essential",
        "fr": "Essentiel pour le consentement",
        "it": "Essenziale per il consenso",
        "de": "Einwilligung erforderlich",
        "es": "Esencial para el consentimiento",
        "nl": "Toestemming essentieel",
        "pt": "Consentimento essencial"
},
    "Commonly paired with Full Name": {
        "en": "Commonly paired with Full Name",
        "fr": "Couramment associé au nom complet",
        "it": "Comunemente abbinato al Nome completo",
        "de": "Häufig mit vollständigem Namen kombiniert",
        "es": "Comúnmente combinado con el nombre completo",
        "nl": "Vaak gecombineerd met volledige naam",
        "pt": "Comumente combinado com o nome completo"
},
    "Latex Allergy": {
        "en": "Latex Allergy",
        "fr": "Allergie au latex",
        "it": "Allergia al lattice",
        "de": "Latexallergie",
        "es": "Alergia al látex",
        "nl": "Latexallergie",
        "pt": "Alergia ao látex"
},
    "Blood Thinning Medications": {
        "en": "Blood Thinning Medications",
        "fr": "Médicaments anticoagulants",
        "it": "Farmaci anticoagulanti",
        "de": "Blutverdünnende Medikamente",
        "es": "Medicamentos anticoagulantes",
        "nl": "Bloedverdunnende medicijnen",
        "pt": "Medicamentos anticoagulantes"
},
    "Skin Conditions / Eczema": {
        "en": "Skin Conditions / Eczema",
        "fr": "Affections cutanées / Eczéma",
        "it": "Patologie della pelle / Eczema",
        "de": "Hauterkrankungen / Ekzeme",
        "es": "Afecciones cutáneas / Eczema",
        "nl": "Huidaandoeningen / Eczeem",
        "pt": "Condições de pele / Eczema"
},
    "Fainting / Vasovagal Episodes": {
        "en": "Fainting / Vasovagal Episodes",
        "fr": "Évanouissements / Épisodes vasovagaux",
        "it": "Svenimenti / Episodi vasovagali",
        "de": "Ohnmacht / Vasovagale Episoden",
        "es": "Desmayos / Episodios vasovagales",
        "nl": "Flauwvallen / Vasovagale episoden",
        "pt": "Desmaios / Episódios vasovagais"
},
    "None": {
        "en": "None",
        "fr": "Aucun",
        "it": "Nessuno",
        "de": "Keine",
        "es": "Ninguno",
        "nl": "Geen",
        "pt": "Nenhum"
},
    "Full Legal Name": {
        "en": "Full Legal Name",
        "fr": "Nom légal complet",
        "it": "Nome e cognome legali",
        "de": "Vollständiger amtlicher Name",
        "es": "Nombre legal completo",
        "nl": "Volledige wettelijke naam",
        "pt": "Nome legal completo"
},
    "Date of Birth": {
        "en": "Date of Birth",
        "fr": "Date de naissance",
        "it": "Data di nascita",
        "de": "Geburtsdatum",
        "es": "Fecha de nacimiento",
        "nl": "Geboortedatum",
        "pt": "Data de nascimento"
},
    "Phone Number": {
        "en": "Phone Number",
        "fr": "Numéro de téléphone",
        "it": "Numero di telefono",
        "de": "Telefonnummer",
        "es": "Número de teléfono",
        "nl": "Telefoonnummer",
        "pt": "Número de telefone"
},
    "Email Address": {
        "en": "Email Address",
        "fr": "Adresse e-mail",
        "it": "Indirizzo e-mail",
        "de": "E-Mail-Adresse",
        "es": "Correo electrónico",
        "nl": "E-mailadres",
        "pt": "Endereço de e-mail"
},
    "Digital Client Signature": {
        "en": "Digital Client Signature",
        "fr": "Signature numérique du client",
        "it": "Firma digitale del cliente",
        "de": "Digitale Kundenunterschrift",
        "es": "Firma digital del cliente",
        "nl": "Digitale klanthandtekening",
        "pt": "Assinatura digital do cliente"
},
    "Postal / Zip Code": {
        "en": "Postal / Zip Code",
        "fr": "Code postal",
        "it": "Codice postale / CAP",
        "de": "Postleitzahl",
        "es": "Código postal",
        "nl": "Postcode",
        "pt": "Código postal / CEP"
},
    "Required for client identification and age verification": {
        "en": "Required for client identification and age verification",
        "fr": "Requis pour l'identification du client et la vérification de l'âge",
        "it": "Richiesto per l'identificazione del cliente e la verifica dell'età",
        "de": "Erforderlich zur Kundenidentifikation und Altersprüfung",
        "es": "Requerido para la identificación del cliente y verificación de edad",
        "nl": "Vereist voor klantidentificatie en leeftijdsverificatie",
        "pt": "Obrigatório para identificação do cliente e verificação de idade"
},
    "Direct telephone contact for appointment reminders": {
        "en": "Direct telephone contact for appointment reminders",
        "fr": "Contact téléphonique direct pour les rappels de rendez-vous",
        "it": "Contatto telefonico diretto per i promemoria degli appuntamenti",
        "de": "Direkter Telefonkontakt für Terminerinnerungen",
        "es": "Contacto telefónico directo para recordatorios de citas",
        "nl": "Direct telefonisch contact voor afspraakherinneringen",
        "pt": "Contato telefônico direto para lembretes de agendamento"
},
    "For appointment confirmations and digital receipt delivery": {
        "en": "For appointment confirmations and digital receipt delivery",
        "fr": "Pour la confirmation des rendez-vous et la délivrance des reçus",
        "it": "Per conferme di appuntamenti e invio di ricevute digitali",
        "de": "Für Terminbestätigungen und digitale Belege",
        "es": "Para confirmaciones de citas y entrega de recibos digitales",
        "nl": "Voor afspraakbevestigingen en digitale kwitanties",
        "pt": "Para confirmações de agendamento e envio de recibos digitais"
},
    "As printed on government-issued photo ID": {
        "en": "As printed on government-issued photo ID",
        "fr": "Tel qu'indiqué sur la pièce d'identité officielle avec photo",
        "it": "Come riportato sul documento d'identità ufficiale con foto",
        "de": "Wie auf dem amtlichen Lichtbildausweis angegeben",
        "es": "Como figura en el documento de identidad oficial con foto",
        "nl": "Zoals vermeld op een geldig identiteitsbewijs met foto",
        "pt": "Conforme impresso no documento oficial de identificação com foto"
},
    "Legally binding digital touch/stylus signature attestation": {
        "en": "Legally binding digital touch/stylus signature attestation",
        "fr": "Attestation de signature numérique tactile/stylet légalement contraignante",
        "it": "Attestazione di firma digitale grafica vincolante con valore legale",
        "de": "Rechtsverbindliche digitale Touch-/Stiftunterschrift",
        "es": "Atestación de firma digital táctil con validez legal",
        "nl": "Rechtsgeldige digitale handtekening via touchscreen of stylus",
        "pt": "Atestação de assinatura digital com validade legal via toque ou caneta"
},
    "Designated contact person in case of a medical emergency": {
        "en": "Designated contact person in case of a medical emergency",
        "fr": "Personne de contact désignée en cas d'urgence médicale",
        "it": "Persona di riferimento designata in caso di emergenza medica",
        "de": "Benannte Kontaktperson für medizinische Notfälle",
        "es": "Persona de contacto designada en caso de emergencia médica",
        "nl": "Aangewezen contactpersoon in geval van een medische noodsituatie",
        "pt": "Pessoa de contato designada em caso de emergência médica"
},
    "Check all conditions that apply to ensure safe procedure execution": {
        "en": "Check all conditions that apply to ensure safe procedure execution",
        "fr": "Cochez toutes les conditions applicables pour garantir la sécurité",
        "it": "Seleziona tutte le condizioni applicabili per garantire l'esecuzione sicura",
        "de": "Alle zutreffenden Punkte ankreuzen für eine sichere Durchführung",
        "es": "Marca todas las condiciones aplicables para garantizar una sesión segura",
        "nl": "Vink alle van toepassing zijnde aandoeningen aan voor een veilige behandeling",
        "pt": "Marque todas as condições aplicáveis para garantir a segurança do procedimento"
},
    "Mandatory declaration before procedure commencement": {
        "en": "Mandatory declaration before procedure commencement",
        "fr": "Déclaration obligatoire avant le début de la prestation",
        "it": "Dichiarazione obbligatoria prima dell'inizio della procedura",
        "de": "Verpflichtende Erklärung vor Beginn des Eingriffs",
        "es": "Declaración obligatoria antes de comenzar el procedimiento",
        "nl": "Verplichte verklaring vóór aanvang van de behandeling",
        "pt": "Declaração obrigatória antes do início do procedimento"
},

    "Studio & Tattooist Information": {
        "en": "Studio & Tattooist Information",
        "fr": "Informations sur le studio et le tatoueur",
        "it": "Informazioni su studio e tatuatore",
        "de": "Studio- & Tätowierer-Informationen",
        "es": "Información del estudio y del tatuador",
        "nl": "Studio- en tatoeëerdergegevens",
        "pt": "Informações do estúdio e do tatuador"
    },
    "Studio & Piercer Information": {
        "en": "Studio & Piercer Information",
        "fr": "Informations sur le studio et le perceur",
        "it": "Informazioni su studio e piercer",
        "de": "Studio- & Piercer-Informationen",
        "es": "Información del estudio y del anillador",
        "nl": "Studio- en piercergegevens",
        "pt": "Informações do estúdio e do body piercer"
    },
    "Studio & qualified professional piercer Information": {
        "en": "Studio & qualified professional piercer Information",
        "fr": "Informations sur le studio et le perceur professionnel qualifié",
        "it": "Informazioni sullo studio e sul piercer professionista qualificato",
        "de": "Informationen zu Studio & qualifiziertem Piercer",
        "es": "Información del estudio y del anillador profesional cualificado",
        "nl": "Informatie over studio en gekwalificeerde piercer",
        "pt": "Informações do estúdio e do body piercer profissional qualificado"
    },
    "Studio & Lead Tattooist Information": {
        "en": "Studio & Lead Tattooist Information",
        "fr": "Informations sur le studio et le tatoueur référent",
        "it": "Informazioni su studio e primo tatuatore",
        "de": "Studio- & Chef-Tätowierer-Informationen",
        "es": "Información del estudio y tatuador principal",
        "nl": "Studio- en hoofdtatoeëerdergegevens",
        "pt": "Informações do estúdio e do tatuador responsável"
    },
    "Studio & Practitioner Information": {
        "en": "Studio & Practitioner Information",
        "fr": "Informations sur le studio et le praticien",
        "it": "Informazioni su studio e operatore",
        "de": "Studio- & Behandler-Informationen",
        "es": "Información del estudio y del profesional",
        "nl": "Studio- en behandelaarsgegevens",
        "pt": "Informações do estúdio e do profissional"
    },
    "Studio & PMU Practitioner Information": {
        "en": "Studio & PMU Practitioner Information",
        "fr": "Informations sur le studio et le dermopigmentiste (PMU)",
        "it": "Informazioni su studio e operatore PMU",
        "de": "Studio- & PMU-Spezialisten-Informationen",
        "es": "Información del estudio y especialista en PMU",
        "nl": "Studio- en PMU-specialistgegevens",
        "pt": "Informações do estúdio e do profissional de PMU"
    },
    "Studio & Client Details": {
        "en": "Studio & Client Details",
        "fr": "Détails du studio et du client",
        "it": "Dati dello studio e del cliente",
        "de": "Studio- und Kundendaten",
        "es": "Detalles del estudio y del cliente",
        "nl": "Studio- en klantgegevens",
        "pt": "Dados do estúdio e do cliente"
    },
    "Client Personal Information": {
        "en": "Client Personal Information",
        "fr": "Informations personnelles du client",
        "it": "Dati personali del cliente",
        "de": "Persönliche Angaben des Kunden",
        "es": "Datos personales del cliente",
        "nl": "Persoonsgegevens van de klant",
        "pt": "Dados pessoais do cliente"
    },
    "Client Information": {
        "en": "Client Information",
        "fr": "Informations du client",
        "it": "Informazioni del cliente",
        "de": "Kundeninformationen",
        "es": "Información del cliente",
        "nl": "Klantinformatie",
        "pt": "Informações do cliente"
    },
    "Client Profile": {
        "en": "Client Profile",
        "fr": "Profil du client",
        "it": "Profilo del cliente",
        "de": "Kundenprofil",
        "es": "Perfil del cliente",
        "nl": "Klantprofiel",
        "pt": "Perfil do cliente"
    },
    "Client Identity & Emergency Details": {
        "en": "Client Identity & Emergency Details",
        "fr": "Identité du client et contact d'urgence",
        "it": "Identità del cliente e contatti di emergenza",
        "de": "Kundenidentität & Notfallkontaktdaten",
        "es": "Identidad del cliente y datos de emergencia",
        "nl": "Identiteit van de klant en noodcontact",
        "pt": "Identidade do cliente e contato de emergência"
    },
    "Minor Client Information": {
        "en": "Minor Client Information",
        "fr": "Informations sur le client mineur",
        "it": "Informazioni sul cliente minorenne",
        "de": "Angaben zum minderjährigen Kunden",
        "es": "Información del cliente menor de edad",
        "nl": "Gegevens van de minderjarige klant",
        "pt": "Informações do cliente menor de idade"
    },
    "Parent / Legal Guardian Information": {
        "en": "Parent / Legal Guardian Information",
        "fr": "Informations sur le parent / tuteur légal",
        "it": "Informazioni su genitore / tutore legale",
        "de": "Angaben zu Eltern / Erziehungsberechtigten",
        "es": "Información del padre/madre o tutor legal",
        "nl": "Gegevens van ouder / wettelijke voogd",
        "pt": "Informações dos pais ou responsável legal"
    },
    "Medical History & Health Disclosures": {
        "en": "Medical History & Health Disclosures",
        "fr": "Antécédents médicaux et déclarations de santé",
        "it": "Anamnesi medica e dichiarazioni sanitarie",
        "de": "Medizinische Vorgeschichte & Gesundheitsangaben",
        "es": "Historial médico y declaraciones de salud",
        "nl": "Medische voorgeschiedenis & gezondheidsverklaringen",
        "pt": "Histórico médico e declarações de saúde"
    },
    "Comprehensive Health & Medical Disclosures": {
        "en": "Comprehensive Health & Medical Disclosures",
        "fr": "Déclarations médicales et bilan de santé complet",
        "it": "Informativa sanitaria e anamnesi completa",
        "de": "Vollständige gesundheitliche & medizinische Auskunft",
        "es": "Declaraciones médicas y de salud integrales",
        "nl": "Uitgebreide medische & gezondheidsverklaringen",
        "pt": "Histórico médico e declarações completas de saúde"
    },
    "Minor Medical History & Health Disclosures": {
        "en": "Minor Medical History & Health Disclosures",
        "fr": "Antécédents médicaux et état de santé du mineur",
        "it": "Anamnesi e dichiarazioni sanitarie per minorenni",
        "de": "Medizinische Vorgeschichte des Minderjährigen",
        "es": "Historial médico y salud del menor",
        "nl": "Medische voorgeschiedenis van de minderjarige",
        "pt": "Histórico médico e declarações de saúde do menor"
    },
    "Mandatory Physician / Doctor Clearance": {
        "en": "Mandatory Physician / Doctor Clearance",
        "fr": "Autorisation médicale préalable obligatoire",
        "it": "Nulla osta medico obbligatorio",
        "de": "Erforderliche ärztliche Unbedenklichkeitsbescheinigung",
        "es": "Autorización médica previa obligatoria",
        "nl": "Verplichte medische goedkeuring van de arts",
        "pt": "Autorização médica prévia obrigatória"
    },
    "Physician Authorization & Physical Readiness": {
        "en": "Physician Authorization & Physical Readiness",
        "fr": "Autorisation médicale et aptitude physique",
        "it": "Nulla osta medico e idoneità fisica",
        "de": "Ärztliche Freigabe & körperliche Belastbarkeit",
        "es": "Autorización médica y aptitud física",
        "nl": "Doktersverklaring & fysieke geschiktheid",
        "pt": "Autorização médica e aptidão física"
    },
    "Mandatory Physician Authorization Clause": {
        "en": "Mandatory Physician Authorization Clause",
        "fr": "Clause d'autorisation médicale obligatoire",
        "it": "Clausola di autorizzazione medica obbligatoria",
        "de": "Klausel zur verpflichtenden ärztlichen Freigabe",
        "es": "Cláusula de autorización médica obligatoria",
        "nl": "Verplichte doktersautorisatieclausule",
        "pt": "Cláusula de autorização médica obrigatória"
    },
    "Physician Authorization & Clearance Clause": {
        "en": "Physician Authorization & Clearance Clause",
        "fr": "Clause d'autorisation et d'avis médical",
        "it": "Clausola di nulla osta e autorizzazione medica",
        "de": "Ärztliche Freigabe- und Genehmigungsklausel",
        "es": "Cláusula de autorización y visto bueno médico",
        "nl": "Doktersautorisatie- & goedkeuringsclausule",
        "pt": "Cláusula de autorização e liberação médica"
    },
    "Tattoo Procedure Details & Design Specifications": {
        "en": "Tattoo Procedure Details & Design Specifications",
        "fr": "Détails de l'acte de tatouage et spécifications du motif",
        "it": "Dettagli della procedura di tatuaggio e specifiche del disegno",
        "de": "Tattoo-Prozedurdetails & Motiv-Spezifikationen",
        "es": "Detalles del procedimiento de tatuaje y especificaciones de diseño",
        "nl": "Tatoeageprocedure en ontwerpspecificaties",
        "pt": "Detalhes do procedimento de tatuagem e especificações do desenho"
    },
    "Piercing Location & Objective Material / Gauge Specifications": {
        "en": "Piercing Location & Objective Material / Gauge Specifications",
        "fr": "Emplacement du piercing et spécifications objectives de matériau / calibre",
        "it": "Posizione del piercing e specifiche oggettive su materiale e calibro (gauge)",
        "de": "Piercing-Platzierung & Spezifikationen zu Material und Drahtstärke (Gauge)",
        "es": "Ubicación de la perforación y especificaciones de material y calibre",
        "nl": "Piercinglocatie en objectieve specificaties van materiaal en dikte (gauge)",
        "pt": "Local do piercing e especificações de material e espessura (gauge)"
    },
    "Project Scope & Multi-Session Structure": {
        "en": "Project Scope & Multi-Session Structure",
        "fr": "Portée du projet et organisation multi-sessions",
        "it": "Ambito del progetto e struttura a sessioni multiple",
        "de": "Projektumfang & Mehrtermin-Struktur",
        "es": "Alcance del proyecto y estructura multisesión",
        "nl": "Projectomvang en planning van meerdere sessies",
        "pt": "Escopo do projeto e estrutura em múltiplas sessões"
    },
    "Authorized Procedure Specifications": {
        "en": "Authorized Procedure Specifications",
        "fr": "Spécifications de l'acte autorisé",
        "it": "Specifiche della procedura autorizzata",
        "de": "Spezifikation der autorisierten Dienstleistung",
        "es": "Especificaciones del procedimiento autorizado",
        "nl": "Specificaties van de goedgekeurde behandeling",
        "pt": "Especificações do procedimento autorizado"
    },
    "Existing Tattoo Details & Laser History": {
        "en": "Existing Tattoo Details & Laser History",
        "fr": "Détails du tatouage existant et antécédents laser",
        "it": "Dettagli del tatuaggio esistente e trattamenti laser pregressi",
        "de": "Angaben zum bestehenden Tattoo & Laser-Behandlungen",
        "es": "Detalles del tatuaje existente e historial de láser",
        "nl": "Gegevens van de bestaande tatoeage en laserhistorie",
        "pt": "Detalhes da tatuagem existente e histórico de laser"
    },
    "Cover-Up Design Goals & Agreements": {
        "en": "Cover-Up Design Goals & Agreements",
        "fr": "Objectifs artistiques et accords pour le recouvrement",
        "it": "Obiettivi stilistici e accordi sul cover-up",
        "de": "Ziele & Vereinbarungen zum Cover-Up-Entwurf",
        "es": "Objetivos de diseño y acuerdos de cobertura",
        "nl": "Doelen en afspraken voor het cover-up ontwerp",
        "pt": "Objetivos de design e acordos para o cover-up"
    },
    "Cosmetic Medical Screening & Contraindications": {
        "en": "Cosmetic Medical Screening & Contraindications",
        "fr": "Évaluation médicale esthétique et contre-indications",
        "it": "Screening medico estetico e controindicazioni",
        "de": "Kosmetische Voruntersuchung & Kontraindikationen",
        "es": "Evaluación médica estética y contraindicaciones",
        "nl": "Medische screening en contra-indicaties voor PMU",
        "pt": "Triagem médica estética e contraindicações"
    },
    "Cosmetic Contraindications & Physician Release": {
        "en": "Cosmetic Contraindications & Physician Release",
        "fr": "Contre-indications esthétiques et avis médical",
        "it": "Controindicazioni estetiche e certificato medico",
        "de": "Kosmetische Kontraindikationen & ärztliche Freigabe",
        "es": "Contraindicaciones estéticas y visto bueno médico",
        "nl": "Cosmetische contra-indicaties & doktersverklaring",
        "pt": "Contraindicações estéticas e liberação médica"
    },
    "Medical History & Scar Tissue Evaluation": {
        "en": "Medical History & Scar Tissue Evaluation",
        "fr": "Antécédents médicaux et évaluation du tissu cicatriciel",
        "it": "Anamnesi medica e valutazione del tessuto cicatriziale",
        "de": "Medizinische Vorgeschichte & Narbengewebe-Prüfung",
        "es": "Historial médico y evaluación de tejido cicatricial",
        "nl": "Medische anamnese en evaluatie van littekenweefsel",
        "pt": "Histórico médico e avaliação de tecido cicatricial"
    },
    "Current Medications, Anticoagulants & Sensitivities": {
        "en": "Current Medications, Anticoagulants & Sensitivities",
        "fr": "Médicaments en cours, anticoagulants et sensibilités",
        "it": "Farmaci attuali, anticoagulanti e sensibilità",
        "de": "Aktuelle Medikamente, Antikoagulanzien & Allergien",
        "es": "Medicamentos actuales, anticoagulantes y sensibilidades",
        "nl": "Huidige medicatie, bloedverdunners en gevoeligheden",
        "pt": "Medicamentos atuais, anticoagulantes e sensibilidades"
    },
    "Capacity, Reflection, Sound Mind & Legal Consent": {
        "en": "Capacity, Reflection, Sound Mind & Legal Consent",
        "fr": "Capacité de discernement, consentement éclairé et légal",
        "it": "Capacità di intendere, consenso informato e dichiarazione legale",
        "de": "Urteilsfähigkeit, Aufklärung & rechtsgültige Einwilligung",
        "es": "Capacidad de reflexión, juicio cabal y consentimiento legal",
        "nl": "Wilsbekwaamheid, weloverwogen besluit & wettelijke toestemming",
        "pt": "Capacidade de reflexão, discernimento e consentimento legal"
    },
    "Consent, Capacity & Pre-Procedure Aftercare Agreement": {
        "en": "Consent, Capacity & Pre-Procedure Aftercare Agreement",
        "fr": "Consentement, discernement et accord de soins pré-procédure",
        "it": "Consenso, discernimento e accordo su cura post-trattamento",
        "de": "Einwilligung, Urteilsfähigkeit & Nachsorge-Vereinbarung",
        "es": "Consentimiento, discernimiento y acuerdo de cuidados previos",
        "nl": "Toestemming, wilsbekwaamheid en afspraken over nazorg",
        "pt": "Consentimento, discernimento e acordo de cuidados prévios"
    },
    "Capacity, Reflection & Pre-Procedure Aftercare Agreement": {
        "en": "Capacity, Reflection & Pre-Procedure Aftercare Agreement",
        "fr": "Discernement, réflexion et accord de soins pré-procédure",
        "it": "Riflessione, discernimento e accordo di cura preliminare",
        "de": "Reflexion, Urteilsfähigkeit & Nachsorge-Vereinbarung",
        "es": "Capacidad de reflexión y acuerdo de cuidados previos",
        "nl": "Wilsbekwaamheid en bevestiging van voorafgaande nazorg",
        "pt": "Capacidade de reflexão e acordo de cuidados pós-procedimento"
    },
    "Guardian Consent, Capacity of Reflection & Aftercare Acknowledgment": {
        "en": "Guardian Consent, Capacity of Reflection & Aftercare Acknowledgment",
        "fr": "Consentement du tuteur, discernement et engagement de suivi des soins",
        "it": "Consenso del tutore, capacità di discernimento e impegno alla cura",
        "de": "Zustimmung des Vormunds, Urteilsfähigkeit & Nachsorge-Pflicht",
        "es": "Consentimiento del tutor, discernimiento y compromiso de cuidados",
        "nl": "Toestemming voogd, wilsbekwaamheid en toezicht op nazorg",
        "pt": "Consentimento do responsável, discernimento e compromisso com os cuidados"
    },
    "Legal Disclaimer, Sound Mind & Health Certification": {
        "en": "Legal Disclaimer, Sound Mind & Health Certification",
        "fr": "Décharge légale, discernement et certification de santé",
        "it": "Liberatoria legale, capacità di intendere e autocertificazione sanitaria",
        "de": "Haftungsausschluss, Urteilsfähigkeit & Gesundheitsbescheinigung",
        "es": "Descargo legal, discernimiento y certificación de salud",
        "nl": "Juridische disclaimer, wilsbekwaamheid en gezondheidsverklaring",
        "pt": "Termo de responsabilidade, discernimento e atestado de saúde"
    },
    "Digital Signature & Identity Verification": {
        "en": "Digital Signature & Identity Verification",
        "fr": "Signature numérique et vérification d'identité",
        "it": "Firma digitale e verifica dell'identità",
        "de": "Digitale Signatur & Identitätsprüfung",
        "es": "Firma digital y verificación de identidad",
        "nl": "Digitale handtekening en identiteitsverificatie",
        "pt": "Assinatura digital e verificação de identidade"
    },
    "Signatures & Dual Identity Verification": {
        "en": "Signatures & Dual Identity Verification",
        "fr": "Signatures et double vérification d'identité",
        "it": "Firme e doppia verifica di identità",
        "de": "Unterschriften & doppelte Identitätsprüfung",
        "es": "Firmas y verificación de doble identidad",
        "nl": "Handtekeningen en dubbele identiteitscontrole",
        "pt": "Assinaturas e dupla verificação de identidade"
    },
    "Client Signature & Date": {
        "en": "Client Signature & Date",
        "fr": "Signature du client et date",
        "it": "Firma del cliente e data",
        "de": "Unterschrift des Kunden & Datum",
        "es": "Firma del cliente y fecha",
        "nl": "Handtekening van de klant en datum",
        "pt": "Assinatura do cliente e data"
    },
    "Master Agreement Signature": {
        "en": "Master Agreement Signature",
        "fr": "Signature de l'accord-cadre",
        "it": "Firma dell'accordo quadro",
        "de": "Unterschrift der Rahmenvereinbarung",
        "es": "Firma del acuerdo marco",
        "nl": "Handtekening van de hoofdovereenkomst",
        "pt": "Assinatura do contrato principal"
    },
    "Studio Name": {
        "en": "Studio Name",
        "fr": "Nom du studio",
        "it": "Nome dello studio",
        "de": "Name des Studios",
        "es": "Nombre del estudio",
        "nl": "Naam van de studio",
        "pt": "Nome do estúdio"
    },
    "Studio Address & Contact": {
        "en": "Studio Address & Contact",
        "fr": "Adresse et coordonnées du studio",
        "it": "Indirizzo e contatti dello studio",
        "de": "Studio-Adresse & Kontaktdaten",
        "es": "Dirección y contacto del estudio",
        "nl": "Studio-adres en contactgegevens",
        "pt": "Endereço e contato do estúdio"
    },
    "Address & Contact": {
        "en": "Address & Contact",
        "fr": "Adresse et contact",
        "it": "Indirizzo e contatti",
        "de": "Adresse & Kontakt",
        "es": "Dirección y contacto",
        "nl": "Adres en contact",
        "pt": "Endereço e contato"
    },
    "Studio Address & Business Contact": {
        "en": "Studio Address & Business Contact",
        "fr": "Adresse du studio et contact professionnel",
        "it": "Indirizzo e contatti commerciali dello studio",
        "de": "Studio-Adresse & Geschäftskontakt",
        "es": "Dirección del estudio y contacto comercial",
        "nl": "Studio-adres en zakelijk contact",
        "pt": "Endereço do estúdio e contato comercial"
    },
    "Studio Address, Telephone & Permit": {
        "en": "Studio Address, Telephone & Permit",
        "fr": "Adresse, téléphone et autorisation du studio",
        "it": "Indirizzo, telefono e licenza dello studio",
        "de": "Studio-Adresse, Telefon & Betriebserlaubnis",
        "es": "Dirección, teléfono y permiso del estudio",
        "nl": "Studio-adres, telefoon en vergunning",
        "pt": "Endereço, telefone e alvará do estúdio"
    },
    "Studio / Aesthetic Clinic Name": {
        "en": "Studio / Aesthetic Clinic Name",
        "fr": "Nom du studio ou de la clinique esthétique",
        "it": "Nome dello studio o della clinica estetica",
        "de": "Name des Studios oder der Schönheitsklinik",
        "es": "Nombre del estudio o clínica estética",
        "nl": "Naam van de studio of esthetische kliniek",
        "pt": "Nome do estúdio ou clínica de estética"
    },
    "Studio / Practice Name": {
        "en": "Studio / Practice Name",
        "fr": "Nom du studio ou du cabinet",
        "it": "Nome dello studio o della struttura",
        "de": "Name des Studios oder der Praxis",
        "es": "Nombre del estudio o consulta",
        "nl": "Naam van de studio of praktijk",
        "pt": "Nome do estúdio ou consultório"
    },
    "Health Facility Permit # & Location": {
        "en": "Health Facility Permit # & Location",
        "fr": "N° d'agrément sanitaire et localisation",
        "it": "N. autorizzazione sanitaria e sede",
        "de": "Gesundheitsamt-Genehmigungs-Nr. & Standort",
        "es": "N.º de registro sanitario y ubicación",
        "nl": "Gezondheidsvergunning nr. & locatie",
        "pt": "N.º de registro de vigilância sanitária e local"
    },
    "Tattooist (Artist) Name": {
        "en": "Tattooist (Artist) Name",
        "fr": "Nom du tatoueur (artiste)",
        "it": "Nome del tatuatore (artista)",
        "de": "Name des Tätowierers (Künstlers)",
        "es": "Nombre del tatuador (artista)",
        "nl": "Naam van de tatoeëerder (artiest)",
        "pt": "Nome do tatuador (artista)"
    },
    "Tattooist Name": {
        "en": "Tattooist Name",
        "fr": "Nom du tatoueur",
        "it": "Nome del tatuatore",
        "de": "Name des Tätowierers",
        "es": "Nombre del tatuador",
        "nl": "Naam van de tatoeëerder",
        "pt": "Nome do tatuador"
    },
    "Lead Tattooist / Master Artist": {
        "en": "Lead Tattooist / Master Artist",
        "fr": "Tatoueur principal / Artiste référent",
        "it": "Tatuatore principale / Master Artist",
        "de": "Leitender Tätowierer / Master Artist",
        "es": "Tatuador principal / Artista maestro",
        "nl": "Hoofdtatoeëerder / Meestertatoeëerder",
        "pt": "Tatuador principal / Artista master"
    },
    "Practitioner (Piercer / Artist) Name": {
        "en": "Practitioner (Piercer / Artist) Name",
        "fr": "Nom du praticien (perceur / artiste)",
        "it": "Nome del professionista (piercer / artista)",
        "de": "Name des Behandlers (Piercers / Tätowierers)",
        "es": "Nombre del profesional (anillador / artista)",
        "nl": "Naam van de behandelaar (piercer / artiest)",
        "pt": "Nome do profissional (piercer / artista)"
    },
    "Certified PMU Practitioner Name": {
        "en": "Certified PMU Practitioner Name",
        "fr": "Nom du praticien certifié en maquillage permanent",
        "it": "Nome dell'operatore PMU certificato",
        "de": "Name der zertifizierten PMU-Fachkraft",
        "es": "Nombre del especialista certificado en PMU",
        "nl": "Naam van de gecertificeerde PMU-specialist",
        "pt": "Nome do profissional certificado em micropigmentação"
    },
    "Workstation / Sterilization Lot #": {
        "en": "Workstation / Sterilization Lot #",
        "fr": "Poste de travail / N° de lot de stérilisation",
        "it": "Postazione di lavoro / N. lotto sterilizzazione",
        "de": "Arbeitsplatz / Sterilisations-Chargennummer",
        "es": "Estación de trabajo / N.º de lote de esterilización",
        "nl": "Werkplek / Sterilisatie lotnummer",
        "pt": "Bancada de trabalho / N.º do lote de esterilização"
    },
    "Needle & Jewelry Sterilization Lot # / Autoclave Cycle": {
        "en": "Needle & Jewelry Sterilization Lot # / Autoclave Cycle",
        "fr": "N° de lot de stérilisation aiguilles & bijoux / Cycle autoclave",
        "it": "N. lotto sterilizzazione aghi e gioielli / Ciclo autoclave",
        "de": "Chargennummer Nadel-/Schmucksterilisation & Autoklavenzyklus",
        "es": "N.º de lote de esterilización de agujas/joyería y ciclo de autoclave",
        "nl": "Sterilisatie lotnummer naalden/sieraden & autoclavecyclus",
        "pt": "N.º do lote de esterilização de agulhas e joias / Ciclo de autoclave"
    },
    "Pigment Brand, Shade & Lot Number": {
        "en": "Pigment Brand, Shade & Lot Number",
        "fr": "Marque, teinte et n° de lot du pigment",
        "it": "Marca del pigmento, tonalità e numero di lotto",
        "de": "Pigmentmarke, Farbton & Chargennummer",
        "es": "Marca, tono y número de lote del pigmento",
        "nl": "Pigmentmerk, tint en batchnummer",
        "pt": "Marca do pigmento, tonalidade e número do lote"
    },
    "Full Legal Name": {
        "en": "Full Legal Name",
        "fr": "Nom et prénom légaux complets",
        "it": "Nome e cognome anagrafici completi",
        "de": "Vollständiger bürgerlicher Name",
        "es": "Nombre y apellidos legales completos",
        "nl": "Volledige officiële naam",
        "pt": "Nome civil completo"
    },
    "Client Full Legal Name": {
        "en": "Client Full Legal Name",
        "fr": "Nom légal complet du client",
        "it": "Nome anagrafico completo del cliente",
        "de": "Vollständiger bürgerlicher Name des Kunden",
        "es": "Nombre legal completo del cliente",
        "nl": "Volledige officiële naam van de klant",
        "pt": "Nome civil completo do cliente"
    },
    "Client Full Name": {
        "en": "Client Full Name",
        "fr": "Nom complet du client",
        "it": "Nome completo del cliente",
        "de": "Vollständiger Name des Kunden",
        "es": "Nombre completo del cliente",
        "nl": "Volledige naam van de klant",
        "pt": "Nome completo do cliente"
    },
    "Minor Full Legal Name": {
        "en": "Minor Full Legal Name",
        "fr": "Nom légal complet du mineur",
        "it": "Nome anagrafico completo del minore",
        "de": "Vollständiger Name des Minderjährigen",
        "es": "Nombre legal completo del menor",
        "nl": "Volledige officiële naam van de minderjarige",
        "pt": "Nome civil completo do menor"
    },
    "Parent / Legal Guardian Full Legal Name": {
        "en": "Parent / Legal Guardian Full Legal Name",
        "fr": "Nom légal complet du parent ou tuteur légal",
        "it": "Nome anagrafico completo del genitore o tutore legale",
        "de": "Vollständiger Name des Elternteils / Erziehungsberechtigten",
        "es": "Nombre legal completo del padre/madre o tutor legal",
        "nl": "Volledige officiële naam van ouder of voogd",
        "pt": "Nome civil completo do pai, mãe ou responsável legal"
    },
    "Date of Birth": {
        "en": "Date of Birth",
        "fr": "Date de naissance",
        "it": "Data di nascita",
        "de": "Geburtsdatum",
        "es": "Fecha de nacimiento",
        "nl": "Geboortedatum",
        "pt": "Data de nascimento"
    },
    "Minor Date of Birth": {
        "en": "Minor Date of Birth",
        "fr": "Date de naissance du mineur",
        "it": "Data di nascita del minore",
        "de": "Geburtsdatum des Minderjährigen",
        "es": "Fecha de nacimiento del menor",
        "nl": "Geboortedatum van de minderjarige",
        "pt": "Data de nascimento do menor"
    },
    "Minor Current Age": {
        "en": "Minor Current Age",
        "fr": "Âge actuel du mineur",
        "it": "Età attuale del minore",
        "de": "Aktuelles Alter des Minderjährigen",
        "es": "Edad actual del menor",
        "nl": "Leeftijd van de minderjarige",
        "pt": "Idade atual do menor"
    },
    "Email Address": {
        "en": "Email Address",
        "fr": "Adresse e-mail",
        "it": "Indirizzo e-mail",
        "de": "E-Mail-Adresse",
        "es": "Correo electrónico",
        "nl": "E-mailadres",
        "pt": "Endereço de e-mail"
    },
    "Guardian Email Address": {
        "en": "Guardian Email Address",
        "fr": "Adresse e-mail du tuteur",
        "it": "Indirizzo e-mail del tutore",
        "de": "E-Mail-Adresse des Erziehungsberechtigten",
        "es": "Correo electrónico del tutor",
        "nl": "E-mailadres van de voogd",
        "pt": "E-mail do responsável legal"
    },
    "Phone Number": {
        "en": "Phone Number",
        "fr": "Numéro de téléphone",
        "it": "Numero di telefono",
        "de": "Telefonnummer",
        "es": "Número de teléfono",
        "nl": "Telefoonnummer",
        "pt": "Número de telefone"
    },
    "Mobile Phone": {
        "en": "Mobile Phone",
        "fr": "Téléphone portable",
        "it": "Cellulare",
        "de": "Mobiltelefon",
        "es": "Teléfono móvil",
        "nl": "Mobiel telefoonnummer",
        "pt": "Telefone celular"
    },
    "Mobile Telephone": {
        "en": "Mobile Telephone",
        "fr": "Téléphone mobile",
        "it": "Numero di cellulare",
        "de": "Mobilnummer",
        "es": "Teléfono móvil",
        "nl": "Mobiele telefoon",
        "pt": "Telefone celular"
    },
    "Guardian Contact Telephone": {
        "en": "Guardian Contact Telephone",
        "fr": "Téléphone de contact du tuteur",
        "it": "Telefono di contatto del tutore",
        "de": "Telefonnummer des Erziehungsberechtigten",
        "es": "Teléfono de contacto del tutor",
        "nl": "Telefoonnummer van de voogd",
        "pt": "Telefone de contato do responsável"
    },
    "Residential Address": {
        "en": "Residential Address",
        "fr": "Adresse de domicile",
        "it": "Indirizzo di residenza",
        "de": "Wohnanschrift",
        "es": "Dirección de residencia",
        "nl": "Woonadres",
        "pt": "Endereço residencial"
    },
    "Emergency Contact (Name & Relationship & Phone)": {
        "en": "Emergency Contact (Name & Relationship & Phone)",
        "fr": "Contact d'urgence (Nom, Lien de parenté & Téléphone)",
        "it": "Contatto di emergenza (Nome, Relazione e Telefono)",
        "de": "Notfallkontakt (Name, Beziehung & Telefon)",
        "es": "Contacto de emergencia (Nombre, Parentesco y Teléfono)",
        "nl": "Noodcontact (Naam, Relatie en Telefoonnummer)",
        "pt": "Contato de emergência (Nome, Parentesco e Telefone)"
    },
    "Emergency Contact (Name, Relationship & Phone)": {
        "en": "Emergency Contact (Name, Relationship & Phone)",
        "fr": "Contact d'urgence (Nom, Lien & Téléphone)",
        "it": "Contatto di emergenza (Nome, Grado di parentela e Telefono)",
        "de": "Notfallkontakt (Name, Verwandtschaftsgrad & Telefon)",
        "es": "Contacto de emergencia (Nombre, Relación y Teléfono)",
        "nl": "Noodcontact (Naam, Verwantschap & Telefoon)",
        "pt": "Contato de emergência (Nome, Grau de parentesco e Telefone)"
    },
    "Emergency Contact Name & Telephone": {
        "en": "Emergency Contact Name & Telephone",
        "fr": "Nom et téléphone du contact d'urgence",
        "it": "Nome e telefono del contatto di emergenza",
        "de": "Name & Telefonnummer des Notfallkontakts",
        "es": "Nombre y teléfono del contacto de emergencia",
        "nl": "Naam en telefoon van het noodcontact",
        "pt": "Nome e telefone do contato de emergência"
    },
    "Government ID (Driver License / Passport #)": {
        "en": "Government ID (Driver License / Passport #)",
        "fr": "Pièce d'identité officielle (Permis / Passeport n°)",
        "it": "Documento di identità (Patente / Passaporto n.)",
        "de": "Amtlicher Lichtbildausweis (Führerschein-/Pass-Nr.)",
        "es": "Documento de identidad (DNI / Licencia / Pasaporte)",
        "nl": "Officieel identiteitsbewijs (Rijbewijs / Paspoort nr.)",
        "pt": "Documento oficial de identificação (RG / CNH / Passaporte)"
    },
    "Minor Identification (Birth Certificate / School ID / Passport)": {
        "en": "Minor Identification (Birth Certificate / School ID / Passport)",
        "fr": "Pièce d'identité du mineur (Acte de naissance / Scolaire / Passeport)",
        "it": "Documento del minore (Atto di nascita / Tessera scolastica / Passaporto)",
        "de": "Ausweisdokument des Minderjährigen (Geburtsurkunde / Schülerausweis / Pass)",
        "es": "Identificación del menor (Acta de nacimiento / Carnet / Pasaporte)",
        "nl": "Identiteitsbewijs van de minderjarige (Geboorteakte / Schoolpas / Paspoort)",
        "pt": "Identificação do menor (Certidão de nascimento / Documento escolar / Passaporte)"
    },
    "Guardian Government ID (Driver License / Passport #)": {
        "en": "Guardian Government ID (Driver License / Passport #)",
        "fr": "Pièce d'identité du tuteur (Permis / Passeport n°)",
        "it": "Documento del tutore (Patente / Passaporto n.)",
        "de": "Ausweisdokument des Vormunds (Führerschein-/Pass-Nr.)",
        "es": "Documento de identidad del tutor (DNI / Licencia / Pasaporte)",
        "nl": "Identiteitsbewijs van de voogd (Rijbewijs / Paspoort nr.)",
        "pt": "Documento oficial do responsável legal (RG / CNH / Passaporte)"
    },
    "Legal Relationship to Minor": {
        "en": "Legal Relationship to Minor",
        "fr": "Lien de parenté juridique avec le mineur",
        "it": "Rapporto di parentela / tutela legale con il minore",
        "de": "Rechtliches Verwandtschaftsverhältnis zum Minderjährigen",
        "es": "Relación o parentesco legal con el menor",
        "nl": "Juridische relatie tot de minderjarige",
        "pt": "Grau de parentesco ou vínculo legal com o menor"
    },
    "Primary Care Physician / Clinic Name & Phone": {
        "en": "Primary Care Physician / Clinic Name & Phone",
        "fr": "Médecin traitant / Clinique & Téléphone",
        "it": "Medico curante / Clinica e Telefono",
        "de": "Hausarzt / Praxisname & Telefonnummer",
        "es": "Médico de cabecera / Centro de salud y teléfono",
        "nl": "Huisarts / Praktijknaam en telefoonnummer",
        "pt": "Médico de referência / Nome da clínica e telefone"
    },
    "Health Condition Physician Clearance Notice": {
        "en": "Health Condition Physician Clearance Notice",
        "fr": "Avis d'autorisation médicale pour état de santé",
        "it": "Informativa sul nulla osta medico per condizioni di salute",
        "de": "Hinweis zur ärztlichen Unbedenklichkeitsbescheinigung",
        "es": "Aviso de autorización médica según condición de salud",
        "nl": "Kennisgeving medische goedkeuring bij gezondheidsaandoeningen",
        "pt": "Aviso de autorização médica para condições de saúde"
    },
    "IMPORTANT: Clients with conditions such as cardiovascular disease, diabetes, epilepsy, bleeding disorders/hemophilia, hepatitis, compromised immune system, or active skin conditions are legally required to obtain written authorization from their physician prior to procedure.": {
        "en": "IMPORTANT: Clients with conditions such as cardiovascular disease, diabetes, epilepsy, bleeding disorders/hemophilia, hepatitis, compromised immune system, or active skin conditions are legally required to obtain written authorization from their physician prior to procedure.",
        "fr": "IMPORTANT : Les personnes souffrant de maladies cardiovasculaires, diabète, épilepsie, troubles de la coagulation, hépatite, déficit immunitaire ou lésions cutanées doivent obligatoirement obtenir une autorisation écrite de leur médecin avant tout acte.",
        "it": "IMPORTANTE: I clienti affetti da patologie cardiovascolari, diabete, epilessia, emofilia, epatite, immunodeficienza o lesioni cutanee attive devono per legge ottenere un nulla osta scritto dal proprio medico prima della procedura.",
        "de": "WICHTIG: Kunden mit Herz-Kreislauf-Erkrankungen, Diabetes, Epilepsie, Blutgerinnungsstörungen, Hepatitis, geschwächtem Immunsystem oder akuten Hauterkrankungen benötigen vor dem Eingriff eine schriftliche ärztliche Unbedenklichkeitsbescheinigung.",
        "es": "IMPORTANTE: Los clientes con enfermedades cardiovasculares, diabetes, epilepsia, trastornos de la coagulación/hemofilia, hepatitis, inmunodeficiencia o problemas cutáneos activos deben obtener autorización médica por escrito antes del procedimiento.",
        "nl": "BELANGRIJK: Klanten met aandoeningen zoals hart- en vaatziekten, diabetes, epilepsie, stollingsstoornissen, hepatitis, verminderde immuniteit of huiduitslag zijn wettelijk verplicht vooraf schriftelijke toestemming van hun arts te overleggen.",
        "pt": "IMPORTANTE: Clientes com doenças cardiovasculares, diabetes, epilepsia, distúrbios hemorrágicos/hemofilia, hepatite, imunidade comprometida ou lesões ativas de pele devem obrigatoriamente apresentar autorização médica por escrito antes do procedimento."
    },
    "Do you have any medical condition that requires physician clearance before tattooing?": {
        "en": "Do you have any medical condition that requires physician clearance before tattooing?",
        "fr": "Présentez-vous une condition médicale nécessitant une autorisation médicale avant le tatouage ?",
        "it": "Ha patologie o condizioni di salute che richiedono un nulla osta medico prima di effettuare un tatuaggio?",
        "de": "Bestehen bei Ihnen Vorerkrankungen, die vor dem Tätowieren eine ärztliche Freigabe erfordern?",
        "es": "¿Padece alguna afección médica que requiera autorización médica antes de tatuarse?",
        "nl": "Heeft u een medische aandoening waarvoor vooraf doktersgoedkeuring vereist is?",
        "pt": "Você possui alguma condição médica que exija autorização médica antes de se tatuar?"
    },
    "No - I have no high-risk contraindicating conditions": {
        "en": "No - I have no high-risk contraindicating conditions",
        "fr": "Non - Aucune contre-indication ou condition à risque",
        "it": "No - Non ho condizioni a rischio o controindicazioni",
        "de": "Nein - Keine risikobehafteten Kontraindikationen",
        "es": "No - No presento condiciones de riesgo ni contraindicaciones",
        "nl": "Nee - Geen risicovolle contra-indicaties",
        "pt": "Não - Não possuo condições contraindicadas de alto risco"
    },
    "Yes - I have obtained written clearance from my doctor": {
        "en": "Yes - I have obtained written clearance from my doctor",
        "fr": "Oui - J'ai obtenu l'autorisation écrite de mon médecin",
        "it": "Sì - Ho ottenuto il certificato/nulla osta scritto dal mio medico",
        "de": "Ja - Schriftliche ärztliche Freigabe liegt vor",
        "es": "Sí - Dispongo de la autorización escrita de mi médico",
        "nl": "Ja - Ik heb schriftelijke goedkeuring van mijn arts verkregen",
        "pt": "Sim - Obtive autorização por escrito do meu médico"
    },
    "Yes - Pending doctor consultation": {
        "en": "Yes - Pending doctor consultation",
        "fr": "Oui - Consultation médicale en cours / en attente",
        "it": "Sì - In attesa di visita medica specialistica",
        "de": "Ja - Ärztliche Konsultation noch ausstehend",
        "es": "Sí - Pendiente de consulta médica",
        "nl": "Ja - In afwachting van doktersconsult",
        "pt": "Sim - Em avaliação/consulta médica pendente"
    },
    "Physician Name & Clearance Document Details": {
        "en": "Physician Name & Clearance Document Details",
        "fr": "Nom du médecin et références du document d'autorisation",
        "it": "Nome del medico e dettagli del documento di nulla osta",
        "de": "Name des Arztes & Angaben zum Attest",
        "es": "Nombre del médico y detalles del documento de autorización",
        "nl": "Naam van de arts & details van de goedkeuringsverklaring",
        "pt": "Nome do médico e dados do comprovante de liberação"
    },
    "Tattoo Placement / Body Location": {
        "en": "Tattoo Placement / Body Location",
        "fr": "Emplacement du tatouage / Zone corporelle",
        "it": "Posizione del tatuaggio / Zona anatomica",
        "de": "Tattoo-Platzierung / Körperstelle",
        "es": "Ubicación del tatuaje / Zona anatómica",
        "nl": "Plaatsing van de tatoeage / Lichaamslocatie",
        "pt": "Local do tatuagem / Região do corpo"
    },
    "Detailed Design Concept & Subject Matter": {
        "en": "Detailed Design Concept & Subject Matter",
        "fr": "Description détaillée du motif et du projet",
        "it": "Descrizione dettagliata del soggetto e del disegno",
        "de": "Detaillierte Motivbeschreibung & Designkonzept",
        "es": "Concepto detallado del diseño y tema",
        "nl": "Gedetailleerde beschrijving van het ontwerp en thema",
        "pt": "Conceito detalhado do desenho e tema"
    },
    "Approximate Dimensions (Inches or Centimeters)": {
        "en": "Approximate Dimensions (Inches or Centimeters)",
        "fr": "Dimensions approximatives (cm ou pouces)",
        "it": "Dimensioni approssimative (cm o pollici)",
        "de": "Ungefähre Abmessungen (Zentimeter oder Zoll)",
        "es": "Dimensiones aproximadas (centímetros o pulgadas)",
        "nl": "Geschatte afmetingen (centimeters of inches)",
        "pt": "Dimensões aproximadas (centímetros ou polegadas)"
    },
    "Color Palette & Shading Style": {
        "en": "Color Palette & Shading Style",
        "fr": "Palette de couleurs et style d'ombrage",
        "it": "Palette cromatica e stile di sfumatura",
        "de": "Farbpalette & Schattierungsstil",
        "es": "Paleta de colores y estilo de sombreado",
        "nl": "Kleurenpalet en schaduwstijl",
        "pt": "Paleta de cores e estilo de sombreamento"
    },
    "Solid Black & Grey Shading": {
        "en": "Solid Black & Grey Shading",
        "fr": "Noir & Gris / Dégradés et ombrages",
        "it": "Nero e grigio / Bianco e nero sfumato",
        "de": "Black & Grey (Schwarz-Grau Schattierung)",
        "es": "Negro y gris (Black & Grey)",
        "nl": "Zwart-grijs (Black & Grey)",
        "pt": "Preto e cinza (Black & Grey)"
    },
    "Full Color": {
        "en": "Full Color",
        "fr": "Couleur intégrale",
        "it": "A colori (Full Color)",
        "de": "Vollfarbe (Full Color)",
        "es": "A todo color (Full Color)",
        "nl": "Volledig in kleur",
        "pt": "Colorido (Full Color)"
    },
    "Blackwork / Linework Only": {
        "en": "Blackwork / Linework Only",
        "fr": "Blackwork / Lignes et tracés uniquement",
        "it": "Solo linee e blackwork (Linework)",
        "de": "Reines Linework & Blackwork",
        "es": "Solo líneas y relleno negro (Blackwork / Linework)",
        "nl": "Enkel lijnen en zwartwerk (Linework/Blackwork)",
        "pt": "Apenas traços e preenchimento sólido (Blackwork / Linework)"
    },
    "Watercolor / Painterly": {
        "en": "Watercolor / Painterly",
        "fr": "Aquarelle / Effet peinture",
        "it": "Acquerello (Watercolor) / Pittorico",
        "de": "Aquarell (Watercolor) / Malerisch",
        "es": "Acuarela (Watercolor) / Pictórico",
        "nl": "Aquarel (Watercolor) / Schilderachtig",
        "pt": "Aquarela (Watercolor) / Pictórico"
    },
    "Fine Line Single Needle": {
        "en": "Fine Line Single Needle",
        "fr": "Fine Line / Aiguille unique (Single Needle)",
        "it": "Linee sottili (Fine Line) / Ago singolo",
        "de": "Fine Line / Feine Nadel (Single Needle)",
        "es": "Línea fina (Fine Line) / Aguja única",
        "nl": "Fine Line / Enkele naald (Single Needle)",
        "pt": "Traço fino (Fine Line) / Agulha única"
    },
    "Other Custom Blend": {
        "en": "Other Custom Blend",
        "fr": "Autre mélange ou style personnalisé",
        "it": "Altra combinazione personalizzata",
        "de": "Anderer individueller Stilmix",
        "es": "Otra combinación o estilo personalizado",
        "nl": "Andere aangepaste stijlcombinatie",
        "pt": "Outra combinação ou estilo personalizado"
    },
    "Reference Material & Sketches Attached": {
        "en": "Reference Material & Sketches Attached",
        "fr": "Images de référence et croquis joints",
        "it": "Materiale di riferimento e bozzetti allegati",
        "de": "Referenzbilder und Skizzen beigefügt",
        "es": "Material de referencia y bocetos adjuntos",
        "nl": "Referentiemateriaal en schetsen bijgevoegd",
        "pt": "Imagens de referência e esboços anexados"
    },
    "Piercing Anatomy / Location": {
        "en": "Piercing Anatomy / Location",
        "fr": "Anatomie / Emplacement du piercing",
        "it": "Anatomia / Posizione del piercing",
        "de": "Piercing-Anatomie / Platzierung",
        "es": "Anatomía / Ubicación de la perforación",
        "nl": "Piercing-anatomie / Plaatsing",
        "pt": "Anatomia / Local do piercing"
    },
    "Lobe (Single / Double / Triple)": {
        "en": "Lobe (Single / Double / Triple)",
        "fr": "Lobe d'oreille (Simple / Double / Triple)",
        "it": "Lobo (Singolo / Doppio / Triplo)",
        "de": "Ohrläppchen (Einfach / Zweifach / Dreifach)",
        "es": "Lóbulo (Simple / Doble / Triple)",
        "nl": "Oorlel (Enkel / Dubbel / Drievoudig)",
        "pt": "Lóbulo (Simples / Duplo / Triplo)"
    },
    "Helix / Cartilage": {
        "en": "Helix / Cartilage",
        "fr": "Hélix / Cartilage",
        "it": "Elica (Helix) / Cartilagine",
        "de": "Helix / Knorpel",
        "es": "Hélix / Cartílago",
        "nl": "Helix / Kraakbeen",
        "pt": "Hélix / Cartilagem"
    },
    "Conch / Tragus / Rook / Daith": {
        "en": "Conch / Tragus / Rook / Daith",
        "fr": "Conch / Tragus / Rook / Daith",
        "it": "Conch / Tragus / Rook / Daith",
        "de": "Conch / Tragus / Rook / Daith",
        "es": "Conch / Tragus / Rook / Daith",
        "nl": "Conch / Tragus / Rook / Daith",
        "pt": "Conch / Tragus / Rook / Daith"
    },
    "Nostril / Septum": {
        "en": "Nostril / Septum",
        "fr": "Narine / Septum",
        "it": "Narice (Nostril) / Setto (Septum)",
        "de": "Nasenflügel (Nostril) / Septum",
        "es": "Nariz (Nostril) / Septum",
        "nl": "Neusvleugel (Nostril) / Septum",
        "pt": "Nostril (Aba nasal) / Septo"
    },
    "Navel": {
        "en": "Navel",
        "fr": "Nombril",
        "it": "Ombelico (Navel)",
        "de": "Bauchnabel",
        "es": "Ombligo",
        "nl": "Navel",
        "pt": "Umbigo"
    },
    "Eyebrow / Bridge": {
        "en": "Eyebrow / Bridge",
        "fr": "Sourcil / Bridge (Pont nasal)",
        "it": "Sopracciglio / Bridge",
        "de": "Augenbraue / Bridge",
        "es": "Ceja / Bridge (Puente nasal)",
        "nl": "Wenkbrauw / Bridge",
        "pt": "Sobrancelha / Bridge"
    },
    "Lip / Labret / Medusa": {
        "en": "Lip / Labret / Medusa",
        "fr": "Lèvre / Labret / Medusa",
        "it": "Labbro / Labret / Medusa",
        "de": "Lippe / Labret / Medusa",
        "es": "Labio / Labret / Medusa",
        "nl": "Lip / Labret / Medusa",
        "pt": "Lábio / Labret / Medusa"
    },
    "Tongue / Oral": {
        "en": "Tongue / Oral",
        "fr": "Langue / Bucco-dentaire",
        "it": "Lingua / Orale",
        "de": "Zunge / Mundbereich",
        "es": "Lengua / Oral",
        "nl": "Tong / Oraal",
        "pt": "Língua / Bucal"
    },
    "Nipple": {
        "en": "Nipple",
        "fr": "Mamelon",
        "it": "Capezzolo",
        "de": "Brustwarze",
        "es": "Pezón",
        "nl": "Tepel",
        "pt": "Mamilo"
    },
    "Surface / Microdermal": {
        "en": "Surface / Microdermal",
        "fr": "Surface / Implat microdermal",
        "it": "Surface / Microdermal",
        "de": "Surface / Mikrodermal-Anker",
        "es": "Superficie / Microdermal",
        "nl": "Surface / Microdermal implantaat",
        "pt": "Superfície / Microdermal"
    },
    "Other Piercing Location": {
        "en": "Other Piercing Location",
        "fr": "Autre emplacement de piercing",
        "it": "Altra posizione di piercing",
        "de": "Andere Piercing-Stelle",
        "es": "Otra ubicación de perforación",
        "nl": "Andere piercinglocatie",
        "pt": "Outro local de piercing"
    },
    "Side / Orientation": {
        "en": "Side / Orientation",
        "fr": "Côté / Orientation",
        "it": "Lato / Orientamento",
        "de": "Seite / Ausrichtung",
        "es": "Lado / Orientación",
        "nl": "Zijde / Richting",
        "pt": "Lado / Orientação"
    },
    "Left": {
        "en": "Left",
        "fr": "Gauche",
        "it": "Sinistra",
        "de": "Links",
        "es": "Izquierda",
        "nl": "Links",
        "pt": "Esquerda"
    },
    "Right": {
        "en": "Right",
        "fr": "Droite",
        "it": "Destra",
        "de": "Rechts",
        "es": "Derecha",
        "nl": "Rechts",
        "pt": "Direita"
    },
    "Center / Bilateral": {
        "en": "Center / Bilateral",
        "fr": "Centre / Bilatéral",
        "it": "Centro / Bilaterale",
        "de": "Mitte / Beidseitig (Bilateral)",
        "es": "Centro / Bilateral",
        "nl": "Midden / Bilateraal",
        "pt": "Centro / Bilateral"
    },
    "N/A": {
        "en": "N/A",
        "fr": "S/O (Sans objet)",
        "it": "N/D (Non applicabile)",
        "de": "N/A (Nicht zutreffend)",
        "es": "N/A (No aplicable)",
        "nl": "N.v.t.",
        "pt": "N/A (Não se aplica)"
    },
    "Initial Jewelry Material & Certified Alloy Grade": {
        "en": "Initial Jewelry Material & Certified Alloy Grade",
        "fr": "Matériau et grade d'alliage certifié du bijou initial",
        "it": "Materiale e grado di lega certificata del gioiello iniziale",
        "de": "Erstschmuck-Material & zertifizierte Legierungsgüte",
        "es": "Material y grado de aleación certificada de la joyería inicial",
        "nl": "Materiaal & gecertificeerde legeringsgraad van het initiële sieraad",
        "pt": "Material e classificação de liga certificada da joia inicial"
    },
    "Implant Grade ASTM F-136 Titanium (Ti6Al4V ELI)": {
        "en": "Implant Grade ASTM F-136 Titanium (Ti6Al4V ELI)",
        "fr": "Titane de grade implantable ASTM F-136 (Ti6Al4V ELI)",
        "it": "Titanio per impianti ASTM F-136 (Ti6Al4V ELI)",
        "de": "Implantatfähiges Titan ASTM F-136 (Ti6Al4V ELI)",
        "es": "Titanio grado implante ASTM F-136 (Ti6Al4V ELI)",
        "nl": "Implant-grade titanium ASTM F-136 (Ti6Al4V ELI)",
        "pt": "Titânio grau implante ASTM F-136 (Ti6Al4V ELI)"
    },
    "Implant Grade ASTM F-138 Stainless Steel (316LVM)": {
        "en": "Implant Grade ASTM F-138 Stainless Steel (316LVM)",
        "fr": "Acier chirurgical implantable ASTM F-138 (316LVM)",
        "it": "Acciaio chirurgico per impianti ASTM F-138 (316LVM)",
        "de": "Implantatfähiger Edelstahl ASTM F-138 (316LVM)",
        "es": "Acero inoxidable grado implante ASTM F-138 (316LVM)",
        "nl": "Implant-grade roestvrij staal ASTM F-138 (316LVM)",
        "pt": "Aço inoxidável grau implante ASTM F-138 (316LVM)"
    },
    "14k / 18k Solid Nickel-Free Gold (Biocompatible)": {
        "en": "14k / 18k Solid Nickel-Free Gold (Biocompatible)",
        "fr": "Or massif 14k / 18k sans nickel (biocompatible)",
        "it": "Oro massiccio 14k / 18k nickel-free (biocompatibile)",
        "de": "14k / 18k nickelfreies Echtgold (biokompatibel)",
        "es": "Oro macizo 14k / 18k libre de níquel (biocompatible)",
        "nl": "14k / 18k massief nikkelvrij goud (biocompatibel)",
        "pt": "Ouro maciço 14k / 18k livre de níquel (biocompatível)"
    },
    "Unalloyed ASTM F-67 Titanium": {
        "en": "Unalloyed ASTM F-67 Titanium",
        "fr": "Titane non allié pur ASTM F-67",
        "it": "Titanio non legato ASTM F-67",
        "de": "Unlegiertes Reintitan ASTM F-67",
        "es": "Titanio no aleado ASTM F-67",
        "nl": "Ongelegeerd zuiver titanium ASTM F-67",
        "pt": "Titânio puro não ligado ASTM F-67"
    },
    "High Purity Niobium (ASTM B392 / 99.9%)": {
        "en": "High Purity Niobium (ASTM B392 / 99.9%)",
        "fr": "Niobium haute pureté (ASTM B392 / 99,9 %)",
        "it": "Niobio ad alta purezza (ASTM B392 / 99,9%)",
        "de": "Reinst-Niob (ASTM B392 / 99,9%)",
        "es": "Niobio de alta pureza (ASTM B392 / 99,9 %)",
        "nl": "Zuiver niobium (ASTM B392 / 99,9%)",
        "pt": "Nióbio de alta pureza (ASTM B392 / 99,9%)"
    },
    "Biocompatible Polymers (PTFE ASTM F754 / Medical Grade)": {
        "en": "Biocompatible Polymers (PTFE ASTM F754 / Medical Grade)",
        "fr": "Polymères biocompatibles (PTFE ASTM F754 / Qualité médicale)",
        "it": "Polimeri biocompatibili (PTFE ASTM F754 / Grado medico)",
        "de": "Biokompatible Polymere (PTFE ASTM F754 / Medizinischer Grad)",
        "es": "Polímeros biocompatibles (PTFE ASTM F754 / Grado médico)",
        "nl": "Biocompatibele polymeren (PTFE ASTM F754 / Medische kwaliteit)",
        "pt": "Polímeros biocompatíveis (PTFE ASTM F754 / Grau médico)"
    },
    "Wire Gauge (AWG / Metric) & Post Length / Diameter": {
        "en": "Wire Gauge (AWG / Metric) & Post Length / Diameter",
        "fr": "Calibre de tige (AWG / métrique) et longueur / diamètre",
        "it": "Spessore barra (AWG / Metrico) e lunghezza / diametro",
        "de": "Drahtstärke (AWG / Metrisch) & Stablänge / Durchmesser",
        "es": "Calibre del alambre (AWG / métrico) y longitud / diámetro",
        "nl": "Dikte (AWG / Metrisch) en staaflengte / diameter",
        "pt": "Espessura do fio (AWG / Métrico) e comprimento / diâmetro"
    },
    "I certify that I am at least 18 years of age (or legal guardian present with ID).": {
        "en": "I certify that I am at least 18 years of age (or legal guardian present with ID).",
        "fr": "J'atteste être âgé(e) d'au moins 18 ans (ou en présence de mon tuteur légal muni d'une pièce d'identité).",
        "it": "Dichiaro di avere almeno 18 anni (o che il mio tutore legale è presente con documento d'identità valido).",
        "de": "Ich bestätige, dass ich mindestens 18 Jahre alt bin (oder der Erziehungsberechtigte mit Ausweis anwesend ist).",
        "es": "Certifico que tengo al menos 18 años de edad (o que mi tutor legal está presente con documento de identidad).",
        "nl": "Ik verklaar dat ik ten minste 18 jaar oud ben (of dat mijn wettelijke voogd met identiteitsbewijs aanwezig is).",
        "pt": "Declaro que tenho pelo menos 18 anos de idade (ou que meu responsável legal está presente com documento oficial)."
    },
    "DECLARATION OF CAPACITY: I declare that I am in full capacity of my own reflection, judgment, and sound mind, and am not under the influence of drugs, alcohol, or narcotics.": {
        "en": "DECLARATION OF CAPACITY: I declare that I am in full capacity of my own reflection, judgment, and sound mind, and am not under the influence of drugs, alcohol, or narcotics.",
        "fr": "DÉCLARATION DE DISCERNEMENT : Je déclare être en pleine possession de mes facultés mentales et de mon jugement, et ne pas être sous l'emprise de drogues, d'alcool ou de stupéfiants.",
        "it": "DICHIARAZIONE DI CAPACITÀ: Dichiaro di essere in piena capacità di intendere e di volere, nel pieno possesso delle mie facoltà mentali e non sotto l'effetto di alcol, droghe o stupefacenti.",
        "de": "ERKLÄRUNG ZUR URTEILSFÄHIGKEIT: Ich erkläre, dass ich bei vollem Bewusstsein und im Vollbesitz meiner geistigen Kräfte bin und nicht unter dem Einfluss von Drogen, Alkohol oder Rauschmitteln stehe.",
        "es": "DECLARACIÓN DE DISCERNIMIENTO: Declaro que me encuentro en pleno uso de mis facultades mentales y capacidad de reflexión, y que no estoy bajo la influencia de drogas, alcohol ni estupefacientes.",
        "nl": "VERKLARING VAN WILBEKWAAMHEID: Ik verklaar dat ik volledig wilsbekwaam en bij vol bewustzijn ben en niet onder invloed verkeer van alcohol, drugs of verdovende middelen.",
        "pt": "DECLARAÇÃO DE DISCERNIMENTO: Declaro estar em plena capacidade de reflexão, discernimento e consciência, e não estar sob a influência de álcool, drogas ou entorpecentes."
    },
    "CAPACITY OF REFLECTION: I affirm that I am of sound mind, in full mental capacity of my decisions, and not under the influence of any drugs, alcohol, or narcotics.": {
        "en": "CAPACITY OF REFLECTION: I affirm that I am of sound mind, in full mental capacity of my decisions, and not under the influence of any drugs, alcohol, or narcotics.",
        "fr": "CAPACITÉ DE DISCERNEMENT : J'affirme être sain(e) d'esprit, en pleine capacité de décision, et ne pas être sous l'emprise de stupéfiants, d'alcool ou de médicaments altérant le jugement.",
        "it": "CAPACITÀ DI INTENDERE: Confermo di essere sano di mente, nella piena capacità decisionale e non sotto l'influsso di droghe, alcol o sostanze stupefacenti.",
        "de": "URTEILSFÄHIGKEIT: Ich bestätige, dass ich im Vollbesitz meiner geistigen Kräfte und entscheidungsfähig bin sowie nicht unter dem Einfluss von Drogen, Alkohol oder Betäubungsmitteln stehe.",
        "es": "CAPACIDAD DE REFLEXIÓN: Afirmo que estoy en pleno uso de mis facultades mentales, con total capacidad de decisión y sin estar bajo la influencia de drogas, alcohol ni narcóticos.",
        "nl": "WILSBEKWAAMHEID: Ik bevestig dat ik bij mijn volle verstand ben, volledig wilsbekwaam ben in mijn beslissingen en niet onder invloed ben van alcohol, drugs of medicijnen.",
        "pt": "CAPACIDADE DE REFLEXÃO: Afirmo estar lúcido, em plena capacidade mental de decisão e não estar sob a influência de quaisquer substâncias psicoativas, álcool ou entorpecentes."
    },
    "CAPACITY OF REFLECTION: I affirm that I am in full capacity of reflection, sound judgment, and entering into this aesthetic procedure of my own free will.": {
        "en": "CAPACITY OF REFLECTION: I affirm that I am in full capacity of reflection, sound judgment, and entering into this aesthetic procedure of my own free will.",
        "fr": "CAPACITÉ DE DISCERNEMENT : J'affirme être en pleine capacité de réflexion, doté(e) d'un jugement sain et entreprendre cette démarche esthétique de mon plein gré.",
        "it": "CAPACITÀ DI DISCERNIMENTO: Confermo di essere in piena capacità di giudizio e di intendere, e di sottopormi a questa procedura estetica per mia libera scelta.",
        "de": "URTEILSFÄHIGKEIT: Ich bestätige, dass ich im Vollbesitz meiner Urteilskraft bin und diese ästhetische Behandlung aus freiem Willen durchführen lasse.",
        "es": "CAPACIDAD DE REFLEXIÓN: Afirmo que me encuentro en plena capacidad de reflexión, con sano juicio y accediendo a este procedimiento estético por mi propia voluntad.",
        "nl": "WILSBEKWAAMHEID: Ik bevestig dat ik over volledig oordeelsvermogen beschik en deze esthetische behandeling uit vrije wil onderga.",
        "pt": "CAPACIDADE DE REFLEXÃO: Afirmo estar em plena capacidade de discernimento e bom senso, realizando este procedimento estético por minha livre e espontânea vontade."
    },
    "DECLARATION OF REFLECTION: I affirm that I am of sound mind, in full capacity of reflection, not under the influence of any drugs/alcohol, and fully committed to completing this extensive project.": {
        "en": "DECLARATION OF REFLECTION: I affirm that I am of sound mind, in full capacity of reflection, not under the influence of any drugs/alcohol, and fully committed to completing this extensive project.",
        "fr": "DÉCLARATION DE DISCERNEMENT : J'affirme être sain(e) d'esprit, en pleine capacité de réflexion, non intoxiqué(e) et pleinement engagé(e) à mener à terme ce projet d'envergure.",
        "it": "DICHIARAZIONE DI DISCERNIMENTO: Confermo di essere sano di mente, in piena capacità di riflessione, non sotto l'influenza di sostanze e pienamente determinato a completare questo progetto.",
        "de": "REFLEXIONSERKLÄRUNG: Ich bestätige, dass ich im Vollbesitz meiner geistigen Kräfte bin, nicht unter Alkoholeinfluss/Drogen stehe und mich voll zur Durchführung dieses Großprojekts verpflichte.",
        "es": "DECLARACIÓN DE DISCERNIMIENTO: Afirmo que estoy en pleno uso de mis facultades, con capacidad de reflexión y plenamente comprometido/a a completar este extenso proyecto.",
        "nl": "VERKLARING VAN REFLECTIE: Ik bevestig dat ik wilsbekwaam ben, niet onder invloed verkeer en mij volledig inzet voor het voltooien van dit omvangrijke project.",
        "pt": "DECLARAÇÃO DE REFLEXÃO: Afirmo estar lúcido, em plena capacidade de reflexão, sem estar sob a influência de álcool/drogas e totalmente comprometido em concluir este grande projeto."
    },
    "PRE-PROCEDURE AFTERCARE ADVICE: I confirm that I have been provided with detailed verbal and written aftercare instructions conforming to professional body piercing standards (sterile saline spray 0.9% USP, non-touch technique, downsizing timeline) prior to the piercing.": {
        "en": "PRE-PROCEDURE AFTERCARE ADVICE: I confirm that I have been provided with detailed verbal and written aftercare instructions conforming to professional body piercing standards (sterile saline spray 0.9% USP, non-touch technique, downsizing timeline) prior to the piercing.",
        "fr": "CONSEILS DE SOINS PRÉ-PROCÉDURE : Je confirme avoir reçu des instructions de soins verbales et écrites détaillées conformes aux normes professionnelles de piercing corporel (spray salin stérile 0,9 % USP, technique sans contact, calendrier de réduction de taille) avant le perçage.",
        "it": "INFORMATIVA CURA POST-PROCEDURA: Confermo di aver ricevuto istruzioni dettagliate verbali e scritte conformi agli standard professionali di body piercing (soluzione salina sterile 0,9% USP, tecnica no-touch, tempistiche di downsizing) prima del piercing.",
        "de": "NACHSORGEAUFKLÄRUNG VOR DEM EINGRIFF: Ich bestätige, dass ich vor dem Piercing ausführliche mündliche und schriftliche Nachsorgeanweisungen gemäß professionellen Bodypiercing-Standards (sterile Kochsalzlösung 0,9% USP, No-Touch-Technik, Downsizing-Plan) erhalten habe.",
        "es": "CONSEJOS DE CUIDADOS PREVIOS: Confirmo que he recibido instrucciones detalladas verbales y escritas conformes a los Estándares Profesionales de Piercing (suero salino estéril 0,9% USP, técnica sin contacto, calendario de cambio a barra más corta) antes del procedimiento.",
        "nl": "VOORAFGAAND NAZORGADVIES: Ik bevestig dat ik voorafgaand aan het piercen uitgebreide mondelinge en schriftelijke nazorginstructies heb ontvangen conform professionele bodypiercing-normen (steriele zoutspray 0,9% USP, non-touch techniek, downsizing-schema).",
        "pt": "INSTRUÇÕES DE CUIDADOS PRÉVIOS: Confirmo que recebi orientações verbais e escritas detalhadas em conformidade com os Padrões Profissionais de Body Piercing (soro fisiológico estéril 0,9% USP, técnica sem toque, cronograma de downsizing) antes da perfuração."
    },
    "PRE-PROCEDURE AFTERCARE CONFIRMATION: I confirm that prior to this procedure, I have received comprehensive verbal and written advice on aftercare, hygiene, and healing instructions.": {
        "en": "PRE-PROCEDURE AFTERCARE CONFIRMATION: I confirm that prior to this procedure, I have received comprehensive verbal and written advice on aftercare, hygiene, and healing instructions.",
        "fr": "CONFIRMATION DES CONSEILS DE SOINS : Je confirme avoir reçu avant l'acte des conseils oraux et écrits complets concernant l'hygiène, les soins et la cicatrisation.",
        "it": "CONFERMA CURA POST-TRATTAMENTO: Confermo di aver ricevuto prima della procedura informazioni orali e scritte complete su igiene, cura e guarigione.",
        "de": "BESTÄTIGUNG DER NACHSORGEAUFKLÄRUNG: Ich bestätige, dass ich vor dem Eingriff eine umfassende mündliche und schriftliche Beratung zu Hygiene und Nachsorge erhalten habe.",
        "es": "CONFIRMACIÓN DE CUIDADOS PREVIOS: Confirmo que antes de este procedimiento he recibido asesoramiento exhaustivo verbal y escrito sobre higiene, cuidados y cicatrización.",
        "nl": "BEVESTIGING VOORAFGAANDE NAZORG: Ik bevestig dat ik voorafgaand aan deze behandeling uitgebreid mondeling en schriftelijk advies over hygiëne en wondverzorging heb gekregen.",
        "pt": "CONFIRMAÇÃO DE CUIDADOS PRÉVIOS: Confirmo que, antes deste procedimento, recebi orientações completas verbais e escritas sobre higiene, cuidados e cicatrização."
    },
    "TRUTHFUL DISCLOSURE CERTIFICATION: I solemnly declare under penalty of false statement that all medical disclosures made in this form are accurate, complete, and true to the best of my knowledge.": {
        "en": "TRUTHFUL DISCLOSURE CERTIFICATION: I solemnly declare under penalty of false statement that all medical disclosures made in this form are accurate, complete, and true to the best of my knowledge.",
        "fr": "CERTIFICATION D'EXACTITUDE : Je déclare solennellement que toutes les déclarations médicales fournies dans ce formulaire sont exactes, complètes et conformes à la vérité.",
        "it": "AUTOCERTIFICAZIONE DI VERIDICITÀ: Dichiaro solennemente, sotto la mia responsabilità, che tutte le dichiarazioni sanitarie rese in questo modulo sono esatte, complete e veritiere.",
        "de": "WAHRHEITSERKLÄRUNG: Ich erkläre feierlich, dass alle in diesem Formular gemachten gesundheitlichen Angaben nach bestem Wissen und Gewissen richtig und vollständig sind.",
        "es": "CERTIFICACIÓN DE VERACIDAD: Declaro solemnemente que todas las declaraciones médicas contenidas en este formulario son exactas, completas y verídicas.",
        "nl": "VERKLARING NAAR WAARHEID: Ik verklaar plechtig dat alle in dit formulier verstrekte medische gegevens naar waarheid en volledig zijn ingevuld.",
        "pt": "DECLARAÇÃO DE VERACIDADE: Declaro solenemente, sob as penas da lei, que todas as informações médicas prestadas neste formulário são exatas, completas e verdadeiras."
    },
    "RELEASE OF LIABILITY: I release the studio, practitioner, and staff from any liability resulting from undisclosed, concealed, or misrepresented medical conditions or allergies.": {
        "en": "RELEASE OF LIABILITY: I release the studio, practitioner, and staff from any liability resulting from undisclosed, concealed, or misrepresented medical conditions or allergies.",
        "fr": "DÉCHARGE DE RESPONSABILITÉ : Je dégage le studio, le praticien et le personnel de toute responsabilité résultant d'antécédents médicaux ou d'allergies non divulgués, dissimulés ou erronés.",
        "it": "ESONERO DI RESPONSABILITÀ: Esonero lo studio, l'operatore e lo staff da ogni responsabilità derivante da patologie, allergie o condizioni mediche omesse o travisate.",
        "de": "HAFTUNGSFREISTELLUNG: Ich stelle das Studio, den Behandler und das Personal von jeglicher Haftung frei, die auf verschwiegene oder falsche medizinische Angaben zurückzuführen ist.",
        "es": "EXENCIÓN DE RESPONSABILIDAD: Eximo al estudio, al profesional y al personal de toda responsabilidad derivada de afecciones médicas o alergias no declaradas o falsificadas.",
        "nl": "VRIJWARING VAN AANSPRAKELIJKHEID: Ik vrijwaar de studio, behandelaar en medewerkers van elke aansprakelijkheid voortvloeiend uit niet-gemelde of verzwegen medische aandoeningen.",
        "pt": "ISENÇÃO DE RESPONSABILIDADE: Isento o estúdio, o profissional e a equipe de qualquer responsabilidade decorrente de condições médicas ou alergias omitidas ou falsificadas."
    },
    "I understand the risks including localized swelling, jewelry rejection/migration, infection if improperly cleaned, and scarring.": {
        "en": "I understand the risks including localized swelling, jewelry rejection/migration, infection if improperly cleaned, and scarring.",
        "fr": "Je comprends les risques incluant gonflement localisé, rejet/migration du bijou, infection en cas d'hygiène inappropriée et cicatrices.",
        "it": "Comprendo i rischi tra cui gonfiore localizzato, rigetto o migrazione del gioiello, infezioni dovute a scarsa igiene ed esiti cicatriziali.",
        "de": "Ich verstehe die Risiken einschließlich lokaler Schwellungen, Schmuckabstoßung/Migration, Infektionen bei mangelnder Pflege und Narbenbildung.",
        "es": "Comprendo los riesgos inherentes, incluidos hinchazón localizada, rechazo/migración de la joya, infecciones por mala higiene y cicatrices.",
        "nl": "Ik begrijp de risico's waaronder lokale zwelling, afstoting/migratie van het sieraad, infectie bij onjuiste reiniging en littekenvorming.",
        "pt": "Compreendo os riscos, incluindo inchaço localizado, rejeição/migração da joia, infecção em caso de higiene inadequada e cicatrizes."
    },
    "LEGAL CUSTODY CERTIFICATION: I solemnly certify under penalty of perjury that I am the biological parent or court-appointed legal guardian with legal custody of the minor named above.": {
        "en": "LEGAL CUSTODY CERTIFICATION: I solemnly certify under penalty of perjury that I am the biological parent or court-appointed legal guardian with legal custody of the minor named above.",
        "fr": "ATTESTATION D'AUTORITÉ PARENTALE : J'atteste sur l'honneur et sous peine de sanctions être le parent biologique ou le tuteur légal détenant la garde légale du mineur nommé ci-dessus.",
        "it": "CERTIFICAZIONE DI POTESTÀ GENITORIALE: Dichiaro solennemente sotto la mia responsabilità di essere il genitore biologico o il tutore legale con potestà sul minore indicato.",
        "de": "SORGERICHTLICHE VERSICHERUNG: Ich versichere an Eides statt, dass ich der leibliche Elternteil oder der gerichtlich bestellte Vormund des genannten Minderjährigen bin.",
        "es": "CERTIFICACIÓN DE CUSTODIA LEGAL: Certifico solemnemente bajo pena de perjurio que soy el progenitor biológico o tutor legal con custodia legal del menor antes nombrado.",
        "nl": "VERKLARING OUDERLIJK GEZAG: Ik verklaar op erewoord dat ik de biologische ouder of wettelijk benoemde voogd met het gezag over de bovengenoemde minderjarige ben.",
        "pt": "CERTIFICAÇÃO DE GUARDA LEGAL: Declaro solenemente, sob as penas da lei, que sou o pai/mãe biológico(a) ou tutor legal detentor da guarda do menor acima qualificado."
    },
    "I agree to remain present in the studio facility during the entire duration of the procedure.": {
        "en": "I agree to remain present in the studio facility during the entire duration of the procedure.",
        "fr": "Je m'engage à rester présent(e) dans les locaux du studio pendant toute la durée de la procédure.",
        "it": "Accetto di rimanere presente all'interno dello studio per l'intera durata della procedura.",
        "de": "Ich verpflichte mich, während der gesamten Dauer des Eingriffs in den Studioräumlichkeiten anwesend zu bleiben.",
        "es": "Acepto permanecer presente en las instalaciones del estudio durante toda la duración del procedimiento.",
        "nl": "Ik ga ermee akkoord tijdens de gehele behandeling in de studio aanwezig te blijven.",
        "pt": "Concordo em permanecer presente nas dependências do estúdio durante todo o procedimento."
    },
    "DESIGN FLEXIBILITY: I understand that successful cover-ups require significant flexibility in size, darker tones, and placement expansion.": {
        "en": "DESIGN FLEXIBILITY: I understand that successful cover-ups require significant flexibility in size, darker tones, and placement expansion.",
        "fr": "FLEXIBILITÉ ARTISTIQUE : Je comprends qu'un recouvrement réussi exige une grande souplesse concernant la taille, les tons foncés et l'agrandissement de la zone.",
        "it": "FLESSIBILITÀ DEL DISEGNO: Comprendo che una cover-up ottimale richiede flessibilità nelle dimensioni, tonalità scure ed espansione della posizione.",
        "de": "DESIGNFLEXIBILITÄT: Ich verstehe, dass ein erfolgreiches Cover-Up erhebliche Flexibilität bei Größe, dunkleren Farbtönen und Platzierungserweiterung erfordert.",
        "es": "FLEXIBILIDAD DE DISEÑO: Entiendo que una cobertura exitosa requiere gran flexibilidad en tamaño, tonos más oscuros y ampliación del área.",
        "nl": "ONTWERPFLEXIBILITEIT: Ik begrijp dat een succesvolle cover-up aanzienlijke flexibiliteit vereist in afmetingen, donkere tonen en uitbreiding van de plaatsing.",
        "pt": "FLEXIBILIDADE DE DESIGN: Compreendo que uma cobertura bem-sucedida requer flexibilidade em relação ao tamanho, tons mais escuros e expansão da área."
    },
    "I agree to thoroughly inspect and approve the facial mapping, symmetry, and color swatch before pigment implantation.": {
        "en": "I agree to thoroughly inspect and approve the facial mapping, symmetry, and color swatch before pigment implantation.",
        "fr": "Je m'engage à inspecter et valider attentivement le tracé préparatoire, la symétrie et l'échantillon de couleur avant toute implantation de pigment.",
        "it": "Accetto di verificare e approvare attentamente la mappatura del viso, la simmetria e la tonalità prima dell'impianto del pigmento.",
        "de": "Ich stimme zu, die Vorzeichnung, Symmetrie und Farbauswahl vor der Pigmentierung sorgfältig zu prüfen und freizugeben.",
        "es": "Acepto revisar y aprobar minuciosamente el diseño previo, la simmetría y la muestra de color antes de la implantación del pigmento.",
        "nl": "Ik ga ermee akkoord de voortekening, symmetrie en kleurstalen grondig te controleren en goed te keuren vóór het pigmenteren.",
        "pt": "Concordo em inspecionar e aprovar minuciosamente o desenho prévio, a simetria e a tonalidade antes da implantação do pigmento."
    },
    "I grant the artist professional creative liberty to adapt anatomical composition for optimum aesthetic longevity.": {
        "en": "I grant the artist professional creative liberty to adapt anatomical composition for optimum aesthetic longevity.",
        "fr": "J'accorde à l'artiste la liberté créative professionnelle d'adapter la composition anatomique pour une longévité esthétique optimale.",
        "it": "Concedo all'artista la libertà creativa professionale per adattare la composizione anatomica garantendo la massima resa estetica nel tempo.",
        "de": "Ich gewähre dem Künstler gestalterische Freiheit zur anatomischen Anpassung für optimale ästhetische Haltbarkeit.",
        "es": "Otorgo al artista libertad creativa profesional para adaptar la composición anatómica logrando la mejor longevidad estética.",
        "nl": "Ik verleen de artiest artistieke vrijheid om de compositie anatomisch aan te passen voor een optimaal esthetisch resultaat.",
        "pt": "Concedo ao artista liberdade criativa profissional para adaptar a composição à anatomia, visando durabilidade e qualidade estética."
    },
    "I agree to the multi-session cancellation and deposit rollover policy (minimum 48hr notice for reschedule).": {
        "en": "I agree to the multi-session cancellation and deposit rollover policy (minimum 48hr notice for reschedule).",
        "fr": "J'accepte les conditions d'annulation et de report d'acompte multi-sessions (préavis minimum de 48 h pour tout report).",
        "it": "Accetto la politica di cancellazione e trasferimento caparra per sessioni multiple (preavviso minimo di 48 ore).",
        "de": "Ich akzeptiere die Stornierungs- und Anzahlungsbedingungen für Mehrterminprojekte (mindestens 48 Std. Vorankündigung).",
        "es": "Acepto la política de cancelación y mantenimiento de depósito para multisesiones (aviso mínimo de 48 horas).",
        "nl": "Ik ga akkoord met het annulerings- en aanbetalingsbeleid voor meerdere sessies (minimaal 48 uur vooraf melden).",
        "pt": "Concordo com a política de cancelamento e transferência de sinal para múltiplas sessões (aviso prévio de pelo menos 48h)."
    },
    "I confirm that I am in suitable physical health for long multi-hour tattoo sessions and have disclosed all medical conditions or obtained required physician clearance.": {
        "en": "I confirm that I am in suitable physical health for long multi-hour tattoo sessions and have disclosed all medical conditions or obtained required physician clearance.",
        "fr": "Je confirme être en bonne condition physique pour des séances longues de plusieurs heures, avoir déclaré tous mes antécédents et obtenu l'accord médical requis.",
        "it": "Confermo di essere in condizioni fisiche idonee per lunghe sessioni di tatuaggio di più ore e di aver dichiarato ogni patologia o ottenuto il nulla osta medico.",
        "de": "Ich bestätige meine körperliche Eignung für mehrstündige Tattoositzungen und habe alle Vorerkrankungen offengelegt oder ärztliche Freigaben eingeholt.",
        "es": "Confirmo que mi estado físico es apto para sesiones prolongadas de varias horas y que he declarado todas mis afecciones o cuento con visto bueno médico.",
        "nl": "Ik bevestig dat mijn fysieke conditie geschikt is voor lange tatoeagesessies en dat ik alle medische aandoeningen heb gemeld of doktersgoedkeuring heb.",
        "pt": "Confirmo estar em condições físicas adequadas para longas sessões de tatuagem e ter informado todo o histórico de saúde ou obtido liberação médica."
    },
    "Complete Project Concept & Subject Scope": {
        "en": "Complete Project Concept & Subject Scope",
        "fr": "Concept complet du projet et description du sujet",
        "it": "Concetto completo del progetto e descrizione del soggetto",
        "de": "Gesamtkonzept des Projekts & Motivbeschreibung",
        "es": "Concepto integral del proyecto y temática",
        "nl": "Volledig projectconcept & beschrijving van het onderwerp",
        "pt": "Conceito completo do projeto e escopo do tema"
    },
    "Body Anatomy Coverage": {
        "en": "Body Anatomy Coverage",
        "fr": "Couverture anatomique corporelle",
        "it": "Copertura anatomica del corpo",
        "de": "Körperabdeckung & Platzierung",
        "es": "Cobertura anatómica corporal",
        "nl": "Anatomische lichaamsdekking",
        "pt": "Cobertura anatômica corporal"
    },
    "Estimated Total Sessions & Hours": {
        "en": "Estimated Total Sessions & Hours",
        "fr": "Nombre estimé de séances et d'heures au total",
        "it": "Stima del numero totale di sessioni e ore",
        "de": "Geschätzte Gesamtsitzungen & Stundenzahl",
        "es": "Estimación total de sesiones y horas",
        "nl": "Geschat totaal aantal sessies en uren",
        "pt": "Estimativa total de sessões e horas"
    },
    "Hourly Rate / Day Rate & Deposit Structure": {
        "en": "Hourly Rate / Day Rate & Deposit Structure",
        "fr": "Tarif horaire / journalier et modalités d'acompte",
        "it": "Tariffa oraria / giornaliera e struttura caparra",
        "de": "Stundensatz / Tagessatz & Anzahlungsstruktur",
        "es": "Tarifa por hora / por día y estructura de depósito",
        "nl": "Uurtarief / dagtarief & aanbetalingsvoorwaarden",
        "pt": "Valor da hora / diária e estrutura do sinal"
    },
    "Biological Mother": {
        "en": "Biological Mother",
        "fr": "Mère biologique",
        "it": "Madre biologica",
        "de": "Leibliche Mutter",
        "es": "Madre biológica",
        "nl": "Biologische moeder",
        "pt": "Mãe biológica"
    },
    "Biological Father": {
        "en": "Biological Father",
        "fr": "Père biologique",
        "it": "Padre biologico",
        "de": "Leiblicher Vater",
        "es": "Padre biológico",
        "nl": "Biologische vader",
        "pt": "Pai biológico"
    },
    "Legal Court-Appointed Guardian": {
        "en": "Legal Court-Appointed Guardian",
        "fr": "Tuteur légal désigné par un tribunal",
        "it": "Tutore legale nominato dal tribunale",
        "de": "Gerichtlich bestellter Vormund",
        "es": "Tutor legal nombrado judicialmente",
        "nl": "Gerechtelijk benoemde voogd",
        "pt": "Tutor legal nomeado judicialmente"
    },
    "Adoptive Parent": {
        "en": "Adoptive Parent",
        "fr": "Parent adoptif",
        "it": "Genitore adottivo",
        "de": "Adoptivelternteil",
        "es": "Padre / Madre adoptivo(a)",
        "nl": "Adoptieouder",
        "pt": "Pai / Mãe adotivo(a)"
    },
    "Other Authorized Legal Custodian": {
        "en": "Other Authorized Legal Custodian",
        "fr": "Autre représentant légal dûment autorisé",
        "it": "Altro affidatario o custode legale autorizzato",
        "de": "Sonstiger sorgeberechtigter gesetzlicher Vertreter",
        "es": "Otro custodio legal autorizado",
        "nl": "Andere bevoegde wettelijke vertegenwoordiger",
        "pt": "Outro responsável legal autorizado"
    },
    "Physician Clearance Warning for Minors": {
        "en": "Physician Clearance Warning for Minors",
        "fr": "Avertissement d'autorisation médicale pour mineurs",
        "it": "Avviso di nulla osta medico per minorenni",
        "de": "Ärztlicher Freigabehinweis für Minderjährige",
        "es": "Aviso de autorización médica para menores",
        "nl": "Waarschuwing doktersgoedkeuring voor minderjarigen",
        "pt": "Aviso de liberação médica para menores"
    },
    "Minors experiencing allergies, hemophilia/bleeding tendencies, diabetes, cardiac conditions, or fainting history require a formal written authorization letter from a licensed pediatrician/doctor prior to undergoing procedures.": {
        "en": "Minors experiencing allergies, hemophilia/bleeding tendencies, diabetes, cardiac conditions, or fainting history require a formal written authorization letter from a licensed pediatrician/doctor prior to undergoing procedures.",
        "fr": "Les mineurs présentant des allergies, une tendance aux saignements/hémophilie, un diabète, des troubles cardiaques ou des syncopes doivent fournir une autorisation écrite d'un pédiatre ou médecin.",
        "it": "I minorenni con allergie, emofilia/tendenza al sanguinamento, diabete, patologie cardiache o svenimenti devono presentare un certificato scritto del pediatra o medico curante.",
        "de": "Minderjährige mit Allergien, Blutungsneigung/Hämophilie, Diabetes, Herzproblemen oder Ohnmachtsneigung benötigen ein schriftliches Attest des Kinderarztes/Arztes.",
        "es": "Los menores con alergias, hemofilia/problemas de coagulación, diabetes, cardiopatías o historial de desmayos requieren autorización formal por escrito de su pediatra o médico.",
        "nl": "Minderjarigen met allergieën, bloedingsneiging/hemofilie, diabetes, hartaandoeningen of neiging tot flauwvallen moeten vooraf een schriftelijke doktersverklaring overleggen.",
        "pt": "Menores com alergias, hemofilia/distúrbios de coagulação, diabetes, problemas cardíacos ou histórico de desmaios necessitam de autorização formal por escrito de médico ou pediatra."
    },
    "Physician Authorization Status for Minor": {
        "en": "Physician Authorization Status for Minor",
        "fr": "Statut de l'autorisation médicale pour le mineur",
        "it": "Stato dell'autorizzazione medica per il minore",
        "de": "Status der ärztlichen Freigabe für Minderjährige",
        "es": "Estado de la autorización médica para el menor",
        "nl": "Status van de medische goedkeuring voor de minderjarige",
        "pt": "Status da autorização médica do menor"
    },
    "Minor has no underlying medical contraindications": {
        "en": "Minor has no underlying medical contraindications",
        "fr": "Le mineur ne présente aucune contre-indication médicale",
        "it": "Il minore non ha controindicazioni mediche pregresse",
        "de": "Der Minderjährige hat keine medizinischen Vorerkrankungen/Kontraindikationen",
        "es": "El menor no tiene contraindicaciones médicas subyacentes",
        "nl": "De minderjarige heeft geen onderliggende medische contra-indicaties",
        "pt": "O menor não apresenta contraindicações médicas subjacentes"
    },
    "Written doctor authorization has been verified and provided": {
        "en": "Written doctor authorization has been verified and provided",
        "fr": "L'autorisation écrite du médecin a été vérifiée et fournie",
        "it": "Il certificato medico scritto è stato verificato e allegato",
        "de": "Schriftliches ärztliches Attest wurde geprüft und vorgelegt",
        "es": "La autorización escrita del médico ha sido verificada y entregada",
        "nl": "Schriftelijke doktersgoedkeuring is gecontroleerd en overgelegd",
        "pt": "A autorização médica por escrito foi verificada e apresentada"
    },
    "Doctor authorization not applicable": {
        "en": "Doctor authorization not applicable",
        "fr": "Autorisation médicale non applicable",
        "it": "Nulla osta medico non applicabile",
        "de": "Ärztliche Freigabe nicht erforderlich",
        "es": "Autorización médica no aplicable",
        "nl": "Doktersautorisatie niet van toepassing",
        "pt": "Autorização médica não aplicável"
    },
    "Exact Authorized Procedure & Location": {
        "en": "Exact Authorized Procedure & Location",
        "fr": "Acte exact autorisé et emplacement anatomique",
        "it": "Procedura esatta autorizzata e posizione",
        "de": "Genaue autorisierte Dienstleistung & Platzierung",
        "es": "Procedimiento exacto autorizado y ubicación",
        "nl": "Exacte goedgekeurde behandeling en locatie",
        "pt": "Procedimento exato autorizado e local anatômico"
    },
    "Sterilized Jewelry Material & Wire Gauge (AWG/Metric)": {
        "en": "Sterilized Jewelry Material & Wire Gauge (AWG/Metric)",
        "fr": "Matériau du bijou stérilisé et calibre (AWG/Métrique)",
        "it": "Materiale del gioiello sterilizzato e spessore barra (AWG/Metrico)",
        "de": "Material des sterilen Schmucks & Drahtstärke (AWG/Metrisch)",
        "es": "Material de la joya esterilizada y calibre (AWG/Métrico)",
        "nl": "Materiaal van het gesteriliseerde sieraad & draaddikte (AWG/Metrisch)",
        "pt": "Material da joia esterilizada e espessura da haste (AWG/Métrico)"
    },
    "Parent / Legal Guardian Signature": {
        "en": "Parent / Legal Guardian Signature",
        "fr": "Signature du parent ou tuteur légal",
        "it": "Firma del genitore o tutore legale",
        "de": "Unterschrift der Eltern / des Erziehungsberechtigten",
        "es": "Firma del padre/madre o tutor legal",
        "nl": "Handtekening van ouder of voogd",
        "pt": "Assinatura do pai, mãe ou responsável legal"
    },
    "Minor Client Signature (Assent)": {
        "en": "Minor Client Signature (Assent)",
        "fr": "Signature du client mineur (Assentiment)",
        "it": "Firma del cliente minorenne (Assenso)",
        "de": "Unterschrift des Minderjährigen (Einwilligung)",
        "es": "Firma del cliente menor (Asentimiento)",
        "nl": "Handtekening van de minderjarige (Instemming)",
        "pt": "Assinatura do cliente menor (Assentimento)"
    },
    "Date of Authorization": {
        "en": "Date of Authorization",
        "fr": "Date de l'autorisation",
        "it": "Data dell'autorizzazione",
        "de": "Datum der Genehmigung",
        "es": "Fecha de autorización",
        "nl": "Datum van goedkeuring",
        "pt": "Data da autorização"
    },
    "Description of Existing Tattoo to Cover": {
        "en": "Description of Existing Tattoo to Cover",
        "fr": "Description du tatouage existant à recouvrir",
        "it": "Descrizione del tatuaggio esistente da coprire",
        "de": "Beschreibung des zu überdeckenden bestehenden Tattoos",
        "es": "Descripción del tatuaje previo que se desea cubrir",
        "nl": "Beschrijving van de te coveren bestaande tatoeage",
        "pt": "Descrição da tatuagem existente a ser coberta"
    },
    "Age of Existing Tattoo (Years/Months)": {
        "en": "Age of Existing Tattoo (Years/Months)",
        "fr": "Âge du tatouage existant (Années/Mois)",
        "it": "Datazione del vecchio tatuaggio (Anni/Mesi)",
        "de": "Alter des bestehenden Tattoos (Jahre/Monate)",
        "es": "Antigüedad del tatuaje existente (Años/Meses)",
        "nl": "Leeftijd van de bestaande tatoeage (Jaren/Maanden)",
        "pt": "Idade da tatuagem existente (Anos/Meses)"
    },
    "Has this area undergone laser tattoo removal / lightening treatments?": {
        "en": "Has this area undergone laser tattoo removal / lightening treatments?",
        "fr": "Cette zone a-t-elle fait l'objet de séances de détatouage au laser ou d'éclaircissement ?",
        "it": "Questa zona è stata sottoposta a trattamenti laser di rimozione o schiaritura?",
        "de": "Wurde diese Stelle bereits mit Laser behandelt (Entfernung oder Aufhellung)?",
        "es": "¿Ha recibido esta zona tratamientos con láser para eliminar o aclarar el tatuaje?",
        "nl": "Is dit gebied behandeld met laser (verwijdering of oplichten)?",
        "pt": "Esta região já passou por sessões de laser para remoção ou clareamento?"
    },
    "No laser treatments": {
        "en": "No laser treatments",
        "fr": "Aucun traitement laser",
        "it": "Nessun trattamento laser",
        "de": "Keine Laserbehandlung",
        "es": "Sin tratamientos láser",
        "nl": "Geen laserbehandelingen ondergaan",
        "pt": "Nenhum tratamento a laser realizado"
    },
    "Yes - Completed laser sessions (skin healed >8 weeks)": {
        "en": "Yes - Completed laser sessions (skin healed >8 weeks)",
        "fr": "Oui - Séances laser terminées (peau cicatrisée depuis plus de 8 semaines)",
        "it": "Sì - Trattamenti laser completati (pelle guarita da più di 8 settimane)",
        "de": "Ja - Laserbehandlung abgeschlossen (Haut seit >8 Wochen verheilt)",
        "es": "Sí - Sesiones de láser finalizadas (piel cicatrizada >8 semanas)",
        "nl": "Ja - Laserbehandelingen afgerond (huid >8 weken genezen)",
        "pt": "Sim - Sessões de laser concluídas (pele cicatrizada há mais de 8 semanas)"
    },
    "Yes - Active laser treatments ongoing": {
        "en": "Yes - Active laser treatments ongoing",
        "fr": "Oui - Traitements laser actifs en cours",
        "it": "Sì - Trattamenti laser attualmente in corso",
        "de": "Ja - Laufende Laserbehandlungen aktiv",
        "es": "Sí - Tratamiento con láser activo en curso",
        "nl": "Ja - Momenteel nog bezig met laserbehandelingen",
        "pt": "Sim - Tratamento a laser em andamento"
    },
    "Ideas & Preferred Imagery for Cover-Up": {
        "en": "Ideas & Preferred Imagery for Cover-Up",
        "fr": "Idées et motifs souhaités pour le recouvrement",
        "it": "Idee e soggetti preferiti per la cover-up",
        "de": "Ideen & Wunschmotive für das Cover-Up",
        "es": "Ideas y motivos preferidos para la cobertura",
        "nl": "Ideeën & voorkeursontwerpen voor de cover-up",
        "pt": "Ideias e imagens de preferência para a cobertura"
    },
    "Cosmetic Tattoo Contraindications": {
        "en": "Cosmetic Tattoo Contraindications",
        "fr": "Contre-indications du maquillage permanent",
        "it": "Controindicazioni per trucco permanente",
        "de": "Kontraindikationen für kosmetische Pigmentierung",
        "es": "Contraindicaciones del tatuaje cosmético",
        "nl": "Contra-indicaties voor permanente make-up",
        "pt": "Contraindicações para maquiagem definitiva/PMU"
    },
    "Accutane (within 12 months), Retin-A/Retinol (within 14 days), chemical peels, botox/fillers (within 3 weeks), pregnancy/nursing, or active cold sores (lip blush) require prior medical consultation or procedure postponement.": {
        "en": "Accutane (within 12 months), Retin-A/Retinol (within 14 days), chemical peels, botox/fillers (within 3 weeks), pregnancy/nursing, or active cold sores (lip blush) require prior medical consultation or procedure postponement.",
        "fr": "L'isotrétinoïne/Roaccutane (<12 mois), la trétinoïne/rétinol (<14 jours), peelings chimiques, botox/fillers (<3 semaines), grossesse/allaitement ou boutons de fièvre nécessitent un avis médical préalable ou le report de l'acte.",
        "it": "Accutane (<12 mesi), Retinolo/Retin-A (<14 giorni), peeling chimici, botox/filler (<3 settimane), gravidanza/allattamento o herpes attivo richiedono un rinvio o consulto medico.",
        "de": "Roaccutan (<12 Monate), Retinol (<14 Tage), chemische Peelings, Botox/Filler (<3 Wochen), Schwangerschaft/Stillzeit oder akuter Herpes erfordern eine Verschiebung oder ärztliche Freigabe.",
        "es": "Accutane (<12 meses), Retin-A/Retinol (<14 días), peelings químicos, botox/rellenos (<3 semanas), embarazo/lactancia o herpes activo requieren consulta médica previa o posponer la cita.",
        "nl": "Roaccutane (<12 mnd), Retinol (<14 dgn), chemische peelings, botox/fillers (<3 wkn), zwangerschap/borstvoeding of koortslip vereisen doktersadvies of uitstel.",
        "pt": "Roacutan (<12 meses), Retinol/Retin-A (<14 dias), peelings químicos, botox/preenchedores (<3 semanas), gravidez/amamentação ou herpes ativo exigem consulta médica ou adiamento."
    },
    "Have you used Accutane, Retin-A, or had chemical peels recently?": {
        "en": "Have you used Accutane, Retin-A, or had chemical peels recently?",
        "fr": "Avez-vous utilisé du Roaccutane, du rétinol ou fait des peelings récemment ?",
        "it": "Ha utilizzato farmaci tipo Roaccutan, retinoidi o fatto peeling di recente?",
        "de": "Haben Sie kürzlich Roaccutan oder Retinol verwendet bzw. Peelings erhalten?",
        "es": "¿Ha utilizado recientemente Roaccutane, Retin-A o se ha realizado peelings químicos?",
        "nl": "Heeft u recent Roaccutane of Retinol gebruikt, of een chemische peeling gehad?",
        "pt": "Você utilizou Roacutan, Retinol ou fez peelings químicos recentemente?"
    },
    "No - None in contraindicated timeframe": {
        "en": "No - None in contraindicated timeframe",
        "fr": "Non - Aucun traitement dans les délais de contre-indication",
        "it": "No - Nessun trattamento nelle tempistiche controindicate",
        "de": "Nein - Keine Anwendung im kritischen Zeitraum",
        "es": "No - Ninguno en el período contraindicado",
        "nl": "Nee - Geen binnen de contra-geïndiceerde periode",
        "pt": "Não - Nenhum produto no intervalo contraindicado"
    },
    "Yes - Over 12 months ago for Accutane / 4 weeks for Retinol": {
        "en": "Yes - Over 12 months ago for Accutane / 4 weeks for Retinol",
        "fr": "Oui - Plus de 12 mois pour Roaccutane / 4 semaines pour Rétinol",
        "it": "Sì - Più di 12 mesi fa per Roaccutan / 4 settimane per retinoidi",
        "de": "Ja - Vor über 12 Monaten (Roaccutan) / vor über 4 Wochen (Retinol)",
        "es": "Sí - Hace más de 12 meses (Accutane) / 4 semanas (Retinol)",
        "nl": "Ja - Meer dan 12 maanden geleden voor Roaccutane / 4 weken voor Retinol",
        "pt": "Sim - Há mais de 12 meses para Roacutan / 4 semanas para Retinol"
    },
    "Yes - Currently using (Requires rescheduling)": {
        "en": "Yes - Currently using (Requires rescheduling)",
        "fr": "Oui - En cours d'utilisation (Nécessite de reprogrammer la séance)",
        "it": "Sì - Uso in corso (Richiede ripianificazione dell'appuntamento)",
        "de": "Ja - Aktuelle Anwendung (Terminverschiebung erforderlich)",
        "es": "Sí - En uso actualmente (Requiere reprogramar la cita)",
        "nl": "Ja - Momenteel in gebruik (Afspraak moet worden verzet)",
        "pt": "Sim - Em uso atualmente (Necessita de reagendamento)"
    },
    "PMU Treatment Type": {
        "en": "PMU Treatment Type",
        "fr": "Type de soin en dermopigmentation (PMU)",
        "it": "Tipologia di trattamento PMU",
        "de": "Art der PMU-Behandlung",
        "es": "Tipo de tratamiento de micropigmentación",
        "nl": "Type PMU-behandeling",
        "pt": "Tipo de procedimento de PMU"
    },
    "Microblading Eyebrows": {
        "en": "Microblading Eyebrows",
        "fr": "Microblading des sourcils (Poil à poil)",
        "it": "Microblading sopracciglia",
        "de": "Microblading Augenbrauen",
        "es": "Microblading de cejas",
        "nl": "Microblading wenkbrauwen",
        "pt": "Microblading de sobrancelhas"
    },
    "Ombré / Powder Brows": {
        "en": "Ombré / Powder Brows",
        "fr": "Sourcils poudrés / Ombré brows",
        "it": "Sopracciglia effetto polvere / Ombré brows",
        "de": "Ombré / Powder Brows",
        "es": "Cejas efecto polvo / Ombré brows",
        "nl": "Ombré / Powder brows",
        "pt": "Sobrancelhas efeito pó / Ombré brows"
    },
    "Combo Brows (Blade & Shade)": {
        "en": "Combo Brows (Blade & Shade)",
        "fr": "Sourcils combinés (Poil à poil & Ombrage)",
        "it": "Sopracciglia combinate (Blade & Shade)",
        "de": "Combo Brows (Kombi aus Härchen & Schattierung)",
        "es": "Cejas combinadas (Blade & Shade)",
        "nl": "Combo brows (Microblading & Schaduw)",
        "pt": "Sobrancelhas combinadas (Fio a fio & Sombra)"
    },
    "Lip Blush / Full Lip Tint": {
        "en": "Lip Blush / Full Lip Tint",
        "fr": "Lip Blush / Teinte complète des lèvres",
        "it": "Lip Blush / Dermopigmentazione labbra",
        "de": "Lip Blush / Vollschattierung der Lippen",
        "es": "Lip Blush / Coloración completa de labios",
        "nl": "Lip Blush / Volledige lipkleuring",
        "pt": "Lip Blush / Pigmentação labial completa"
    },
    "Lash Enhancement / Permanent Eyeliner": {
        "en": "Lash Enhancement / Permanent Eyeliner",
        "fr": "Densification ciliaire / Eyeliner permanent",
        "it": "Infracigliare / Eyeliner permanente",
        "de": "Wimpernkranzverdichtung / Eyeliner",
        "es": "Delineado de ojos permanente / Realce de pestañas",
        "nl": "Wimperrandversterking / Permanente eyeliner",
        "pt": "Delineador definitivo / Realce de cílios"
    },
    "Freckles / Beauty Marks": {
        "en": "Freckles / Beauty Marks",
        "fr": "Taches de rousseur / Grains de beauté",
        "it": "Lentiggini / Nei estetici",
        "de": "Sommersprossen / Schönheitsflecken",
        "es": "Pecas / Lunares estéticos",
        "nl": "Sproeten / Schoonheidsvlekjes",
        "pt": "Sardas / Sinais de beleza"
    },
    "Areola Restorative Tattoo": {
        "en": "Areola Restorative Tattoo",
        "fr": "Dermopigmentation réparatrice de l'aréole",
        "it": "Dermopigmentazione ricostruttiva areola",
        "de": "Medizinische Areola-Rekonstruktionspigmentierung",
        "es": "Micropigmentación reconstructiva de areola mamaria",
        "nl": "Tatoeage voor herstel van de tepelhof (Areola)",
        "pt": "Dermopigmentação reconstrutiva de aréola mamária"
    },
    "PMU Client Signature": {
        "en": "PMU Client Signature",
        "fr": "Signature du client (Maquillage permanent)",
        "it": "Firma del cliente (Trattamento PMU)",
        "de": "Unterschrift der Kundin / des Kunden (PMU)",
        "es": "Firma del cliente (PMU / Micropigmentación)",
        "nl": "Handtekening van de PMU-klant",
        "pt": "Assinatura do cliente de micropigmentação"
    },
    "Clinical Clearance Notice": {
        "en": "Clinical Clearance Notice",
        "fr": "Avis de validation clinique préalable",
        "it": "Avviso di nulla osta clinico specialistico",
        "de": "Klinischer Freigabehinweis",
        "es": "Aviso de autorización médica clínica",
        "nl": "Kennisgeving van klinische goedkeuring",
        "pt": "Aviso de liberação clínica especializada"
    },
    "Clients with severe chronic ailments, artificial heart valves, bleeding disorders, compromised immunity, or active skin lesions require written authorization from their attending medical doctor before undergoing invasive body modification procedures.": {
        "en": "Clients with severe chronic ailments, artificial heart valves, bleeding disorders, compromised immunity, or active skin lesions require written authorization from their attending medical doctor before undergoing invasive body modification procedures.",
        "fr": "Les clients souffrant d'affections chroniques sévères, valves cardiaques artificielles, troubles de la coagulation, déficit immunitaire ou lésions cutanées actives doivent fournir une autorisation écrite de leur médecin traitant avant toute intervention.",
        "it": "I clienti con patologie croniche gravi, valvole cardiache artificiali, disturbi emorragici, difese immunitarie compromesse o lesioni cutanee attive devono presentare autorizzazione scritta del medico curante prima della procedura.",
        "de": "Kunden mit schweren chronischen Erkrankungen, künstlichen Herzklappen, Blutgerinnungsstörungen, Immunschwäche oder akuten Hautläsionen benötigen vor dem Eingriff eine schriftliche ärztliche Freigabe.",
        "es": "Los clientes con enfermedades crónicas graves, válvulas cardíacas artificiales, trastornos de coagulación, inmunodepresión o lesiones cutáneas activas deben presentar autorización médica por escrito antes del procedimiento.",
        "nl": "Klanten met ernstige chronische aandoeningen, kunsthartkleppen, bloedingsstoornissen, verminderde immuniteit of actieve huidlaesies moeten vooraf een schriftelijke doktersverklaring overleggen.",
        "pt": "Clientes com doenças crônicas graves, válvulas cardíacas artificiais, distúrbios hemorrágicos, imunodeficiência ou lesões ativas de pele devem apresentar autorização médica por escrito antes do procedimento."
    },
    "Do you require or have you received physician clearance for body modification?": {
        "en": "Do you require or have you received physician clearance for body modification?",
        "fr": "Avez-vous besoin ou avez-vous obtenu une autorisation médicale pour cette modification corporelle ?",
        "it": "Ha bisogno o ha già ricevuto il nulla osta medico per questo trattamento?",
        "de": "Benötigen oder besitzen Sie eine ärztliche Unbedenklichkeitsbescheinigung für diesen Eingriff?",
        "es": "¿Requiere o ha obtenido autorización médica para esta modificación corporal?",
        "nl": "Heeft u een doktersverklaring nodig of reeds verkregen voor deze behandeling?",
        "pt": "Você necessita ou já obteve liberação médica para esta modificação corporal?"
    },
    "Yes - Pending medical evaluation": {
        "en": "Yes - Pending medical evaluation",
        "fr": "Oui - En attente d'évaluation médicale",
        "it": "Sì - In attesa di valutazione medica",
        "de": "Ja - Ärztliche Untersuchung noch ausstehend",
        "es": "Sí - Pendiente de evaluación médica",
        "nl": "Ja - In afwachting van medische beoordeling",
        "pt": "Sim - Em avaliação médica pendente"
    },
    "Physician Name, Clinic & Clearance Date (if applicable)": {
        "en": "Physician Name, Clinic & Clearance Date (if applicable)",
        "fr": "Nom du médecin, clinique et date de l'autorisation (le cas échéant)",
        "it": "Nome del medico, clinica e data del nulla osta (se applicabile)",
        "de": "Name des Arztes, Praxis & Datum der Freigabe (falls zutreffend)",
        "es": "Nombre del médico, clínica y fecha de autorización (si corresponde)",
        "nl": "Naam van de arts, kliniek & datum van goedkeuring (indien van toepassing)",
        "pt": "Nome do médico, clínica e data da liberação (se aplicável)"
    },
    "List all prescribed medications, over-the-counter drugs, or vitamins taken in the past 14 days": {
        "en": "List all prescribed medications, over-the-counter drugs, or vitamins taken in the past 14 days",
        "fr": "Liste des médicaments prescrits, en vente libre ou vitamines pris au cours des 14 derniers jours",
        "it": "Elenco di tutti i farmaci prescritti, da banco o integratori assunti negli ultimi 14 giorni",
        "de": "Alle in den letzten 14 Tagen eingenommenen verschreibungspflichtigen/freien Medikamente und Vitamine",
        "es": "Lista de medicamentos recetados, de venta libre o vitaminas tomados en los últimos 14 días",
        "nl": "Overzicht van voorgeschreven medicijnen, zelfzorgmiddelen of vitamines van de afgelopen 14 dagen",
        "pt": "Relação de medicamentos prescritos, de venda livre ou suplementos vitamínicos tomados nos últimos 14 dias"
    },
    "Do you have a history of vasovagal fainting, lightheadedness, or dizziness during medical procedures or injections?": {
        "en": "Do you have a history of vasovagal fainting, lightheadedness, or dizziness during medical procedures or injections?",
        "fr": "Avez-vous des antécédents de malaise vagal, étourdissements ou vertiges lors de soins ou d'injections ?",
        "it": "Ha precedenti di svenimento vagale, vertigini o capogiri durante procedure mediche o iniezioni?",
        "de": "Neigen Sie bei medizinischen Eingriffen oder Spritzen zu Kreislaufproblemen, Schwindel oder Ohnmacht (Vasovagale Synkope)?",
        "es": "¿Tiene antecedentes de síncope vasovagal, mareos o desvanecimientos durante procedimientos médicos o inyecciones?",
        "nl": "Heeft u een geschiedenis van vasovagaal flauwvallen, duizeligheid of licht in het hoofd bij medische ingrepen of injecties?",
        "pt": "Você tem histórico de desmaio vasovagal, tontura ou vertigem durante procedimentos médicos ou injeções?"
    },
    "No history of fainting": {
        "en": "No history of fainting",
        "fr": "Aucun antécédent d'évanouissement ou de syncope",
        "it": "Nessun precedente di svenimento",
        "de": "Keine Neigung zu Ohnmacht oder Kreislaufkollaps",
        "es": "Sin antecedentes de desmayos",
        "nl": "Geen geschiedenis van flauwvallen",
        "pt": "Sem histórico de desmaios"
    },
    "Yes - Occasionally prone to lightheadedness": {
        "en": "Yes - Occasionally prone to lightheadedness",
        "fr": "Oui - Sujet(te) occasionnellement aux étourdissements",
        "it": "Sì - Talvolta soggetto a lievi capogiri",
        "de": "Ja - Gelegentlich anfällig für Schwindelgefühle",
        "es": "Sí - Propenso/a ocasionalmente a mareos",
        "nl": "Ja - Soms gevoelig voor duizeligheid",
        "pt": "Sim - Ocasionalmente propenso(a) a tonturas"
    },
    "Yes - Known vasovagal syncope history": {
        "en": "Yes - Known vasovagal syncope history",
        "fr": "Oui - Antécédents avérés de malaise vagal",
        "it": "Sì - Storia documentata di sincope vasovagale",
        "de": "Ja - Bekannte vasovagale Synkopen-Neigung",
        "es": "Sí - Historial conocido de síncope vasovagal",
        "nl": "Ja - Bekend met vasovagale syncope",
        "pt": "Sim - Histórico comprovado de síncope vasovagal"
    },
    "Is the intended skin area free of active sunburn, rashes, eczema, cuts, or infections?": {
        "en": "Is the intended skin area free of active sunburn, rashes, eczema, cuts, or infections?",
        "fr": "La zone cutanée concernée est-elle exempte de coups de soleil, éruptions, eczéma, coupures ou infections ?",
        "it": "La zona cutanea interessata è priva di scottature, eruzioni, eczemi, tagli o infezioni attive?",
        "de": "Ist die betroffene Hautpartie frei von Sonnenbrand, Hautausschlägen, Ekzemen, Schnittwunden oder Infektionen?",
        "es": "¿La zona cutánea prevista está libre de quemaduras solares, erupciones, eccemas, cortes o infecciones?",
        "nl": "Is de te behandelen huid vrij van zonnebrand, uitslag, eczeem, wondjes of infecties?",
        "pt": "A área da pele a ser trabalhada está livre de queimaduras de sol, erupções, eczema, cortes ou infecções ativas?"
    },
    "Yes - Skin is fully healthy and unbroken": {
        "en": "Yes - Skin is fully healthy and unbroken",
        "fr": "Oui - La peau est saine, intacte et sans lésion",
        "it": "Sì - La pelle è sana, integra e priva di lesioni",
        "de": "Ja - Die Haut ist vollständig gesund und intakt",
        "es": "Sí - La piel está completamente sana e intacta",
        "nl": "Ja - De huid is volledig gezond en onbeschadigd",
        "pt": "Sim - A pele está totalmente saudável e íntegra"
    },
    "No - Skin has active redness, irritation, or trauma": {
        "en": "No - Skin has active redness, irritation, or trauma",
        "fr": "Non - Présence de rougeurs, irritations ou lésions cutanées",
        "it": "No - La pelle presenta arrossamenti, irritazioni o lesioni attive",
        "de": "Nein - Haut weist Rötungen, Reizungen oder Verletzungen auf",
        "es": "No - La piel presenta enrojecimiento, irritación o traumatismo activo",
        "nl": "Nee - De huid vertoont roodheid, irritatie of beschadiging",
        "pt": "Não - A pele apresenta vermelhidão, irritação ou lesão ativa"
    },
    "Client Signature (Legal Health Certification)": {
        "en": "Client Signature (Legal Health Certification)",
        "fr": "Signature du client (Certification médicale légale)",
        "it": "Firma del cliente (Autocertificazione sanitaria con valore legale)",
        "de": "Unterschrift des Kunden (Rechtliche Gesundheitsbescheinigung)",
        "es": "Firma del cliente (Certificación legal de salud)",
        "nl": "Handtekening van de klant (Wettelijke gezondheidsverklaring)",
        "pt": "Assinatura do cliente (Declaração legal de saúde)"
    },
    "Client Signature": {
        "en": "Client Signature",
        "fr": "Signature du client",
        "it": "Firma del cliente",
        "de": "Unterschrift des Kunden",
        "es": "Firma del cliente",
        "nl": "Handtekening van de klant",
        "pt": "Assinatura do cliente"
    },
    "Date": {
        "en": "Date",
        "fr": "Date",
        "it": "Data",
        "de": "Datum",
        "es": "Fecha",
        "nl": "Datum",
        "pt": "Data"
    },
    "Date Signed": {
        "en": "Date Signed",
        "fr": "Date de signature",
        "it": "Data di firma",
        "de": "Unterzeichnungsdatum",
        "es": "Fecha de la firma",
        "nl": "Datum van ondertekening",
        "pt": "Data da assinatura"
    },
    "Heart condition, pacemaker, high blood pressure, or mitral valve prolapse": {
        "en": "Heart condition, pacemaker, high blood pressure, or mitral valve prolapse",
        "fr": "Affections cardiaques, stimulateur cardiaque (pacemaker), hypertension artérielle ou prolapsus valvulaire",
        "it": "Cardiopatie, pacemaker, ipertensione o prolasso della valvola mitrale",
        "de": "Herzerkrankungen, Herzschrittmacher, Bluthochdruck oder Mitralklappenprolaps",
        "es": "Cardiopatías, marcapasos, hipertensión arterial o prolapso de la válvula mitral",
        "nl": "Hartaandoeningen, pacemaker, hoge bloeddruk of mitralisklepprolaps",
        "pt": "Doenças cardíacas, marca-passo, hipertensão arterial ou prolapso da válvula mitral"
    },
    "Doctor clearance recommended for invasive procedures": {
        "en": "Doctor clearance recommended for invasive procedures",
        "fr": "Avis médical préalable recommandé pour les actes invasifs",
        "it": "Nulla osta medico raccomandato per procedure invasive",
        "de": "Ärztliche Freigabe für invasive Eingriffe empfohlen",
        "es": "Se recomienda autorización médica previa para procedimientos invasivos",
        "nl": "Doktersadvies aanbevolen voor invasieve behandelingen",
        "pt": "Liberação médica recomendada para procedimentos invasivos"
    },
    "Hemophilia, prolonged bleeding, or currently taking blood-thinning medications (e.g. Aspirin, Warfarin)": {
        "en": "Hemophilia, prolonged bleeding, or currently taking blood-thinning medications (e.g. Aspirin, Warfarin)",
        "fr": "Hémophilie, saignements prolongés ou prise d'anticoagulants/antiagrégants (ex. Aspirine, Warfarine)",
        "it": "Emofilia, sanguinamento prolungato o assunzione di anticoagulanti (es. Cardioaspirina, Coumadin)",
        "de": "Hämophilie, Blutungsneigung oder Einnahme von Blutverdünnern (z.B. Aspirin, Marcumar)",
        "es": "Hemofilia, sangrado prolongado o toma de anticoagulantes (ej. Aspirina, Sintrom, Warfarina)",
        "nl": "Hemofilie, verhoogde bloedingsneiging of gebruik van bloedverdunners (bijv. Aspirine, Warfarine)",
        "pt": "Hemofilia, sangramento prolongado ou uso de anticoagulantes (ex.: Aspirina, Varfarina)"
    },
    "May increase bleeding risk during procedure": {
        "en": "May increase bleeding risk during procedure",
        "fr": "Peut augmenter le risque hémorragique pendant l'acte",
        "it": "Può aumentare il rischio di sanguinamento durante la procedura",
        "de": "Kann das Blutungsrisiko während des Eingriffs erhöhen",
        "es": "Puede aumentar el riesgo de sangrado durante el procedimiento",
        "nl": "Kan het bloedingsrisico tijdens de behandeling verhogen",
        "pt": "Pode aumentar o risco de sangramento durante o procedimento"
    },
    "Diabetes (Type 1 or Type 2)": {
        "en": "Diabetes (Type 1 or Type 2)",
        "fr": "Diabète (Type 1 ou Type 2)",
        "it": "Diabete (Tipo 1 o Tipo 2)",
        "de": "Diabetes mellitus (Typ 1 oder Typ 2)",
        "es": "Diabetes (Tipo 1 o Tipo 2)",
        "nl": "Diabetes (Type 1 of Type 2)",
        "pt": "Diabetes (Tipo 1 ou Tipo 2)"
    },
    "May slow wound healing; keep blood sugar regulated": {
        "en": "May slow wound healing; keep blood sugar regulated",
        "fr": "Peut ralentir la cicatrisation cutanée ; glycémie stable requise",
        "it": "Può rallentare la guarigione; mantenere la glicemia controllata",
        "de": "Kann die Wundheilung verlangsamen; Blutzucker stabil halten",
        "es": "Puede ralentizar la cicatrización; mantenga la glucemia controlada",
        "nl": "Kan de wondgenezing vertragen; bloedsuikerspiegel stabiel houden",
        "pt": "Pode retardar a cicatrização; mantenha o controle glicêmico"
    },
    "Epilepsy, seizures, or frequent fainting spells": {
        "en": "Epilepsy, seizures, or frequent fainting spells",
        "fr": "Épilepsie, convulsions ou syncopes et malaises fréquents",
        "it": "Epilessia, convulsioni o frequenti episodi di svenimento",
        "de": "Epilepsie, Krampfanfälle oder häufige Ohnmachtsanfälle",
        "es": "Epilepsia, convulsiones o desmayos frecuentes",
        "nl": "Epilepsie, toevallen of frequente flauwtes",
        "pt": "Epilepsia, convulsões ou episódios frequentes de desmaio"
    },
    "Artist needs to take seizure precautions": {
        "en": "Artist needs to take seizure precautions",
        "fr": "Le praticien doit adapter la prise en charge et sécuriser le poste",
        "it": "L'operatore deve predisporre precauzioni adeguate",
        "de": "Tätowierer muss entsprechende Schutzmaßnahmen treffen",
        "es": "El profesional debe tomar precauciones preventivas ante crisis",
        "nl": "Behandelaar moet voorzorgsmaatregelen nemen",
        "pt": "O profissional precisa adotar precauções de segurança adequadas"
    },
    "Hepatitis (A, B, or C), HIV/AIDS, or other bloodborne pathogens": {
        "en": "Hepatitis (A, B, or C), HIV/AIDS, or other bloodborne pathogens",
        "fr": "Hépatites (A, B ou C), VIH/SIDA ou autres agents pathogènes transmissibles par le sang",
        "it": "Epatite (A, B o C), HIV/AIDS o altri patogeni a trasmissione ematica",
        "de": "Hepatitis (A, B oder C), HIV/AIDS oder andere durch Blut übertragbare Erreger",
        "es": "Hepatitis (A, B o C), VIH/SIDA u otros patógenos transmitidos por la sangre",
        "nl": "Hepatitis (A, B of C), Hiv/Aids of andere bloedoverdraagbare pathogenen",
        "pt": "Hepatite (A, B ou C), HIV/AIDS ou outros patógenos transmitidos pelo sangue"
    },
    "Universal precautions apply; disclosure assists in safety": {
        "en": "Universal precautions apply; disclosure assists in safety",
        "fr": "Les précautions universelles s'appliquent ; la déclaration renforce la sécurité",
        "it": "Si applicano le precauzioni universali; la trasparenza tutela la salute",
        "de": "Universelle Schutzmaßnahmen greifen; Offenlegung dient der Sicherheit",
        "es": "Se aplican precauciones universales; la transparencia garantiza la seguridad",
        "nl": "Universele voorzorgsmaatregelen van toepassing; melding dient de veiligheid",
        "pt": "Precauções universais são aplicadas; a declaração apoia a segurança"
    },
    "History of keloid scarring or hypertrophic scars": {
        "en": "History of keloid scarring or hypertrophic scars",
        "fr": "Antécédents de cicatrices chéloïdes ou hypertrophiques",
        "it": "Tendenza alla formazione di cicatrici cheloidi o ipertrofiche",
        "de": "Neigung zu Keloidbildung oder hypertrophen Narben",
        "es": "Antecedentes de cicatrización queloide o cicatrices hipertróficas",
        "nl": "Geschiedenis van keloïdvorming of hypertrofische littekens",
        "pt": "Histórico de cicatrizes queloides ou cicatrizes hipertróficas"
    },
    "Risk of altered cosmetic outcome": {
        "en": "Risk of altered cosmetic outcome",
        "fr": "Risque de modification du résultat esthétique et cicatriciel",
        "it": "Rischio di alterazione dell'esito estetico e cicatriziale",
        "de": "Risiko von Beeinträchtigungen des ästhetischen Ergebnisses",
        "es": "Riesgo de alteración del resultado estético y de cicatrización",
        "nl": "Risico op afwijkende esthetische littekenvorming",
        "pt": "Risco de alteração no resultado estético e na cicatrização"
    },
    "Allergies to latex, adhesives, soaps, lidocaine, or metals (nickel, cobalt)": {
        "en": "Allergies to latex, adhesives, soaps, lidocaine, or metals (nickel, cobalt)",
        "fr": "Allergies au latex, adhésifs, savons, lidocaïne ou métaux (nickel, cobalt)",
        "it": "Allergie a lattice, adesivi, saponi, lidocaina o metalli (nichel, cobalto)",
        "de": "Allergien gegen Latex, Pflasterkleber, Seifen, Lidocain oder Metalle (Nickel, Kobalt)",
        "es": "Alergias al látex, apósitos/adhesivos, jabones, lidocaína o metales (níquel, cobalto)",
        "nl": "Allergieën voor latex, kleefpleisters, zepen, lidocaïne of metalen (nikkel, kobalt)",
        "pt": "Alergias a látex, adesivos, sabonetes, lidocaína ou metais (níquel, cobalto)"
    },
    "Requires hypoallergenic setup and materials": {
        "en": "Requires hypoallergenic setup and materials",
        "fr": "Nécessite du matériel et des consommables hypoallergéniques",
        "it": "Richiede allestimento e materiali ipoallergenici",
        "de": "Erfordert hypoallergenes Setup und Material",
        "es": "Requiere equipamiento y materiales hipoalergénicos",
        "nl": "Vereist hypoallergene materialen en opstelling",
        "pt": "Requer equipamentos e materiais hipoalergênicos"
    },
    "Currently pregnant, planning pregnancy, or nursing": {
        "en": "Currently pregnant, planning pregnancy, or nursing",
        "fr": "Grossesse en cours, projet de grossesse ou allaitement",
        "it": "Gravidanza in corso, pianificazione gravidanza o allattamento",
        "de": "Bestehende Schwangerschaft, geplante Schwangerschaft oder Stillzeit",
        "es": "Embarazo actual, planificación de embarazo o período de lactancia",
        "nl": "Momenteel zwanger, kinderwens of borstvoeding gevend",
        "pt": "Gravidez confirmada, planejamento de gravidez ou amamentação"
    },
    "Procedure typically postponed during pregnancy/nursing": {
        "en": "Procedure typically postponed during pregnancy/nursing",
        "fr": "L'acte doit être impérativement reporté pendant la grossesse et l'allaitement",
        "it": "Procedura di norma posticipata durante gravidanza o allattamento",
        "de": "Eingriff wird während Schwangerschaft/Stillzeit in der Regel verschoben",
        "es": "El procedimiento debe posponerse durante el embarazo y la lactancia",
        "nl": "Behandeling wordt uitgesteld tijdens zwangerschap of borstvoeding",
        "pt": "O procedimento deve ser adiado durante a gravidez e a amamentação"
    },
    "Active skin condition at the procedure site (eczema, psoriasis, sunburn, active acne)": {
        "en": "Active skin condition at the procedure site (eczema, psoriasis, sunburn, active acne)",
        "fr": "Affections cutanées actives sur la zone (eczéma, psoriasis, coup de soleil, acné sévère)",
        "it": "Patologie cutanee attive sulla zona (eczema, psoriasi, scottature, acne infiammata)",
        "de": "Akute Hauterkrankung an der Eingriffsstelle (Ekzem, Psoriasis, Sonnenbrand, Akne)",
        "es": "Afección cutánea activa en la zona (eccema, psoriasis, quemadura solar, acné activo)",
        "nl": "Actieve huidaandoening op de behandelplek (eczeem, psoriasis, zonnebrand, actieve acne)",
        "pt": "Condição ativa de pele no local (eczema, psoríase, queimadura solar, acne ativa)"
    },
    "Cannot perform procedure over compromised skin": {
        "en": "Cannot perform procedure over compromised skin",
        "fr": "Impossible d'effectuer l'acte sur une peau lésée ou fragilisée",
        "it": "Non è possibile eseguire la procedura su cute lesa o infiammata",
        "de": "Eingriff auf geschädigter oder entzündeter Haut nicht möglich",
        "es": "No se puede realizar el procedimiento sobre piel dañada o irritada",
        "nl": "Behandeling kan niet worden uitgevoerd op beschadigde huid",
        "pt": "Não é possível realizar o procedimento sobre pele sensibilizada ou lesionada"
    },
    "Compromised immune system or taking immunosuppressive medication": {
        "en": "Compromised immune system or taking immunosuppressive medication",
        "fr": "Système immunitaire affaibli ou prise de traitements immunosuppresseurs",
        "it": "Sistema immunitario compromesso o terapia immunosoppressiva",
        "de": "Geschwächtes Immunsystem oder Einnahme von Immunsuppressiva",
        "es": "Sistema inmunitario debilitado o toma de medicamentos inmunosupresores",
        "nl": "Verzwakt immuunsysteem of gebruik van afweeronderdrukkende medicatie",
        "pt": "Sistema imunológico comprometido ou uso de medicamentos imunossupressores"
    },
    "Increased risk of infection; doctor consult required": {
        "en": "Increased risk of infection; doctor consult required",
        "fr": "Risque infectieux accru ; avis médical préalable requis",
        "it": "Aumentato rischio di infezione; consulto medico obbligatorio",
        "de": "Erhöhtes Infektionsrisiko; ärztliche Rücksprache erforderlich",
        "es": "Mayor riesgo de infección; se requiere consulta médica previa",
        "nl": "Verhoogd infectierisico; doktersconsultatie verplicht",
        "pt": "Risco aumentado de infecção; consulta médica obrigatória"
    },
    "Taking Accutane (isotretinoin) currently or within the past 6 months": {
        "en": "Taking Accutane (isotretinoin) currently or within the past 6 months",
        "fr": "Prise de Roaccutane / isotrétinoïne actuellement ou au cours des 6 derniers mois",
        "it": "Assunzione di isotretinoina (Roaccutan) in corso o negli ultimi 6 mesi",
        "de": "Einnahme von Isotretinoin (Roaccutan) aktuell oder in den letzten 6 Monaten",
        "es": "Toma de Roacutan / isotretinoína actualmente o en los últimos 6 meses",
        "nl": "Gebruik van Roaccutane (isotretinoïne) nu of in de afgelopen 6 maanden",
        "pt": "Uso de Roacutan (isotretinoína) atualmente ou nos últimos 6 meses"
    },
    "Skin fragility; procedure must be postponed at least 6 months post-treatment": {
        "en": "Skin fragility; procedure must be postponed at least 6 months post-treatment",
        "fr": "Fragilité cutanée majeure ; reporter l'acte d'au moins 6 mois après l'arrêt",
        "it": "Fragilità cutanea; posticipare di almeno 6 mesi dal termine della cura",
        "de": "Erhöhte Hautempfindlichkeit; Wartezeit von mind. 6 Monaten nach Absetzen",
        "es": "Fragilidad de la piel; debe posponerse al menos 6 meses tras finalizar el tratamiento",
        "nl": "Kwetsbare huid; minimaal 6 maanden wachten na beëindiging van de kuur",
        "pt": "Extrema sensibilidade na pele; adiar por no mínimo 6 meses após o término do tratamento"
    },
    "Under the influence of alcohol, drugs, or recreational substances today": {
        "en": "Under the influence of alcohol, drugs, or recreational substances today",
        "fr": "Sous l'emprise d'alcool, de stupéfiants ou de substances récréatives aujourd'hui",
        "it": "Sotto l'influsso di alcol, droghe o sostanze ricreative oggi",
        "de": "Heute unter dem Einfluss von Alkohol, Drogen oder Rauschmitteln",
        "es": "Bajo la influencia de alcohol, drogas o sustancias recreativas hoy",
        "nl": "Vandaag onder invloed van alcohol, drugs of verdovende middelen",
        "pt": "Sob efeito de álcool, drogas ou substâncias entorpecentes no dia de hoje"
    },
    "ABSOLUTE CONTRAINDICATION: Cannot proceed under the influence": {
        "en": "ABSOLUTE CONTRAINDICATION: Cannot proceed under the influence",
        "fr": "CONTRE-INDICATION ABSOLUE : Impossible d'effectuer l'acte sous influence",
        "it": "CONTROINDICAZIONE ASSOLUTA: Vietato procedere sotto l'effetto di sostanze",
        "de": "ABSOLUTE KONTRAINDIKATION: Keine Durchführung unter Alkoholeinfluss/Drogen",
        "es": "CONTRAINDICACIÓN ABSOLUTA: No se puede proceder bajo los efectos de sustancias",
        "nl": "ABSOLUTE CONTRA-INDICATIE: Geen behandeling mogelijk onder invloed",
        "pt": "CONTRAINDICAÇÃO ABSOLUTA: Proibido realizar o procedimento sob o efeito de substâncias"
    },
    "Studio / Shop Name": {
        "en": "Studio / Shop Name",
        "fr": "Nom du studio ou de l'établissement",
        "it": "Nome dello studio o del negozio",
        "de": "Name des Studios / Shops",
        "es": "Nombre del estudio o tienda",
        "nl": "Naam van de studio of shop",
        "pt": "Nome do estúdio ou estabelecimento"
    },
    "104 Studio Plaza, Suite B | (555) 019-2834 | contact@poli-studio.com": {
        "en": "104 Studio Plaza, Suite B | (555) 019-2834 | contact@poli-studio.com",
        "fr": "104 Studio Plaza, Suite B | (555) 019-2834 | contact@poli-studio.com",
        "it": "104 Studio Plaza, Suite B | (555) 019-2834 | contact@poli-studio.com",
        "de": "104 Studio Plaza, Suite B | (555) 019-2834 | contact@poli-studio.com",
        "es": "104 Studio Plaza, Suite B | (555) 019-2834 | contact@poli-studio.com",
        "nl": "104 Studio Plaza, Suite B | (555) 019-2834 | contact@poli-studio.com",
        "pt": "104 Studio Plaza, Suite B | (555) 019-2834 | contact@poli-studio.com"
    },
    "Poli International Tattoo & Piercing Studio": {
        "en": "Poli International Tattoo & Piercing Studio",
        "fr": "Poli International Tattoo & Piercing Studio",
        "it": "Poli International Tattoo & Piercing Studio",
        "de": "Poli International Tattoo & Piercing Studio",
        "es": "Poli International Tattoo & Piercing Studio",
        "nl": "Poli International Tattoo & Piercing Studio",
        "pt": "Poli International Tattoo & Piercing Studio"
    },
    "Poli International Studio": {
        "en": "Poli International Studio",
        "fr": "Poli International Studio",
        "it": "Poli International Studio",
        "de": "Poli International Studio",
        "es": "Poli International Studio",
        "nl": "Poli International Studio",
        "pt": "Poli International Studio"
    },
    "Name of licensed tattoo artist": {
        "en": "Name of licensed tattoo artist",
        "fr": "Nom de l'artiste tatoueur agréé",
        "it": "Nome del tatuatore abilitato",
        "de": "Name des lizenzierten Tätowierers",
        "es": "Nombre del tatuador certificado",
        "nl": "Naam van de gediplomeerde tatoeëerder",
        "pt": "Nome do tatuador profissional certificado"
    },
    "Lead Artist Name": {
        "en": "Lead Artist Name",
        "fr": "Nom de l'artiste principal",
        "it": "Nome del primo artista",
        "de": "Name des leitenden Künstlers",
        "es": "Nombre del artista principal",
        "nl": "Naam van de hoofdartiest",
        "pt": "Nome do artista principal"
    },
    "Name of practitioner executing procedure": {
        "en": "Name of practitioner executing procedure",
        "fr": "Nom du praticien réalisant l'acte",
        "it": "Nome dell'operatore che esegue la procedura",
        "de": "Name der ausführenden Fachkraft",
        "es": "Nombre del profesional que realiza el procedimiento",
        "nl": "Naam van de uitvoerende behandelaar",
        "pt": "Nome do profissional responsável pelo procedimento"
    },
    "Cover-up specialist artist name": {
        "en": "Cover-up specialist artist name",
        "fr": "Nom de l'artiste spécialiste en recouvrement",
        "it": "Nome del tatuatore specialista in cover-up",
        "de": "Name des Cover-Up-Spezialisten",
        "es": "Nombre del artista especialista en cover-up",
        "nl": "Naam van de cover-up specialist",
        "pt": "Nome do artista especialista em cover-up"
    },
    "Practitioner Name": {
        "en": "Practitioner Name",
        "fr": "Nom du praticien",
        "it": "Nome dell'operatore",
        "de": "Name der Fachkraft",
        "es": "Nombre del profesional",
        "nl": "Naam van de behandelaar",
        "pt": "Nome do profissional"
    },
    "Client legal name": {
        "en": "Client legal name",
        "fr": "Nom légal du client",
        "it": "Nome anagrafico del cliente",
        "de": "Bürgerlicher Name des Kunden",
        "es": "Nombre legal del cliente",
        "nl": "Officiële naam van de klant",
        "pt": "Nome civil do cliente"
    },
    "Jane Doe": {
        "en": "Jane Doe",
        "fr": "Jeanne Dupont",
        "it": "Maria Rossi",
        "de": "Erika Mustermann",
        "es": "María García",
        "nl": "Sanne Janssen",
        "pt": "Maria Silva"
    },
    "Jane Elizabeth Doe": {
        "en": "Jane Elizabeth Doe",
        "fr": "Jeanne Élisabeth Dupont",
        "it": "Maria Elisabetta Rossi",
        "de": "Erika Elisabeth Mustermann",
        "es": "María Isabel García",
        "nl": "Sanne Elisabeth Janssen",
        "pt": "Maria Elisabeth Silva"
    },
    "Minor first and last name": {
        "en": "Minor first and last name",
        "fr": "Prénom et nom du mineur",
        "it": "Nome e cognome del minore",
        "de": "Vor- und Nachname des Minderjährigen",
        "es": "Nombre y apellidos del menor",
        "nl": "Voor- en achternaam van de minderjarige",
        "pt": "Nome e sobrenome do menor"
    },
    "Guardian first and last name": {
        "en": "Guardian first and last name",
        "fr": "Prénom et nom du tuteur",
        "it": "Nome e cognome del tutore",
        "de": "Vor- und Nachname des Erziehungsberechtigten",
        "es": "Nombre y apellidos del tutor",
        "nl": "Voor- en achternaam van de voogd",
        "pt": "Nome e sobrenome do responsável"
    },
    "Street, City, State, ZIP": {
        "en": "Street, City, State, ZIP",
        "fr": "Rue, Ville, Région, Code postal",
        "it": "Via, Città, Provincia, CAP",
        "de": "Straße, Hausnr., Stadt, PLZ",
        "es": "Calle, Ciudad, Provincia, Código Postal",
        "nl": "Straat, Huisnummer, Stad, Postcode",
        "pt": "Rua, Número, Cidade, Estado, CEP"
    },
    "State/Country & ID Number": {
        "en": "State/Country & ID Number",
        "fr": "Pays/Région et numéro de pièce d'identité",
        "it": "Paese/Stato e numero del documento",
        "de": "Land/Bundesland & Dokumentennummer",
        "es": "País/Comunidad y número de documento",
        "nl": "Land/Provincie & documentnummer",
        "pt": "País/Estado e número do documento"
    },
    "ID Type and Number": {
        "en": "ID Type and Number",
        "fr": "Type de pièce et numéro",
        "it": "Tipo di documento e numero",
        "de": "Ausweisart und Nummer",
        "es": "Tipo de documento y número",
        "nl": "Soort document en nummer",
        "pt": "Tipo de documento e número"
    },
    "ID Type and document number": {
        "en": "ID Type and document number",
        "fr": "Type et numéro du document",
        "it": "Tipo e numero del documento",
        "de": "Dokumentenart und Ausweisnummer",
        "es": "Tipo y número de documento",
        "nl": "Documenttype en nummer",
        "pt": "Tipo e número do documento"
    },
    "Permit & Location": {
        "en": "Permit & Location",
        "fr": "N° d'autorisation et lieu",
        "it": "Autorizzazione e sede",
        "de": "Betriebserlaubnis & Standort",
        "es": "Permiso y ubicación",
        "nl": "Vergunning & locatie",
        "pt": "Alvará e localização"
    },
    "Contact person & phone number": {
        "en": "Contact person & phone number",
        "fr": "Personne à contacter et téléphone",
        "it": "Persona di riferimento e recapito telefonico",
        "de": "Kontaktperson & Telefonnummer",
        "es": "Persona de contacto y número de teléfono",
        "nl": "Contactpersoon & telefoonnummer",
        "pt": "Pessoa de contato e telefone"
    },
    "Color intensity, darkness, motifs...": {
        "en": "Color intensity, darkness, motifs...",
        "fr": "Intensité des couleurs, saturation, motifs existants...",
        "it": "Intensità dei colori, tonalità scure, soggetti...",
        "de": "Farbintensität, Deckkraft, vorhandene Motive...",
        "es": "Intensidad de color, oscuridad, motivos existentes...",
        "nl": "Kleurintensiteit, donkerte, bestaande motieven...",
        "pt": "Intensidade da cor, saturação, motivos existentes..."
    },
    "Dark motifs, florals, koi, biomech, dark shading...": {
        "en": "Dark motifs, florals, koi, biomech, dark shading...",
        "fr": "Motifs foncés, floral, carpe koï, biomécanique, ombrages sombres...",
        "it": "Soggetti scuri, floreale, carpa koi, biomeccanico, forti ombreggiature...",
        "de": "Dunkle Motive, Floral, Koi, Biomechanik, dunkle Schattierungen...",
        "es": "Motivos oscuros, florales, carpa koi, biomecánico, sombras oscuras...",
        "nl": "Donkere motieven, bloemen, koi, biomechanisch, zware schaduwen...",
        "pt": "Temas escuros, florais, carpa koi, biomecânico, sombras densas..."
    },
    "Detailed description of large scale theme, motifs, background elements, flow...": {
        "en": "Detailed description of large scale theme, motifs, background elements, flow...",
        "fr": "Description détaillée du thème de grande envergure, arrière-plans, dynamique...",
        "it": "Descrizione dettagliata del tema di grandi dimensioni, sfondi, flusso visivo...",
        "de": "Detaillierte Beschreibung des Großprojekts, Hintergründe, Dynamik...",
        "es": "Descripción detallada del proyecto de gran escala, fondos, composición...",
        "nl": "Gedetailleerde beschrijving van het grote thema, achtergronden, anatomische flow...",
        "pt": "Descrição detalhada do projeto de grande escala, fundos, fluxo visual..."
    },
    "Subject matter, symbols, references, text/lettering, style details...": {
        "en": "Subject matter, symbols, references, text/lettering, style details...",
        "fr": "Sujet, symboles, références, lettrage, détails stylistiques...",
        "it": "Soggetto, simboli, riferimenti, scritte/lettering, dettagli di stile...",
        "de": "Motivbeschreibung, Symbole, Referenzen, Schriftzüge, Stilwünsche...",
        "es": "Tema, símbolos, referencias, texto/tipografía, detalles de estilo...",
        "nl": "Onderwerp, symbolen, referenties, belettering, stijlkenmerken...",
        "pt": "Tema, símbolos, referências, escrita/lettering, detalhes do estilo..."
    },
    "e.g. Left outer forearm, 2 inches above wrist": {
        "en": "e.g. Left outer forearm, 2 inches above wrist",
        "fr": "ex. Avant-bras gauche extérieur, 5 cm au-dessus du poignet",
        "it": "es. Avambraccio esterno sinistro, 5 cm sopra il polso",
        "de": "z.B. Linker äußerer Unterarm, 5 cm oberhalb des Handgelenks",
        "es": "ej. Antebrazo exterior izquierdo, 5 cm sobre la muñeca",
        "nl": "bijv. Buitenkant linker onderarm, 5 cm boven de pols",
        "pt": "ex.: Antebraço externo esquerdo, 5 cm acima do pulso"
    },
    "e.g. 4 inches x 6 inches (10cm x 15cm)": {
        "en": "e.g. 4 inches x 6 inches (10cm x 15cm)",
        "fr": "ex. 10 cm x 15 cm (4 x 6 pouces)",
        "it": "es. 10 cm x 15 cm",
        "de": "z.B. 10 cm x 15 cm",
        "es": "ej. 10 cm x 15 cm",
        "nl": "bijv. 10 cm x 15 cm",
        "pt": "ex.: 10 cm x 15 cm"
    },
    "e.g. Full Back (neck to gluteal fold) and Rib panels": {
        "en": "e.g. Full Back (neck to gluteal fold) and Rib panels",
        "fr": "ex. Dos complet (nuque aux fessiers) et côtes",
        "it": "es. Schiena completa (dalla nuca ai glutei) e costato",
        "de": "z.B. Kompletter Rücken (Nacken bis Gesäßfalte) und Rippen",
        "es": "ej. Espalda completa (de nuca a glúteos) y costillas",
        "nl": "bijv. Volledige rug (nek tot bilplooi) en ribbenpanelen",
        "pt": "ex.: Costas inteiras (nuca aos glúteos) e costelas"
    },
    "e.g. 5-7 sessions (~30-35 total hours)": {
        "en": "e.g. 5-7 sessions (~30-35 total hours)",
        "fr": "ex. 5 à 7 séances (~30 à 35 heures au total)",
        "it": "es. 5-7 sessioni (~30-35 ore totali)",
        "de": "z.B. 5-7 Sitzungen (~30-35 Gesamtstunden)",
        "es": "ej. 5-7 sesiones (~30-35 horas en total)",
        "nl": "bijv. 5-7 sessies (~30-35 uur in totaal)",
        "pt": "ex.: 5 a 7 sessões (~30 a 35 horas no total)"
    },
    "e.g. $180/hr or $1,200/day rate, $300 holding deposit": {
        "en": "e.g. $180/hr or $1,200/day rate, $300 holding deposit",
        "fr": "ex. 150 €/h ou 1 000 €/jour, 250 € d'acompte",
        "it": "es. 150 €/ora o 1.000 €/giornata, 250 € caparra",
        "de": "z.B. 150 €/Std. oder 1.000 €/Tagessatz, 250 € Anzahlung",
        "es": "ej. 150 €/h o 1.000 €/tarifa día, 250 € fianza/reserva",
        "nl": "bijv. €150/uur of €1.000/dagtarief, €250 aanbetaling",
        "pt": "ex.: R$ 250/h ou R$ 1.800/diária, R$ 400 sinal de reserva"
    },
    "e.g. Station 3 - Autoclave Lot #2026-A": {
        "en": "e.g. Station 3 - Autoclave Lot #2026-A",
        "fr": "ex. Poste 3 - Lot d'autoclave n° 2026-A",
        "it": "es. Postazione 3 - Lotto autoclave n. 2026-A",
        "de": "z.B. Platz 3 - Autoklav-Chargennr. 2026-A",
        "es": "ej. Cabina 3 - Lote de autoclave n.º 2026-A",
        "nl": "bijv. Werkplek 3 - Autoclaaf lotnr. 2026-A",
        "pt": "ex.: Bancada 3 - Lote autoclave n.º 2026-A"
    },
    "e.g. Lot #NV-2026-44, Statim Cycle 12 (Biological Spore Tested)": {
        "en": "e.g. Lot #NV-2026-44, Statim Cycle 12 (Biological Spore Tested)",
        "fr": "ex. Lot n° NV-2026-44, Cycle Statim 12 (Test biologique d'indicateurs de spores conforme)",
        "it": "es. Lotto n. NV-2026-44, Ciclo Statim 12 (Test biologico delle spore conforme)",
        "de": "z.B. Chargennr. NV-2026-44, Statim-Zyklus 12 (Biologischer Sporentest geprüft)",
        "es": "ej. Lote n.º NV-2026-44, Ciclo Statim 12 (Test biológico de esporas conforme)",
        "nl": "bijv. Lotnr. NV-2026-44, Statim-cyclus 12 (Biologische sporentest getest)",
        "pt": "ex.: Lote n.º NV-2026-44, Ciclo Statim 12 (Teste biológico de esporos aprovado)"
    },
    "e.g. 16G (1.2mm) x 5/16\" (8mm) Threadless Labret": {
        "en": "e.g. 16G (1.2mm) x 5/16\" (8mm) Threadless Labret",
        "fr": "ex. Labret sans pas de vis 16G (1,2 mm) x 8 mm (5/16\")",
        "it": "es. Labret threadless 16G (1,2 mm) x 8 mm (5/16\")",
        "de": "z.B. 16G (1,2 mm) x 8 mm (5/16\") gewindefreies Labret",
        "es": "ej. Labret sin rosca 16G (1,2 mm) x 8 mm (5/16\")",
        "nl": "bijv. 16G (1,2 mm) x 8 mm (5/16\") draadloze labret",
        "pt": "ex.: Labret sem rosca 16G (1,2 mm) x 8 mm (5/16\")"
    },
    "e.g. Standard bilateral earlobe piercing": {
        "en": "e.g. Standard bilateral earlobe piercing",
        "fr": "ex. Perçage classique bilatéral des lobes d'oreilles",
        "it": "es. Foratura standard bilaterale dei lobi delle orecchie",
        "de": "z.B. Standardmäßiges beidseitiges Ohrlochstechen",
        "es": "ej. Perforación estándar bilateral de lóbulos de oreja",
        "nl": "bijv. Standaard dubbele oorlel-piercing",
        "pt": "ex.: Perfuração bilateral padrão do lóbulo da orelha"
    },
    "e.g. ASTM F-136 Implant Grade Titanium Studs (18G / 1.0mm)": {
        "en": "e.g. ASTM F-136 Implant Grade Titanium Studs (18G / 1.0mm)",
        "fr": "ex. Clous en titane de grade médical ASTM F-136 (18G / 1,0 mm)",
        "it": "es. Orecchini a perno in titanio per impianti ASTM F-136 (18G / 1,0 mm)",
        "de": "z.B. ASTM F-136 Implantat-Titanstecker (18G / 1,0 mm)",
        "es": "ej. Pendientes de titanio grado implante ASTM F-136 (18G / 1,0 mm)",
        "nl": "bijv. ASTM F-136 implant-grade titanium studs (18G / 1,0 mm)",
        "pt": "ex.: Pinos em titânio grau implante ASTM F-136 (18G / 1,0 mm)"
    },
    "e.g. Tina Davies I Love Ink - Dark Brown Lot #5821": {
        "en": "e.g. Tina Davies I Love Ink - Dark Brown Lot #5821",
        "fr": "ex. Tina Davies I Love Ink - Dark Brown Lot n° 5821",
        "it": "es. Tina Davies I Love Ink - Dark Brown Lotto n. 5821",
        "de": "z.B. Tina Davies I Love Ink - Dark Brown Chargennr. 5821",
        "es": "ej. Tina Davies I Love Ink - Dark Brown Lote n.º 5821",
        "nl": "bijv. Tina Davies I Love Ink - Dark Brown Batchnr. 5821",
        "pt": "ex.: Tina Davies I Love Ink - Dark Brown Lote n.º 5821"
    },
    "e.g. Done 5 years ago": {
        "en": "e.g. Done 5 years ago",
        "fr": "ex. Réalisé il y a 5 ans",
        "it": "es. Eseguito 5 anni fa",
        "de": "z.B. Vor 5 Jahren gestochen",
        "es": "ej. Hecho hace 5 años",
        "nl": "bijv. 5 jaar geleden gezet",
        "pt": "ex.: Realizado há 5 anos"
    },
    "e.g. 15": {
        "en": "e.g. 15",
        "fr": "ex. 15",
        "it": "es. 15",
        "de": "z.B. 15",
        "es": "ej. 15",
        "nl": "bijv. 15",
        "pt": "ex.: 15"
    },
    "e.g. Mark Doe (Spouse) - (555) 987-6543": {
        "en": "e.g. Mark Doe (Spouse) - (555) 987-6543",
        "fr": "ex. Marc Dupont (Conjoint) - 06 12 34 56 78",
        "it": "es. Marco Rossi (Coniuge) - 333 1234567",
        "de": "z.B. Max Mustermann (Ehepartner) - 0151 12345678",
        "es": "ej. Carlos García (Cónyuge) - 612 345 678",
        "nl": "bijv. Jan Jansen (Partner) - 06 12345678",
        "pt": "ex.: Carlos Silva (Cônjuge) - (11) 98765-4321"
    },
    "e.g. John Doe (Spouse) - (555) 987-6543": {
        "en": "e.g. John Doe (Spouse) - (555) 987-6543",
        "fr": "ex. Jean Dupont (Conjoint) - 06 12 34 56 78",
        "it": "es. Giovanni Rossi (Coniuge) - 333 1234567",
        "de": "z.B. Johann Mustermann (Ehepartner) - 0151 12345678",
        "es": "ej. Juan García (Cónyuge) - 612 345 678",
        "nl": "bijv. Johan Jansen (Partner) - 06 12345678",
        "pt": "ex.: João Silva (Cônjuge) - (11) 98765-4321"
    },
    "e.g. Dr. Robert Vance, Metro Health - (555) 234-5678": {
        "en": "e.g. Dr. Robert Vance, Metro Health - (555) 234-5678",
        "fr": "ex. Dr Robert Vance, Centre Médical Métro - 01 23 45 67 89",
        "it": "es. Dott. Roberto Valli, Centro Sanitario - 02 12345678",
        "de": "z.B. Dr. med. Robert Vance, Medizinisches Versorgungszentrum - 030 1234567",
        "es": "ej. Dr. Roberto Vence, Salud Metropolitana - 912 345 678",
        "nl": "bijv. Dr. Robert Vance, Metro Gezondheidscentrum - 020 1234567",
        "pt": "ex.: Dr. Roberto Vance, Centro de Saúde Metropolitano - (11) 3234-5678"
    },
    "Dr. John Doe, City Medical Center, (555) 123-4567": {
        "en": "Dr. John Doe, City Medical Center, (555) 123-4567",
        "fr": "Dr Jean Dupont, Centre Médical Municipal, 01 23 45 67 89",
        "it": "Dott. Giovanni Rossi, Policlinico Cittadino, 02 12345678",
        "de": "Dr. Johann Mustermann, Städtisches Klinikum, 030 1234567",
        "es": "Dr. Juan García, Centro Médico Municipal, 912 345 678",
        "nl": "Dr. Jan Jansen, Medisch Centrum Stad, 020 1234567",
        "pt": "Dr. João Silva, Centro Médico Municipal, (11) 3123-4567"
    },
    "Dr. Smith, City Medical Clinic, Clearance dated MM/DD/YYYY": {
        "en": "Dr. Smith, City Medical Clinic, Clearance dated MM/DD/YYYY",
        "fr": "Dr Martin, Clinique Médicale, Autorisation en date du JJ/MM/AAAA",
        "it": "Dott. Rossi, Clinica Sanitaria, Certificato del GG/MM/AAAA",
        "de": "Dr. Müller, Medizinisches Zentrum, Freigabe vom TT.MM.JJJJ",
        "es": "Dr. Pérez, Centro Médico, Autorización con fecha DD/MM/AAAA",
        "nl": "Dr. De Vries, Medisch Centrum, Goedkeuring d.d. DD-MM-JJJJ",
        "pt": "Dr. Souza, Clínica Médica, Autorização com data de DD/MM/AAAA"
    },
    "e.g. Blood pressure medication, multivitamins, occasional ibuprofen...": {
        "en": "e.g. Blood pressure medication, multivitamins, occasional ibuprofen...",
        "fr": "ex. Traitement antihypertenseur, multivitamines, ibuprofène occasionnel...",
        "it": "es. Farmaci per la pressione, multivitaminici, ibuprofene occasionale...",
        "de": "z.B. Blutdruckmedikamente, Multivitamine, gelegentlich Ibuprofen...",
        "es": "ej. Medicamentos para la tensión, multivitaminas, ibuprofeno ocasional...",
        "nl": "bijv. Bloeddrukmedicatie, multivitaminen, af en toe ibuprofen...",
        "pt": "ex.: Remédio para pressão arterial, polivitamínicos, ibuprofeno ocasional..."
    },
    "Comprehensive studio consultation, medical safety disclosure, doctor authorization clause, and legal consent waiver for professional tattoo appointments.": {
        "en": "Comprehensive studio consultation, medical safety disclosure, doctor authorization clause, and legal consent waiver for professional tattoo appointments.",
        "fr": "Consultation de studio complète, déclaration de sécurité médicale, clause d'autorisation médicale et décharge légale de consentement pour rendez-vous de tatouage professionnel.",
        "it": "Consulenza di studio completa, informativa sanitaria, clausola di nulla osta medico e consenso informato per appuntamenti di tatuaggio professionale.",
        "de": "Umfassende Studio-Beratung, medizinische Sicherheitsauskunft, ärztliche Freigabeklausel und rechtliche Einverständniserklärung für professionelle Tattoo-Termine.",
        "es": "Consulta integral de estudio, declaración de seguridad médica, cláusula de autorización médica y consentimiento legal informado para citas de tatuaje profesional.",
        "nl": "Uitgebreide studio-intake, medische veiligheidsverklaring, doktersautorisatieclausule en wettelijke toestemmingsverklaring voor professionele tatoeageafspraken.",
        "pt": "Consulta completa de estúdio, declaração de segurança médica, cláusula de autorizzazione médica e termo de consentimento livre e esclarecido para tatuagem profissional."
    },
    "jane.doe@example.com": {
        "en": "jane.doe@example.com",
        "fr": "jeanne.dupont@example.com",
        "it": "maria.rossi@example.com",
        "de": "erika.mustermann@example.com",
        "es": "maria.garcia@example.com",
        "nl": "sanne.janssen@example.com",
        "pt": "maria.silva@example.com"
    },
    "(555) 432-8765": {
        "en": "(555) 432-8765",
        "fr": "06 12 34 56 78",
        "it": "333 1234567",
        "de": "0151 12345678",
        "es": "612 345 678",
        "nl": "06 12345678",
        "pt": "(11) 98765-4321"
    },
    "Comprehensive consent form for body piercing compliant with professional body piercing standards, qualified professional piercer sterilization protocols, physician clearance, sound mind declaration, and pre-procedure aftercare.": {
        "en": "Comprehensive consent form for body piercing compliant with professional body piercing standards, qualified professional piercer sterilization protocols, physician clearance, sound mind declaration, and pre-procedure aftercare.",
        "fr": "Formulaire de consentement complet pour piercing corporel conforme aux normes professionnelles de piercing corporel, protocoles de stérilisation de perceur qualifié, avis médical, discernement et soins préalables.",
        "it": "Modulo di consenso informato completo per body piercing conforme agli standard professionali, protocolli di sterilizzazione di piercer qualificato, nulla osta medico e cura preventiva.",
        "de": "Umfassende Einwilligungserklärung für Bodypiercing gemäß professionellen Standards, Sterilisationsprotokollen qualifizierter Piercer, ärztlicher Freigabe und Vorab-Nachsorgeberatung.",
        "es": "Formulario de consentimiento integral para piercing corporal según los Estándares Profesionales de Piercing, protocolos de esterilización de anillador cualificado, visto bueno médico y cuidados previos.",
        "nl": "Volledig toestemmingsformulier voor bodypiercing conform professionele normen, sterilisatieprotocollen van gekwalificeerde piercers, doktersgoedkeuring en voorafgaande nazorginstructies.",
        "pt": "Formulário abrangente de consentimento para body piercing conforme Padrões Profissionais, protocolos de esterilização de body piercer qualificado, autorização médica e cuidados prévios."
    },
    "jane@example.com": {
        "en": "jane@example.com",
        "fr": "jeanne@example.com",
        "it": "maria@example.com",
        "de": "erika@example.com",
        "es": "maria@example.com",
        "nl": "sanne@example.com",
        "pt": "maria@example.com"
    },
    "Medical Clearance Requirements": {
        "en": "Medical Clearance Requirements",
        "fr": "Exigences d'autorisation médicale",
        "it": "Requisiti di nulla osta medico",
        "de": "Anforderungen an die ärztliche Freigabe",
        "es": "Requisitos de autorización médica",
        "nl": "Vereisten voor medische goedkeuring",
        "pt": "Requisitos de liberação médica"
    },
    "Certain health conditions (including heart murmurs, hemophilia/blood clotting disorders, diabetes, immune disorders, pregnancy, or keloid scarring history) may mandate prior doctor authorization under professional body piercing standards.": {
        "en": "Certain health conditions (including heart murmurs, hemophilia/blood clotting disorders, diabetes, immune disorders, pregnancy, or keloid scarring history) may mandate prior doctor authorization under professional body piercing standards.",
        "fr": "Certains états de santé (notamment souffles cardiaques, troubles de la coagulation/hémophilie, diabète, immunodéficience, grossesse ou antécédents de chéloïdes) exigent une autorisation médicale préalable selon les normes professionnelles de piercing corporel.",
        "it": "Alcune condizioni di salute (tra cui soffi cardiaci, disturbi della coagulazione/emofilia, diabete, deficit immunitari, gravidanza o cheloidi) richiedono nulla osta medico preventivo secondo gli standard professionali di body piercing.",
        "de": "Bestimmte Erkrankungen (einschließlich Herzgeräusche, Blutgerinnungsstörungen/Hämophilie, Diabetes, Immunschwäche, Schwangerschaft oder Keloidbildung) erfordern gemäß professionellen Bodypiercing-Standards eine vorherige ärztliche Freigabe.",
        "es": "Ciertas condiciones de salud (incluidos soplos cardíacos, trastornos de coagulación/hemofilia, diabetes, problemas inmunitarios, embarazo o historial de queloides) exigen autorización médica previa según los Estándares Profesionales de Piercing.",
        "nl": "Bepaalde gezondheidsaandoeningen (waaronder hartruis, stollingsstoornissen/hemofilie, diabetes, immuunstoornissen, zwangerschap of neiging tot keloïden) vereisen vooraf doktersgoedkeuring conform professionele bodypiercing-normen.",
        "pt": "Determinadas condições de saúde (como sopro cardíaco, distúrbios de coagulação/hemofilia, diabetes, distúrbios imunológicos, gravidez ou histórico de queloides) exigem autorização médica prévia sob os Padrões Profissionais de Body Piercing."
    },
    "No medical clearance required": {
        "en": "No medical clearance required",
        "fr": "Aucune autorisation médicale requise",
        "it": "Nessun nulla osta medico richiesto",
        "de": "Keine ärztliche Freigabe erforderlich",
        "es": "No requiere autorización médica",
        "nl": "Geen medische goedkeuring vereist",
        "pt": "Nenhuma autorização médica necessária"
    },
    "Yes - Doctor authorization obtained and on file": {
        "en": "Yes - Doctor authorization obtained and on file",
        "fr": "Oui - Autorisation du médecin obtenue et archivée",
        "it": "Sì - Nulla osta medico ottenuto e archiviato",
        "de": "Ja - Ärztliche Freigabe liegt vor und wurde hinterlegt",
        "es": "Sí - Autorización médica obtenida y archivada",
        "nl": "Ja - Doktersgoedkeuring verkregen en opgeslagen",
        "pt": "Sim - Autorização médica obtida e arquivada"
    },
    "Yes - Cleared by treating physician": {
        "en": "Yes - Cleared by treating physician",
        "fr": "Oui - Validé par le médecin traitant",
        "it": "Sì - Autorizzato dal medico curante",
        "de": "Ja - Durch behandelnden Arzt freigegeben",
        "es": "Sí - Autorizado por el médico tratante",
        "nl": "Ja - Goedgekeurd door behandelend arts",
        "pt": "Sim - Liberado pelo médico assistente"
    },
    "Comprehensive health disclosure and clinical intake form covering cardiovascular conditions, blood thinners, communicable diseases, allergies, fainting history, physician authorizations, and legal certifications.": {
        "en": "Comprehensive health disclosure and clinical intake form covering cardiovascular conditions, blood thinners, communicable diseases, allergies, fainting history, physician authorizations, and legal certifications.",
        "fr": "Bilan de santé complet et formulaire d'admission clinique couvrant affections cardiovasculaires, anticoagulants, maladies transmissibles, allergies, syncopes, autorisations médicales et déclarations légales.",
        "it": "Informativa sanitaria completa e scheda clinica di accoglienza per cardiopatie, anticoagulanti, malattie trasmissibili, allergie, svenimenti, nulla osta medici e certificazioni legali.",
        "de": "Vollständige gesundheitliche Aufklärung und klinischer Aufnahmebogen für Herz-Kreislauf-Erkrankungen, Blutverdünner, Infektionskrankheiten, Allergien, Ohnmachten, Arztfreigaben und Rechtszertifizierungen.",
        "es": "Declaración integral de salud y ficha clínica de admisión sobre afecciones cardiovasculares, anticoagulantes, enfermedades transmisibles, alergias, síncopes, autorizaciones médicas y certificaciones legales.",
        "nl": "Uitgebreid gezondheidsoverzicht en klinisch intakeformulier over hart- en vaatziekten, bloedverdunners, overdraagbare aandoeningen, allergieën, flauwvallen, doktersautorisaties en wettelijke verklaringen.",
        "pt": "Histórico completo de saúde e ficha clínica abrangendo doenças cardiovasculares, anticoagulantes, doenças transmissíveis, alergias, desmaios, autorizações médicas e declarações legais."
    },
    "Multi-Session Tattoo Project Master Agreement": {
        "en": "Multi-Session Tattoo Project Master Agreement",
        "fr": "Accord-cadre pour projet de tatouage multi-sessions",
        "it": "Accordo quadro per progetti di tatuaggio a sessioni multiple",
        "de": "Rahmenvereinbarung für mehrteilige Tattoo-Großprojekte",
        "es": "Acuerdo marco para proyectos de tatuaje multisesión",
        "nl": "Hoofdovereenkomst voor tatoeageprojecten in meerdere sessies",
        "pt": "Contrato principal para projeto de tatuagem em múltiplas sessões"
    },
    "Comprehensive agreement for back pieces, sleeves, body suits, and multi-session projects covering studio details, multi-day scheduling, physician releases, deposit structures, and continuous health disclosures.": {
        "en": "Comprehensive agreement for back pieces, sleeves, body suits, and multi-session projects covering studio details, multi-day scheduling, physician releases, deposit structures, and continuous health disclosures.",
        "fr": "Contrat complet pour dos complets, manchettes, combinaisons intégrales et projets multi-séances couvrant organisation, avis médical, acomptes et suivi continu de santé.",
        "it": "Accordo completo per schiene, maniche, body suit e progetti a più sedute con dettagli su pianificazione, nulla osta medici, caparre e dichiarazioni sanitarie continuative.",
        "de": "Umfassender Vertrag für Rücken-, Ärmel- und Ganzkörpertattoos sowie Mehrterminprojekte mit Terminplanung, Arztfreigaben, Anzahlungen und fortlaufender Gesundheitsauskunft.",
        "es": "Acuerdo integral para espaldas completas, mangas, trajes de cuerpo y proyectos multisesión que abarca calendario, vistos buenos médicos, depósitos y declaraciones continuas de salud.",
        "nl": "Uitgebreide overeenkomst voor backs, sleeves, body suits en projecten in meerdere sessies met planning, doktersverklaringen, aanbetalingsvoorwaarden en gezondheidsverklaringen.",
        "pt": "Contrato abrangente para fechamentos de costas, braços, body suits e projetos em múltiplas sessões cobrindo agendamento, liberação médica, sinal e declaração contínua de saúde."
    },
    "Medical Assessment & High-Endurance Screening": {
        "en": "Medical Assessment & High-Endurance Screening",
        "fr": "Évaluation médicale et aptitude aux séances longues",
        "it": "Valutazione medica e screening per sedute ad alta resistenza",
        "de": "Medizinische Beurteilung & Belastbarkeitsprüfung für lange Sitzungen",
        "es": "Evaluación médica y examen de resistencia para sesiones largas",
        "nl": "Medische beoordeling en screening voor langdurige sessies",
        "pt": "Avaliação médica e triagem de resistência para sessões prolongadas"
    },
    "Multi-Session Medical Prerequisite": {
        "en": "Multi-Session Medical Prerequisite",
        "fr": "Prérequis médical pour séances multiples",
        "it": "Prerequisito medico per sessioni multiple",
        "de": "Medizinische Voraussetzung für Mehrterminsitzungen",
        "es": "Requisito médico previo para sesiones múltiples",
        "nl": "Medische voorwaarde voor meerdere sessies",
        "pt": "Pré-requisito médico para múltiplas sessões"
    },
    "Extended tattoo sessions place significant physical stress on the circulatory, endocrine, and immune systems. Clients with chronic conditions must be formally cleared by their physician.": {
        "en": "Extended tattoo sessions place significant physical stress on the circulatory, endocrine, and immune systems. Clients with chronic conditions must be formally cleared by their physician.",
        "fr": "Les séances de tatouage prolongées sollicitent fortement les systèmes circulatoire, endocrinien et immunitaire. Les personnes ayant des affections chroniques doivent obligatoirement obtenir l'autorisation de leur médecin.",
        "it": "Le lunghe sessioni di tatuaggio comportano un notevole stress fisico per i sistemi circolatorio, endocrino e immunitario. I clienti con patologie croniche devono avere il nulla osta del proprio medico.",
        "de": "Längere Tattoositzungen stellen eine erhebliche Belastung für Kreislauf, Hormon- und Immunsystem dar. Kunden mit chronischen Vorerkrankungen benötigen eine formelle ärztliche Freigabe.",
        "es": "Las sesiones prolongadas de tatuaje generan una exigencia física importante en los sistemas circulatorio, endocrino e inmune. Los clientes con afecciones crónicas deben contar con autorización médica formal.",
        "nl": "Langdurige tatoeagesessies belasten het cardiovasculaire, endocriene en immuunsysteem aanzienlijk. Klanten met chronische aandoeningen moeten vooraf formeel worden goedgekeurd door hun arts.",
        "pt": "Sessões extensas de tatuagem impõem estresse físico significativo aos sistemas circulatório, endócrino e imunológico. Clientes com condições crônicas devem obter liberação médica formal."
    },
    "PRE-PROCEDURE AFTERCARE: I confirm that the artist has provided comprehensive verbal and written aftercare advice prior to commencing work, and I commit to rigorous healing hygiene between sessions.": {
        "en": "PRE-PROCEDURE AFTERCARE: I confirm that the artist has provided comprehensive verbal and written aftercare advice prior to commencing work, and I commit to rigorous healing hygiene between sessions.",
        "fr": "SOINS PRÉ-PROCÉDURE : Je confirme que l'artiste m'a fourni des conseils complets oraux et écrits de soins avant de débuter, et je m'engage à maintenir une hygiène stricte entre les séances.",
        "it": "CURA POST-PROCEDURA: Confermo che l'artista mi ha fornito istruzioni post-trattamento orali e scritte complete prima di iniziare, e mi impegno a rispettare un'igiene rigorosa tra le sedute.",
        "de": "NACHSORGEAUFKLÄRUNG: Ich bestätige, dass der Tätowierer vor Beginn umfassende mündliche und schriftliche Nachsorgehinweise gegeben hat, und verpflichte mich zu strenger Hygiene zwischen den Terminen.",
        "es": "CUIDADOS PREVIOS: Confirmo que el artista me ha facilitado recomendaciones detalladas verbales y escritas sobre los cuidados antes de comenzar, y me comprometo a mantener una higiene rigurosa entre sesiones.",
        "nl": "VOORAFGAAND NAZORGADVIES: Ik bevestig dat de artiest mij voorafgaand aan het werk uitgebreide mondelinge en schriftelijke nazorginstructies heeft gegeven en verbind mij tot strikte hygiëne tussen de sessies.",
        "pt": "CUIDADOS PRÉVIOS: Confirmo que o tatuador forneceu orientações abrangentes verbais e escritas de cuidados antes de iniciar o trabalho, e me comprometo com rigorosa higiene entre as sessões."
    },
    "Minor Consent & Legal Guardian Authorization Form": {
        "en": "Minor Consent & Legal Guardian Authorization Form",
        "fr": "Formulaire de consentement pour mineur et autorisation du tuteur légal",
        "it": "Modulo di consenso per minorenni e autorizzazione del genitore/tutore legale",
        "de": "Einverständniserklärung für Minderjährige & Genehmigung der Erziehungsberechtigten",
        "es": "Formulario de consentimiento para menores y autorización del tutor legal",
        "nl": "Toestemmingsformulier voor minderjarigen & machtiging wettelijke voogd",
        "pt": "Formulário de consentimento para menores e autorização do responsável legal"
    },
    "Legally required consent form for minor services (earlobes/piercings), requiring legal guardian identification, relationship verification, physician authorization review, capacity of reflection, and dual signatures.": {
        "en": "Legally required consent form for minor services (earlobes/piercings), requiring legal guardian identification, relationship verification, physician authorization review, capacity of reflection, and dual signatures.",
        "fr": "Formulaire légal obligatoire pour actes sur mineurs (lobes/piercings), requérant identification du tuteur, vérification du lien de parenté, contrôle d'avis médical, discernement et double signature.",
        "it": "Modulo legale obbligatorio per prestazioni su minori (lobi/piercing), con identificazione del tutore, verifica della potestà, controllo del nulla osta medico, discernimento e doppia firma.",
        "de": "Rechtlich vorgeschriebene Einwilligung für Minderjährige (Ohrläppchen/Piercings) mit Identitätsnachweis der Erziehungsberechtigten, Sorgerechtsprüfung, Arztfreigabe, Urteilsfähigkeit und doppelter Unterschrift.",
        "es": "Formulario de consentimiento legal obligatorio para menores (lóbulos/piercings), con identificación del tutor legal, acreditación de tutela, autorización médica, discernimiento y doble firma.",
        "nl": "Wettelijk verplicht toestemmingsformulier voor minderjarigen (oorlellen/piercings), met identiteitscontrole van de voogd, verificatie van het gezag, doktersautorisatie, wilsbekwaamheid en dubbele handtekening.",
        "pt": "Formulário de consentimento obrigatório por lei para menores (lóbulos/piercings), exigindo identificação do responsável legal, comprovação de guarda, liberação médica, discernimento e dupla assinatura."
    },
    "CAPACITY OF REFLECTION: I affirm that I am in full capacity of my own reflection and sound judgment, not impaired by any substance, and freely authorize this procedure.": {
        "en": "CAPACITY OF REFLECTION: I affirm that I am in full capacity of my own reflection and sound judgment, not impaired by any substance, and freely authorize this procedure.",
        "fr": "CAPACITÉ DE DISCERNEMENT : J'affirme être en pleine capacité de réflexion et de discernement, libre de toute substance altérante, et autoriser librement cette procédure.",
        "it": "CAPACITÀ DI DISCERNIMENTO: Confermo di essere in piena capacità di riflessione e giudizio, non sotto l'influenza di sostanze, e di autorizzare liberamente questa procedura.",
        "de": "URTEILSFÄHIGKEIT: Ich bestätige, dass ich im Vollbesitz meiner geistigen Kräfte und Urteilsfähigkeit bin, nicht unter Alkoholeinfluss/Drogen stehe und diesem Eingriff frei zustimme.",
        "es": "CAPACIDAD DE REFLEXIÓN: Afirmo que estoy en pleno uso de mis facultades de reflexión y juicio cabal, sin alteración por sustancias, y autorizo libremente este procedimiento.",
        "nl": "WILSBEKWAAMHEID: Ik bevestig dat ik volledig wilsbekwaam ben, niet onder invloed van middelen verkeer en deze behandeling uit vrije wil goedkeur.",
        "pt": "CAPACIDADE DE REFLEXÃO: Afirmo estar em plena capacidade de reflexão e bom senso, sem qualquer alteração por substâncias, e autorizo livremente este procedimento."
    },
    "PRE-PROCEDURE AFTERCARE: I certify that both the minor and I have received thorough verbal and written pre-procedure aftercare instructions adhering to professional body piercing standards, and I will supervise the minor's healing protocol.": {
        "en": "PRE-PROCEDURE AFTERCARE: I certify that both the minor and I have received thorough verbal and written pre-procedure aftercare instructions adhering to professional body piercing standards, and I will supervise the minor's healing protocol.",
        "fr": "SOINS PRÉ-PROCÉDURE : J'atteste que le mineur et moi-même avons reçu des instructions de soins préalables complètes conformes aux normes professionnelles de piercing corporel, et que je superviserai le protocole de cicatrisation.",
        "it": "CURA POST-PROCEDURA: Certifico che sia io che il minore abbiamo ricevuto istruzioni complete verbali e scritte conformi agli standard professionali di body piercing e che supervisionerò la guarigione.",
        "de": "NACHSORGEAUFKLÄRUNG: Ich versichere, dass sowohl der Minderjährige als auch ich ausführliche Nachsorgeanweisungen nach professionellen Bodypiercing-Standards erhalten haben und ich die Wundpflege beaufsichtige.",
        "es": "CUIDADOS PREVIOS: Certifico que tanto el menor como yo hemos recibido instrucciones completas verbales y escritas conformes a los Estándares Profesionales de Piercing, y supervisaré los cuidados de cicatrización.",
        "nl": "VOORAFGAAND NAZORGADVIES: Ik verklaar dat zowel de minderjarige als ik grondige mondelinge en schriftelijke nazorginstructies conform professionele bodypiercing-normen hebben ontvangen en ik toezicht houd op de genezing.",
        "pt": "CUIDADOS PRÉVIOS: Certifico que tanto o menor quanto eu recebemos orientações verbais e escritas completas de acordo com os Padrões Profissionais de Body Piercing, e supervisionarei a cicatrização."
    },
    "Cover-Up & Rework Assessment Form": {
        "en": "Cover-Up & Rework Assessment Form",
        "fr": "Formulaire d'évaluation pour recouvrement (Cover-Up) et retouche",
        "it": "Modulo di valutazione per cover-up (copertura) e rielaborazione tatuaggio",
        "de": "Begutachtungs- & Zustimmungsformular für Cover-Up & Überarbeitung",
        "es": "Formulario de valoración para cobertura (Cover-Up) y retoque",
        "nl": "Beoordelingsformulier voor cover-up en bijwerken van tatoeages",
        "pt": "Formulário de avaliação para cobertura (Cover-Up) e reforma de tatuagem"
    },
    "Specialized consultation form for covering up or reworking existing tattoo work with skin condition disclosures, laser lightening history, physician release, and design flexibility terms.": {
        "en": "Specialized consultation form for covering up or reworking existing tattoo work with skin condition disclosures, laser lightening history, physician release, and design flexibility terms.",
        "fr": "Formulaire de consultation spécialisé pour recouvrir ou retoucher un tatouage existant avec antécédents de peau, historique laser, accord médical et flexibilité artistique.",
        "it": "Modulo di consulenza specialistica per copertura o restauro di tatuaggi esistenti, con stato della pelle, trattamenti laser pregressi, nulla osta medico e flessibilità del disegno.",
        "de": "Spezialisiertes Beratungsformular zur Überdeckung oder Überarbeitung alter Tattoos mit Hautzustandsangaben, Laser-Vorgeschichte, Arztfreigabe und Designflexibilität.",
        "es": "Formulario de consulta especializada para cubrir o retocar tatuajes existentes con estado de la piel, historial de aclarado láser, visto bueno médico y flexibilidad de diseño.",
        "nl": "Gespecialiseerd consultatieformulier voor het coveren of bijwerken van bestaande tatoeages inclusief huidconditie, laserhistorie, doktersgoedkeuring en ontwerpflexibiliteit.",
        "pt": "Formulário de consulta especializada para cobertura ou reforma de tatuagem antiga com histórico da pele, sessões de laser, liberação médica e flexibilidade artística."
    },
    "CAPACITY OF REFLECTION: I declare that I am in full capacity of reflection and sound mind, making this decision freely.": {
        "en": "CAPACITY OF REFLECTION: I declare that I am in full capacity of reflection and sound mind, making this decision freely.",
        "fr": "CAPACITÉ DE DISCERNEMENT : Je déclare être en pleine capacité de réflexion et sain(e) d'esprit, prenant cette décision de mon plein gré.",
        "it": "CAPACITÀ DI DISCERNIMENTO: Dichiaro di essere in piena capacità di riflessione e sano di mente, prendendo questa decisione in totale libertà.",
        "de": "URTEILSFÄHIGKEIT: Ich erkläre, dass ich im Vollbesitz meiner geistigen Kräfte und Urteilsfähigkeit bin und diese Entscheidung frei treffe.",
        "es": "CAPACIDAD DE REFLEXIÓN: Declaro que me encuentro en plena capacidad de reflexión y sano juicio, tomando esta decisión libremente.",
        "nl": "WILSBEKWAAMHEID: Ik verklaar dat ik over mijn volle verstand en oordeelsvermogen beschik en deze beslissing vrijwillig neem.",
        "pt": "CAPACIDADE DE REFLEXÃO: Declaro estar em plena capacidade de reflexão e discernimento lúcido, tomando esta decisão livremente."
    },
    "PRE-PROCEDURE AFTERCARE: I confirm that I have been provided with aftercare instructions prior to the procedure.": {
        "en": "PRE-PROCEDURE AFTERCARE: I confirm that I have been provided with aftercare instructions prior to the procedure.",
        "fr": "SOINS PRÉ-PROCÉDURE : Je confirme avoir reçu des consignes de soins et de cicatrisation avant le début de l'acte.",
        "it": "CURA POST-PROCEDURA: Confermo di aver ricevuto le indicazioni di cura e guarigione prima di effettuare la procedura.",
        "de": "NACHSORGEAUFKLÄRUNG: Ich bestätige, dass mir vor dem Eingriff Nachsorgeanweisungen erteilt wurden.",
        "es": "CUIDADOS PREVIOS: Confirmo que se me han proporcionado instrucciones sobre cuidados y cicatrización antes del procedimiento.",
        "nl": "VOORAFGAAND NAZORGADVIES: Ik bevestig dat ik voorafgaand aan de behandeling nazorginstructies heb ontvangen.",
        "pt": "CUIDADOS PRÉVIOS: Confirmo que recebi instruções sobre cuidados e cicatrização antes da realização do procedimento."
    },
    "PMU & Cosmetic Tattoo Consultation": {
        "en": "PMU & Cosmetic Tattoo Consultation",
        "fr": "Consultation de maquillage permanent (PMU) et dermo-esthétique",
        "it": "Consulenza per trucco permanente (PMU) e dermopigmentazione",
        "de": "PMU & Permanent Make-up Beratungs- und Einverständnisbogen",
        "es": "Consulta de micropigmentación (PMU) y maquillaje permanente",
        "nl": "PMU & Permanente make-up consultatie en toestemming",
        "pt": "Consulta de micropigmentação (PMU) e maquiagem definitiva"
    },
    "Specialized consultation and consent agreement for cosmetic tattooing (microblading, powder brows, lip blushing, permanent eyeliner) including contraindication screening, pigment patch testing, sound mind declaration, and aftercare advice.": {
        "en": "Specialized consultation and consent agreement for cosmetic tattooing (microblading, powder brows, lip blushing, permanent eyeliner) including contraindication screening, pigment patch testing, sound mind declaration, and aftercare advice.",
        "fr": "Contrat de consultation et de consentement pour maquillage permanent (microblading, sourcils poudrés, lip blush, eyeliner) avec dépistage des contre-indications, test pigmentaire, discernement et conseils de soins.",
        "it": "Accordo specialistico di consulenza e consenso per trucco permanente (microblading, powder brows, labbra, eyeliner) con verifica controindicazioni, patch test pigmenti, discernimento e cura post-trattamento.",
        "de": "Spezialisierte Beratung und Einwilligung für Permanent Make-up (Microblading, Powder Brows, Lip Blush, Eyeliner) mit Kontraindikationen-Screening, Pigment-Patch-Test, Urteilsfähigkeit und Nachsorgeaufklärung.",
        "es": "Acuerdo especializado de consulta y consentimiento para micropigmentación (microblading, cejas efecto polvo, lip blush, eyeliner) con evaluación de contraindicaciones, prueba de parche, discernimiento y cuidados.",
        "nl": "Gespecialiseerd intake- en toestemmingsformulier voor permanente make-up (microblading, powder brows, lip blush, eyeliner) inclusief screening van contra-indicaties, patch-test, wilsbekwaamheid en nazorgadvies.",
        "pt": "Termo de consulta e consentimento especializado para micropigmentação (microblading, powder brows, lip blush, delineador) incluindo contraindicações, teste de contato com pigmento, discernimento e cuidados."
    },
    "PRE-PROCEDURE AFTERCARE ADVICE: I confirm that I have been provided with comprehensive verbal and written aftercare instructions (dry/wet healing protocol, sun avoidance, touch-up schedule) prior to procedure.": {
        "en": "PRE-PROCEDURE AFTERCARE ADVICE: I confirm that I have been provided with comprehensive verbal and written aftercare instructions (dry/wet healing protocol, sun avoidance, touch-up schedule) prior to procedure.",
        "fr": "CONSEILS DE SOINS PRÉ-PROCÉDURE : Je confirme avoir reçu des instructions de soins verbales et écrites complètes (protocole de cicatrisation, protection solaire, retouche) avant l'acte.",
        "it": "INFORMATIVA CURA POST-TRATTAMENTO: Confermo di aver ricevuto istruzioni post-trattamento dettagliate verbali e scritte (protocollo di guarigione, protezione solare, ritocco) prima della procedura.",
        "de": "NACHSORGEAUFKLÄRUNG VOR DEM EINGRIFF: Ich bestätige, dass ich vor dem Eingriff ausführliche mündliche und schriftliche Nachsorgehinweise (Wundpflege, Sonnenschutz, Nachstechtermin) erhalten habe.",
        "es": "CONSEJOS DE CUIDADOS PREVIOS: Confirmo que antes del procedimiento he recibido instrucciones completas verbales y escritas sobre cuidados (protocolo de curación, protección solar, cita de retoque).",
        "nl": "VOORAFGAAND NAZORGADVIES: Ik bevestig dat ik voorafgaand aan de behandeling uitgebreide mondelinge en schriftelijke nazorginstructies heb ontvangen (genezingsprotocol, zonvermijding, nabehandeling).",
        "pt": "INSTRUÇÕES DE CUIDADOS PRÉVIOS: Confirmo que, antes do procedimento, recebi instruções detalhadas verbais e escritas sobre cuidados (protocolo de cicatrização, proteção solar, cronograma de retoque)."
    },
    "Blank Custom Form": {
        "en": "Blank Custom Form",
        "fr": "Formulaire vierge personnalisé",
        "it": "Modulo personalizzato vuoto",
        "de": "Leeres individuelles Formular",
        "es": "Formulario en blanco personalizado",
        "nl": "Leeg aangepast formulier",
        "pt": "Formulário em branco personalizado"
    },
    "Start from scratch to build custom forms for your studio.": {
        "en": "Start from scratch to build custom forms for your studio.",
        "fr": "Partez de zéro pour concevoir des formulaires sur mesure pour votre studio.",
        "it": "Inizia da zero per creare moduli su misura per il tuo studio.",
        "de": "Beginnen Sie von Grund auf und erstellen Sie individuelle Formulare für Ihr Studio.",
        "es": "Empiece desde cero para diseñar formularios personalizados para su estudio.",
        "nl": "Begin vanaf nul en maak formulieren op maat voor uw studio.",
        "pt": "Comece do zero para criar formulários personalizados para o seu estúdio."
    }
};

    class FormTranslator {
        /**
         * Find translation in dictionary or fallback to original
         */
        static translateText(text, targetLang = 'en') {
            if (!text || typeof text !== 'string') return text;
            const trimmed = text.trim();
            if (!trimmed) return text;

            // Direct key match
            if (TRANSLATION_DICTIONARY[trimmed] && TRANSLATION_DICTIONARY[trimmed][targetLang]) {
                return TRANSLATION_DICTIONARY[trimmed][targetLang];
            }

            // Direct key match on raw
            if (TRANSLATION_DICTIONARY[text] && TRANSLATION_DICTIONARY[text][targetLang]) {
                return TRANSLATION_DICTIONARY[text][targetLang];
            }

            // Reverse lookup: check if this text matches any language version in dictionary
            for (const key in TRANSLATION_DICTIONARY) {
                const entry = TRANSLATION_DICTIONARY[key];
                for (const langCode in entry) {
                    if (entry[langCode] && entry[langCode].toLowerCase() === trimmed.toLowerCase()) {
                        if (entry[targetLang]) {
                            return entry[targetLang];
                        }
                    }
                }
            }

            return text;
        }

        /**
         * Recursively translate a field definition object
         */
        static translateField(field, targetLang) {
            if (!field) return;

            // Translate Label
            if (field.label) {
                field.label = this.translateText(field.label, targetLang);
            }

            // Translate Placeholder
            if (field.placeholder) {
                field.placeholder = this.translateText(field.placeholder, targetLang);
            }

            // Translate Help Text
            if (field.helpText) {
                field.helpText = this.translateText(field.helpText, targetLang);
            }

            // Translate Options if present
            if (Array.isArray(field.options)) {
                field.options = field.options.map(opt => this.translateText(opt, targetLang));
            }

            // Translate Nested Child Fields if Container
            if ((field.type === 'container' || field.type === 'section_group') && Array.isArray(field.fields)) {
                field.fields.forEach(child => this.translateField(child, targetLang));
            }
        }

        /**
         * Translates entire form schema object (name, description, sections, fields, containers)
         * Persists translations directly onto the currentForm object!
         */
        static translateForm(form, targetLang = 'en') {
            if (!form || typeof form !== 'object') return form;

            // Translate Form Name & Description
            if (form.name) {
                form.name = this.translateText(form.name, targetLang);
            }
            if (form.description) {
                form.description = this.translateText(form.description, targetLang);
            }

            // Set current form language tag
            form.language = targetLang;

            // Translate Sections
            if (Array.isArray(form.sections)) {
                form.sections.forEach(section => {
                    if (section.title) {
                        section.title = this.translateText(section.title, targetLang);
                    }
                    if (Array.isArray(section.fields)) {
                        section.fields.forEach(field => {
                            this.translateField(field, targetLang);
                        });
                    }
                });
            }

            return form;
        }
    }

    // Expose globally
    if (typeof window !== 'undefined') {
        window.FormTranslator = FormTranslator;
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { FormTranslator, TRANSLATION_DICTIONARY };
    }
})();
