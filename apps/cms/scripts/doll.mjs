// Creador de muñecos: tipos de pieza de fábrica, la página del creador y piezas de prueba.
// Las piezas reales las sube Daniela desde el panel (Creador de muñecos → Piezas).

export const PAGE_SLUG = "disena-tu-muneco";

export const partTypes = [
  ["Cuerpo", 10, true, false],
  ["Ropa", 20, false, false],
  ["Zapatos", 30, false, false],
  ["Boca", 40, false, false],
  ["Ojos", 50, true, false],
  ["Cejas", 60, false, false],
  ["Cabello", 70, false, false],
  ["Accesorios", 80, false, true],
].map(([name, layer, required, multiple], i) => ({ status: "published", sort: i + 1, name, layer, required, multiple }));

export const builderBlock = {
  mode: "creador",
  show_heading: true,
  eyebrow: "Diseña tu muñeco",
  title: "Arma tu muñeco pieza por pieza",
  subtitle: "Elige el cuerpo, la cara, el cabello, la ropa y los accesorios. Lo vemos juntos antes de coserlo.",
  canvas_width: 1000,
  canvas_height: 1400,
  canvas_background: null,
  step1_title: "01 · Elige sus piezas",
  step2_title: "02 · Ponle nombre e historia",
  step3_title: "03 · Un regalo a tu medida",
  units_label: "Unidades de este diseño",
  size_note: "Hasta 8 × 12 pulgadas (aprox. 20 × 30 cm).",
  addons_title: "Un poquito más de magia",
  review_title: "Así quedará tu muñeco",
  review_note: "Revisa el diseño. Si algo no te convence, vuelve y cámbialo antes de agregarlo al carrito.",
  summary_note: "Envío calculado en el carrito. Pagas después de aprobar el diseño.",
  submit_label: "Confirmar y agregar al carrito",
  empty_message: "Estamos preparando las piezas del creador. Mientras tanto puedes contarnos tu idea en Crea tu personaje.",
};

export const builderPage = {
  slug: PAGE_SLUG,
  title: "Diseña tu muñeco",
  seo_title: "Diseña tu muñeco · Korokotico",
  seo_description: "Arma tu muñeco de tela pieza por pieza: cuerpo, ojos, boca, cabello, ropa, zapatos y accesorios.",
};

// ---- Piezas de prueba (solo con --demo-parts) ----
// Lienzo 1000 × 1400: cada SVG ocupa el lienzo completo y dibuja su pieza en su lugar.

const svg = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1400" width="1000" height="1400">${body}</svg>`;

const bodyShape = (skin, cheek) => `
  <rect x="300" y="760" width="400" height="420" rx="150" fill="${skin}"/>
  <rect x="180" y="800" width="150" height="330" rx="75" fill="${skin}" transform="rotate(12 255 800)"/>
  <rect x="670" y="800" width="150" height="330" rx="75" fill="${skin}" transform="rotate(-12 745 800)"/>
  <rect x="350" y="1100" width="130" height="230" rx="60" fill="${skin}"/>
  <rect x="520" y="1100" width="130" height="230" rx="60" fill="${skin}"/>
  <circle cx="500" cy="480" r="330" fill="${skin}"/>
  <circle cx="330" cy="580" r="45" fill="${cheek}" opacity="0.55"/>
  <circle cx="670" cy="580" r="45" fill="${cheek}" opacity="0.55"/>`;

const eyes = {
  Redondos: `<circle cx="390" cy="480" r="42" fill="#1F1611"/><circle cx="610" cy="480" r="42" fill="#1F1611"/><circle cx="404" cy="464" r="13" fill="#fff"/><circle cx="624" cy="464" r="13" fill="#fff"/>`,
  Dormilones: `<path d="M340 485q50 40 100 0" fill="none" stroke="#1F1611" stroke-width="18" stroke-linecap="round"/><path d="M560 485q50 40 100 0" fill="none" stroke="#1F1611" stroke-width="18" stroke-linecap="round"/>`,
};
const brows = {
  Felices: `<path d="M340 390q50-35 100 0M560 390q50-35 100 0" fill="none" stroke="#5C4230" stroke-width="16" stroke-linecap="round"/>`,
  Valientes: `<path d="M340 380l100 25M660 380l-100 25" fill="none" stroke="#5C4230" stroke-width="18" stroke-linecap="round"/>`,
};
const mouths = {
  Sonrisa: `<path d="M430 610q70 60 140 0" fill="none" stroke="#3B2A22" stroke-width="16" stroke-linecap="round"/>`,
  Sorpresa: `<ellipse cx="500" cy="625" rx="38" ry="46" fill="#3B2A22"/><ellipse cx="500" cy="645" rx="22" ry="16" fill="#E58C6A"/>`,
};
const hair = {
  Corto: (c) => `<path d="M175 470q0-330 325-330t325 330q-60-150-180-170q-60 70-290 70q-60 0-120 100z" fill="${c}"/>`,
  Coletas: (c) =>
    `<path d="M175 470q0-330 325-330t325 330q-120-200-325-200t-325 200z" fill="${c}"/><circle cx="150" cy="430" r="95" fill="${c}"/><circle cx="850" cy="430" r="95" fill="${c}"/>`,
};
const clothes = {
  "Camiseta lima": `<path d="M300 830q200-60 400 0l90 140-90 50v140H300v-140l-90-50z" fill="#C6FF34"/><path d="M420 800q80 40 160 0" fill="none" stroke="#01112B" stroke-width="8"/>`,
  "Vestido violeta": `<path d="M340 810q160-50 320 0l120 420H220z" fill="#7F3AEF"/><path d="M260 1180h480" stroke="#fff" stroke-width="10" stroke-dasharray="22 16"/>`,
};
const shoes = {
  "Tenis azules": `<rect x="320" y="1290" width="175" height="80" rx="40" fill="#01112B"/><rect x="505" y="1290" width="175" height="80" rx="40" fill="#01112B"/><rect x="330" y="1345" width="155" height="18" rx="9" fill="#fff"/><rect x="515" y="1345" width="155" height="18" rx="9" fill="#fff"/>`,
  "Botas rojas": `<rect x="335" y="1230" width="155" height="140" rx="40" fill="#C8643B"/><rect x="510" y="1230" width="155" height="140" rx="40" fill="#C8643B"/>`,
};
const accessories = {
  Moño: `<path d="M500 170l-110-60v120zM500 170l110-60v120z" fill="#E58C6A"/><circle cx="500" cy="170" r="32" fill="#C8643B"/>`,
  Lentes: `<circle cx="390" cy="480" r="80" fill="none" stroke="#01112B" stroke-width="14"/><circle cx="610" cy="480" r="80" fill="none" stroke="#01112B" stroke-width="14"/><path d="M470 480h60" stroke="#01112B" stroke-width="14"/>`,
  Corona: `<path d="M380 175l40-110 80 70 80-70 40 110z" fill="#F2C95C" stroke="#C8643B" stroke-width="8"/>`,
};

/** [tipo, nombre, svg, precio, elegida al empezar] */
export const demoParts = [
  ["Cuerpo", "Piel clara", svg(bodyShape("#F3D2B5", "#E9A48A")), 0, true],
  ["Cuerpo", "Piel morena", svg(bodyShape("#B07A55", "#8C4F3A")), 0, false],
  ...Object.entries(eyes).map(([n, s], i) => ["Ojos", n, svg(s), 0, i === 0]),
  ...Object.entries(brows).map(([n, s], i) => ["Cejas", n, svg(s), 0, i === 0]),
  ...Object.entries(mouths).map(([n, s], i) => ["Boca", n, svg(s), 0, i === 0]),
  ["Cabello", "Corto café", svg(hair.Corto("#5C4230")), 0, true],
  ["Cabello", "Coletas negras", svg(hair.Coletas("#1F1611")), 0, false],
  ["Cabello", "Coletas naranja", svg(hair.Coletas("#E07B39")), 1000, false],
  ...Object.entries(clothes).map(([n, s], i) => ["Ropa", n, svg(s), i === 1 ? 1500 : 0, i === 0]),
  ...Object.entries(shoes).map(([n, s], i) => ["Zapatos", n, svg(s), 0, i === 0]),
  ...Object.entries(accessories).map(([n, s]) => ["Accesorios", n, svg(s), 1000, false]),
];
