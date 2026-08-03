export const MAX_BRANDING_ASSET_BYTES = 2 * 1024 * 1024;

export type ValidatedBrandingAsset = {
  extension: "png" | "jpg" | "webp";
  mimeType: "image/png" | "image/jpeg" | "image/webp";
  width: number;
  height: number;
};

function jpegDimensions(bytes: Uint8Array) {
  let offset = 2;
  while (offset + 8 < bytes.length) {
    if (bytes[offset] !== 0xff) break;
    const marker = bytes[offset + 1];
    const size = (bytes[offset + 2] << 8) + bytes[offset + 3];
    if (marker >= 0xc0 && marker <= 0xc3) {
      return {
        height: (bytes[offset + 5] << 8) + bytes[offset + 6],
        width: (bytes[offset + 7] << 8) + bytes[offset + 8],
      };
    }
    offset += size + 2;
  }
  return null;
}

export function validateBrandingAsset(
  bytes: Uint8Array,
): ValidatedBrandingAsset {
  if (!bytes.length || bytes.length > MAX_BRANDING_ASSET_BYTES) {
    throw new Error("A imagem deve ter no máximo 2 MB.");
  }

  let asset: ValidatedBrandingAsset | null = null;
  if (
    bytes.length >= 24 &&
    bytes
      .slice(0, 8)
      .every((v, i) => v === [137, 80, 78, 71, 13, 10, 26, 10][i])
  ) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    asset = {
      extension: "png",
      mimeType: "image/png",
      width: view.getUint32(16),
      height: view.getUint32(20),
    };
  } else if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    const dimensions = jpegDimensions(bytes);
    if (dimensions)
      asset = { extension: "jpg", mimeType: "image/jpeg", ...dimensions };
  } else if (
    bytes.length >= 30 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const chunk = String.fromCharCode(...bytes.slice(12, 16));
    if (chunk === "VP8X") {
      const width =
        1 +
        view.getUint8(24) +
        (view.getUint8(25) << 8) +
        (view.getUint8(26) << 16);
      const height =
        1 +
        view.getUint8(27) +
        (view.getUint8(28) << 8) +
        (view.getUint8(29) << 16);
      asset = { extension: "webp", mimeType: "image/webp", width, height };
    } else if (chunk === "VP8 ") {
      asset = {
        extension: "webp",
        mimeType: "image/webp",
        width: view.getUint16(26, true) & 0x3fff,
        height: view.getUint16(28, true) & 0x3fff,
      };
    } else if (chunk === "VP8L" && bytes[20] === 0x2f) {
      const bits = view.getUint32(21, true);
      asset = {
        extension: "webp",
        mimeType: "image/webp",
        width: (bits & 0x3fff) + 1,
        height: ((bits >> 14) & 0x3fff) + 1,
      };
    }
  }

  if (!asset)
    throw new Error(
      "Envie uma imagem PNG, JPEG ou WEBP válida. SVG não é aceito.",
    );
  if (
    asset.width < 32 ||
    asset.height < 32 ||
    asset.width > 4096 ||
    asset.height > 4096
  ) {
    throw new Error(
      "A imagem deve ter entre 32 e 4096 pixels em cada dimensão.",
    );
  }
  return asset;
}
