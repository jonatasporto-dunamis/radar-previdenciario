import type { ThemeColorScale, ThemeConfig } from "@/types/brand";

const colorVariableMap: Record<keyof ThemeColorScale, string> = {
  background: "--background",
  foreground: "--foreground",
  card: "--card",
  cardForeground: "--card-foreground",
  popover: "--popover",
  popoverForeground: "--popover-foreground",
  primary: "--primary",
  primaryForeground: "--primary-foreground",
  secondary: "--secondary",
  secondaryForeground: "--secondary-foreground",
  accent: "--accent",
  accentForeground: "--accent-foreground",
  success: "--success",
  successForeground: "--success-foreground",
  warning: "--warning",
  warningForeground: "--warning-foreground",
  danger: "--danger",
  dangerForeground: "--danger-foreground",
  muted: "--muted",
  mutedForeground: "--muted-foreground",
  neutral: "--neutral",
  neutralForeground: "--neutral-foreground",
  border: "--border",
  input: "--input",
  ring: "--ring",
};

function serializeColors(colors: ThemeColorScale) {
  return Object.entries(colorVariableMap)
    .map(
      ([key, variable]) =>
        `${variable}: ${colors[key as keyof ThemeColorScale]};`,
    )
    .join("\n");
}

export function buildThemeCss(theme: ThemeConfig) {
  return `
:root {
${serializeColors(theme.colors.light)}
  --font-sans-config: ${theme.fonts.sans};
  --font-mono-config: ${theme.fonts.mono};
  --radius: ${theme.radius.lg};
  --radius-sm-config: ${theme.radius.sm};
  --radius-md-config: ${theme.radius.md};
  --radius-lg-config: ${theme.radius.lg};
  --radius-xl-config: ${theme.radius.xl};
  --radius-full-config: ${theme.radius.full};
  --spacing-page: ${theme.spacing.page};
  --spacing-section: ${theme.spacing.section};
  --spacing-content: ${theme.spacing.content};
  --shadow-soft: ${theme.shadow.soft};
  --shadow-card: ${theme.shadow.card};
  --shadow-elevated: ${theme.shadow.elevated};
  --button-height: ${theme.buttons.height};
  --button-padding-x: ${theme.buttons.paddingX};
  --button-radius: ${theme.buttons.radius};
  --card-radius: ${theme.cards.radius};
  --card-padding: ${theme.cards.padding};
  --badge-radius: ${theme.badges.radius};
  --badge-padding-x: ${theme.badges.paddingX};
  --badge-padding-y: ${theme.badges.paddingY};
}

.dark {
${serializeColors(theme.colors.dark)}
}
`;
}

export type { ThemeConfig } from "@/types/brand";
