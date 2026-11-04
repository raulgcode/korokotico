import { useEffect, useState } from "react";
import { useFetchers, useNavigation } from "react-router";
import { LoaderCircleIcon } from "lucide-react";

/** Tiempo antes de mostrar la barra, para que las cargas rápidas no parpadeen */
const SHOW_AFTER_MS = 150;
/** Si tarda más que esto, el CMS probablemente está despertando: avisamos con un mensaje */
const SLOW_AFTER_MS = 2500;

/**
 * Barra de progreso arriba de la página y aviso flotante mientras la web espera al servidor
 * (navegación entre páginas, formularios y acciones con fetcher). En el plan gratuito de Fly
 * el CMS se apaga y tarda unos segundos en despertar; así el cliente ve que algo está pasando.
 */
export function NavigationProgress() {
  const navigation = useNavigation();
  const fetchers = useFetchers();
  const busy = navigation.state !== "idle" || fetchers.some((f) => f.state !== "idle");
  const saving = navigation.state === "submitting" || fetchers.some((f) => f.state === "submitting");

  const [visible, setVisible] = useState(false);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!busy) {
      setVisible(false);
      setSlow(false);
      return;
    }
    const show = setTimeout(() => setVisible(true), SHOW_AFTER_MS);
    const warn = setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    return () => {
      clearTimeout(show);
      clearTimeout(warn);
    };
  }, [busy]);

  return (
    <>
      <div
        role="progressbar"
        aria-label="Cargando"
        aria-hidden={!visible}
        className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-1 overflow-hidden transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {visible && <div className="nav-progress-bar h-full w-1/3 rounded-full bg-primary" />}
      </div>
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex justify-center px-4">
        {visible && slow && (
          <div className="flex items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm font-bold text-background shadow-lg animate-in fade-in-0 slide-in-from-bottom-2">
            <LoaderCircleIcon className="size-4 shrink-0 animate-spin" />
            {saving ? "Guardando… puede tardar unos segundos" : "Cargando… puede tardar unos segundos"}
          </div>
        )}
      </div>
    </>
  );
}
