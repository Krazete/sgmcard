const VERSION = "3.0.0"; /* update whenever anything changes */

self.addEventListener("install", event => {
    // console.log("PWA Install: " + VERSION);
    self.skipWaiting();
    event.waitUntil((async () => {
        const assets = [
            "./",
            "./font/TBCinemaRGothic-M.ttf",
            "./font/Typo_DodamM.ttf",
            "./font/WashingtonBoldDynamic.otf",
            "./fragment/BronzeBottom.png",
            "./fragment/BronzeElement.png",
            "./fragment/BronzeLevel.png",
            "./fragment/BronzeTop.png",
            "./fragment/DiamondBottom.png",
            "./fragment/DiamondElement.png",
            "./fragment/DiamondLevel.png",
            "./fragment/DiamondTop.png",
            "./fragment/ElementalIconDark.png",
            "./fragment/ElementalIconFire.png",
            "./fragment/ElementalIconLight.png",
            "./fragment/ElementalIconNeutral.png",
            "./fragment/ElementalIconWater.png",
            "./fragment/ElementalIconWind.png",
            "./fragment/EnergyBlank.png",
            "./fragment/EnergyIcon-Blue.png",
            "./fragment/EnergyIcon.png",
            "./fragment/GoldBottom.png",
            "./fragment/GoldElement.png",
            "./fragment/GoldLevel.png",
            "./fragment/GoldTop.png",
            "./fragment/GreyBackground.png",
            "./fragment/SilverBottom.png",
            "./fragment/SilverElement.png",
            "./fragment/SilverLevel.png",
            "./fragment/SilverTop.png",
            "./fragment/SkullTier.png",
            "./gradient/BronzeGradient.png",
            "./gradient/DiamondGradientDark.png",
            "./gradient/DiamondGradientLight.png",
            "./gradient/DiamondGradientMapFire.png",
            "./gradient/DiamondGradientMapNeutralB.png",
            "./gradient/DiamondGradientMapWind.png",
            "./gradient/DiamondGradientWater.png",
            "./gradient/GoldGradient.png",
            "./gradient/SilverGradient.png",
            "./index.css",
            "./index.js",
            "./library/FileSaver-js/FileSaver.min.js",
            "./library/gif-js/gif.js",
            "./library/iro.min.js",
            "./library/jsscrub.js",
            "./library/jszip/jszip.min.js",
            "./library/libgif-js/libgif.js",
            "./menu/ArrowGold.png",
            "./menu/ButtonTrash.png",
            "./menu/Checkmark.png",
            "./menu/Drag1F.png",
            "./menu/ElementalDarkBackless.png",
            "./menu/ElementalFireBackless.png",
            "./menu/ElementalLightBackless.png",
            "./menu/ElementalNeutralBackless.png",
            "./menu/ElementalUnknownBackless.png",
            "./menu/ElementalWaterBackless.png",
            "./menu/ElementalWindBackless.png",
            "./menu/LossMark.png",
            "./menu/constraints_bronze.png",
            "./menu/constraints_diamond.png",
            "./menu/constraints_gold.png",
            "./menu/constraints_no.png",
            "./menu/constraints_silver.png",
            "./menu/kofi.png"
        ];
        const cache = await caches.open(VERSION);
        cache.addAll(assets);
    })());
});

self.addEventListener("activate", event => {
    // console.log("PWA Activate: " + VERSION);
    self.clients.claim();
    event.waitUntil((async () => {
        const keys = await caches.keys();
        keys.forEach(async (key) => {
            if (key !== VERSION) {
                // console.log("PWA Delete: " + key);
                await caches.delete(key);
            }
        });
    })());
});

self.addEventListener("fetch", event => {
    // console.log("PWA Fetch: " + VERSION);
    event.respondWith((async () => {
        const cache = await caches.open(VERSION);
        const cacheResponse = await cache.match(event.request);
        if (cacheResponse) {
            return cacheResponse;
        }
        else {
            try {
                const fetchResponse = await fetch(event.request);
                if (event.request.method === "GET") {
                    cache.put(event.request, fetchResponse.clone());
                }
                return fetchResponse;
            }
            catch (e) {
                // console.warn(e);
            }
        }
    })());
});
