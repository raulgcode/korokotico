// Creador de muñecos: tipos de pieza de fábrica, la página del creador y piezas de prueba.
// Las piezas de Daniela (apps/cms/scripts/parts) se suben con el seed; luego se editan desde el panel
// (Creador de muñecos → Piezas).

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

// Posición de cada tipo en el lienzo (% de 1000 × 1400), medida con las piezas de Daniela.
// Solo se escribe si el tipo no tiene posición todavía.
export const typePositions = {
  Cuerpo: [10, 3, 80],
  Ropa: [10, 36, 80],
  Zapatos: [29, 82, 42],
  Boca: [45, 31, 10.1],
  Ojos: [38, 20, 24],
  Cejas: [38, 16, 24],
  Cabello: [25.1, 5, 49.9],
  Accesorios: [33.1, 18.2, 33.7],
};

/**
 * Piezas de Daniela (archivos en apps/cms/scripts/parts, vienen recortados).
 * [tipo, nombre, archivo, elegida al empezar, posición propia [x, y, ancho] o null = la del tipo]
 */
export const parts = [
  ["Cuerpo", "Cuerpo claro", "cuerpo-claro.svg", true, null],
  ["Cuerpo", "Cuerpo medio", "cuerpo-medio.svg", false, null],
  ["Cuerpo", "Cuerpo moreno", "cuerpo-moreno.svg", false, null],
  ["Cuerpo", "Cuerpo moreno claro", "cuerpo-moreno-claro.svg", false, null],
  ["Ropa", "Camisa y falda lila", "camisa-y-falda-lila.svg", false, null],
  ["Ropa", "Camiseta verde y short marrón", "camiseta-verde-y-short-marron.svg", false, null],
  ["Ropa", "Camiseta y shorts azul", "camiseta-y-shorts-azul.svg", true, null],
  ["Ropa", "Overol", "overol.svg", false, null],
  ["Ropa", "Overol verde", "overol-verde.svg", false, null],
  ["Ropa", "Sudadera y pantalón", "sudadera-y-pantalon.svg", false, null],
  ["Ropa", "Vestido amarillo", "vestido-amarillo.svg", false, null],
  ["Ropa", "Vestido amarillo claro", "vestido-amarillo-claro.svg", false, null],
  ["Ropa", "Vestido cuadro rojos", "vestido-cuadro-rojos.svg", false, null],
  ["Ropa", "Vestido de cerezas", "vestido-de-cerezas.svg", false, null],
  ["Ropa", "Vestido lila", "vestido-lila.svg", false, null],
  ["Ropa", "Vestido rosa", "vestido-rosa.svg", false, null],
  ["Zapatos", "Deportivos amarillos", "deportivos-amarillos.svg", false, null],
  ["Zapatos", "Deportivos rojos", "deportivos-rojos.svg", false, null],
  ["Zapatos", "Deportivos verde", "deportivos-verde.svg", false, null],
  ["Zapatos", "Zapatos amarillos", "zapatos-amarillos.svg", false, null],
  ["Zapatos", "Zapatos azules", "zapatos-azules.svg", false, null],
  ["Zapatos", "Zapatos lila", "zapatos-lila.svg", false, null],
  ["Zapatos", "Zapatos rojos", "zapatos-rojos.svg", true, null],
  ["Zapatos", "Zapatos rosa", "zapatos-rosa.svg", false, null],
  ["Boca", "Boca 1", "boca-1.svg", true, [45.0, 31, 10.1]],
  ["Boca", "Boca 2", "boca-2.svg", false, [44.7, 31, 10.7]],
  ["Boca", "Boca 3", "boca-3.svg", false, [44.5, 31, 11.0]],
  ["Boca", "Boca 4", "boca-4.svg", false, [44.5, 31, 10.9]],
  ["Boca", "Boca 5", "boca-5.svg", false, [44.0, 31, 12.0]],
  ["Ojos", "Ojos azules", "ojos-azules.svg", false, null],
  ["Ojos", "Ojos dorados", "ojos-dorados.svg", false, null],
  ["Ojos", "Ojos grises", "ojos-grises.svg", false, null],
  ["Ojos", "Ojos marrones", "ojos-marrones.svg", true, null],
  ["Ojos", "Ojos miel", "ojos-miel.svg", false, null],
  ["Ojos", "Ojos verde", "ojos-verde.svg", false, null],
  ["Cejas", "Cejas 1", "cejas-1.svg", false, null],
  ["Cejas", "Cejas 2", "cejas-2.svg", true, null],
  ["Cejas", "Cejas 3", "cejas-3.svg", false, null],
  ["Cejas", "Cejas 4", "cejas-4.svg", false, null],
  ["Cejas", "Cejas 5", "cejas-5.svg", false, null],
  ["Cejas", "Cejas 6", "cejas-6.svg", false, null],
  ["Cejas", "Cejas 7", "cejas-7.svg", false, null],
  ["Cabello", "Cabello 1", "cabello-1.svg", true, [25.1, 5, 49.9]],
  ["Cabello", "Cabello 2", "cabello-2.svg", false, [21.5, 2, 57.1]],
  ["Cabello", "Cabello 3", "cabello-3.svg", false, [19.7, 5, 60.7]],
  ["Cabello", "Cabello 4", "cabello-4.svg", false, [21.7, 5, 56.6]],
  ["Cabello", "Cabello 5", "cabello-5.svg", false, [21.2, 5, 57.6]],
  ["Cabello", "Cabello 6", "cabello-6.svg", false, [20.9, 0.5, 58.1]],
  ["Cabello", "Cabello 7", "cabello-7.svg", false, [26.3, 5, 47.3]],
  ["Cabello", "Cabello 8", "cabello-8.svg", false, [26.6, 5, 46.9]],
  ["Cabello", "Cabello 9", "cabello-9.svg", false, [20.5, 5, 59.0]],
  ["Cabello", "Cabello 11", "cabello-11.svg", false, [22.5, 5, 55.0]],
  ["Cabello", "Cabello 12", "cabello-12.svg", false, [24.6, 5, 50.9]],
  ["Cabello", "Cabello 13", "cabello-13.svg", false, [23.1, 5, 53.8]],
  ["Cabello", "Cabello 14", "cabello-14.svg", false, [26.1, 5, 47.8]],
  ["Cabello", "Cabello 15", "cabello-15.svg", false, [25.8, 5, 48.4]],
  ["Cabello", "Cabello 16", "cabello-16.svg", false, [24.1, 5, 51.9]],
  ["Cabello", "Cabello 17", "cabello-17.svg", false, [25.9, 5, 48.3]],
  ["Cabello", "Cabello 18", "cabello-18.svg", false, [26.2, 5, 47.7]],
  ["Cabello", "Cabello 19", "cabello-19.svg", false, [23.0, 5, 53.9]],
  ["Accesorios", "Lazo amarillo", "lazo-amarillo.svg", false, [52.6, 4.3, 18.7]],
  ["Accesorios", "Lazo lila", "lazo-lila.svg", false, [53.5, 4.7, 17.1]],
  ["Accesorios", "Lazo rosa", "lazo-rosa.svg", false, [52.1, 3.3, 19.7]],
  ["Accesorios", "Lazos mente", "lazos-mente.svg", false, [53.0, 3.6, 17.9]],
  ["Accesorios", "Lazos rojos", "lazos-rojos.svg", false, [52.8, 3.8, 18.4]],
  ["Accesorios", "Lentes 1", "lentes-1.svg", false, [33.1, 18.2, 33.7]],
  ["Accesorios", "Lentes 2", "lentes-2.svg", false, [33.9, 18.1, 32.1]],
  ["Accesorios", "Lentes 3", "lentes-3.svg", false, [35.1, 18.1, 29.7]],
  ["Accesorios", "Lentes 4", "lentes-4.svg", false, [32.9, 18.3, 34.1]],
  ["Accesorios", "Lentes 5", "lentes-5.svg", false, [33.2, 18.2, 33.5]],
  ["Accesorios", "Lentes 6", "lentes-6.svg", false, [32.4, 18.3, 35.1]],
  ["Accesorios", "Lentes 7", "lentes-7.svg", false, [34.4, 19.5, 31.1]],
  ["Accesorios", "Lentes 8", "lentes-8.svg", false, [34.3, 19.2, 31.3]],
  ["Accesorios", "Lentes 9", "lentes-9.svg", false, [35.5, 19.0, 28.9]],
  ["Accesorios", "Lentes 10", "lentes-10.svg", false, [33.8, 17.3, 32.3]],
];


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
