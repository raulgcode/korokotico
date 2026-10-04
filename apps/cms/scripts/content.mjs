// Contenido inicial del sitio (igual al sitio de referencia).
// `files` contiene los ids de las imágenes subidas por el seed.

const p = (...paragraphs) => paragraphs.map((t) => `<p>${t}</p>`).join("\n");

export const settings = (files, cmsUrl, siteUrl) => ({
  site_name: "Korokotico",
  site_url: siteUrl,
  logo: files.logo,
  symbol: files.symbol,
  topbar_text: "Hecho a mano, pensado para ti.",
  topbar_link_label: "Conoce nuestro proceso por encargo →",
  topbar_link_url: "/como-funciona",
  footer_text: "Hecho a mano en Costa Rica · 2026",
  whatsapp_number: null,
  contact_email: null,
  seo_title: "Korokotico · Personajes de tela hechos a mano en Costa Rica",
  seo_description:
    "Personajes de tela hechos a mano en Costa Rica. Convertimos ideas, dibujos y mascotas en regalos personales, por encargo.",
  og_image: files.og,
  locale: "es_CR",
});

export const menus = (cmsUrl) => [
  {
    key: "header",
    title: "Menú principal",
    items: [
      { label: "Colecciones", url: "/colecciones", sort: 1 },
      { label: "Cómo funciona", url: "/como-funciona", sort: 2 },
      { label: "Nuestra historia", url: "/historia", sort: 3 },
      { label: "Hablemos", url: "/contacto", sort: 4 },
    ],
  },
  {
    key: "footer",
    title: "Menú del pie",
    items: [
      { label: "Preguntas frecuentes", url: "/preguntas-frecuentes", sort: 1 },
      { label: "Contacto", url: "/contacto", sort: 2 },
      { label: "Administración", url: `${cmsUrl}/admin`, sort: 3, new_tab: true },
    ],
  },
];

export const collections = (files) =>
  [
    ["magicas", "Criaturas mágicas", "Imagina algo extraordinario", "Una mezcla de imaginación y un poquito de magia.", "#B49AD8", true],
    ["fauna", "Animales fantásticos de Costa Rica", "Imagina algo extraordinario", "La fauna de aquí, con posibilidades extraordinarias.", "#5FA35A", true],
    ["pintar", "Muñecas para pintar", "Dale tu toque personal", "Un vestido en blanco para llenarlo de color.", "#E58C6A", true],
    ["profesiones", "Muñecas de profesiones", "Dale tu toque personal", "Personajes que celebran lo que te inspira.", "#3E7FC1", false],
    ["coser", "Muñeca para coser", "Dale tu toque personal", "Una experiencia para crear con tus propias manos.", "#C8643B", false],
    ["dibujo", "De dibujo a personaje", "Dale tu toque personal", "De una idea en papel a un personaje para abrazar.", "#F2C95C", false],
    ["mascota", "Tu mascota en un personaje", "Dale tu toque personal", "Sus rasgos favoritos, convertidos en un personaje.", "#D9A877", false],
  ].map(([slug, title, category, description, accent_color, featured], i) => ({
    status: "published",
    sort: i + 1,
    number: String(i + 1).padStart(2, "0"),
    slug,
    title,
    category,
    description,
    accent_color,
    featured,
    image: files[`collection_${slug}`],
  }));

export const packages = [
  { sort: 1, name: "Personaje base", description: "Personaje, empaque y certificado de nacimiento.", price: 14000, includes_addons: false },
  { sort: 2, name: "Experiencia completa", description: "Base + cuento, stickers, llavero y rompecabezas.", price: 24000, includes_addons: true },
];

export const addons = [
  { sort: 1, name: "cuento", price: 4500 },
  { sort: 2, name: "llavero", price: 2500 },
  { sort: 3, name: "stickers", price: 1500 },
  { sort: 4, name: "rompecabezas", price: 2500 },
];

export const shippingZones = [
  { sort: 1, name: "GAM", price: 3000 },
  { sort: 2, name: "Fuera de GAM", price: 3500 },
];

const b = (collection, item) => ({ collection, item });

const createForm = {
  show_heading: false,
  eyebrow: "Lo creamos contigo",
  title: "Imagina tu propio personaje",
  subtitle: "Cuéntanos tu idea. Revisaremos contigo el diseño y los detalles de tu encargo.",
  step1_title: "01 · ¿Qué vamos a crear?",
  step2_title: "02 · Esos detalles que lo hacen tuyo",
  step3_title: "03 · Un regalo a tu medida",
  addons_title: "Un poquito más de magia",
  references_note: "JPG, PNG, WEBP o PDF · Máximo 10 MB por archivo y 20 MB por solicitud. Tus referencias son privadas.",
  units_label: "Unidades de este diseño",
  summary_note: "Envío calculado en el carrito. Pagas después de aprobar el diseño cuando aplique.",
  submit_label: "Agregar al carrito",
  size_note: "Hasta 8 × 12 pulgadas (aprox. 20 × 30 cm). Las medidas finales varían con la silueta.",
  process_link_label: "Conoce el proceso",
  process_link_url: "/como-funciona",
};

export const pages = (files) => [
  {
    slug: "inicio",
    title: "Inicio",
    seo_title: "Tu imaginación, lista para abrazar · Korokotico",
    seo_description:
      "Personajes de tela hechos a mano en Costa Rica. Convertimos ideas, dibujos y mascotas en regalos personales, por encargo.",
    blocks: [
      b("block_hero", {
        eyebrow: "Hecho a mano con mucho corazón ♡",
        kicker: "Pequeñas ideas. Grandes abrazos.",
        title: "Tu imaginación, lista para abrazar.",
        description:
          "Ideas, dibujos y mascotas que se convierten en personajes de tela. Hechos a mano, por encargo y con todo eso que los hace tuyos.",
        primary_label: "Explorar colecciones",
        primary_url: "/colecciones",
        secondary_label: "Crear mi personaje",
        secondary_url: "/crear",
        image: files.symbol,
        image_caption: "Personajes de tela acolchados en 2D · Hechos en Costa Rica",
        features: [{ text: "Hecho a mano en Costa Rica" }, { text: "Cada personaje es único" }, { text: "Envíos a todo el país" }],
      }),
      b("block_collections", {
        eyebrow: "El comienzo de algo muy tuyo",
        title: "Un mundo de posibilidades",
        subtitle: "No hay una sola forma de imaginar. Encuentra la tuya.",
        layout: "preview",
        limit: 3,
        button_label: "Ver todas las colecciones",
        button_url: "/colecciones",
      }),
      b("block_steps", {
        eyebrow: "Así de sencillo",
        title: "Lo creamos contigo.",
        layout: "compact",
        steps: [
          { title: "Nos cuentas tu idea", description: "Elige una colección y comparte los detalles que hacen especial a tu personaje." },
          { title: "Le damos forma, juntos", description: "Conversamos por WhatsApp, revisamos el diseño y lo ajustamos contigo antes de crearlo." },
          {
            title: "Listo para abrazar",
            description: "Después de la confirmación y el pago verificado, lo elaboramos en 5 días hábiles. El envío es adicional.",
          },
        ],
        button_label: "Así funciona tu encargo",
        button_url: "/como-funciona",
      }),
      b("block_story", {
        eyebrow: "Nuestra historia",
        title: "Korokotico nació de un regalo.",
        content: p(
          "Un personaje pensado para un primer sobrino. Un regalo personal que pudiera acompañarlo y conservarse con el tiempo.",
          "Hoy, esa misma intención está en cada idea que creamos contigo.",
        ),
        image: files.symbol,
        button_label: "Conoce nuestra historia",
        button_url: "/historia",
      }),
    ],
  },
  {
    slug: "colecciones",
    title: "Colecciones",
    seo_title: "Colecciones · Korokotico",
    seo_description:
      "Siete colecciones de personajes de tela hechos a mano en Costa Rica: criaturas mágicas, fauna tica, muñecas, dibujos y mascotas.",
    blocks: [
      b("block_page_header", {
        eyebrow: "Colecciones",
        title: "Un mundo de posibilidades",
        subtitle: "Siete colecciones. Infinitas maneras de hacerlas tuyas. Todos nuestros personajes se crean por encargo.",
      }),
      b("block_collections", { layout: "full" }),
    ],
  },
  {
    slug: "como-funciona",
    title: "Cómo funciona",
    seo_title: "Cómo funciona · Korokotico",
    seo_description:
      "De tu idea a un abrazo: así diseñamos, confirmamos y creamos tu personaje de tela por encargo. Envíos a toda Costa Rica.",
    blocks: [
      b("block_page_header", {
        eyebrow: "Cómo funciona",
        title: "De tu idea a un abrazo",
        subtitle: "Un proceso cercano, hecho contigo. Sin prisas inventadas ni personajes en serie.",
      }),
      b("block_steps", {
        layout: "detailed",
        steps: [
          {
            title: "Elige y cuéntanos",
            description:
              "Explora una colección y comparte la idea, los colores y el nombre de tu personaje. Puedes agregar varios personajes, cada uno con sus propios detalles, sin crear una cuenta.",
          },
          {
            title: "Diseñamos contigo",
            description:
              "Antes de comenzar un diseño personalizado te pedimos un compromiso claro de continuar. No cobramos anticipo por diseñar.\n\nTu diseño incluye hasta tres cambios sin costo. Después del tercero, coordinamos cómo continuar antes de hacer más ajustes.",
          },
          {
            title: "Apruebas y confirmamos",
            description:
              "Cuando apruebas el diseño, coordinamos el pago por SINPE Móvil o transferencia. La verificación es manual: subir un comprobante no confirma el pago automáticamente.",
          },
          {
            title: "Lo creamos y enviamos",
            description:
              "La producción comienza únicamente tras la aprobación del diseño cuando aplique, la confirmación del pedido y la verificación del pago. El plazo de elaboración es de 5 días hábiles desde la confirmación.",
          },
        ],
        note_title: "Enviamos a toda Costa Rica por Correos de Costa Rica.",
        note: "GAM: ₡3.000. Fuera de GAM: ₡3.500. No ofrecemos retiro.",
        button_label: "Crear mi personaje",
        button_url: "/crear",
      }),
    ],
  },
  {
    slug: "historia",
    title: "Nuestra historia",
    seo_title: "Nuestra historia · Korokotico",
    seo_description: "Una idea pequeña, un cariño enorme. Así nació Korokotico, personajes de tela hechos a mano en Costa Rica.",
    blocks: [
      b("block_page_header", {
        eyebrow: "Nuestra historia",
        title: "Todo empezó con un regalo",
        subtitle: "Una idea pequeña, un cariño enorme. Así nació Korokotico.",
        image: files.symbol,
      }),
      b("block_rich_text", {
        content: p(
          "La fundadora de Korokotico quería crear algo especial para su primer sobrino: un regalo personal, útil, de un tamaño adecuado para él y que pudiera conservarse con el tiempo.",
          "De esa intención nació un personaje de tela acolchado en 2D, con una silueta que sigue el diseño. Algo parecido a un cojín, no un peluche tridimensional convencional. Su diseño buscó evitar botones y piezas desprendibles.",
        ),
      }),
      b("block_cta", {
        title: "Tu imaginación también tiene un lugar aquí.",
        content: p(
          "Hoy convertimos ideas, gustos, dibujos y mascotas en personajes hechos a mano en Costa Rica. Cada uno se crea por encargo, pensado por y para quien lo recibe, sea un niño o un adulto que quiere regalarse algo muy suyo.",
        ),
        fine_print:
          "Las características de cada personaje se revisan individualmente. No afirmamos certificaciones ni seguridad absoluta. Los kits de costura contienen herramientas y requieren sus propias indicaciones de uso.",
        button_label: "Encuentra tu punto de partida",
        button_url: "/colecciones",
        tone: "soft",
      }),
    ],
  },
  {
    slug: "contacto",
    title: "Hablemos",
    seo_title: "Hablemos · Korokotico",
    seo_description: "Las mejores ideas empiezan conversando. Escríbenos para crear tu personaje de tela hecho a mano.",
    blocks: [
      b("block_page_header", {
        eyebrow: "Hablemos",
        title: "Las mejores ideas empiezan conversando",
        subtitle: "Nos encantará conocer lo que tienes en mente y darle forma contigo.",
      }),
      b("block_contact", {
        title: "Hablemos, de persona a persona.",
        content:
          "WhatsApp es nuestro espacio para acompañarte, revisar el diseño y coordinar tu encargo. No usamos un generador automático de personajes ni un chatbot.",
        whatsapp_label: "Escríbenos por WhatsApp",
        email_label: "Envíanos un correo",
        whatsapp_pending: "El número de WhatsApp está pendiente de configurar.",
        email_pending: "El correo de contacto también está pendiente de configurar.",
      }),
      b("block_cta", {
        title: "Mientras tanto, deja lista tu idea.",
        content: p(
          "Puedes preparar tu personaje y guardar una solicitud para revisar. Esta web todavía no está abierta para recibir clientes: faltan fotos, contactos, datos de pago y políticas revisadas.",
        ),
        button_label: "Preparar mi personaje",
        button_url: "/crear",
        tone: "strong",
      }),
    ],
  },
  {
    slug: "crear",
    title: "Crea tu personaje",
    seo_title: "Crea tu personaje · Korokotico",
    seo_description: "Comparte tu idea, elige los detalles y crea un personaje de tela único por encargo.",
    blocks: [
      b("block_page_header", {
        eyebrow: "Crea tu personaje",
        title: "¿A quién vamos a darle vida?",
        subtitle: "Tu idea es el punto de partida. Nosotros ponemos las manos y el corazón.",
      }),
      b("block_create_form", createForm),
    ],
  },
  {
    slug: "preguntas-frecuentes",
    title: "Preguntas frecuentes",
    seo_title: "Preguntas frecuentes · Korokotico",
    seo_description: "Precios, tiempos, envíos y todo lo que necesitas saber antes de pedir tu personaje de tela Korokotico.",
    blocks: [
      b("block_page_header", {
        eyebrow: "Preguntas frecuentes",
        title: "Preguntas que acompañan tu idea",
        subtitle: "Los detalles importantes, con claridad y sin letra pequeña inventada.",
      }),
      b("block_faq", {
        items: [
          ["¿Son peluches tradicionales?", "Son personajes de tela acolchados en 2D, parecidos a un cojín. La silueta sigue el diseño del personaje. Todos se elaboran por encargo."],
          [
            "¿Cuánto cuesta un personaje?",
            "Prediseñado base desde ₡12.000; con cuento, stickers y llavero desde ₡20.000; completo con rompecabezas desde ₡22.000. Personalizado, de dibujo o mascota: base ₡14.000 y completo ₡24.000.",
          ],
          ["¿Qué incluye la base?", "Personaje, empaque y certificado de nacimiento."],
          ["¿Puedo elegir complementos individuales?", "Sí: cuento ₡4.500, stickers ₡1.500, llavero ₡2.500 y rompecabezas ₡2.500."],
          ["¿Cuándo pago?", "Después de aprobar el diseño cuando aplique. No cobramos anticipo por diseñar."],
          ["¿Puedo pedir cambios al diseño?", "Incluye hasta tres cambios sin costo."],
          ["¿Cuánto tarda?", "5 días hábiles de elaboración desde la confirmación del pedido."],
          ["¿Dónde entregan?", "Solo envíos a toda Costa Rica por Correos de Costa Rica. GAM ₡3.000; fuera de GAM ₡3.500."],
          ["¿Qué tamaño tienen?", "Hasta 8 × 12 pulgadas, aproximadamente 20 × 30 cm."],
          ["¿Necesito una cuenta?", "No. Puedes enviar tu solicitud como invitado y consultar el estado desde un enlace privado."],
          ["¿Usarán mis fotos o dibujos para publicidad?", "Tus referencias no se reutilizarán para marketing sin autorización específica."],
        ].map(([question, answer]) => ({ question, answer })),
      }),
    ],
  },
];
