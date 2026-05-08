import type {
  Behavior,
  InputFormat,
  InputSourceKind,
  InputTarget,
  OptionItem,
  OutputBehavior,
  OutputFormat,
  OutputTarget,
} from "./types";

export const TEXT_PREVIEW_LIMIT = 512 * 1024;
export const TEXT_FORMATS = new Set([
  "text",
  "yaml",
  "json",
  "domainset",
  "ruleset",
  "ipset",
]);
export const BINARY_OUTPUT_FORMATS = new Set<OutputFormat>([
  "mrs",
  "srs",
  "mmdb",
  "sing-db",
  "metadb",
  "dat",
  "sing-geosite",
]);

export const INPUT_TARGETS: OptionItem<InputTarget>[] = [
  { id: "auto", label: "自动检测" },
  { id: "mihomo", label: "Mihomo" },
  { id: "general", label: "General" },
  { id: "egern", label: "Egern" },
  { id: "sing-box", label: "Sing-Box" },
  { id: "geoip", label: "GeoIP" },
  { id: "geosite", label: "Geosite" },
  { id: "asn", label: "ASN" },
];

const TEXT_INPUT_TARGET_IDS = new Set<InputTarget>([
  "auto",
  "mihomo",
  "general",
  "egern",
  "sing-box",
]);

const TEXT_INPUT_FORMAT_IDS = new Set<InputFormat>([
  "auto",
  "yaml",
  "text",
  "json",
  "domainset",
  "ruleset",
  "ipset",
]);

export const ALL_INPUT_FORMATS: OptionItem<InputFormat>[] = [
  { id: "auto", label: "自动检测" },
  { id: "yaml", label: "YAML" },
  { id: "mrs", label: "MRS" },
  { id: "text", label: "Text" },
  { id: "json", label: "JSON" },
  { id: "srs", label: "SRS" },
  { id: "domainset", label: "Domain Set" },
  { id: "ruleset", label: "Rule Set" },
  { id: "ipset", label: "IP Set" },
  { id: "mmdb", label: "MMDB" },
  { id: "sing-db", label: "Sing DB" },
  { id: "metadb", label: "MetaDB" },
  { id: "dat", label: "DAT" },
  { id: "sing-geosite", label: "Sing Geosite" },
];

export const INPUT_FORMATS_BY_TARGET: Record<
  InputTarget,
  OptionItem<InputFormat>[]
> = {
  auto: ALL_INPUT_FORMATS,
  mihomo: [
    { id: "auto", label: "自动检测" },
    { id: "yaml", label: "YAML" },
    { id: "mrs", label: "MRS" },
    { id: "text", label: "Text" },
  ],
  general: [
    { id: "auto", label: "自动检测" },
    { id: "text", label: "Text" },
    { id: "domainset", label: "Domain Set" },
    { id: "ruleset", label: "Rule Set" },
    { id: "ipset", label: "IP Set" },
  ],
  egern: [
    { id: "auto", label: "自动检测" },
    { id: "yaml", label: "YAML" },
  ],
  "sing-box": [
    { id: "auto", label: "自动检测" },
    { id: "json", label: "JSON" },
    { id: "srs", label: "SRS" },
  ],
  geoip: [
    { id: "auto", label: "自动检测" },
    { id: "mmdb", label: "MMDB" },
    { id: "dat", label: "DAT" },
    { id: "sing-db", label: "Sing DB" },
    { id: "metadb", label: "MetaDB" },
  ],
  geosite: [
    { id: "auto", label: "自动检测" },
    { id: "dat", label: "DAT" },
    { id: "sing-geosite", label: "Sing Geosite" },
  ],
  asn: [
    { id: "auto", label: "自动检测" },
    { id: "mmdb", label: "MMDB" },
  ],
};

export function inputTargetsForSourceKind(kind: InputSourceKind) {
  if (kind === "file") return INPUT_TARGETS;
  return INPUT_TARGETS.filter((item) => TEXT_INPUT_TARGET_IDS.has(item.id));
}

export function inputFormatsForSourceKind(
  kind: InputSourceKind,
  target: InputTarget,
) {
  const formats = INPUT_FORMATS_BY_TARGET[target];
  if (kind === "file") return formats;
  return formats.filter((item) => TEXT_INPUT_FORMAT_IDS.has(item.id));
}

export const INPUT_BEHAVIORS: OptionItem<Behavior>[] = [
  { id: "auto", label: "自动" },
  { id: "domain", label: "Domain" },
  { id: "ip", label: "IP" },
  { id: "classical", label: "Classical" },
];

export const OUTPUT_TARGETS: OptionItem<OutputTarget>[] = [
  { id: "mihomo", label: "Mihomo" },
  { id: "sing-box", label: "Sing-Box" },
  { id: "egern", label: "Egern" },
  { id: "general", label: "General" },
  { id: "geoip", label: "GeoIP" },
  { id: "geosite", label: "Geosite" },
];

export const OUTPUT_FORMATS_BY_TARGET: Record<
  OutputTarget,
  OptionItem<OutputFormat>[]
> = {
  mihomo: [
    { id: "mrs", label: "MRS" },
    { id: "text", label: "Text" },
    { id: "yaml", label: "YAML" },
  ],
  "sing-box": [
    { id: "srs", label: "SRS" },
    { id: "json", label: "JSON" },
  ],
  egern: [{ id: "yaml", label: "YAML" }],
  general: [
    { id: "domainset", label: "Domain Set" },
    { id: "ruleset", label: "Rule Set" },
    { id: "ipset", label: "IP Set" },
  ],
  geoip: [
    { id: "dat", label: "DAT" },
    { id: "mmdb", label: "MMDB" },
    { id: "sing-db", label: "Sing DB" },
    { id: "metadb", label: "MetaDB" },
  ],
  geosite: [
    { id: "dat", label: "DAT" },
    { id: "sing-geosite", label: "Sing Geosite" },
  ],
};

export const OUTPUT_BEHAVIORS: OptionItem<OutputBehavior>[] = [
  { id: "auto", label: "自动" },
  { id: "domain", label: "Domain" },
  { id: "ip", label: "IP" },
  { id: "classical", label: "Classical" },
];

export const DOMAIN_OUTPUT_BEHAVIORS: OptionItem<OutputBehavior>[] = [
  { id: "domain", label: "Domain" },
  { id: "classical", label: "Classical" },
];

export const IP_OUTPUT_BEHAVIORS: OptionItem<OutputBehavior>[] = [
  { id: "ip", label: "IP" },
  { id: "classical", label: "Classical" },
];

export const MRS_OUTPUT_BEHAVIORS: OptionItem<OutputBehavior>[] = [
  { id: "domain", label: "Domain" },
  { id: "ip", label: "IP" },
];

export const SAMPLE_TEXT = `payload:
  - DOMAIN-SUFFIX,example.com
  - DOMAIN,ads.example.net
  - IP-CIDR,10.0.0.0/8,no-resolve
`;

export function defaultOutputBehavior(
  target: OutputTarget,
  format: OutputFormat,
): OutputBehavior {
  if (target === "general" && format === "domainset") return "domain";
  if (target === "general" && format === "ipset") return "ip";
  if (target === "mihomo" && format === "mrs") return "domain";
  return "classical";
}

export function defaultOutputBehaviorForInput(
  inputTarget: InputTarget | undefined,
  target: OutputTarget,
  format: OutputFormat,
): OutputBehavior {
  if (inputTarget === "geosite") {
    return target === "mihomo" && format === "mrs" ? "domain" : "classical";
  }
  if (inputTarget === "geoip" || inputTarget === "asn") {
    return target === "mihomo" && format === "mrs" ? "ip" : "classical";
  }
  return defaultOutputBehavior(target, format);
}

export function outputBehaviorOptions(
  target: OutputTarget,
  format: OutputFormat,
  inputTarget?: InputTarget,
) {
  if (inputTarget === "geosite") {
    return target === "mihomo" && format === "mrs"
      ? MRS_OUTPUT_BEHAVIORS.filter((item) => item.id === "domain")
      : DOMAIN_OUTPUT_BEHAVIORS;
  }
  if (inputTarget === "geoip" || inputTarget === "asn") {
    return target === "mihomo" && format === "mrs"
      ? MRS_OUTPUT_BEHAVIORS.filter((item) => item.id === "ip")
      : IP_OUTPUT_BEHAVIORS;
  }
  if (target === "mihomo" && format === "mrs") return MRS_OUTPUT_BEHAVIORS;
  return OUTPUT_BEHAVIORS;
}

export function supportsOutputBehavior(
  target: OutputTarget,
  format: OutputFormat,
) {
  if (target === "geoip" || target === "geosite") return false;
  return !(
    target === "general" &&
    (format === "domainset" || format === "ipset")
  );
}

export function outputBehaviorHint(target: OutputTarget, format: OutputFormat) {
  if (target === "general" && format === "domainset")
    return "Domain Set 固定输出 domain 规则。";
  if (target === "general" && format === "ipset")
    return "IP Set 固定输出 IP CIDR 规则。";
  if (target === "geoip" || target === "geosite")
    return "数据库输出不需要规则行为。";
  return null;
}

export function supportsInputBehavior(target: InputTarget) {
  return target !== "geoip" && target !== "geosite" && target !== "asn";
}
