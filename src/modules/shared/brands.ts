import { env } from "./config.ts";

export interface BrandAssets {
  /** R2 sub-folder path relative to r2Folder (e.g. "assets/videos") */
  videoFolder: string;
  /** R2 sub-folder path relative to r2Folder (e.g. "assets/audios") */
  audioFolder: string;
  /** Exact filenames of every available background video */
  videos: string[];
  /** Exact filenames of every available background audio */
  audios: string[];
}

export interface BrandConfig {
  id: "asfa" | "mafa";
  name: string;
  igUserId: string | undefined;
  r2Folder: string;
  assets: BrandAssets;
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
    assets: {
      videoFolder: "assets/videos",
      audioFolder: "assets/audios",
      videos: [
        "cmmby8lrc003331qlwmlvoh4h.mp4",
        "cmmby8lrm003431qlyefmxzdf.mp4",
        "cmmby8lrw003531ql47qkoo57.mp4",
        "cmmby8ls6003631qlxl471rn0.mp4",
        "cmmby8lsj003731qlfaoemzcs.mp4",
        "cmmby8lst003831qlbb3ivoiu.mp4",
        "cmmby8lt3003931qlls8k1h8x.mp4",
        "cmmby8ltd003a31ql504dwfwe.mp4",
        "cmmby8ltn003b31qlc8ffgm88.mp4",
        "cmmby8ltx003c31qllplqvv60.mp4",
        "cmmby8lu9003d31ql3oex53n9.mp4",
        "cmmby8luk003e31qlp9aiqb5e.mp4",
        "cmmby8luu003f31qliwzz9uco.mp4",
        "cmmby8lv8003g31qlxn8v2775.mp4",
        "cmmby8lvi003h31ql33b16jrw.mp4",
        "cmmby8lvr003i31ql7jfdye1f.mp4",
        "cmmby8lw2003j31qloz735vbq.mp4",
        "cmmby8lwc003k31ql9ib97424.mp4",
        "cmmby8lwm003l31ql5msfi88x.mp4",
        "cmmby8lwx003m31qlpy0kq7vq.mp4",
        "cmmby8lx7003n31qljoave0nx.mp4",
        "cmmby8lxh003o31qlmtkpx6sh.mp4",
        "cmmby8lxs003p31qlzf7fqsej.mp4",
        "cmmby8ly2003q31qlv5zx9vki.mp4",
        "cmmby8lyc003r31qlkuw0g4j0.mp4",
        "cmmby8lym003s31qlf8f92lx1.mp4",
        "cmmby8lyw003t31qlkzibblgq.mp4",
        "cmmby8lz7003u31qlkfpi04dm.mp4",
        "g3k48gqxv5196izy0wfs822f.mp4",
        "g44fnvdv3zfjm74ylzjv22j0.mp4",
        "htoobcd35xrkf8alfwqrt62v.mp4",
        "nj5rlchcn3h5e7e6iltbn6zq.mp4",
        "ut6rl8qotx7ip0qk2ybwnftw.mp4",
        "vz7rt1ncsd029bm2e91q95wa.mp4",
        "wh9ra796fo8msvjhqacp8a8i.mp4",
        "y06xkcojln0yt8jfzksxa6zz.mp4",
      ],
      audios: [
        "cmmby8iih000131qlwn1h62pn.m4a",
        "cmmby8ijb000231ql5xjfxr29.m4a",
        "cmmby8ijt000331qlec8ayx6x.m4a",
        "cmmby8ikf000431qlqx9kmml3.m4a",
        "cmmby8il3000531qli4j8ef2j.m4a",
        "cmmby8im3000631qlz0zc9o0k.m4a",
        "cmmby8is5000731qlemwf2kev.m4a",
        "cmmby8isl000831qlc9m6fug4.m4a",
        "cmmby8it0000931qlekuhdwrv.m4a",
        "cmmby8ite000a31qlwr1d27xh.m4a",
      ],
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
    assets: {
      videoFolder: "videos",
      audioFolder: "audios",
      videos: [
        "M_VID_0001.mp4",
        "M_VID_0002.mp4",
        "M_VID_0003.mp4",
        "M_VID_0004.mp4",
        "M_VID_0005.mp4",
        "M_VID_0006.mp4",
        "M_VID_0007.mp4",
        "M_VID_0008.mp4",
        "M_VID_0009.mp4",
        "M_VID_0010.mp4",
        "M_VID_0011.mp4",
        "M_VID_0012.mp4",
        "M_VID_0013.mp4",
        "M_VID_0014.mp4",
        "M_VID_0015.mp4",
        "M_VID_0016.mp4",
        "M_VID_0017.mp4",
        "M_VID_0018.mp4",
        "M_VID_0019.mp4",
        "M_VID_0020.mp4",
        "M_VID_0021.mp4",
        "M_VID_0022.mp4",
        "M_VID_0023.mp4",
        "M_VID_0024.mp4",
      ],
      audios: [
        "M_AUD_0001.m4a",
        "M_AUD_0002.m4a",
        "M_AUD_0003.m4a",
        "M_AUD_0004.m4a",
      ],
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
