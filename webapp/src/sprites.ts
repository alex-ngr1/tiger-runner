import altushkaUrl from "./assets/altushka.png";
import altHudUrl from "./assets/altushka-hud.png";
import bottleUrl from "./assets/bottle.png";
import kioskUrl from "./assets/kiosk.png";
import trailerUrl from "./assets/trailer.png";

export const sprites = {
  altushka: null as HTMLImageElement | null,
  altHud: null as HTMLImageElement | null,
  bottle: null as HTMLImageElement | null,
  kiosk: null as HTMLImageElement | null,
  trailer: null as HTMLImageElement | null,
};

function load(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`sprite failed: ${src}`));
    img.src = src;
  });
}

export function loadSprites(): Promise<void> {
  return Promise.all([
    load(altushkaUrl).then((img) => {
      sprites.altushka = img;
    }),
    load(altHudUrl).then((img) => {
      sprites.altHud = img;
    }),
    load(bottleUrl).then((img) => {
      sprites.bottle = img;
    }),
    load(kioskUrl).then((img) => {
      sprites.kiosk = img;
    }),
    load(trailerUrl).then((img) => {
      sprites.trailer = img;
    }),
  ]).then(() => undefined);
}

export { altHudUrl };
