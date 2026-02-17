import { env } from "./config.ts";

export interface BrandConfig {
    id: "asfa" | "mafa";
    name: string;
    igUserId: string | undefined;
    r2Folder: string;
    prefix: {
        video: string;
        audio: string;
    };
    maxAssets: {
        videos: number;
        audios: number;
    };
    tables: {
        t1: string | undefined;
        t2: string | undefined;
    };
}

export const BRANDS: Record<string, BrandConfig> = {
    asfa: {
        id: "asfa",
        name: "Astrología Familiar",
        igUserId: env.IG_USER_ID,
        r2Folder: "AstrologiaFamiliar",
        prefix: {
            video: "ASFA_VID_",
            audio: "ASFA_AUD_",
        },
        maxAssets: {
            videos: 28,
            audios: 10,
        },
        tables: {
            t1: env.AIRTABLE_ASFA_T1_TABLE_ID,
            t2: env.AIRTABLE_ASFA_T2_TABLE_ID,
        },
    },
    mafa: {
        id: "mafa",
        name: "Manual Familiar",
        igUserId: env.IG_MAFA_USER_ID,
        r2Folder: "ManualFamiliar",
        prefix: {
            video: "M_VID_",
            audio: "M_AUD_",
        },
        maxAssets: {
            videos: 24,
            audios: 4,
        },
        tables: {
            t1: env.AIRTABLE_MAFA_T1_TABLE_ID,
            t2: env.AIRTABLE_MAFA_T2_TABLE_ID,
        },
    },
};

export function getBrandFromTemplateId(templateId: string): BrandConfig {
    if (templateId.toLowerCase().startsWith("mafa-")) {
        return BRANDS.mafa;
    }
    return BRANDS.asfa;
}
