import type { Block, CatalogCollection, DollPartType, Shop, SiteSettings } from "~/lib/types";
import { Collections, Contact, Cta, Faq, Hero, PageHeader, RichText, Steps, Story } from "./content-blocks";
import { CreateForm } from "./create-form";
import { DollBuilder } from "./doll-builder";

type Props = {
  blocks: Block[];
  settings: SiteSettings;
  collections: CatalogCollection[];
  shop: Shop | null;
  dollParts?: DollPartType[];
};

/** Pinta las secciones de una página en el orden definido en el CMS */
export function BlockRenderer({ blocks, settings, collections, shop, dollParts = [] }: Props) {
  return (
    <>
      {blocks.map((block) => {
        if (!block.item) return null;
        const key = `${block.collection}-${block.id}`;
        switch (block.collection) {
          case "block_hero":
            return <Hero key={key} block={block.item} />;
          case "block_page_header":
            return <PageHeader key={key} block={block.item} />;
          case "block_collections":
            return <Collections key={key} block={block.item} collections={collections} />;
          case "block_steps":
            return <Steps key={key} block={block.item} />;
          case "block_story":
            return <Story key={key} block={block.item} />;
          case "block_rich_text":
            return <RichText key={key} block={block.item} />;
          case "block_cta":
            return <Cta key={key} block={block.item} />;
          case "block_faq":
            return <Faq key={key} block={block.item} />;
          case "block_contact":
            return <Contact key={key} block={block.item} settings={settings} />;
          case "block_create_form":
            if (block.item.mode === "creador") return shop ? <DollBuilder key={key} block={block.item} types={dollParts} shop={shop} /> : null;
            return shop ? <CreateForm key={key} block={block.item} collections={collections} shop={shop} /> : null;
          default:
            return null;
        }
      })}
    </>
  );
}
