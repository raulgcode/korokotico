export type FileRef = {
  id: string;
  type?: string | null;
  width?: number | null;
  height?: number | null;
  title?: string | null;
  description?: string | null;
};

export type MenuItem = { label: string; url: string; new_tab?: boolean | null };
export type Menu = { key: string; title: string; items: MenuItem[] };

export type Theme = {
  id: number;
  name: string;
  base: string | null;
  display_font: string | null;
  body_font: string | null;
} & Partial<Record<import("./theme").ColorField, string | null>>;

export type SiteSettings = {
  site_name: string;
  site_url: string | null;
  logo: FileRef | null;
  symbol: FileRef | null;
  active_theme: Theme | null;
  topbar_text: string | null;
  topbar_link_label: string | null;
  topbar_link_url: string | null;
  footer_text: string | null;
  whatsapp_number: string | null;
  contact_email: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_image: { id: string } | null;
  twitter_handle: string | null;
  locale: string | null;
};

type Link<P extends string> = { [K in `${P}_label` | `${P}_url`]: string | null };

export type HeroBlock = {
  eyebrow: string | null;
  kicker: string | null;
  title: string;
  description: string | null;
  image: FileRef | string | null;
  image_caption: string | null;
  features: { text: string }[] | null;
} & Link<"primary"> &
  Link<"secondary">;

export type PageHeaderBlock = { eyebrow: string | null; title: string; subtitle: string | null; image: FileRef | string | null };

export type CollectionsBlock = {
  eyebrow: string | null;
  title: string | null;
  subtitle: string | null;
  layout: "preview" | "full";
  limit: number | null;
} & Link<"button">;

export type StepsBlock = {
  eyebrow: string | null;
  title: string | null;
  subtitle: string | null;
  layout: "compact" | "detailed";
  steps: { title: string; description: string }[] | null;
  note_title: string | null;
  note: string | null;
} & Link<"button">;

export type StoryBlock = {
  eyebrow: string | null;
  title: string | null;
  content: string | null;
  image: FileRef | string | null;
} & Link<"button">;

export type RichTextBlock = { title: string | null; content: string | null };

export type CtaBlock = {
  eyebrow: string | null;
  title: string | null;
  content: string | null;
  fine_print: string | null;
  tone: "soft" | "strong";
} & Link<"button">;

export type FaqBlock = { title: string | null; items: { question: string; answer: string }[] | null };

export type ContactBlock = {
  title: string | null;
  content: string | null;
  whatsapp_label: string | null;
  email_label: string | null;
  whatsapp_pending: string | null;
  email_pending: string | null;
};

export type CreateFormBlock = {
  mode: "formulario" | "creador" | null;
  show_heading: boolean;
  eyebrow: string | null;
  title: string | null;
  subtitle: string | null;
  step1_title: string | null;
  step2_title: string | null;
  step3_title: string | null;
  addons_title: string | null;
  references_note: string | null;
  units_label: string | null;
  summary_note: string | null;
  submit_label: string | null;
  size_note: string | null;
  canvas_width: number | null;
  canvas_height: number | null;
  canvas_background: string | null;
  review_title: string | null;
  review_note: string | null;
  empty_message: string | null;
} & Link<"process_link">;

/** Posición en % del lienzo (el alto sale de la proporción de la imagen) */
export type DollPosition = { pos_x: number | null; pos_y: number | null; pos_width: number | null };

export type DollPart = DollPosition & {
  id: number;
  name: string;
  price: number | null;
  layer: number | null;
  is_default: boolean | null;
  image: FileRef;
  thumbnail: FileRef | null;
};

export type DollPartType = DollPosition & {
  id: number;
  name: string;
  layer: number;
  required: boolean | null;
  multiple: boolean | null;
  parts: DollPart[];
};

export type DesignPart = {
  id: number;
  type: string;
  name: string;
  price: number;
  /** Capa final (0 = atrás) */
  z?: number;
  /** Posición que eligió el cliente, en % del lienzo */
  position?: { x: number; y: number; w: number };
};

export type Block =
  | { id: number; collection: "block_hero"; item: HeroBlock }
  | { id: number; collection: "block_page_header"; item: PageHeaderBlock }
  | { id: number; collection: "block_collections"; item: CollectionsBlock }
  | { id: number; collection: "block_steps"; item: StepsBlock }
  | { id: number; collection: "block_story"; item: StoryBlock }
  | { id: number; collection: "block_rich_text"; item: RichTextBlock }
  | { id: number; collection: "block_cta"; item: CtaBlock }
  | { id: number; collection: "block_faq"; item: FaqBlock }
  | { id: number; collection: "block_contact"; item: ContactBlock }
  | { id: number; collection: "block_create_form"; item: CreateFormBlock };

export type Page = {
  id: number;
  slug: string;
  title: string;
  seo_title: string | null;
  seo_description: string | null;
  og_image: { id: string } | null;
  no_index: boolean | null;
  date_updated: string | null;
  blocks: Block[] | null;
};

export type CatalogCollection = {
  id: number;
  number: string | null;
  slug: string;
  title: string;
  category: string | null;
  description: string | null;
  body: string | null;
  image: FileRef | null;
  accent_color: string | null;
  featured: boolean | null;
  seo_title: string | null;
  seo_description: string | null;
  og_image: { id: string } | null;
};

export type Package = { id: number; name: string; description: string | null; price: number; includes_addons: boolean };
export type Addon = { id: number; name: string; price: number };
export type ShippingZone = { id: number; name: string; price: number };

export type Shop = { packages: Package[]; addons: Addon[]; shippingZones: ShippingZone[] };

export type RequestItem = {
  id: number;
  status: string;
  character_name: string | null;
  colors: string | null;
  interests: string | null;
  idea: string | null;
  units: number;
  unit_price: number;
  subtotal: number;
  addons: string[] | null;
  collection: { title: string; slug: string } | null;
  package: { name: string; includes_addons: boolean } | null;
  references: { directus_files_id: { filename_download: string } | null }[] | null;
  source: "formulario" | "creador" | null;
  design_image: string | null;
  design_parts: DesignPart[] | null;
  parts_price: number | null;
};

export type Order = {
  id: number;
  code: string;
  token: string;
  status: string;
  customer_name: string;
  email: string;
  phone: string;
  address: string | null;
  notes: string | null;
  subtotal: number;
  shipping: number;
  total: number;
  date_created: string;
  shipping_zone: { name: string } | null;
  items: RequestItem[];
};
