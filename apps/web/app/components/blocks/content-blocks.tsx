import { ArrowRightIcon, CheckIcon, MailIcon, MessageCircleIcon, TruckIcon } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { CmsImage } from "~/components/cms-image";
import { SectionHeading } from "~/components/section-heading";
import { SmartLink } from "~/components/smart-link";
import type {
  CatalogCollection,
  CollectionsBlock,
  ContactBlock,
  CtaBlock,
  FaqBlock,
  HeroBlock,
  PageHeaderBlock,
  RichTextBlock,
  SiteSettings,
  StepsBlock,
  StoryBlock,
} from "~/lib/types";
import { cn } from "~/lib/utils";

function CmsButton({
  label,
  url,
  variant,
  className,
}: {
  label: string | null;
  url: string | null;
  variant?: "default" | "outline" | "secondary";
  className?: string;
}) {
  if (!label || !url) return null;
  return (
    <Button asChild size="lg" variant={variant} className={className}>
      <SmartLink to={url}>
        {label}
        <ArrowRightIcon />
      </SmartLink>
    </Button>
  );
}

const Paragraphs = ({ text, className }: { text: string | null; className?: string }) =>
  text ? (
    <>
      {text.split(/\n\s*\n/).map((p, i) => (
        <p key={i} className={className}>
          {p}
        </p>
      ))}
    </>
  ) : null;

/** Mancha decorativa de fondo */
const Blob = ({ className }: { className?: string }) => (
  <div aria-hidden className={cn("pointer-events-none absolute -z-10 rounded-full blur-2xl", className)} />
);

export function Hero({ block }: { block: HeroBlock }) {
  return (
    <section className="relative isolate overflow-hidden">
      <Blob className="-top-24 -right-24 size-96 bg-accent/80" />
      <Blob className="top-1/2 -left-32 size-80 bg-secondary/80" />
      <div className="container-k grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-24">
        <div className="text-center lg:text-left">
          {block.eyebrow && (
            <p className="inline-flex rounded-full border-2 border-dashed border-primary/40 bg-card px-4 py-1.5 text-[11px] font-extrabold tracking-[0.18em] text-primary uppercase sm:text-xs">
              {block.eyebrow}
            </p>
          )}
          {block.kicker && <p className="mt-6 font-display text-xl text-leaf italic sm:text-2xl">{block.kicker}</p>}
          <h1 className="mt-3 text-[2.75rem] leading-[1.02] font-semibold sm:text-6xl lg:text-7xl">{block.title}</h1>
          {block.description && (
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl lg:mx-0">{block.description}</p>
          )}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <CmsButton label={block.primary_label} url={block.primary_url} />
            <CmsButton label={block.secondary_label} url={block.secondary_url} variant="outline" />
          </div>
          {!!block.features?.length && (
            <ul className="mt-10 flex flex-col items-center gap-3 text-sm font-bold sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
              {block.features.map((f) => (
                <li key={f.text} className="flex items-center gap-2">
                  <span className="grid size-6 place-items-center rounded-full bg-secondary text-leaf">
                    <CheckIcon className="size-3.5" strokeWidth={3} />
                  </span>
                  {f.text}
                </li>
              ))}
            </ul>
          )}
        </div>

        {block.image && (
          <figure className="relative mx-auto w-full max-w-sm sm:max-w-md">
            <div className="stitch relative aspect-square rounded-[42%_58%_55%_45%/50%_45%_55%_50%] bg-accent p-10 outline-primary/40 sm:p-14">
              <CmsImage file={block.image} priority widths={[480, 720, 960]} sizes="(min-width: 1024px) 28rem, 80vw" className="size-full object-contain drop-shadow-xl" />
              <span className="absolute top-6 -left-2 rotate-[-8deg] rounded-full bg-sun px-4 py-2 text-xs font-extrabold text-cocoa shadow-md sm:-left-6">
                ¡Hecho a mano!
              </span>
              <span className="absolute -right-1 bottom-10 grid size-14 rotate-12 place-items-center rounded-full bg-leaf text-2xl text-white shadow-md">
                ♡
              </span>
            </div>
            {block.image_caption && (
              <figcaption className="mt-6 text-center text-sm font-semibold text-muted-foreground">{block.image_caption}</figcaption>
            )}
          </figure>
        )}
      </div>
    </section>
  );
}

export function PageHeader({ block }: { block: PageHeaderBlock }) {
  return (
    <section className="relative isolate overflow-hidden border-b-2 border-dashed border-border">
      <Blob className="-top-32 left-1/2 size-[28rem] -translate-x-1/2 bg-accent/70" />
      <div className="container-k py-14 text-center sm:py-20">
        {block.image && (
          <CmsImage file={block.image} priority widths={[240, 480]} sizes="10rem" className="mx-auto mb-6 size-28 object-contain sm:size-36" />
        )}
        <SectionHeading as="h1" eyebrow={block.eyebrow} title={block.title} subtitle={block.subtitle} />
      </div>
    </section>
  );
}

export function CollectionCard({ item, index, variant }: { item: CatalogCollection; index: number; variant: "preview" | "full" }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-border bg-card transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
      <div
        className="stitch relative m-3 aspect-[4/3] overflow-hidden rounded-xl outline-white/70"
        style={{ backgroundColor: item.accent_color ? `${item.accent_color}33` : undefined }}
      >
        <CmsImage
          file={item.image}
          alt={item.title}
          widths={[400, 640, 800]}
          sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 90vw"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {variant === "full" && item.number && (
          <span className="absolute top-3 left-3 rounded-full bg-card/90 px-3 py-1 font-display text-lg font-semibold text-primary">
            {item.number}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-6 pt-3 pb-6">
        {item.category && <Badge variant={index % 2 ? "secondary" : "accent"}>{item.category}</Badge>}
        <h3 className="mt-3 text-2xl leading-tight font-semibold">
          <SmartLink to={`/colecciones/${item.slug}`} className="after:absolute after:inset-0">
            {item.title}
          </SmartLink>
        </h3>
        {item.description && <p className="mt-2 text-muted-foreground">{item.description}</p>}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-extrabold text-primary">
          Explorar colección
          <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </article>
  );
}

export function Collections({ block, collections }: { block: CollectionsBlock; collections: CatalogCollection[] }) {
  let items = collections;
  if (block.layout === "preview") {
    const featured = collections.filter((c) => c.featured);
    items = featured.length ? featured : collections;
  }
  if (block.limit) items = items.slice(0, block.limit);

  return (
    <section className={cn("container-k", block.title ? "py-16 sm:py-24" : "py-12 sm:py-16")}>
      <SectionHeading eyebrow={block.eyebrow} title={block.title} subtitle={block.subtitle} className="mb-12" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <CollectionCard key={item.id} item={item} index={i} variant={block.layout} />
        ))}
      </div>
      {block.button_label && block.button_url && (
        <div className="mt-12 text-center">
          <CmsButton label={block.button_label} url={block.button_url} variant="outline" />
        </div>
      )}
    </section>
  );
}

export function Steps({ block }: { block: StepsBlock }) {
  const steps = block.steps ?? [];
  const detailed = block.layout === "detailed";
  return (
    <section className={cn(!detailed && "bg-secondary/50", "py-16 sm:py-24")}>
      <div className="container-k">
        <SectionHeading eyebrow={block.eyebrow} title={block.title} subtitle={block.subtitle} className="mb-12" />
        <ol className={cn("grid gap-6", detailed ? "md:grid-cols-2" : "md:grid-cols-3")}>
          {steps.map((step, i) => (
            <li
              key={i}
              className={cn(
                "relative rounded-2xl bg-card p-7 sm:p-8",
                detailed ? "border-2 border-border" : "stitch text-center outline-leaf/30 md:text-left",
              )}
            >
              <span
                className={cn(
                  "grid size-14 place-items-center rounded-full font-display text-xl font-semibold",
                  i % 2 ? "bg-secondary text-leaf" : "bg-accent text-primary",
                  !detailed && "mx-auto md:mx-0",
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-5 text-2xl font-semibold">{step.title}</h3>
              <div className="mt-3 space-y-3 leading-relaxed text-muted-foreground">
                <Paragraphs text={step.description} />
              </div>
            </li>
          ))}
        </ol>
        {(block.note_title || block.note) && (
          <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-leaf/40 bg-secondary/60 p-6 text-center sm:flex-row sm:text-left">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-leaf text-white">
              <TruckIcon className="size-6" />
            </span>
            <div>
              {block.note_title && <p className="font-bold">{block.note_title}</p>}
              {block.note && <p className="text-secondary-foreground/90">{block.note}</p>}
            </div>
          </div>
        )}
        {block.button_label && block.button_url && (
          <div className="mt-12 text-center">
            <CmsButton label={block.button_label} url={block.button_url} />
          </div>
        )}
      </div>
    </section>
  );
}

export function Story({ block }: { block: StoryBlock }) {
  return (
    <section className="container-k py-16 sm:py-24">
      <div className="grid items-center gap-10 overflow-hidden rounded-[2rem] bg-accent/70 p-8 sm:p-12 lg:grid-cols-[0.8fr_1.2fr] lg:p-16">
        {block.image && (
          <div className="stitch mx-auto aspect-square w-full max-w-xs rounded-full bg-card p-8 outline-primary/30">
            <CmsImage file={block.image} widths={[320, 640]} sizes="20rem" className="size-full object-contain" />
          </div>
        )}
        <div className="text-center lg:text-left">
          {block.eyebrow && <p className="eyebrow">{block.eyebrow}</p>}
          {block.title && <h2 className="mt-3 text-3xl leading-tight font-semibold sm:text-4xl lg:text-5xl">{block.title}</h2>}
          {block.content && <div className="prose-k mt-6" dangerouslySetInnerHTML={{ __html: block.content }} />}
          {block.button_label && block.button_url && (
            <div className="mt-8">
              <CmsButton label={block.button_label} url={block.button_url} variant="outline" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function RichText({ block }: { block: RichTextBlock }) {
  return (
    <section className="container-k py-14 sm:py-20">
      <div className="mx-auto max-w-2xl">
        {block.title && <h2 className="mb-6 text-3xl font-semibold sm:text-4xl">{block.title}</h2>}
        {block.content && <div className="prose-k first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-6xl first-letter:leading-none first-letter:text-primary" dangerouslySetInnerHTML={{ __html: block.content }} />}
      </div>
    </section>
  );
}

export function Cta({ block }: { block: CtaBlock }) {
  const strong = block.tone === "strong";
  return (
    <section className="container-k py-12 sm:py-16">
      <div
        className={cn(
          "stitch relative isolate mx-auto max-w-4xl overflow-hidden rounded-[2rem] px-6 py-12 text-center sm:px-12 sm:py-16",
          strong ? "bg-primary text-primary-foreground outline-white/40" : "bg-secondary/70 outline-leaf/30",
        )}
      >
        {block.eyebrow && <p className={cn("eyebrow", strong && "text-sun")}>{block.eyebrow}</p>}
        {block.title && <h2 className="mx-auto mt-2 max-w-2xl text-3xl leading-tight font-semibold sm:text-4xl">{block.title}</h2>}
        {block.content && (
          <div
            className={cn("prose-k mx-auto mt-5 max-w-2xl", strong ? "text-primary-foreground/90 [&_a]:text-white" : "")}
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        )}
        {block.button_label && block.button_url && (
          <Button asChild size="lg" variant={strong ? "secondary" : "default"} className={cn("mt-8", strong && "bg-card text-primary hover:bg-card/90")}>
            <SmartLink to={block.button_url}>
              {block.button_label}
              <ArrowRightIcon />
            </SmartLink>
          </Button>
        )}
        {block.fine_print && (
          <p className={cn("mx-auto mt-8 max-w-2xl text-xs leading-relaxed", strong ? "text-primary-foreground/75" : "text-muted-foreground")}>
            {block.fine_print}
          </p>
        )}
      </div>
    </section>
  );
}

export function Faq({ block }: { block: FaqBlock }) {
  return (
    <section className="container-k py-14 sm:py-20">
      <div className="mx-auto max-w-3xl">
        {block.title && <h2 className="mb-8 text-center text-3xl font-semibold sm:text-4xl">{block.title}</h2>}
        <Accordion type="single" collapsible className="rounded-2xl border-2 border-border bg-card px-5 sm:px-8">
          {(block.items ?? []).map((item, i) => (
            <AccordionItem key={i} value={`q${i}`}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent className="text-base leading-relaxed">{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

export function Contact({ block, settings }: { block: ContactBlock; settings: SiteSettings }) {
  const phone = settings.whatsapp_number?.replace(/\D/g, "");
  return (
    <section className="container-k py-14 sm:py-20">
      <div className="mx-auto grid max-w-4xl items-center gap-8 rounded-[2rem] border-2 border-border bg-card p-8 sm:p-12 md:grid-cols-[1.2fr_1fr]">
        <div className="text-center md:text-left">
          {block.title && <h2 className="text-3xl leading-tight font-semibold sm:text-4xl">{block.title}</h2>}
          {block.content && <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{block.content}</p>}
        </div>
        <div className="flex flex-col gap-3">
          {phone ? (
            <Button asChild size="lg" className="bg-[#25D366] text-white shadow-[#25D366]/30 hover:bg-[#1fb457]">
              <a href={`https://wa.me/${phone}`} target="_blank" rel="noopener noreferrer">
                <MessageCircleIcon /> {block.whatsapp_label || "WhatsApp"}
              </a>
            </Button>
          ) : (
            block.whatsapp_pending && (
              <p className="flex items-start gap-3 rounded-xl bg-muted p-4 text-sm text-muted-foreground">
                <MessageCircleIcon className="mt-0.5 size-5 shrink-0 text-leaf" /> {block.whatsapp_pending}
              </p>
            )
          )}
          {settings.contact_email ? (
            <Button asChild size="lg" variant="outline">
              <a href={`mailto:${settings.contact_email}`}>
                <MailIcon /> {block.email_label || settings.contact_email}
              </a>
            </Button>
          ) : (
            block.email_pending && (
              <p className="flex items-start gap-3 rounded-xl bg-muted p-4 text-sm text-muted-foreground">
                <MailIcon className="mt-0.5 size-5 shrink-0 text-primary" /> {block.email_pending}
              </p>
            )
          )}
        </div>
      </div>
    </section>
  );
}
