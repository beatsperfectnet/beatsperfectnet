import { loadBranding } from "@/lib/brand/loadBranding";

const branding = loadBranding();

export const brandTokens = {
  color: {
    bg: branding.color_system?.background ?? "#F3F6F4",
    surface: branding.color_system?.surface ?? "#FFFFFF",
    surfaceSoft: branding.color_system?.surface_soft ?? "#F8FAFC",
    border: branding.color_system?.border ?? "#D9E2EC",
    text: branding.color_system?.text ?? "#102A43",
    mutedText: branding.color_system?.muted_text ?? "#475569",
    pipeline: branding.color_system?.pipeline ?? "#1F6F8B",
    success: branding.color_system?.success ?? "#5C7A52",
    warning: branding.color_system?.warning ?? "#F2B84B",
    accent: branding.color_system?.accent ?? "#F47C57",
    danger: branding.color_system?.danger ?? "#BE123C"
  },
  font: {
    ui: branding.typography?.ui_font?.stack ?? '"Inter", system-ui, sans-serif',
    mono: branding.typography?.mono_font?.stack ?? '"IBM Plex Mono", ui-monospace, SFMono-Regular, monospace'
  },
  radius: {
    sm: "10px",
    md: "16px",
    lg: "24px"
  },
  shadow: {
    soft: branding.color_system?.shadows?.soft ?? "0 12px 30px rgba(16, 42, 67, 0.08)"
  },
  layout: {
    pageMaxWidth: "1280px",
    pagePadding: "24px",
    cardPadding: "20px",
    gap: "16px"
  }
} as const;
