import { ArrowRightIcon, MinusIcon, PaperclipIcon, PlusIcon, RulerIcon, SparklesIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Form, useActionData, useNavigation } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import { SectionHeading } from "~/components/section-heading";
import { SmartLink } from "~/components/smart-link";
import type { CreateErrors } from "~/lib/orders.server";
import type { CatalogCollection, CreateFormBlock, Shop } from "~/lib/types";
import { cn, formatPrice } from "~/lib/utils";

type Props = {
  block: CreateFormBlock;
  collections: CatalogCollection[];
  shop: Shop;
  defaultCollection?: number;
  forceHeading?: boolean;
};

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-sm font-semibold text-destructive">
      {message}
    </p>
  );
}

export function Step({ title, children }: { title: string | null; children: React.ReactNode }) {
  return (
    <Card className="gap-5 border-2 shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">{children}</CardContent>
    </Card>
  );
}

export function CreateForm({ block, collections, shop, defaultCollection, forceHeading }: Props) {
  const actionData = useActionData() as { errors?: CreateErrors } | undefined;
  const errors = actionData?.errors ?? {};
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting" && navigation.formMethod === "POST";

  const [collectionId, setCollectionId] = useState(String(defaultCollection ?? collections[0]?.id ?? ""));
  const [packageId, setPackageId] = useState(String(shop.packages[0]?.id ?? ""));
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [units, setUnits] = useState(1);
  const [name, setName] = useState("");

  const pkg = shop.packages.find((p) => String(p.id) === packageId);
  const collection = collections.find((c) => String(c.id) === collectionId);
  const unitPrice = useMemo(() => {
    if (!pkg) return 0;
    if (pkg.includes_addons) return pkg.price;
    return pkg.price + shop.addons.filter((a) => addonIds.includes(String(a.id))).reduce((s, a) => s + a.price, 0);
  }, [pkg, addonIds, shop.addons]);

  const showHeading = forceHeading || block.show_heading;

  return (
    <section id="crear" className="container-k scroll-mt-28 py-12 sm:py-16">
      {showHeading && <SectionHeading eyebrow={block.eyebrow} title={block.title} subtitle={block.subtitle} className="mb-10" />}

      <Form method="post" encType="multipart/form-data" className="grid items-start gap-6 lg:grid-cols-[1fr_22rem] lg:gap-8">
        <input type="hidden" name="intent" value="add-to-cart" />
        <div className="space-y-6">
          {errors.form && <p className="rounded-xl bg-destructive/10 p-4 font-semibold text-destructive">{errors.form}</p>}

          <Step title={block.step1_title}>
            <div className="space-y-2">
              <Label htmlFor="collection">Colección</Label>
              <Select name="collection" value={collectionId} onValueChange={setCollectionId}>
                <SelectTrigger id="collection" aria-invalid={!!errors.collection} aria-describedby="collection-error">
                  <SelectValue placeholder="Elige una colección" />
                </SelectTrigger>
                <SelectContent>
                  {collections.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError id="collection-error" message={errors.collection} />
              {collection?.description && <p className="text-sm text-muted-foreground">{collection.description}</p>}
            </div>
          </Step>

          <Step title={block.step2_title}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="character_name">Nombre del personaje</Label>
                <Input
                  id="character_name"
                  name="character_name"
                  required
                  maxLength={120}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Luna, la perezosa valiente"
                  aria-invalid={!!errors.character_name}
                  aria-describedby="character_name-error"
                />
                <FieldError id="character_name-error" message={errors.character_name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="colors">Colores favoritos</Label>
                <Input id="colors" name="colors" maxLength={200} placeholder="Ej: verde menta y amarillo" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="idea">Cuéntanos tu idea</Label>
              <Textarea
                id="idea"
                name="idea"
                required
                maxLength={2000}
                placeholder="¿Cómo te lo imaginas? ¿Para quién es?"
                aria-invalid={!!errors.idea}
                aria-describedby="idea-error"
              />
              <FieldError id="idea-error" message={errors.idea} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interests">Gustos e intereses</Label>
              <Input id="interests" name="interests" maxLength={300} placeholder="Ej: le encantan los dinosaurios y el fútbol" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="references">
                <PaperclipIcon className="size-4 text-primary" /> Referencias (opcional)
              </Label>
              <Input
                id="references"
                name="references"
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="h-auto py-2.5"
                aria-invalid={!!errors.references}
                aria-describedby="references-note references-error"
              />
              {block.references_note && (
                <p id="references-note" className="text-xs text-muted-foreground">
                  {block.references_note}
                </p>
              )}
              <FieldError id="references-error" message={errors.references} />
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
          </Step>
        </div>

        <aside className="lg:sticky lg:top-28">
          <Card className="stitch gap-5 border-0 bg-accent/60 shadow-none outline-primary/30">
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="units">{block.units_label || "Unidades"}</Label>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="icon" aria-label="Quitar una unidad" onClick={() => setUnits((u) => Math.max(1, u - 1))}>
                    <MinusIcon />
                  </Button>
                  <Input
                    id="units"
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

              <Separator className="bg-primary/20" />

              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="sr-only">Personaje</dt>
                  <dd className="font-display text-xl font-semibold">{name || "Tu personaje"}</dd>
                  <dd className="text-muted-foreground">{collection?.title}</dd>
                </div>
                <div className="flex justify-between gap-4 pt-2">
                  <dt>Paquete</dt>
                  <dd className="font-bold">{formatPrice(unitPrice)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Unidades</dt>
                  <dd className="font-bold">{units}</dd>
                </div>
                <div className="flex justify-between gap-4 border-t-2 border-dashed border-primary/25 pt-3 text-base">
                  <dt className="font-bold">Subtotal</dt>
                  <dd className="font-display text-2xl font-semibold text-primary">{formatPrice(unitPrice * units)}</dd>
                </div>
              </dl>

              {block.summary_note && <p className="text-xs leading-relaxed text-muted-foreground">{block.summary_note}</p>}

              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? "Guardando…" : block.submit_label || "Agregar al carrito"}
                {!submitting && <ArrowRightIcon />}
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
        </aside>
      </Form>
    </section>
  );
}

type PackagePickerProps = {
  shop: Shop;
  packageId: string;
  onPackageChange: (id: string) => void;
  addonIds: string[];
  onAddonsChange: React.Dispatch<React.SetStateAction<string[]>>;
  addonsTitle: string | null;
  error?: string;
};

/** Paquetes y complementos (lo usan el formulario y el creador de muñecos) */
export function PackagePicker({ shop, packageId, onPackageChange, addonIds, onAddonsChange, addonsTitle, error }: PackagePickerProps) {
  const pkg = shop.packages.find((p) => String(p.id) === packageId);
  return (
    <>
      <RadioGroup name="package" value={packageId} onValueChange={onPackageChange} className="grid gap-3 sm:grid-cols-2">
        {shop.packages.map((p) => (
          <Label
            key={p.id}
            htmlFor={`package-${p.id}`}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-2xl border-2 bg-card p-5 leading-normal transition-colors hover:border-primary/50",
              packageId === String(p.id) && "border-primary bg-accent/40",
            )}
          >
            <RadioGroupItem id={`package-${p.id}`} value={String(p.id)} className="mt-1" />
            <span className="flex-1">
              <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span className="font-display text-lg font-semibold">{p.name}</span>
                <span className="font-extrabold text-primary">{formatPrice(p.price)}</span>
              </span>
              {p.description && <span className="mt-1 block text-sm font-normal text-muted-foreground">{p.description}</span>}
            </span>
          </Label>
        ))}
      </RadioGroup>
      <FieldError id="package-error" message={error} />

      {shop.addons.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="flex items-center gap-2 font-display text-xl font-semibold">
            <SparklesIcon className="size-5 text-sun" /> {addonsTitle}
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {shop.addons.map((a) => {
              const included = !!pkg?.includes_addons;
              const checked = included || addonIds.includes(String(a.id));
              return (
                <Label
                  key={a.id}
                  htmlFor={`addon-${a.id}`}
                  data-disabled={included}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border-2 bg-card px-4 py-3 font-semibold capitalize"
                >
                  <Checkbox
                    id={`addon-${a.id}`}
                    name="addons"
                    value={String(a.id)}
                    checked={checked}
                    disabled={included}
                    onCheckedChange={(v) =>
                      onAddonsChange((ids: string[]) => (v ? [...ids, String(a.id)] : ids.filter((x) => x !== String(a.id))))
                    }
                  />
                  <span className="flex-1">{a.name}</span>
                  <span className="text-sm font-bold text-muted-foreground normal-case">
                    {included ? "Incluido" : formatPrice(a.price)}
                  </span>
                </Label>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
