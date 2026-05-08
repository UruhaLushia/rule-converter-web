export type InputTarget =
  | "auto"
  | "mihomo"
  | "general"
  | "egern"
  | "sing-box"
  | "geoip"
  | "geosite"
  | "asn";

export type InputFormat =
  | "auto"
  | "yaml"
  | "mrs"
  | "text"
  | "json"
  | "srs"
  | "domainset"
  | "ruleset"
  | "ipset"
  | "mmdb"
  | "sing-db"
  | "metadb"
  | "dat"
  | "sing-geosite";

export type Behavior = "auto" | "domain" | "ip" | "classical";
export type OutputTarget =
  | "mihomo"
  | "general"
  | "egern"
  | "sing-box"
  | "geoip"
  | "geosite";

export type OutputFormat =
  | "mrs"
  | "text"
  | "yaml"
  | "json"
  | "srs"
  | "domainset"
  | "ruleset"
  | "ipset"
  | "mmdb"
  | "sing-db"
  | "metadb"
  | "dat"
  | "sing-geosite";

export type OutputBehavior = Behavior;
export type InputTab = "text" | "file";
export type WorkspaceMode = "convert" | "match";

export type InputSourceKind = "text" | "file";

export interface InputSourceItem {
  id: string;
  key: string;
  kind: InputSourceKind;
  target: InputTarget;
  format: InputFormat;
  behavior: Behavior;
  text: string;
  file?: File;
  fileName?: string;
  size?: number;
  detecting?: boolean;
  locked?: boolean;
  indexes?: IndexSection[];
}

export interface ConvertOptions {
  inputTarget?: Exclude<InputTarget, "auto">;
  inputFormat?: Exclude<InputFormat, "auto">;
  inputBehavior?: Behavior;
  outputTarget: OutputTarget;
  outputFormat: OutputFormat;
  outputBehavior?: OutputBehavior;
  countries?: string[];
  codes?: string[];
  asns?: number[];
  split?: boolean;
}

export interface BuildDbEntry {
  key: string;
  keys?: string[];
  inputTarget?: Exclude<InputTarget, "auto">;
  inputFormat?: Exclude<InputFormat, "auto">;
  inputBehavior?: Behavior;
  payload: Uint8Array;
}

export interface BuildDbOptions {
  outputTarget: OutputTarget;
  outputFormat: OutputFormat;
  inputFormat?: Exclude<InputFormat, "auto">;
  inputBehavior?: Behavior;
  entries: BuildDbEntry[];
}

export interface RawConvertOutput {
  behavior: string;
  format: string;
  count: number;
  bytes: Uint8Array | number[];
}

export interface ConvertOutput {
  key: string;
  behavior: string;
  format: string;
  count: number;
  bytes: Uint8Array;
  text?: string;
}

export interface SkippedRule {
  rule: string;
  reason: string;
}

export interface RawConvertResult {
  kind?: string;
  outputs: RawConvertOutput[] | Record<string, string | Uint8Array | number[]>;
  info?: Record<string, { behavior?: string; format?: string; count?: number }>;
  skipped: SkippedRule[];
}

export interface ConvertResult {
  kind?: string;
  outputs: ConvertOutput[];
  skipped: SkippedRule[];
}

export interface MatchRule {
  behavior?: string;
  rule?: string;
  source?: string;
  set?: string;
}

export interface MatchResult {
  matched: boolean;
  query: string;
  kind?: string;
  rules?: MatchRule[];
}

export interface DetectResult {
  kind: "rules" | "db";
  target: Exclude<InputTarget, "auto">;
  format: string;
  behavior?: string | null;
}

export interface IndexSection {
  title: string;
  items: string[];
}

export interface OptionItem<T extends string = string> {
  id: T;
  label: string;
}

export interface DbFilterOption {
  value: string;
  label: string;
}
