// Ilustraciones iniciales (SVG) que el seed sube a la biblioteca de Directus.
// Son provisionales: reemplázalas por fotos reales desde el panel.

const stitch = (color = "#FFFFFF", w = 3) =>
  `fill="none" stroke="${color}" stroke-width="${w}" stroke-dasharray="7 6" stroke-linecap="round" opacity="0.85"`;

const sloth = (size = 400) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="${size}" height="${size}">
  <path d="M200 52c34 0 41-30 66-22 18 6 14 30-4 40" fill="none" stroke="#4F7A5A" stroke-width="10" stroke-linecap="round"/>
  <path d="M258 40c18-16 44-10 48 6-20 12-38 10-48-6z" fill="#7FA36E"/>
  <ellipse cx="200" cy="215" rx="150" ry="140" fill="#9A7458"/>
  <ellipse cx="200" cy="215" rx="138" ry="128" ${stitch("#F6E7D3")}/>
  <ellipse cx="200" cy="232" rx="112" ry="92" fill="#F3DFC6"/>
  <ellipse cx="148" cy="214" rx="44" ry="26" transform="rotate(-22 148 214)" fill="#5C4230"/>
  <ellipse cx="252" cy="214" rx="44" ry="26" transform="rotate(22 252 214)" fill="#5C4230"/>
  <circle cx="152" cy="214" r="12" fill="#1F1611"/>
  <circle cx="248" cy="214" r="12" fill="#1F1611"/>
  <circle cx="156" cy="209" r="4" fill="#FFFFFF"/>
  <circle cx="252" cy="209" r="4" fill="#FFFFFF"/>
  <ellipse cx="200" cy="252" rx="22" ry="15" fill="#3B2A22"/>
  <path d="M176 284c14 14 34 14 48 0" fill="none" stroke="#3B2A22" stroke-width="7" stroke-linecap="round"/>
  <circle cx="120" cy="268" r="14" fill="#E9A48A" opacity="0.6"/>
  <circle cx="280" cy="268" r="14" fill="#E9A48A" opacity="0.6"/>
</svg>`;

export const symbolSvg = sloth(400);

export const logoSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 160" width="640" height="160">
  <g transform="translate(4 4) scale(0.38)">${sloth(400).replace(/<\/?svg[^>]*>/g, "")}</g>
  <text x="168" y="104" font-family="Fraunces, Georgia, serif" font-size="78" font-weight="600" fill="#3B2A22" letter-spacing="-1">korokotico</text>
</svg>`;

const card = (bg, body) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480" width="480" height="480">
  <rect width="480" height="480" fill="${bg}"/>
  <circle cx="400" cy="70" r="90" fill="#FFFFFF" opacity="0.25"/>
  <circle cx="60" cy="430" r="110" fill="#FFFFFF" opacity="0.18"/>
  ${body}
</svg>`;

const face = (cx, cy, dark = "#2E211A") => `
  <circle cx="${cx - 26}" cy="${cy}" r="9" fill="${dark}"/><circle cx="${cx + 26}" cy="${cy}" r="9" fill="${dark}"/>
  <circle cx="${cx - 23}" cy="${cy - 3}" r="3" fill="#fff"/><circle cx="${cx + 29}" cy="${cy - 3}" r="3" fill="#fff"/>
  <path d="M${cx - 14} ${cy + 22}c8 9 20 9 28 0" fill="none" stroke="${dark}" stroke-width="5" stroke-linecap="round"/>
  <circle cx="${cx - 46}" cy="${cy + 20}" r="10" fill="#E9A48A" opacity="0.7"/><circle cx="${cx + 46}" cy="${cy + 20}" r="10" fill="#E9A48A" opacity="0.7"/>`;

const doll = (dress, hair, extra = "", dressStroke = "#FFFFFF") => `
  <path d="M240 88c-62 0-96 44-96 96 0 22 6 40 16 54h160c10-14 16-32 16-54 0-52-34-96-96-96z" fill="${hair}"/>
  <circle cx="240" cy="190" r="74" fill="#F3D9BF"/>
  <path d="M168 170c18-50 126-58 146 0-30-18-70-30-146 0z" fill="${hair}"/>
  ${face(240, 196)}
  <path d="M176 270h128l42 150H134z" fill="${dress}"/>
  <path d="M182 282h116l36 128H146z" ${stitch(dressStroke)}/>
  <rect x="120" y="282" width="34" height="96" rx="17" fill="#F3D9BF" transform="rotate(14 137 282)"/>
  <rect x="326" y="282" width="34" height="96" rx="17" fill="#F3D9BF" transform="rotate(-14 343 282)"/>
  ${extra}`;

export const collectionSvgs = {
  magicas: card(
    "#E7DDF4",
    `<path d="M240 120c90 0 140 70 140 150s-56 130-140 130-140-50-140-130 50-150 140-150z" fill="#B49AD8"/>
     <path d="M240 134c80 0 126 64 126 136s-50 116-126 116-126-44-126-116 46-136 126-136z" ${stitch()}/>
     <path d="M226 128l14-78 14 78z" fill="#F2C95C"/>
     <path d="M150 150l-30-40 46 18zM330 150l30-40-46 18z" fill="#9A7DC4"/>
     ${face(240, 260)}
     <path d="M372 96l8 18 20 2-15 13 5 20-18-11-18 11 5-20-15-13 20-2z" fill="#F2C95C"/>
     <circle cx="104" cy="120" r="7" fill="#F2C95C"/><circle cx="398" cy="330" r="6" fill="#fff"/>`,
  ),
  fauna: card(
    "#DCEBD5",
    `<ellipse cx="240" cy="300" rx="150" ry="110" fill="#5FA35A"/>
     <ellipse cx="240" cy="300" rx="136" ry="96" ${stitch()}/>
     <circle cx="170" cy="190" r="58" fill="#5FA35A"/><circle cx="310" cy="190" r="58" fill="#5FA35A"/>
     <circle cx="170" cy="190" r="40" fill="#E2483B"/><circle cx="310" cy="190" r="40" fill="#E2483B"/>
     <ellipse cx="170" cy="190" rx="8" ry="26" fill="#1C1C1C"/><ellipse cx="310" cy="190" rx="8" ry="26" fill="#1C1C1C"/>
     <path d="M196 320c26 22 62 22 88 0" fill="none" stroke="#2D5A2A" stroke-width="7" stroke-linecap="round"/>
     <ellipse cx="150" cy="392" rx="40" ry="16" fill="#F28C38"/><ellipse cx="330" cy="392" rx="40" ry="16" fill="#F28C38"/>
     <path d="M110 300c-30 10-40 40-30 60M370 300c30 10 40 40 30 60" stroke="#3E7FC1" stroke-width="16" stroke-linecap="round" fill="none"/>`,
  ),
  pintar: card(
    "#FBE3D6",
    doll(
      "#FFFFFF",
      "#6B4A36",
      `<circle cx="400" cy="300" r="16" fill="#E2483B"/><circle cx="420" cy="350" r="14" fill="#F2C95C"/><circle cx="388" cy="392" r="15" fill="#3E7FC1"/><circle cx="72" cy="330" r="14" fill="#5FA35A"/>
       <path d="M60 140l70 70" stroke="#C8643B" stroke-width="12" stroke-linecap="round"/><path d="M48 128l20 20" stroke="#F2C95C" stroke-width="16" stroke-linecap="round"/>`,
      "#C9B8A8",
    ),
  ),
  profesiones: card(
    "#D9E8F2",
    doll(
      "#3E7FC1",
      "#3B2A22",
      `<path d="M190 96h100l14 30H176z" fill="#2B4E73"/><rect x="170" y="122" width="140" height="14" rx="7" fill="#2B4E73"/>
       <circle cx="240" cy="108" r="8" fill="#F2C95C"/>
       <rect x="214" y="300" width="52" height="40" rx="6" fill="#fff" opacity="0.9"/><path d="M240 308v24M228 320h24" stroke="#E2483B" stroke-width="6"/>`,
    ),
  ),
  coser: card(
    "#F6E7C8",
    doll(
      "#E58C6A",
      "#A0522D",
      `<path d="M370 120c40 60 10 160-60 210" fill="none" stroke="#C8643B" stroke-width="4" stroke-dasharray="10 8"/>
       <path d="M352 96l40 40" stroke="#8C8C8C" stroke-width="6" stroke-linecap="round"/><circle cx="356" cy="100" r="6" fill="none" stroke="#8C8C8C" stroke-width="3"/>
       <circle cx="92" cy="140" r="34" fill="#E2483B"/><circle cx="92" cy="140" r="22" ${stitch()}/>`,
    ),
  ),
  dibujo: card(
    "#FFF1C9",
    `<rect x="96" y="96" width="290" height="300" rx="14" fill="#FFFFFF" transform="rotate(-4 240 246)"/>
     <path d="M170 300c-10-80 30-140 80-140s90 60 70 140c-10 40-140 40-150 0z" fill="none" stroke="#3E7FC1" stroke-width="6" stroke-linecap="round"/>
     <circle cx="222" cy="230" r="7" fill="#3E7FC1"/><circle cx="270" cy="230" r="7" fill="#3E7FC1"/>
     <path d="M226 262c10 10 30 10 40 0" fill="none" stroke="#3E7FC1" stroke-width="5" stroke-linecap="round"/>
     <path d="M180 170l-20-40M300 170l20-40" stroke="#3E7FC1" stroke-width="6" stroke-linecap="round"/>
     <g transform="rotate(35 380 360)"><rect x="360" y="240" width="34" height="170" rx="6" fill="#F2C95C"/><path d="M360 410l17 40 17-40z" fill="#F3D9BF"/><path d="M372 438l5 12 5-12z" fill="#3B2A22"/><rect x="360" y="240" width="34" height="22" fill="#E58C6A"/></g>`,
  ),
  mascota: card(
    "#F2DED0",
    `<ellipse cx="240" cy="270" rx="140" ry="130" fill="#D9A877"/>
     <ellipse cx="240" cy="270" rx="126" ry="116" ${stitch()}/>
     <path d="M118 170c-40 30-46 120-10 150 20-30 30-90 10-150zM362 170c40 30 46 120 10 150-20-30-30-90-10-150z" fill="#8A5A3B"/>
     <ellipse cx="240" cy="310" rx="76" ry="58" fill="#F6E3CC"/>
     <circle cx="198" cy="250" r="12" fill="#2E211A"/><circle cx="282" cy="250" r="12" fill="#2E211A"/>
     <circle cx="202" cy="246" r="4" fill="#fff"/><circle cx="286" cy="246" r="4" fill="#fff"/>
     <ellipse cx="240" cy="292" rx="20" ry="14" fill="#2E211A"/>
     <path d="M240 306v14M216 328c12 10 36 10 48 0" fill="none" stroke="#2E211A" stroke-width="5" stroke-linecap="round"/>
     <path d="M232 334q8 26 16 0" fill="#E2726B"/>
     <path d="M84 400c10-20 30-20 40 0M370 110c10-20 30-20 40 0" stroke="#C8643B" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  ),
};

export const ogSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <rect width="1200" height="630" fill="#FBF5EC"/>
  <circle cx="1040" cy="120" r="220" fill="#F4D9CC"/>
  <circle cx="120" cy="560" r="200" fill="#DCE5D3"/>
  <g transform="translate(760 150) scale(0.9)">${sloth(400).replace(/<\/?svg[^>]*>/g, "")}</g>
  <text x="90" y="250" font-family="Georgia, serif" font-size="74" font-weight="700" fill="#3B2A22">Tu imaginación,</text>
  <text x="90" y="340" font-family="Georgia, serif" font-size="74" font-weight="700" fill="#C8643B">lista para abrazar.</text>
  <text x="90" y="420" font-family="Arial, sans-serif" font-size="30" fill="#6B5446">Personajes de tela hechos a mano en Costa Rica</text>
  <text x="90" y="520" font-family="Georgia, serif" font-size="40" font-weight="700" fill="#3B2A22">korokotico</text>
</svg>`;
