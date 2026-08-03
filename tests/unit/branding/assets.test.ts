import { describe, expect, it } from "vitest";
import { validateBrandingAsset } from "@/lib/branding/assets";

function png(width: number, height: number) {
  const bytes = new Uint8Array(24);
  bytes.set([137, 80, 78, 71, 13, 10, 26, 10]);
  const view = new DataView(bytes.buffer);
  view.setUint32(16, width);
  view.setUint32(20, height);
  return bytes;
}

describe("branding asset validation", () => {
  it("accepts a PNG by its actual signature and dimensions", () => {
    expect(validateBrandingAsset(png(512, 256))).toMatchObject({
      mimeType: "image/png",
      width: 512,
      height: 256,
    });
  });

  it("rejects SVG and renamed arbitrary files", () => {
    const svg = new TextEncoder().encode(
      "<svg><script>alert(1)</script></svg>",
    );
    expect(() => validateBrandingAsset(svg)).toThrow(/SVG não é aceito/);
  });

  it("rejects dimensions outside the safe range", () => {
    expect(() => validateBrandingAsset(png(16, 16))).toThrow(/entre 32 e 4096/);
  });
});
