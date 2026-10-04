// Génère devpost/NOVA360_presentation.pptx (pptxgenjs).
// Usage : NODE_PATH=<dossier contenant pptxgenjs, react-icons, react, react-dom, sharp> node devpost/presentation/build-deck.cjs
const path = require("path");
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");

const OUT = path.join(__dirname, "..", "NOVA360_presentation.pptx");
const APPLY_THEME = process.env.APPLY_THEME_JS;

// Palette tirée de l'application : bleu nuit (base), ambre (surlignage des preuves), vert (validé), rouge (risque), violet (mise à jour)
const THEME = {
  name: "NOVA 360",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "1B2A41", lt1: "FFFFFF", dk2: "4A5568", lt2: "EEF2F7",
    accent1: "E8A33D", accent2: "2E7D5B", accent3: "C0453A", accent4: "3B6EA8", accent5: "7A5BA6", accent6: "8A94A6",
    hlink: "3B6EA8", folHlink: "7A5BA6",
  },
};
const HEX = THEME.colors;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 × 7.5 in
pres.title = "NOVA 360 — mémoire opérationnelle du projet NOVA";
pres.subject = "Défi Loto-Québec — Projet 360 / NOVA";
pres.author = "Équipe NOVA 360";
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
const C = pres.SchemeColor;
const W = 13.333;

// ───────── Mises en page (layouts) ─────────
pres.defineSlideMaster({
  title: "TITRE",
  background: { color: C.text1 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.8, y: 2.0, w: 11.7, h: 1.5, fontSize: 54, bold: true, color: C.background1, fontFace: THEME.headFontFace, valign: "bottom", align: "left", margin: 0 }, text: "" } },
    { placeholder: { options: { name: "body", type: "body", x: 0.8, y: 3.7, w: 11.7, h: 1.6, fontSize: 22, color: C.background2, valign: "top", margin: 0 }, text: "" } },
  ],
});
pres.defineSlideMaster({
  title: "INTERCALAIRE",
  background: { color: C.text1 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.8, y: 1.6, w: 11.7, h: 1.3, fontSize: 44, bold: true, color: C.background1, fontFace: THEME.headFontFace, valign: "bottom", align: "left", margin: 0 }, text: "" } },
    { placeholder: { options: { name: "body", type: "body", x: 0.8, y: 3.1, w: 11.7, h: 3.2, fontSize: 18, color: C.background2, valign: "top", margin: 0 }, text: "" } },
  ],
});
pres.defineSlideMaster({
  title: "CONTENU",
  background: { color: C.background1 },
  margin: [0.5, 0.6, 0.6, 0.6],
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 0.35, w: 12.1, h: 0.9, fontSize: 36, bold: true, color: C.text1, fontFace: THEME.headFontFace, valign: "middle", align: "left", margin: 0 }, text: "" } },
    { text: { text: "NOVA 360 · Défi Loto-Québec — Projet 360", options: { x: 0.6, y: 7.0, w: 8, h: 0.3, fontSize: 10, color: C.accent6, margin: 0 } } },
  ],
  slideNumber: { x: 12.2, y: 7.0, w: 0.5, h: 0.3, fontSize: 10, color: C.accent6, align: "right" },
});

// ───────── Typographie française ─────────
const NB = "\u00A0"; // espace insécable
const NBH = "\u2011"; // trait d'union insécable
const fr = (t) =>
  t
    .replace(/« /g, "«" + NB)
    .replace(/ »/g, NB + "»")
    .replace(/ ([:;?!])/g, NB + "$1")
    .replace(/(\d) (?=[\dA-Za-zÀ-ÿ$%])/g, "$1" + NB) // « 22 octobre », « 180 000 $ »
    .replace(/\b([A-Z]{2,4})-(\d)/g, "$1" + NBH + "$2"); // identifiants : SEC-210, CR-04, INV-003
const frAll = (text) => (typeof text === "string" ? fr(text) : Array.isArray(text) ? text.map((r) => (typeof r === "string" ? fr(r) : { ...r, text: fr(r.text) })) : text);
/** Diapositive dont chaque texte (zones, tableaux) reçoit la typographie française. */
function newSlide(opts) {
  const slide = pres.addSlide(opts);
  const addText = slide.addText.bind(slide);
  slide.addText = (text, o) => addText(frAll(text), o);
  const addTable = slide.addTable.bind(slide);
  slide.addTable = (rows, o) => addTable(rows.map((row) => row.map((c) => (typeof c === "string" ? fr(c) : { ...c, text: fr(c.text) }))), o);
  return slide;
}

// ───────── Aides graphiques ─────────
async function icon(Comp, hex = "FFFFFF") {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Comp, { color: `#${hex}`, size: 256 }));
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + png.toString("base64");
}
/** Pictogramme blanc dans un disque de couleur (motif récurrent du deck). */
async function iconDisc(slide, Comp, x, y, d, color, name) {
  slide.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color }, line: { color, width: 0 }, objectName: `${name}-disque` });
  const pad = d * 0.24;
  slide.addImage({ data: await icon(Comp), x: x + pad, y: y + pad, w: d - 2 * pad, h: d - 2 * pad, objectName: `${name}-icone` });
}
/** Étiquette de preuve, comme dans l'application : « M04 · L17-L23 ». */
function chip(slide, label, x, y, w, name, fill = C.background2) {
  slide.addText(label, {
    shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.08, x, y, w, h: 0.32,
    fill: { color: fill }, line: { color: fill, width: 0 },
    fontSize: 11, bold: true, color: C.accent4, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: name,
  });
}
function card(slide, x, y, w, h, name, fill = C.background2) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, rectRadius: 0.12, fill: { color: fill }, line: { color: fill, width: 0 },
    shadow: { type: "outer", color: HEX.dk1, opacity: 0.12, blur: 6, offset: 2, angle: 90 }, objectName: name,
  });
}
const T = (slide, text, opts) => slide.addText(text, { isTextBox: true, margin: 0, valign: "top", ...opts });

async function build() {
  // 1 ─ Titre
  pres.addSection({ title: "Ouverture" });
  let s = newSlide({ masterName: "TITRE", sectionTitle: "Ouverture" });
  s.addText("NOVA 360", { placeholder: "title" });
  s.addText("Une mémoire de projet sur laquelle une équipe peut réellement s'appuyer", { placeholder: "body" });
  T(s, "Défi Loto-Québec · Projet 360 / NOVA", { x: 0.8, y: 6.3, w: 8, h: 0.4, fontSize: 16, color: C.accent1, bold: true, objectName: "defi" });
  await iconDisc(s, fa.FaProjectDiagram, 11.2, 5.75, 1.3, C.accent1, "logo");
  s.addNotes("Pitch : reprendre un projet sans se fier à la mauvaise info. NOVA 360 relie chaque réponse à sa preuve, tranche les contradictions et intègre les nouveautés sans effacer l'historique.");

  // 2 ─ Le problème
  pres.addSection({ title: "Le problème" });
  s = newSlide({ masterName: "CONTENU", sectionTitle: "Le problème" });
  s.addText("64 fichiers, plusieurs versions de la vérité", { placeholder: "title" });
  const pb = [
    { ic: fa.FaCalendarTimes, h: "La date", a: "Le plan v3 (12 sept.) dit : 15 octobre", b: "Le comité (10 sept.) a décidé : 22 octobre", c: ["Plan v3 · E7", "M04 · L17-L23"] },
    { ic: fa.FaShieldAlt, h: "La sécurité", a: "Le rapport de statut dit : « VERT »", b: "Le correctif est livré, pas accepté", c: ["Rapport · p.1", "SEC-210 · L23-L25"] },
    { ic: fa.FaFileInvoiceDollar, h: "La facture", a: "INV-003 facture 18 000 $ pour CR-04", b: "CR-04 n'est qu'un brouillon non approuvé", c: ["INV-003 · p.1", "CR-04 · p.1"] },
  ];
  for (const [i, p] of pb.entries()) {
    const x = 0.6 + i * 4.15;
    card(s, x, 1.55, 3.85, 4.35, `carte-${i}`);
    await iconDisc(s, p.ic, x + 0.35, 1.85, 0.75, C.accent3, `pb-${i}`);
    T(s, p.h, { x: x + 1.3, y: 1.95, w: 2.3, h: 0.55, fontSize: 22, bold: true, color: C.text1, fontFace: THEME.headFontFace, valign: "middle" });
    T(s, p.a, { x: x + 0.35, y: 2.95, w: 3.15, h: 0.85, fontSize: 15, italic: true, color: C.text2 });
    T(s, p.b, { x: x + 0.35, y: 3.85, w: 3.15, h: 0.9, fontSize: 16, bold: true, color: C.text1 });
    chip(s, p.c[0], x + 0.35, 5.2, 1.5, `pb-${i}-preuve-1`, C.background1);
    chip(s, p.c[1], x + 1.95, 5.2, 1.55, `pb-${i}-preuve-2`, C.background1);
  }
  T(s, "Le vrai risque n'est pas le manque d'information : c'est de se fier à la mauvaise.", { x: 0.6, y: 6.2, w: 12.1, h: 0.5, fontSize: 18, italic: true, color: C.accent3, valign: "middle", objectName: "accroche" });
  s.addNotes("Trois exemples réels du corpus. Une date de fichier récente ne garantit pas l'exactitude ; un correctif livré n'est pas validé ; une demande de changement en brouillon n'autorise aucune dépense.");

  // 3 ─ L'approche
  pres.addSection({ title: "Notre solution" });
  s = newSlide({ masterName: "CONTENU", sectionTitle: "Notre solution" });
  s.addText("Une approche « preuve d'abord »", { placeholder: "title" });
  const steps = [
    { n: "1", h: "Extraire", d: "64 fichiers : courriels et pièces jointes, PDF par page, Excel par cellule, captures transcrites" },
    { n: "2", h: "Structurer", d: "35 événements, 7 décisions, 8 contradictions, 13 actions, 4 risques" },
    { n: "3", h: "Vérifier", d: "278 citations contrôlées automatiquement contre le corpus ; 44 tests" },
    { n: "4", h: "Servir", d: "Brief d'une page, Q01–Q10, chronologie, dossier de décisions, chat cité" },
  ];
  for (const [i, st] of steps.entries()) {
    const x = 0.6 + i * 3.15;
    card(s, x, 1.65, 2.75, 3.9, `etape-${i}`);
    s.addText(st.n, { shape: pres.shapes.OVAL, x: x + 0.3, y: 1.95, w: 0.75, h: 0.75, fill: { color: C.accent1 }, line: { color: C.accent1, width: 0 }, fontSize: 24, bold: true, color: C.text1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: `etape-${i}-num` });
    T(s, st.h, { x: x + 0.3, y: 2.95, w: 2.2, h: 0.55, fontSize: 22, bold: true, color: C.text1, fontFace: THEME.headFontFace });
    T(s, st.d, { x: x + 0.3, y: 3.55, w: 2.2, h: 1.9, fontSize: 15, color: C.text2 });
    if (i < 3) s.addShape(pres.shapes.CHEVRON, { x: x + 2.82, y: 3.4, w: 0.26, h: 0.45, fill: { color: C.accent6 }, line: { color: C.accent6, width: 0 }, objectName: `fleche-${i}` });
  }
  T(s, "Chaque affirmation pointe vers un fichier et un repère : ligne, page, cellule ou capture.", { x: 0.6, y: 5.95, w: 12.1, h: 0.5, fontSize: 18, italic: true, color: C.accent4, valign: "middle", objectName: "principe" });
  s.addNotes("La machine vérifie que chaque preuve existe ; l'équipe vérifie le fond. Le corpus tient dans le contexte du modèle : pas de base vectorielle, rien n'est oublié.");

  // 4 ─ Ce qu'un repreneur doit savoir
  s = newSlide({ masterName: "CONTENU", sectionTitle: "Notre solution" });
  s.addText("Ce qu'il faut savoir pour reprendre NOVA demain", { placeholder: "title" });
  const stats = [
    { v: "22 oct.", c: C.accent4, l: "Date approuvée par le comité le 10 sept., mais pas un go garanti", p: "M04 · L17-L23" },
    { v: "3", c: C.accent3, l: "Conditions de go-live encore ouvertes : SEC-210, ACC-303, runbook", p: "M06 · L11-L16" },
    { v: "204 k$", c: C.accent2, l: "Autorisés : 180 000 $ du contrat + 24 000 $ de CR-01 approuvé", p: "CR-01 · p.1" },
    { v: "18 k$", c: C.accent3, l: "Facturés sans autorisation sur INV-003 (CR-04, brouillon)", p: "INV-003 · p.1" },
  ];
  for (const [i, st] of stats.entries()) {
    const x = 0.6 + i * 3.15;
    T(s, st.v, { x, y: 1.8, w: 2.85, h: 1.2, fontSize: 54, bold: true, color: st.c, fontFace: THEME.headFontFace, valign: "bottom" });
    T(s, st.l, { x, y: 3.2, w: 2.75, h: 1.5, fontSize: 16, color: C.text1 });
    chip(s, st.p, x, 4.85, 1.75, `stat-${i}-preuve`);
  }
  card(s, 0.6, 5.6, 12.1, 0.95, "responsable", C.background2);
  await iconDisc(s, fa.FaUserTie, 0.85, 5.73, 0.7, C.accent4, "resp");
  T(s, "Responsable : Nicolas Perron, chargé de projet depuis le 16 septembre 2026 (Élodie Caron avant lui).", { x: 1.75, y: 5.6, w: 9.0, h: 0.95, fontSize: 16, color: C.text1, valign: "middle" });
  chip(s, "E06 · L3", 10.95, 5.91, 1.5, "resp-preuve", C.background1);
  s.addNotes("Ce sont les réponses Q01, Q04, Q05, Q06 et Q10, chacune sourcée. Montrer ensuite le brief d'une page dans l'application.");

  // 5 ─ Conditions de go-live → actions
  s = newSlide({ masterName: "CONTENU", sectionTitle: "Notre solution" });
  s.addText("Les trois conditions de go-live, reliées à des actions", { placeholder: "title" });
  const hdr = (t) => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.text1 }, fontSize: 15 } });
  const rows = [
    [hdr("Condition"), hdr("Statut au 30 sept."), hdr("Responsable"), hdr("Échéance")],
    ["Validation sécurité de SEC-210", "Correctif livré le 19 sept. : EN VALIDATION, non accepté", "Sophie Lambert", "À confirmer (re-test planifié, sans date)"],
    ["Fermeture d'ACC-303", "OUVERT : Tab n'atteint pas « Enregistrer » dans la modale", "Boréal, puis Mélissa Gagnon", "À confirmer (« prochaine build »)"],
    ["Approbation du runbook", "Étape 4 retour arrière TODO, étape 5 « À compléter »", "Boréal ops, puis Olivier Côté", "À confirmer (« quelques jours avant »)"],
  ];
  s.addTable(rows, {
    x: 0.6, y: 1.6, w: 12.1, colW: [2.6, 4.2, 2.4, 2.9], fontSize: 15, color: C.text1, valign: "middle",
    border: { type: "solid", pt: 0.75, color: HEX.lt2 }, fill: { color: C.background1 }, rowH: [0.55, 0.95, 0.95, 0.95], margin: 0.1, objectName: "tableau-conditions",
  });
  await iconDisc(s, fa.FaExclamationTriangle, 0.6, 5.55, 0.65, C.accent1, "attention");
  T(s, "Aucune échéance n'est documentée : nous écrivons « à confirmer » plutôt que d'en inventer une.", { x: 1.45, y: 5.55, w: 11.2, h: 0.65, fontSize: 17, italic: true, color: C.text1, valign: "middle", objectName: "pas-d-invention" });
  s.addNotes("Source : comité du 26 sept. (M06 L11-L16), runbook OPS-601 (capture), SEC-210 L25, ACC-303 L16. Les recommandations de notre équipe sont toujours distinguées des engagements documentés.");

  // 6 ─ Contradictions
  s = newSlide({ masterName: "CONTENU", sectionTitle: "Notre solution" });
  s.addText("Les contradictions sont tranchées, pas cachées", { placeholder: "title" });
  const ctr = [
    { old: "Plan v3 (12 sept.) : mise en production le 15 oct.", keep: "Comité de direction (10 sept.) : 22 oct.", basis: "Autorité + date" },
    { old: "Registre du 29 sept. : connecteur « Ouvert »", keep: "INT-101 fermé le 17 sept. (120/120)", basis: "Date des faits" },
    { old: "Rapport de statut : sécurité et accessibilité « VERT »", keep: "SEC-210 en validation, ACC-303 ouvert", basis: "Autorité" },
  ];
  for (const [i, c] of ctr.entries()) {
    const y = 1.6 + i * 1.5;
    card(s, 0.6, y, 4.9, 1.2, `perime-${i}`, "FBE9E7");
    await iconDisc(s, fa.FaTimes, 0.8, y + 0.3, 0.6, C.accent3, `perime-${i}`);
    T(s, c.old, { x: 1.55, y, w: 3.8, h: 1.2, fontSize: 15, color: C.text1, valign: "middle" });
    s.addShape(pres.shapes.RIGHT_ARROW, { x: 5.7, y: y + 0.38, w: 0.6, h: 0.45, fill: { color: C.accent6 }, line: { color: C.accent6, width: 0 }, objectName: `fleche-ctr-${i}` });
    card(s, 6.5, y, 4.3, 1.2, `retenu-${i}`, "E6F2EC");
    await iconDisc(s, fa.FaCheck, 6.7, y + 0.3, 0.6, C.accent2, `retenu-${i}`);
    T(s, c.keep, { x: 7.45, y, w: 3.25, h: 1.2, fontSize: 15, bold: true, color: C.text1, valign: "middle" });
    s.addText(c.basis, { shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.1, x: 11.0, y: y + 0.36, w: 1.7, h: 0.48, fill: { color: C.accent1 }, line: { color: C.accent1, width: 0 }, fontSize: 13, bold: true, color: C.text1, align: "center", valign: "middle", margin: 0, isTextBox: true, objectName: `base-${i}` });
  }
  T(s, "8 contradictions résolues au total, chacune avec ses preuves. Jamais par la date du fichier.", { x: 0.6, y: 6.15, w: 12.1, h: 0.5, fontSize: 17, italic: true, color: C.accent4, valign: "middle", objectName: "total-contradictions" });
  s.addNotes("Exemple clé (C-02) : le registre est daté du 29, mais sa ligne date du 9 septembre ; le ticket INT-101 a été fermé le 17. Démo : page Contradictions.");

  // 7 ─ Démo
  pres.addSection({ title: "Démonstration" });
  s = newSlide({ masterName: "INTERCALAIRE", sectionTitle: "Démonstration" });
  s.addText("Démonstration en direct", { placeholder: "title" });
  s.addText(
    [
      { text: "Brief d'une page, avec ses preuves", options: { bullet: true, breakLine: true } },
      { text: "Q10 : un clic vers la capture du runbook", options: { bullet: true, breakLine: true } },
      { text: "Contradiction C-02 et chronologie « livré ≠ validé »", options: { bullet: true, breakLine: true } },
      { text: "Chat : « Qui a approuvé CR-04 ? »", options: { bullet: true, breakLine: true } },
      { text: "La nouvelle information, intégrée devant vous", options: { bullet: true } },
    ],
    { placeholder: "body", paraSpaceAfter: 8 },
  );
  T(s, "louisbarbonet.github.io/NOVA360", { x: 0.8, y: 6.4, w: 8, h: 0.4, fontSize: 16, bold: true, color: C.accent1, objectName: "url-demo" });
  s.addNotes("Pilote au clavier, narrateur à l'oral. Viser environ 2 min 30 de parcours, puis 2 min pour la nouvelle information.");

  // 8 ─ Nouvelle information
  pres.addSection({ title: "Nouvelle information" });
  s = newSlide({ masterName: "CONTENU", sectionTitle: "Nouvelle information" });
  s.addText("Intégrer une nouvelle information", { placeholder: "title" });
  const flow = [
    { ic: fa.FaUpload, h: "Téléverser", d: "Tout format : courriel, PDF, Excel, capture" },
    { ic: fa.FaFileAlt, h: "Extraire", d: "Pièces jointes citables ; captures transcrites « à relire »" },
    { ic: fa.FaRobot, h: "Brouillon", d: "Le LLM rédige changements, impacts, actions, brief révisé" },
    { ic: fa.FaFilter, h: "Garde-fous", d: "Retire tout changement qui ne cite pas la nouvelle source" },
    { ic: fa.FaUserCheck, h: "Relecture", d: "Aucune approbation inventée, aucune condition fermée sans preuve" },
    { ic: fa.FaLayerGroup, h: "Version U1", d: "Avant / après comparables ; le baseline reste intact" },
  ];
  for (const [i, f] of flow.entries()) {
    const x = 0.6 + i * 2.06;
    await iconDisc(s, f.ic, x + 0.55, 1.65, 0.8, i === 5 ? C.accent5 : C.accent4, `flux-${i}`);
    T(s, f.h, { x, y: 2.6, w: 1.9, h: 0.45, fontSize: 18, bold: true, color: C.text1, align: "center", fontFace: THEME.headFontFace });
    T(s, f.d, { x, y: 3.1, w: 1.9, h: 1.4, fontSize: 14, color: C.text2, align: "center" });
    if (i < 5) s.addShape(pres.shapes.CHEVRON, { x: x + 1.83, y: 1.9, w: 0.2, h: 0.32, fill: { color: C.accent6 }, line: { color: C.accent6, width: 0 }, objectName: `fleche-flux-${i}` });
  }
  card(s, 0.6, 4.85, 12.1, 1.55, "repetition", "F1ECF8");
  await iconDisc(s, fa.FaClipboardCheck, 0.85, 5.25, 0.75, C.accent5, "rep");
  T(s, [
    { text: "Répétition réelle : ", options: { bold: true } },
    { text: "un courriel avec une capture et un PDF en pièces jointes annonce le runbook final « reçu, pas encore approuvé ». Résultat : GL-3 reste ouverte, sécurité et accessibilité inchangées, brief révisé sur une page, 75 citations valides." },
  ], { x: 1.85, y: 4.85, w: 10.65, h: 1.55, fontSize: 16, color: C.text1, valign: "middle", objectName: "repetition-texte" });
  s.addNotes("Le plan B existe : si l'IA est indisponible, les sources restent ingérées et le brouillon est rempli à la main. Après la démo, les résultats U1 sont poussés dans le dépôt (RESULTATS.md).");

  // 9 ─ Fiabilité
  pres.addSection({ title: "Fiabilité et limites" });
  s = newSlide({ masterName: "CONTENU", sectionTitle: "Fiabilité et limites" });
  s.addText("Trois barrières contre l'erreur", { placeholder: "title" });
  const bar = [
    { ic: fa.FaCheckDouble, h: "Validation automatique", d: "Chaque citation doit exister dans le corpus. Dans le chat, un repère introuvable s'affiche en rouge.", v: "278", l: "citations vérifiées" },
    { ic: fa.FaShieldAlt, h: "Garde-fous déterministes", d: "Un changement doit citer la nouvelle source ; ce qui est déclaré « inchangé » ne peut pas changer.", v: "44", l: "tests automatisés" },
    { ic: fa.FaUserCheck, h: "Relecture humaine", d: "Réponses, mémoire et 12 réponses de chat pré-enregistrées relues par l'équipe.", v: "3", l: "repères inventés par le LLM, détectés et corrigés" },
  ];
  for (const [i, b] of bar.entries()) {
    const x = 0.6 + i * 4.15;
    card(s, x, 1.6, 3.85, 4.9, `barriere-${i}`);
    await iconDisc(s, b.ic, x + 0.35, 1.9, 0.8, C.accent2, `barriere-${i}`);
    T(s, b.h, { x: x + 0.35, y: 2.9, w: 3.2, h: 0.5, fontSize: 19, bold: true, color: C.text1, fontFace: THEME.headFontFace });
    T(s, b.d, { x: x + 0.35, y: 3.45, w: 3.2, h: 1.45, fontSize: 15, color: C.text2 });
    T(s, b.v, { x: x + 0.35, y: 4.95, w: 1.15, h: 0.85, fontSize: 40, bold: true, color: C.accent2, fontFace: THEME.headFontFace, valign: "middle" });
    T(s, b.l, { x: x + 1.5, y: 4.95, w: 2.1, h: 0.85, fontSize: 14, color: C.text1, valign: "middle" });
  }
  s.addNotes("L'IA lit, relie et rédige ; la machine vérifie l'existence des preuves ; l'équipe vérifie le fond. Outils : Claude Code (rédaction et développement), Gemini (chat de démo), documentés dans le mode d'emploi.");

  // 10 ─ Limites
  s = newSlide({ masterName: "CONTENU", sectionTitle: "Fiabilité et limites" });
  s.addText("Ce que nous ne savons pas, et le disons", { placeholder: "title" });
  const lim = [
    { ic: fa.FaCalendarAlt, t: "Échéances non documentées : re-test SEC-210, build ACC-303, runbook final" },
    { ic: fa.FaFileInvoice, t: "Acceptation du jalon 3 d'INV-003 (36 000 $) non prouvée" },
    { ic: fa.FaServer, t: "Migration Canada Central prouvée par un compte rendu, pas par une preuve technique" },
    { ic: fa.FaGavel, t: "Aucune instance go/no-go planifiée ; contrat jusqu'au 31 oct. (9 jours de marge)" },
    { ic: fa.FaCommentDots, t: "Le chat peut se tromper : les réponses relues font foi" },
    { ic: fa.FaTachometerAlt, t: "Quota gratuit de Gemini limité : bascule entre modèles et plan B manuel" },
  ];
  for (const [i, l] of lim.entries()) {
    const x = 0.6 + (i % 2) * 6.15;
    const y = 1.65 + Math.floor(i / 2) * 1.55;
    card(s, x, y, 5.95, 1.3, `limite-${i}`);
    await iconDisc(s, l.ic, x + 0.3, y + 0.3, 0.7, C.accent1, `limite-${i}`);
    T(s, l.t, { x: x + 1.25, y, w: 4.5, h: 1.3, fontSize: 16, color: C.text1, valign: "middle" });
  }
  s.addNotes("Le dire nous-mêmes avant que le jury le demande. Règle : ne jamais inventer ; dire « non documenté » et proposer l'action qui obtiendrait l'information.");

  // 11 ─ Accès
  pres.addSection({ title: "Conclusion" });
  s = newSlide({ masterName: "CONTENU", sectionTitle: "Conclusion" });
  s.addText("À consulter sans installer ni payer quoi que ce soit", { placeholder: "title" });
  const acc = [
    { ic: fa.FaGlobe, h: "Application en ligne", u: "louisbarbonet.github.io/NOVA360", d: "Brief, Q01–Q10, preuves, recherche et chat (clé API gardée secrète par un relais)" },
    { ic: fa.FaGithub, h: "Résultats dans le dépôt", u: "github.com/LouisBarbonet/NOVA360 → RESULTATS.md", d: "Tous les livrables lisibles sans exécuter de code, par version" },
    { ic: fa.FaFileArchive, h: "Export hors ligne", u: "NOVA360_remise.zip → dist/index.html", d: "S'ouvre sans serveur ni connexion" },
  ];
  for (const [i, a] of acc.entries()) {
    const x = 0.6 + i * 4.15;
    card(s, x, 1.65, 3.85, 4.2, `acces-${i}`);
    await iconDisc(s, a.ic, x + 0.35, 1.95, 0.85, C.accent4, `acces-${i}`);
    T(s, a.h, { x: x + 0.35, y: 3.0, w: 3.2, h: 0.5, fontSize: 20, bold: true, color: C.text1, fontFace: THEME.headFontFace });
    T(s, a.u, { x: x + 0.35, y: 3.55, w: 3.2, h: 0.8, fontSize: 14, bold: true, color: C.accent4 });
    T(s, a.d, { x: x + 0.35, y: 4.4, w: 3.2, h: 1.3, fontSize: 15, color: C.text2 });
  }
  T(s, "Stack : TypeScript · Vite · GitHub Pages · Cloudflare Workers · Gemini / Claude · 44 tests", { x: 0.6, y: 6.2, w: 12.1, h: 0.45, fontSize: 14, color: C.accent6, valign: "middle", objectName: "stack" });
  s.addNotes("Conformément à la consigne de Loto-Québec, les résultats finaux sont dans le dépôt GitHub, consultables sans exécuter le code.");

  // 12 ─ Conclusion
  s = newSlide({ masterName: "INTERCALAIRE", sectionTitle: "Conclusion" });
  s.addText("Une réponse = une preuve", { placeholder: "title" });
  s.addText(
    [
      { text: "Reprendre un projet sans se fier à la mauvaise info : NOVA 360 relie chaque réponse à sa preuve, tranche les contradictions et intègre les nouveautés sans effacer l'historique.", options: { italic: true, breakLine: true } },
      { text: " ", options: { breakLine: true } },
      { text: "Et ensuite : ingestion continue des courriels et tickets, alertes sur les échéances « à confirmer », comparaison de plusieurs projets.", options: { fontSize: 16, color: C.accent1 } },
    ],
    { placeholder: "body" },
  );
  await iconDisc(s, fa.FaProjectDiagram, 11.2, 5.75, 1.3, C.accent1, "logo-fin");
  s.addNotes("Terminer sur le pitch, puis ouvrir aux questions (aide-mémoire de la passe 3).");

  await pres.writeFile({ fileName: OUT });
  if (APPLY_THEME) await require(APPLY_THEME).applyTheme(OUT, THEME);
  console.log("✓", OUT);
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});
