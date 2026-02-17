import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadRaleway } from "@remotion/google-fonts/Raleway";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
// import { loadFont as loadCinzel } from "@remotion/google-fonts/Cinzel";

import React from "react";

export interface BrandTheme {
    hook: {
        fontFamily: string;
        fontWeight: React.CSSProperties["fontWeight"];
        letterSpacing: string;
        fontSize?: string;
    };
    body: {
        fontFamily: string;
        fontWeight: React.CSSProperties["fontWeight"];
        letterSpacing: string;
    };
    overlay: {
        backgroundColor: string;
    };
}

// Preload fonts
const { fontFamily: frauncesFamily } = loadFraunces("normal", {
    weights: ["700"],
    subsets: ["latin"],
});
const { fontFamily: ralewayFamily } = loadRaleway("normal", {
    weights: ["400"],
    subsets: ["latin"],
});
const { fontFamily: playfairFamily } = loadPlayfair("normal", {
    weights: ["700"],
    subsets: ["latin"],
});
/*
const { fontFamily: cinzelFamily } = loadCinzel("normal", {
    weights: ["700"],
    subsets: ["latin"],
});
*/

export const THEMES: Record<"asfa" | "mafa", BrandTheme> = {
    asfa: {
        hook: {
            fontFamily: frauncesFamily,
            fontWeight: "700",
            letterSpacing: "0.03em",
        },
        body: {
            fontFamily: ralewayFamily,
            fontWeight: "400",
            letterSpacing: "normal",
        },
        overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
        },
    },
    mafa: {
        hook: {
            fontFamily: playfairFamily,
            fontWeight: "700",
            letterSpacing: "0.05em",
        },
        body: {
            fontFamily: ralewayFamily,
            fontWeight: "400",
            letterSpacing: "normal",
        },
        overlay: {
            backgroundColor: "rgba(20, 20, 20, 0.6)", // Slightly deeper for editorial feel
        },
    },
};

export function getThemeByBrand(brandId: string): BrandTheme {
    const id = brandId.toLowerCase();
    if (id === "mafa" || id === "asfa") {
        return THEMES[id];
    }
    return THEMES.asfa;
}
