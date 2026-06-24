import { readFileSync } from "node:fs";
import { join } from "node:path";

import { parse } from "yaml";

type BrandingDoc = {
  branding?: {
    typography?: {
      ui_font?: {
        stack?: string;
      };
      mono_font?: {
        stack?: string;
      };
    };
    color_system?: {
      background?: string;
      surface?: string;
      surface_soft?: string;
      border?: string;
      text?: string;
      muted_text?: string;
      pipeline?: string;
      success?: string;
      warning?: string;
      accent?: string;
      danger?: string;
      shadows?: {
        soft?: string;
      };
    };
    tone_of_voice?: {
      shared_principles?: string[];
      shop_voice?: string[];
      net_voice?: string[];
    };
  };
};

const brandingPath = join(process.cwd(), "branding.yaml");

export function loadBranding(): NonNullable<BrandingDoc["branding"]> {
  const file = readFileSync(brandingPath, "utf8");
  const parsed = parse(file) as BrandingDoc;

  if (!parsed.branding) {
    throw new Error(`Missing branding root in ${brandingPath}`);
  }

  return parsed.branding;
}

