import {
  BINARY_OUTPUT_FORMATS,
  TEXT_FORMATS,
  TEXT_PREVIEW_LIMIT,
} from "./constants";
import type {
  ConvertOutput,
  ConvertResult,
  OutputFormat,
  RawConvertResult,
} from "./types";

const FORMAT_EXTENSIONS: Record<string, string> = {
  mrs: "mrs",
  text: "list",
  yaml: "yaml",
  json: "json",
  srs: "srs",
  domainset: "list",
  ruleset: "list",
  ipset: "list",
  mmdb: "mmdb",
  "sing-db": "db",
  "sing-geosite": "db",
  metadb: "db",
  dat: "dat",
};

export function outputExtension(format: string) {
  return FORMAT_EXTENSIONS[format] ?? format;
}

export function stripExtension(name: string) {
  const clean = name.trim().replace(/[\\/]+/g, "-");
  const index = clean.lastIndexOf(".");
  if (index <= 0) return clean || "rules";
  return clean.slice(0, index) || "rules";
}

export function withOutputExtension(name: string, format: OutputFormat) {
  return `${stripExtension(name)}.${outputExtension(format)}`;
}

export function outputNameForFile(file: File | null, format: OutputFormat) {
  return withOutputExtension(file?.name ?? "rules", format);
}

export function normalizeBytes(bytes: Uint8Array | number[]) {
  return bytes instanceof Uint8Array ? bytes : Uint8Array.from(bytes);
}

export function byteLength(bytes: Uint8Array | number[]) {
  return bytes instanceof Uint8Array ? bytes.byteLength : bytes.length;
}

export function normalizeResult(
  result: RawConvertResult,
  defaultFormat: OutputFormat,
): ConvertResult {
  if (Array.isArray(result.outputs)) {
    return {
      kind: result.kind,
      outputs: result.outputs.map((output, index) => ({
        key: output.behavior || `output-${index + 1}`,
        ...output,
        bytes: normalizeBytes(output.bytes),
      })),
      skipped: result.skipped ?? [],
    };
  }

  const encoder = new TextEncoder();
  return {
    kind: result.kind,
    outputs: Object.entries(result.outputs).map(([key, payload]) => {
      const info = result.info?.[key];
      const text = typeof payload === "string" ? payload : undefined;
      return {
        key,
        behavior: info?.behavior ?? key,
        format: info?.format ?? defaultFormat,
        count: info?.count ?? 0,
        bytes:
          text === undefined
            ? normalizeBytes(payload as Uint8Array | number[])
            : encoder.encode(text),
        text,
      };
    }),
    skipped: result.skipped ?? [],
  };
}

export function splitTokens(value: string) {
  return value
    .split(/[\s,，]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function splitNumbers(value: string) {
  return splitTokens(value)
    .map((item) => Number(item.replace(/^AS/i, "")))
    .filter((item) => Number.isInteger(item) && item > 0);
}

export function isTextOutput(format: string) {
  return TEXT_FORMATS.has(format);
}

export function shouldReturnBytes(format: OutputFormat) {
  return BINARY_OUTPUT_FORMATS.has(format);
}

export function normalizeListItems(value: unknown) {
  const items = Array.isArray(value)
    ? value
    : Object.values((value ?? {}) as Record<string, unknown>);
  return items
    .map((item) => String(item))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function outputFileName(
  output: ConvertOutput,
  index: number,
  total: number,
  preferredName: string,
) {
  const code = stripExtension(
    output.key || output.behavior || `rules-${index + 1}`,
  );
  if (preferredName.includes("${code}")) {
    return withOutputExtension(
      preferredName.replaceAll("${code}", code),
      output.format as OutputFormat,
    );
  }

  const name = withOutputExtension(
    preferredName || "rules",
    output.format as OutputFormat,
  );
  if (total <= 1) return name;

  const ext = outputExtension(output.format);
  return `${code}.${ext}`;
}

export function downloadBytes(bytes: Uint8Array | number[], fileName: string) {
  const copy = normalizeBytes(bytes);
  const blob = new Blob([copy.slice()], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function decodePreview(output: ConvertOutput) {
  if (output.text !== undefined) return output.text;
  if (byteLength(output.bytes) > TEXT_PREVIEW_LIMIT) return null;
  return new TextDecoder().decode(normalizeBytes(output.bytes));
}
