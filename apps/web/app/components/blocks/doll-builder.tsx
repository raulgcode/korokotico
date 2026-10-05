import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BanIcon,
  BringToFrontIcon,
  CheckIcon,
  MinusIcon,
  MoveIcon,
  PlusIcon,
  RotateCcwIcon,
  RulerIcon,
  SendToBackIcon,
  ShuffleIcon,
  Undo2Icon,
} from "lucide-react";
import { Dialog } from "radix-ui";
import { useEffect, useMemo, useRef, useState } from "react";
import { Form, useActionData, useNavigation, useSearchParams, useSubmit } from "react-router";
import { SectionHeading } from "~/components/section-heading";
import { SmartLink } from "~/components/smart-link";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import { assetUrl } from "~/lib/assets";
import type { DollErrors } from "~/lib/orders.server";
import type { CreateFormBlock, DollPart, DollPartType, DollPosition, Shop } from "~/lib/types";
import { cn, formatPrice } from "~/lib/utils";
import { FieldError, PackagePicker, Step } from "./create-form";

type Props = { block: CreateFormBlock; types: DollPartType[]; shop: Shop };
type Selection = Record<number, number[]>;
/** Posición en % del lienzo; el alto sale de la proporción de la imagen */
type Box = { x: number; y: number; w: number };
type Layer = { part: DollPart; type: DollPartType; layer: number; box: Box | null };

const boxOf = (p: DollPosition): Box | null =>
  p.pos_width ? { x: p.pos_x ?? 0, y: p.pos_y ?? 0, w: p.pos_width } : null;

/** Piezas elegidas al empezar: las marcadas en el CMS, o la primera de cada tipo obligatorio */
function initialSelection(types: DollPartType[]): Selection {
  return Object.fromEntries(
    types.map((t) => {
      const defaults = t.parts.filter((p) => p.is_default).map((p) => p.id);
      const ids = t.multiple ? defaults : defaults.slice(0, 1);
      return [t.id, ids.length || !t.required ? ids : [t.parts[0].id]];
    }),
  );
}

function randomSelection(types: DollPartType[]): Selection {
  const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];
  return Object.fromEntries(
    types.map((t) => {
      if (t.multiple) return [t.id, t.parts.filter(() => Math.random() < 0.3).slice(0, 2).map((p) => p.id)];
      if (!t.required && Math.random() < 0.25) return [t.id, []];
      return [t.id, [pick(t.parts).id]];
    }),
  );
}

const layerUrl = (part: DollPart, width: number) => assetUrl(part.image, { width, quality: 90 })!;

/** Dibuja las capas en un canvas (igual que la vista previa) y devuelve el PNG del diseño final */
async function composeDesign(layers: Layer[], width: number, height: number, background: string | null) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);
  }
  const images = await Promise.all(
    layers.map(async ({ part }) => {
      const img = new Image();
      img.src = layerUrl(part, width);
      await img.decode();
      return img;
    }),
  );
  layers.forEach(({ box }, i) => {
    const img = images[i];
    const ratio = img.naturalWidth && img.naturalHeight ? img.naturalHeight / img.naturalWidth : height / width;
    if (box) {
      const w = (box.w / 100) * width;
      ctx.drawImage(img, (box.x / 100) * width, (box.y / 100) * height, w, w * ratio);
    } else {
      // Sin posición: la imagen ocupa el lienzo sin deformarse
      const scale = Math.min(width, height / ratio);
      const w = scale;
      const h = scale * ratio;
      ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h);
    }
  });
  return new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob"))), "image/png"));
}

/** Caja que ocupa una imagen sin posición (encajada en el lienzo sin deformarse) */
function fittedBox(img: HTMLImageElement, width: number, height: number): Box {
  const ratio = img.naturalWidth && img.naturalHeight ? img.naturalHeight / img.naturalWidth : height / width;
  const canvasRatio = height / width;
  if (ratio <= canvasRatio) return { x: 0, y: ((1 - ratio / canvasRatio) / 2) * 100, w: 100 };
  const w = (canvasRatio / ratio) * 100;
  return { x: (100 - w) / 2, y: 0, w };
}

type Editing = { partId: number; onChange: (box: Box) => void };

function DollPreview({
  layers,
  width,
  height,
  background,
  className,
  editing,
}: {
  layers: Layer[];
  width: number;
  height: number;
  background: string | null;
  className?: string;
  editing?: Editing;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Arrastra la pieza elegida para moverla y la esquina para cambiar su tamaño
  function startDrag(event: React.PointerEvent<HTMLElement>, box: Box | null, mode: "move" | "resize") {
    if (!editing || !ref.current) return;
    event.preventDefault();
    event.stopPropagation();
    const img = (event.currentTarget.closest("[data-layer]") as HTMLElement | null)?.querySelector("img");
    const from = box ?? (img ? fittedBox(img, width, height) : { x: 0, y: 0, w: 100 });
    const rect = ref.current.getBoundingClientRect();
    const start = { x: event.clientX, y: event.clientY };
    const round = (n: number) => Math.round(n * 10) / 10;
    const move = (e: PointerEvent) => {
      const dx = ((e.clientX - start.x) / rect.width) * 100;
      const dy = ((e.clientY - start.y) / rect.height) * 100;
      editing.onChange(
        mode === "move" ? { ...from, x: round(from.x + dx), y: round(from.y + dy) } : { ...from, w: round(Math.max(3, from.w + dx)) },
      );
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  return (
    <div
      ref={ref}
      className={cn("relative mx-auto overflow-hidden rounded-[1.75rem]", className)}
      style={{ aspectRatio: `${width} / ${height}`, background: background ?? undefined }}
    >
      {layers.map(({ part, box }) => {
        const active = editing?.partId === part.id;
        return (
          <div
            key={part.id}
            data-layer
            className={cn("absolute", !box && "inset-0", active ? "cursor-move touch-none outline-2 outline-primary outline-dashed" : "pointer-events-none")}
            style={box ? { left: `${box.x}%`, top: `${box.y}%`, width: `${box.w}%` } : undefined}
            onPointerDown={active ? (e) => startDrag(e, box, "move") : undefined}
          >
            <img
              src={layerUrl(part, width)}
              alt=""
              draggable={false}
              className={cn("select-none", box ? "block h-auto w-full" : "size-full object-contain")}
            />
            {active && (
              <span
                aria-hidden
                className="absolute -right-2.5 -bottom-2.5 size-5 cursor-nwse-resize touch-none rounded-full border-2 border-background bg-primary shadow"
                onPointerDown={(e) => startDrag(e, box, "resize")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function DollBuilder({ block, types, shop }: Props) {
  const width = block.canvas_width || 1000;
  const height = block.canvas_height || 1400;
  const background = block.canvas_background || null;

  const actionData = useActionData() as { errors?: DollErrors } | undefined;
  const serverErrors = actionData?.errors ?? {};
  const navigation = useNavigation();
  const submit = useSubmit();
  const submitting = navigation.state !== "idle" && navigation.formData?.get("intent") === "add-doll";

  const [selection, setSelection] = useState<Selection>(() => initialSelection(types));
  const [history, setHistory] = useState<Selection[]>([]);
  const [activeType, setActiveType] = useState(types[0]?.id);
  const [packageId, setPackageId] = useState(String(shop.packages[0]?.id ?? ""));
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [units, setUnits] = useState(1);
  const [name, setName] = useState("");
  const [review, setReview] = useState<{ url: string; blob: Blob } | null>(null);
  const [composing, setComposing] = useState(false);
  const [clientErrors, setClientErrors] = useState<DollErrors>({});
  const formRef = useRef<HTMLFormElement>(null);
  // ?ajustar=1: herramienta para medir dónde va cada tipo de pieza y copiarlo a Directus
  const [searchParams] = useSearchParams();
  const adjusting = searchParams.has("ajustar");
  const [adjusted, setAdjusted] = useState<Record<number, Box>>({});
  // Lo que el cliente mueve o agranda, y el orden de capas que elige (por pieza)
  const [custom, setCustom] = useState<Record<number, Box>>({});
  const [order, setOrder] = useState<Record<number, number>>({});
  const [editingPart, setEditingPart] = useState<number | null>(null);
  const errors = { ...serverErrors, ...clientErrors };

  // Si el servidor rechaza el diseño, se cierra la revisión para mostrar el error
  useEffect(() => {
    if (actionData?.errors) setReview(null);
  }, [actionData]);
  useEffect(() => () => void (review && URL.revokeObjectURL(review.url)), [review]);

  const layers = useMemo<Layer[]>(
    () =>
      types
        .flatMap((type) =>
          (selection[type.id] ?? []).flatMap((id) => {
            const part = type.parts.find((p) => p.id === id);
            if (!part) return [];
            const box = (adjusting ? null : custom[part.id]) ?? boxOf(part) ?? adjusted[type.id] ?? boxOf(type);
            return [{ part, type, layer: order[part.id] ?? part.layer ?? type.layer, box }];
          }),
        )
        .sort((a, b) => a.layer - b.layer),
    [types, selection, adjusted, custom, order, adjusting],
  );
  const editingLayer = layers.find((l) => l.part.id === editingPart) ?? null;

  const pkg = shop.packages.find((p) => String(p.id) === packageId);
  const partsPrice = layers.reduce((s, l) => s + (l.part.price ?? 0), 0);
  const addonsPrice = pkg?.includes_addons ? 0 : shop.addons.filter((a) => addonIds.includes(String(a.id))).reduce((s, a) => s + a.price, 0);
  const unitPrice = (pkg?.price ?? 0) + addonsPrice + partsPrice;

  if (!types.length) {
    return (
      <section className="container-k py-12 sm:py-16">
        {block.show_heading && <SectionHeading eyebrow={block.eyebrow} title={block.title} subtitle={block.subtitle} className="mb-8" />}
        <p className="mx-auto max-w-lg rounded-[2rem] border-2 border-dashed bg-card p-8 text-center text-muted-foreground">
          {block.empty_message || "Muy pronto podrás diseñar tu muñeco aquí."}
        </p>
      </section>
    );
  }

  function update(next: Selection) {
    setHistory((h) => [...h.slice(-30), selection]);
    setSelection(next);
    setClientErrors({});
  }

  function toggle(type: DollPartType, part: DollPart | null) {
    const current = selection[type.id] ?? [];
    let ids: number[];
    if (!part) ids = [];
    else if (type.multiple) ids = current.includes(part.id) ? current.filter((id) => id !== part.id) : [...current, part.id];
    else ids = current.includes(part.id) && !type.required ? [] : [part.id];
    update({ ...selection, [type.id]: ids });
    setEditingPart(part && ids.includes(part.id) ? part.id : null);
  }

  /** Mueve la pieza una capa adelante (+1) o atrás (-1) intercambiándola con su vecina */
  function moveLayer(partId: number, direction: 1 | -1) {
    const index = layers.findIndex((l) => l.part.id === partId);
    const other = layers[index + direction];
    if (index < 0 || !other) return;
    const current = layers[index];
    const a = current.layer;
    const b = other.layer === a ? a + direction * 0.5 : other.layer;
    setOrder((o) => ({ ...o, [current.part.id]: b, [other.part.id]: a }));
  }

  async function openReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const missing = types.find((t) => t.required && !(selection[t.id] ?? []).length);
    const next: DollErrors = {};
    if (missing) next.parts = `Elige ${missing.name.toLowerCase()} para tu muñeco.`;
    if (!name.trim()) next.character_name = "Cuéntanos cómo se llamará tu muñeco.";
    if (!pkg) next.package = "Elige un paquete.";
    setClientErrors(next);
    if (Object.keys(next).length) {
      if (missing) setActiveType(missing.id);
      return;
    }
    setComposing(true);
    try {
      const blob = await composeDesign(layers, width, height, background);
      setReview({ url: URL.createObjectURL(blob), blob });
    } catch (error) {
      console.error(error);
      setClientErrors({ design: "No pudimos generar la imagen de tu diseño. Inténtalo de nuevo." });
    } finally {
      setComposing(false);
    }
  }

  function confirm() {
    if (!review || !formRef.current) return;
    const data = new FormData(formRef.current);
    data.set("design", new File([review.blob], "diseno.png", { type: "image/png" }));
    submit(data, { method: "post", encType: "multipart/form-data", preventScrollReset: true });
  }

  const type = types.find((t) => t.id === activeType) ?? types[0];
  const chosen = selection[type.id] ?? [];

  return (
    <section id="disena" className="container-k scroll-mt-28 py-12 sm:py-16">
      {block.show_heading && <SectionHeading eyebrow={block.eyebrow} title={block.title} subtitle={block.subtitle} className="mb-10" />}

      <Form ref={formRef} method="post" onSubmit={openReview} className="grid items-start gap-6 lg:grid-cols-[minmax(0,24rem)_1fr] lg:gap-8">
        <input type="hidden" name="intent" value="add-doll" />
        {layers.map(({ part }) => (
          <input key={part.id} type="hidden" name="parts" value={part.id} />
        ))}
        <input
          type="hidden"
          name="layout"
          value={JSON.stringify(layers.map(({ part, box }, z) => ({ id: part.id, z, ...(custom[part.id] && box ? box : {}) })))}
        />

        {/* Vista previa: fija arriba en el celular, a la izquierda en escritorio */}
        <aside className="sticky top-16 z-20 -mx-4 min-w-0 bg-background/95 px-4 py-2 backdrop-blur lg:top-28 lg:mx-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
          <Card className="stitch gap-4 border-0 bg-accent/60 py-3 shadow-none outline-primary/30 lg:py-6">
            <CardContent className="flex items-center gap-4 px-4 lg:block lg:space-y-4 lg:px-6">
              <DollPreview
                layers={layers}
                width={width}
                height={height}
                background={background}
                className="mx-0 h-[26vh] shrink-0 lg:mx-auto lg:h-auto lg:w-full"
                editing={
                  adjusting
                    ? chosen[0]
                      ? { partId: chosen[0], onChange: (box) => setAdjusted((a) => ({ ...a, [type.id]: box })) }
                      : undefined
                    : editingLayer
                      ? { partId: editingLayer.part.id, onChange: (box) => setCustom((c) => ({ ...c, [editingLayer.part.id]: box })) }
                      : undefined
                }
              />
              <div className="flex min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-2">
                <div>
                  <p className="font-display text-lg leading-tight font-semibold">{name || "Tu muñeco"}</p>
                  <p className="text-sm font-bold text-primary">{formatPrice(unitPrice * units)}</p>
                </div>
                <div className="flex gap-1">
                  <Button type="button" variant="outline" size="icon" aria-label="Deshacer" disabled={!history.length} onClick={() => {
                    setSelection(history[history.length - 1]);
                    setHistory((h) => h.slice(0, -1));
                  }}>
                    <Undo2Icon />
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => update(randomSelection(types))}>
                    <ShuffleIcon /> Al azar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>

        <div className="min-w-0 space-y-6">
          {adjusting && <AdjustPanel type={type} box={adjusted[type.id] ?? boxOf(type)} onChange={(box) => setAdjusted((a) => ({ ...a, [type.id]: box }))} />}
          {errors.form && <p className="rounded-xl bg-destructive/10 p-4 font-semibold text-destructive">{errors.form}</p>}

          <Step title={block.step1_title}>
            <div role="tablist" aria-label="Tipos de pieza" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {types.map((t) => {
                const count = (selection[t.id] ?? []).length;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={t.id === type.id}
                    onClick={() => setActiveType(t.id)}
                    className={cn(
                      "shrink-0 rounded-full border-2 px-4 py-1.5 text-sm font-bold transition-colors",
                      t.id === type.id ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary/50",
                    )}
                  >
                    {t.name}
                    {count > 0 && t.id !== type.id && <CheckIcon className="ml-1 inline size-3.5" />}
                  </button>
                );
              })}
            </div>

            <div role="tabpanel" className="grid grid-cols-3 gap-3 sm:grid-cols-4 xl:grid-cols-5">
              {!type.required && !type.multiple && (
                <button
                  type="button"
                  onClick={() => toggle(type, null)}
                  aria-pressed={!chosen.length}
                  className={cn(
                    "flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border-2 bg-card text-xs font-bold text-muted-foreground",
                    !chosen.length && "border-primary text-primary",
                  )}
                >
                  <BanIcon className="size-6" /> Ninguno
                </button>
              )}
              {type.parts.map((part) => {
                const active = chosen.includes(part.id);
                return (
                  <button
                    key={part.id}
                    type="button"
                    onClick={() => toggle(type, part)}
                    aria-pressed={active}
                    className={cn(
                      "group relative flex flex-col overflow-hidden rounded-2xl border-2 bg-card text-left transition-colors hover:border-primary/50",
                      active && "border-primary ring-2 ring-primary/30",
                    )}
                  >
                    <span className="aspect-square w-full bg-accent/30 p-1.5">
                      <img
                        src={assetUrl(part.thumbnail ?? part.image, { width: 240 })}
                        alt=""
                        loading="lazy"
                        className="size-full object-contain"
                      />
                    </span>
                    <span className="px-2 py-1.5 text-xs leading-tight font-bold">
                      {part.name}
                      {!!part.price && <span className="block font-semibold text-primary">+{formatPrice(part.price)}</span>}
                    </span>
                    {active && (
                      <span className="absolute top-1.5 right-1.5 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
                        <CheckIcon className="size-3.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {type.multiple && <p className="text-xs text-muted-foreground">Puedes elegir varios.</p>}

            {!adjusting && layers.length > 0 && (
              <LayerEditor
                layers={layers}
                editing={editingLayer}
                onSelect={setEditingPart}
                onMove={moveLayer}
                onReset={(partId) => {
                  setCustom(({ [partId]: _, ...rest }) => rest);
                  setOrder(({ [partId]: _, ...rest }) => rest);
                }}
              />
            )}
            <FieldError id="parts-error" message={errors.parts} />
          </Step>

          <Step title={block.step2_title}>
            <div className="space-y-2">
              <Label htmlFor="doll-name">Nombre del muñeco</Label>
              <Input
                id="doll-name"
                name="character_name"
                maxLength={120}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Luna, la exploradora"
                aria-invalid={!!errors.character_name}
                aria-describedby="doll-name-error"
              />
              <FieldError id="doll-name-error" message={errors.character_name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doll-idea">Su historia o algo que debamos saber (opcional)</Label>
              <Textarea id="doll-idea" name="idea" maxLength={2000} placeholder="¿Para quién es? ¿Qué le gusta?" />
            </div>
          </Step>

          <Step title={block.step3_title}>
            <PackagePicker
              shop={shop}
              packageId={packageId}
              onPackageChange={setPackageId}
              addonIds={addonIds}
              onAddonsChange={setAddonIds}
              addonsTitle={block.addons_title}
              error={errors.package}
            />
            <div className="space-y-2 pt-2">
              <Label htmlFor="doll-units">{block.units_label || "Unidades"}</Label>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="icon" aria-label="Quitar una unidad" onClick={() => setUnits((u) => Math.max(1, u - 1))}>
                  <MinusIcon />
                </Button>
                <Input
                  id="doll-units"
                  name="units"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={20}
                  value={units}
                  onChange={(e) => setUnits(Math.min(20, Math.max(1, Number(e.target.value) || 1)))}
                  className="w-16 text-center font-bold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                />
                <Button type="button" variant="outline" size="icon" aria-label="Agregar una unidad" onClick={() => setUnits((u) => Math.min(20, u + 1))}>
                  <PlusIcon />
                </Button>
              </div>
            </div>
          </Step>

          <Card className="stitch gap-4 border-0 bg-accent/60 shadow-none outline-primary/30">
            <CardContent className="space-y-4">
              <PriceSummary pkgName={pkg?.name} base={(pkg?.price ?? 0) + addonsPrice} partsPrice={partsPrice} units={units} />
              {block.summary_note && <p className="text-xs leading-relaxed text-muted-foreground">{block.summary_note}</p>}
              <FieldError id="design-error" message={errors.design} />
              <Button type="submit" size="lg" className="w-full" disabled={composing || submitting}>
                {composing ? "Preparando tu diseño…" : "Revisar mi diseño"}
                {!composing && <ArrowRightIcon />}
              </Button>
              {block.size_note && (
                <p className="flex gap-2 text-xs text-muted-foreground">
                  <RulerIcon className="size-4 shrink-0 text-primary" /> {block.size_note}
                </p>
              )}
              {block.process_link_label && block.process_link_url && (
                <SmartLink to={block.process_link_url} className="inline-flex items-center gap-1 text-sm font-extrabold text-primary hover:underline">
                  {block.process_link_label} <ArrowRightIcon className="size-4" />
                </SmartLink>
              )}
            </CardContent>
          </Card>
        </div>
      </Form>

      <Dialog.Root open={!!review} onOpenChange={(open) => !open && !submitting && setReview(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed inset-x-4 top-1/2 z-50 mx-auto max-h-[92vh] max-w-3xl -translate-y-1/2 overflow-y-auto rounded-[2rem] bg-background p-5 shadow-xl sm:p-8">
            <Dialog.Title className="font-display text-3xl font-semibold">{block.review_title || "Así quedará tu muñeco"}</Dialog.Title>
            {block.review_note && <Dialog.Description className="mt-2 text-muted-foreground">{block.review_note}</Dialog.Description>}
            <div className="mt-6 grid gap-6 sm:grid-cols-[minmax(0,1fr)_16rem]">
              {review && (
                <img src={review.url} alt={`Diseño de ${name}`} className="mx-auto max-h-[50vh] rounded-[1.5rem] bg-accent/40 object-contain sm:max-h-[60vh]" />
              )}
              <div className="space-y-4 text-sm">
                <p className="font-display text-2xl font-semibold">{name}</p>
                <ul className="space-y-1">
                  {layers.map(({ part, type }) => (
                    <li key={part.id} className="flex justify-between gap-3">
                      <span>
                        <span className="text-muted-foreground">{type.name}:</span> <span className="font-semibold">{part.name}</span>
                      </span>
                      {!!part.price && <span className="font-bold whitespace-nowrap">+{formatPrice(part.price)}</span>}
                    </li>
                  ))}
                </ul>
                <Separator className="bg-primary/20" />
                <PriceSummary pkgName={pkg?.name} base={(pkg?.price ?? 0) + addonsPrice} partsPrice={partsPrice} units={units} />
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" size="lg" disabled={submitting} onClick={() => setReview(null)}>
                <ArrowLeftIcon /> Volver a editar
              </Button>
              <Button type="button" size="lg" disabled={submitting} onClick={confirm}>
                {submitting ? "Guardando…" : block.submit_label || "Confirmar y agregar al carrito"}
                {!submitting && <ArrowRightIcon />}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}

function PriceSummary({ pkgName, base, partsPrice, units }: { pkgName?: string; base: number; partsPrice: number; units: number }) {
  return (
    <dl className="space-y-1.5 text-sm">
      <div className="flex justify-between gap-4">
        <dt>{pkgName ?? "Paquete"}</dt>
        <dd className="font-bold">{formatPrice(base)}</dd>
      </div>
      {partsPrice > 0 && (
        <div className="flex justify-between gap-4">
          <dt>Piezas especiales</dt>
          <dd className="font-bold">+{formatPrice(partsPrice)}</dd>
        </div>
      )}
      <div className="flex justify-between gap-4">
        <dt>Unidades</dt>
        <dd className="font-bold">{units}</dd>
      </div>
      <div className="flex justify-between gap-4 border-t-2 border-dashed border-primary/25 pt-2 text-base">
        <dt className="font-bold">Subtotal</dt>
        <dd className="font-display text-2xl font-semibold text-primary">{formatPrice((base + partsPrice) * units)}</dd>
      </div>
    </dl>
  );
}

/** Herramientas del cliente: elegir una pieza, traerla adelante, mandarla atrás o restablecerla */
function LayerEditor({
  layers,
  editing,
  onSelect,
  onMove,
  onReset,
}: {
  layers: Layer[];
  editing: Layer | null;
  onSelect: (partId: number | null) => void;
  onMove: (partId: number, direction: 1 | -1) => void;
  onReset: (partId: number) => void;
}) {
  const index = editing ? layers.indexOf(editing) : -1;
  return (
    <div className="space-y-3 rounded-2xl bg-accent/40 p-4">
      <p className="flex items-center gap-2 text-sm font-bold">
        <MoveIcon className="size-4 text-primary" /> Ajusta cada pieza
      </p>
      <div className="flex flex-wrap gap-1.5">
        {[...layers].reverse().map((l) => (
          <button
            key={l.part.id}
            type="button"
            onClick={() => onSelect(editing?.part.id === l.part.id ? null : l.part.id)}
            aria-pressed={editing?.part.id === l.part.id}
            className={cn(
              "rounded-full border-2 bg-card px-3 py-1 text-xs font-bold",
              editing?.part.id === l.part.id ? "border-primary text-primary" : "hover:border-primary/50",
            )}
          >
            {l.type.name}: {l.part.name}
          </button>
        ))}
      </div>
      {editing ? (
        <>
          <p className="text-xs text-muted-foreground">
            Arrastra «{editing.part.name}» en la vista previa para moverla y usa el punto de la esquina para cambiar su tamaño.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" disabled={index >= layers.length - 1} onClick={() => onMove(editing.part.id, 1)}>
              <BringToFrontIcon /> Traer adelante
            </Button>
            <Button type="button" variant="outline" size="sm" disabled={index <= 0} onClick={() => onMove(editing.part.id, -1)}>
              <SendToBackIcon /> Enviar atrás
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => onReset(editing.part.id)}>
              <RotateCcwIcon /> Restablecer
            </Button>
          </div>
        </>
      ) : (
        <p className="text-xs text-muted-foreground">Toca una pieza de la lista para moverla, cambiar su tamaño o su capa.</p>
      )}
    </div>
  );
}

/** Panel del modo ajuste (?ajustar=1): muestra los valores para copiar en Directus → Tipos de pieza */
function AdjustPanel({ type, box, onChange }: { type: DollPartType; box: Box | null; onChange: (box: Box) => void }) {
  return (
    <div className="space-y-3 rounded-2xl border-2 border-dashed border-primary bg-card p-5 text-sm">
      <p className="font-bold">Modo ajuste · {type.name}</p>
      {box ? (
        <>
          <p className="text-muted-foreground">
            Arrastra la pieza en la vista previa para moverla y usa el punto de la esquina para cambiar su ancho. Luego copia estos valores
            en Directus → Creador de muñecos → Tipos de pieza → {type.name}.
          </p>
          <dl className="grid grid-cols-3 gap-2 text-center">
            {(
              [
                ["Izquierda (%)", box.x],
                ["Arriba (%)", box.y],
                ["Ancho (%)", box.w],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="rounded-xl bg-accent/50 p-2">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="font-display text-xl font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </>
      ) : (
        <div className="space-y-2">
          <p className="text-muted-foreground">Este tipo no tiene posición: sus imágenes ocupan todo el lienzo (lo normal para el cuerpo).</p>
          <Button type="button" variant="outline" size="sm" onClick={() => onChange({ x: 25, y: 25, w: 50 })}>
            Darle una posición
          </Button>
        </div>
      )}
    </div>
  );
}
