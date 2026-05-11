import { useEffect, useMemo, useState } from "react";
import {
  buildDb,
  bufToBuf,
  bufToStr,
  matchBuf,
  matchStr,
} from "@uruhalushia/rule-converter-wasm";
import {
  OUTPUT_FORMATS_BY_TARGET,
  OUTPUT_TARGETS,
  SAMPLE_TEXT,
  defaultOutputBehaviorForInput,
  outputBehaviorHint,
  outputBehaviorOptions,
  supportsInputBehavior,
  supportsOutputBehavior,
} from "./constants";
import { ControlPanel } from "./components/ControlPanel";
import { ErrorAlert } from "./components/ErrorAlert";
import { InputPanel } from "./components/InputPanel";
import { MatchPanel } from "./components/MatchPanel";
import { OutputPanel } from "./components/OutputPanel";
import { ToolResults } from "./components/ToolResults";
import { WorkspaceSidebar } from "./components/WorkspaceSidebar";
import type {
  Behavior,
  ConvertOptions,
  ConvertResult,
  DetectResult,
  BuildDbOptions,
  InputSourceItem,
  IndexSection,
  DbFilterOption,
  InputFormat,
  InputTarget,
  MatchResult,
  OutputBehavior,
  OutputFormat,
  OutputTarget,
  RawConvertResult,
  WorkspaceMode,
} from "./types";
import {
  byteLength,
  normalizeResult,
  stripExtension,
  shouldReturnBytes,
  withOutputExtension,
} from "./utils";

export default function App() {
  const [workspace, setWorkspace] = useState<WorkspaceMode>("convert");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputSources, setInputSources] = useState<InputSourceItem[]>(() => [
    {
      id: crypto.randomUUID(),
      key: "domain",
      kind: "text",
      target: "auto",
      format: "auto",
      behavior: "auto",
      text: SAMPLE_TEXT,
    },
  ]);

  const [inputTarget] = useState<InputTarget>("auto");
  const [inputFormat] = useState<InputFormat>("auto");
  const [inputBehavior] = useState<Behavior>("auto");
  const [outputTarget, setOutputTargetState] = useState<OutputTarget>("mihomo");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("mrs");
  const [outputBehavior, setOutputBehavior] = useState<OutputBehavior>(() =>
    defaultOutputBehaviorForInput(undefined, "mihomo", "mrs"),
  );
  const [outputName, setOutputName] = useState(() =>
    withOutputExtension("domain", "mrs"),
  );
  const [filterCountries, setFilterCountries] = useState<string[]>([]);
  const [filterCodes, setFilterCodes] = useState<string[]>([]);
  const [filterAsns, setFilterAsns] = useState<string[]>([]);
  const [splitOutput, setSplitOutput] = useState(true);
  const [matchQuery, setMatchQuery] = useState("ads.example.com");
  const [detectedInput, setDetectedInput] = useState<DetectResult | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [indexSections, setIndexSections] = useState<IndexSection[]>([]);

  const [result, setResult] = useState<ConvertResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isMatching, setIsMatching] = useState(false);

  const lockedDetectedInput = detectedInput;
  const outputTargets = outputTargetsForInput(lockedDetectedInput);
  const outputFormats = outputFormatsForInput(
    lockedDetectedInput,
    outputTarget,
  );
  const effectiveInputTarget = inputTargetForOptions(
    inputTarget,
    lockedDetectedInput,
  );
  const effectiveInputFormat = inputFormatForOptions(
    inputFormat,
    lockedDetectedInput,
  );
  const inputBehaviorSupported = supportsInputBehavior(
    effectiveInputTarget ?? inputTarget,
  );
  const outputBehaviorSupported = supportsOutputBehavior(
    outputTarget,
    outputFormat,
  );
  const outputBehaviorItems = outputBehaviorOptionsForInput(
    effectiveInputTarget,
    outputTarget,
    outputFormat,
  );
  const effectiveOutputBehavior = outputBehaviorItems.some(
    (item) => item.id === outputBehavior,
  )
    ? outputBehavior
    : outputBehaviorItems[0]?.id;
  const behaviorHint = outputBehaviorHint(outputTarget, outputFormat);
  const inputDatabaseKinds = useMemo(
    () => databaseKindsFromSources(inputSources),
    [inputSources],
  );
  const databaseFilterKinds = {
    countries:
      inputDatabaseKinds.countries ||
      effectiveInputTarget === "geoip" ||
      (inputTarget === "geoip" && !effectiveInputTarget) ||
      outputTarget === "geoip",
    codes:
      inputDatabaseKinds.codes ||
      effectiveInputTarget === "geosite" ||
      (inputTarget === "geosite" && !effectiveInputTarget) ||
      outputTarget === "geosite",
    asns:
      inputDatabaseKinds.asns ||
      effectiveInputTarget === "asn" ||
      (inputTarget === "asn" && !effectiveInputTarget),
  };
  const supportsDatabaseFilters =
    databaseFilterKinds.countries ||
    databaseFilterKinds.codes ||
    databaseFilterKinds.asns;
  const supportsSplitOutput =
    supportsDatabaseFilters && supportsSplitOutputTarget(outputTarget);
  const databaseFilterOptions = useMemo(
    () => ({
      countries: filterOptionsForTarget(
        indexItems(indexSections, "GeoIP"),
        inputSources,
        "geoip",
        outputTarget,
      ),
      codes: filterOptionsForTarget(
        indexItems(indexSections, "Geosite"),
        inputSources,
        "geosite",
        outputTarget,
      ),
      asns: filterOptionsForTarget(
        indexItems(indexSections, "ASN"),
        inputSources,
        "asn",
        outputTarget,
      ),
    }),
    [indexSections, inputSources, outputTarget],
  );
  const totalOutputBytes = useMemo(
    () =>
      result?.outputs.reduce((sum, item) => sum + byteLength(item.bytes), 0) ??
      0,
    [result],
  );

  useEffect(() => {
    if (!supportsSplitOutput && outputName.includes("${code}")) {
      setOutputName(defaultMergedOutputName(inputSources, outputFormat));
    }
  }, [inputSources, outputFormat, outputName, supportsSplitOutput]);

  const setOutputTarget = (next: OutputTarget) => {
    setOutputTargetState(next);
    const nextFormats = outputFormatsForInput(lockedDetectedInput, next);
    const nextFormat = nextFormats.some((item) => item.id === outputFormat)
      ? outputFormat
      : nextFormats[0].id;
    if (nextFormat !== outputFormat) {
      setOutputFormat(nextFormat);
      setOutputName((current) => {
        const base = outputNameBaseForTarget(
          current,
          supportsSplitOutputTarget(next) && supportsDatabaseFilters,
          splitOutput,
        );
        return withOutputExtension(base, nextFormat);
      });
    }
    setOutputBehavior(
      defaultOutputBehaviorForInput(effectiveInputTarget, next, nextFormat),
    );
  };

  const setOutputFormatWithBehavior = (next: OutputFormat) => {
    setOutputFormat(next);
    setOutputName((current) => {
      const base = outputNameBaseForTarget(
        current,
        supportsSplitOutput,
        splitOutput,
      );
      return withOutputExtension(base, next);
    });
    setOutputBehavior(
      defaultOutputBehaviorForInput(effectiveInputTarget, outputTarget, next),
    );
  };

  const setSplitOutputWithName = (next: boolean) => {
    setSplitOutput(next);
    setOutputName((current) => {
      if (!supportsSplitOutput) return current;
      if (next) return withOutputExtension("${code}", outputFormat);
      return current.includes("${code}")
        ? defaultMergedOutputName(inputSources, outputFormat)
        : current;
    });
  };

  const setSources = (sources: InputSourceItem[]) => {
    setInputSources(sources);
    setDetectedInput(null);
    setIndexSections([]);
  };

  const addSource = (source: InputSourceItem) =>
    setSources([...inputSources, source]);

  const updateSource = (source: InputSourceItem) =>
    setSources(
      inputSources.map((item) => (item.id === source.id ? source : item)),
    );

  const removeSource = (id: string) =>
    setSources(inputSources.filter((item) => item.id !== id));

  const buildOptions = (): ConvertOptions => ({
    inputTarget: effectiveInputTarget,
    inputFormat: effectiveInputFormat,
    inputBehavior:
      inputBehaviorSupported && inputBehavior !== "auto"
        ? inputBehavior
        : undefined,
    outputTarget,
    outputFormat,
    outputBehavior:
      outputBehaviorSupported && effectiveOutputBehavior !== "auto"
        ? effectiveOutputBehavior
        : undefined,
    countries:
      databaseFilterKinds.countries && filterCountries.length > 0
        ? unscopedDbFilterValues(filterCountries)
        : undefined,
    codes:
      databaseFilterKinds.codes && filterCodes.length > 0
        ? unscopedDbFilterValues(filterCodes)
        : undefined,
    asns:
      databaseFilterKinds.asns && filterAsns.length > 0
        ? filterAsns.map(asnValue).filter((item) => item > 0)
        : undefined,
    split: supportsSplitOutput ? splitOutput : undefined,
  });

  const getMatchOptions = (source: InputSourceItem | undefined) => ({
    inputTarget: inputTargetFromSource(source) ?? effectiveInputTarget,
    inputFormat: inputFormatFromSource(source) ?? effectiveInputFormat,
    inputBehavior:
      inputBehaviorFromSource(source) ??
      (inputBehaviorSupported && inputBehavior !== "auto"
        ? inputBehavior
        : undefined),
  });

  const handleConvert = async () => {
    setError(null);
    setResult(null);
    setIsPending(true);
    try {
      const options = buildOptions();
      let raw: RawConvertResult;
      if (isDbBuildOutput(outputTarget)) {
        raw = buildDb(
          await buildDbOptions(inputSources, options),
        ) as RawConvertResult;
      } else {
        if (inputSources.length !== 1) {
          throw new Error("多输入仅支持合并构建数据库");
        }
        const source = inputSources[0];
        const payload = await sourcePayload(source);
        const sourceOptions = { ...options, ...optionsFromSource(source) };
        raw = (
          shouldReturnBytes(outputFormat)
            ? bufToBuf(payload, sourceOptions)
            : bufToStr(payload, sourceOptions)
        ) as RawConvertResult;
      }
      setResult(normalizeResult(raw, outputFormat));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsPending(false);
    }
  };

  const handleMatch = async () => {
    setError(null);
    setMatchResult(null);
    setIsMatching(true);
    try {
      const query = matchQuery.trim();
      if (!query) throw new Error("请输入匹配测试内容");
      if (inputSources.length === 0) throw new Error("请先添加输入");
      const results = await Promise.all(
        inputSources.map(async (source) => {
          const options = getMatchOptions(source);
          const result =
            source.kind === "text"
              ? matchStr(source.text, query, options)
              : matchBuf(await sourcePayload(source), query, options);
          return withInputSource(result as MatchResult, source);
        }),
      );
      setMatchResult(mergeMatchResults(results, query));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className="min-h-screen bg-default/30 text-foreground transition-colors">
      <main className="mx-auto flex w-full max-w-360 flex-col gap-3 px-3 py-3 sm:gap-4 sm:px-5 sm:py-4 lg:px-8">
        <header className="flex flex-col gap-2 py-1 sm:flex-row sm:items-end sm:justify-between sm:py-2">
          <div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="打开侧栏"
                className="grid size-10 place-items-center rounded-full border border-separator bg-surface text-lg shadow-sm sm:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                ☰
              </button>
              <h1 className="text-2xl font-semibold tracking-normal">
                Rule Converter
              </h1>
            </div>
            <p className="mt-1 text-sm text-muted">
              本地 WASM 转换规则集，支持转换、匹配测试和 GeoIP/Geosite
              索引读取。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted sm:justify-end">
            <span>Mihomo / Sing-Box / Egern / General / GeoIP / Geosite</span>
            <a
              className="grid size-8 place-items-center rounded-full text-foreground/80 transition-colors hover:bg-surface hover:text-accent"
              href="https://github.com/UruhaLushia/rule-converter-web"
              target="_blank"
              rel="noreferrer"
              aria-label="源码"
            >
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.01c-3.2.7-3.88-1.38-3.88-1.38-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.17 1.18A11.03 11.03 0 0 1 12 6.12c.98 0 1.96.13 2.88.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.77.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.27 5.69.42.36.78 1.06.78 2.14v3.03c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
              </svg>
            </a>
          </div>
        </header>

        <section className="grid items-start gap-3 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-4 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)]">
          <WorkspaceSidebar
            value={workspace}
            onChange={setWorkspace}
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          <div className="grid min-w-0 items-start gap-3 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-4 xl:grid-cols-[minmax(0,1fr)_440px]">
            <div className="flex flex-col gap-3">
              <InputPanel
                sources={inputSources}
                onAdd={addSource}
                onUpdate={updateSource}
                onRemove={removeSource}
              />
              {workspace === "convert" ? (
                <OutputPanel
                  result={result}
                  outputName={outputName}
                  totalOutputBytes={totalOutputBytes}
                />
              ) : (
                <ToolResults
                  matchResult={matchResult}
                  indexSections={indexSections}
                />
              )}
            </div>

            <div className="flex flex-col gap-3">
              {workspace === "convert" ? (
                <ControlPanel
                  outputTarget={outputTarget}
                  setOutputTarget={setOutputTarget}
                  outputFormat={outputFormat}
                  setOutputFormatWithBehavior={setOutputFormatWithBehavior}
                  outputFormats={outputFormats}
                  outputTargets={outputTargets}
                  outputBehavior={outputBehavior}
                  setOutputBehavior={setOutputBehavior}
                  outputBehaviorItems={outputBehaviorItems}
                  outputBehaviorSupported={outputBehaviorSupported}
                  behaviorHint={behaviorHint}
                  outputName={outputName}
                  setOutputName={setOutputName}
                  databaseFilterKinds={databaseFilterKinds}
                  databaseFilterOptions={databaseFilterOptions}
                  filterCountries={filterCountries}
                  setFilterCountries={setFilterCountries}
                  filterCodes={filterCodes}
                  setFilterCodes={setFilterCodes}
                  filterAsns={filterAsns}
                  setFilterAsns={setFilterAsns}
                  splitOutput={splitOutput}
                  setSplitOutput={setSplitOutputWithName}
                  supportsSplitOutput={supportsSplitOutput}
                  isPending={isPending}
                  handleConvert={handleConvert}
                  withCurrentOutputExtension={(name) =>
                    withOutputExtension(name, outputFormat)
                  }
                />
              ) : (
                <MatchPanel
                  detectedInput={lockedDetectedInput}
                  matchQuery={matchQuery}
                  setMatchQuery={setMatchQuery}
                  isMatching={isMatching}
                  handleMatch={handleMatch}
                />
              )}
              <ErrorAlert error={error} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function inputTargetForOptions(
  inputTarget: InputTarget,
  detected: DetectResult | null,
) {
  if (detected?.target === "asn") return "asn";
  if (detected?.target) return detected.target;
  return inputTarget === "auto" ? undefined : inputTarget;
}

function indexItems(sections: IndexSection[], titlePrefix: string) {
  return (
    sections.find((section) => section.title.startsWith(titlePrefix))?.items ??
    []
  );
}

function withInputSource(result: MatchResult, source: InputSourceItem) {
  const input = source.key.trim() || source.fileName || "输入";
  return {
    ...result,
    rules: result.rules?.map((rule) => ({ ...rule, input })),
  };
}

function mergeMatchResults(
  results: MatchResult[],
  fallbackQuery: string,
): MatchResult {
  const rules = results.flatMap((result) => result.rules ?? []);
  const first = results[0];
  return {
    matched: results.some((result) => result.matched),
    query: first?.query ?? fallbackQuery,
    kind: first?.kind,
    rules,
  };
}

function databaseKindsFromSources(sources: InputSourceItem[]) {
  return {
    countries: sources.some((source) => source.target === "geoip"),
    codes: sources.some((source) => source.target === "geosite"),
    asns: sources.some((source) => source.target === "asn"),
  };
}

function filterOptionsForTarget(
  indexItems: string[],
  sources: InputSourceItem[],
  target: InputTarget,
  outputTarget: OutputTarget,
): DbFilterOption[] {
  const options = new Map<string, string>();
  for (const item of indexItems) {
    const value = item.trim();
    if (value) options.set(value, value);
  }

  for (const source of sources) {
    const sourceName = source.key.trim();
    if (!sourceName) continue;
    if (source.target === target) {
      for (const code of sourceIndexItems(source, target)) {
        const value = scopedDbFilterValue(source, code);
        options.set(
          value,
          sourceName === code ? code : `${code}（${sourceName}）`,
        );
      }
    } else if (outputTarget === target && !isDatabaseSource(source)) {
      options.set(sourceName, sourceName);
    }
  }
  return [...options].map(filterOptionFromEntry);
}

function sourceIndexItems(source: InputSourceItem, target: InputTarget) {
  const title =
    target === "geoip" ? "GeoIP" : target === "asn" ? "ASN" : "Geosite";
  const items =
    indexItems(source.indexes ?? [], title).length > 0
      ? indexItems(source.indexes ?? [], title)
      : [source.key.trim()].filter(Boolean);
  if (target === "geoip" || target === "geosite") {
    return items.map((item) => item.toLowerCase());
  }
  return items;
}

function isDatabaseSource(source: InputSourceItem) {
  return (
    source.target === "geoip" ||
    source.target === "geosite" ||
    source.target === "asn"
  );
}

function filterOptionFromEntry([value, label]: [
  string,
  string,
]): DbFilterOption {
  return { value, label };
}

function scopedDbFilterValue(source: InputSourceItem, code: string) {
  return `${source.id}:${code}`;
}

function unscopedDbFilterValue(value: string) {
  const index = value.indexOf(":");
  return index === -1 ? value : value.slice(index + 1);
}

function unscopedDbFilterValues(values: string[]) {
  return uniqueValues(values.map(unscopedDbFilterValue));
}

function uniqueValues(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function dbFilterMatchesSource(
  value: string,
  source: InputSourceItem,
  key: string,
) {
  const index = value.indexOf(":");
  if (index === -1) return value === key;
  return value.slice(0, index) === source.id && value.slice(index + 1) === key;
}

function defaultMergedOutputName(
  sources: InputSourceItem[],
  format: OutputFormat,
) {
  return withOutputExtension(firstSourceName(sources), format);
}

function firstSourceName(sources: InputSourceItem[]) {
  return stripExtension(sources[0]?.key || sources[0]?.fileName || "rules");
}

function asnValue(value: string) {
  const number = Number(unscopedDbFilterValue(value).replace(/^AS/i, ""));
  return Number.isInteger(number) ? number : 0;
}

function inputFormatForOptions(
  inputFormat: InputFormat,
  detected: DetectResult | null,
) {
  if (detected?.format) return detected.format as Exclude<InputFormat, "auto">;
  return inputFormat === "auto" ? undefined : inputFormat;
}

function outputTargetsForInput(detected: DetectResult | null) {
  if (detected?.target === "geoip") {
    return OUTPUT_TARGETS.filter((item) =>
      ["general", "mihomo", "geoip"].includes(item.id),
    );
  }
  if (detected?.target === "geosite") {
    return OUTPUT_TARGETS.filter((item) =>
      ["general", "mihomo", "sing-box", "egern", "geosite"].includes(item.id),
    );
  }
  if (detected?.target === "asn") {
    return OUTPUT_TARGETS.filter((item) =>
      ["general", "mihomo"].includes(item.id),
    );
  }
  return OUTPUT_TARGETS;
}

function outputFormatsForInput(
  detected: DetectResult | null,
  outputTarget: OutputTarget,
) {
  const formats = OUTPUT_FORMATS_BY_TARGET[outputTarget];
  if (detected?.target === "geosite") {
    if (outputTarget === "general") {
      return formats.filter((item) => item.id !== "ipset");
    }
    return formats.filter((item) => item.id !== "mmdb");
  }
  if (detected?.target === "geoip" || detected?.target === "asn") {
    if (outputTarget === "general") {
      return formats.filter((item) => item.id === "ipset");
    }
    if (outputTarget === "mihomo") {
      return formats.filter((item) => item.id === "mrs" || item.id === "text");
    }
  }
  return formats;
}

function outputBehaviorOptionsForInput(
  inputTarget: Exclude<InputTarget, "auto"> | undefined,
  outputTarget: OutputTarget,
  outputFormat: OutputFormat,
) {
  return outputBehaviorOptions(outputTarget, outputFormat, inputTarget);
}

function supportsSplitOutputTarget(outputTarget: OutputTarget) {
  return outputTarget !== "geoip" && outputTarget !== "geosite";
}

function outputNameBaseForTarget(
  current: string,
  supportsSplitOutput: boolean,
  splitOutput: boolean,
) {
  if (!supportsSplitOutput) {
    return current.includes("${code}") ? "rules" : current;
  }
  if (splitOutput && !current.includes("${code}")) {
    return "${code}";
  }
  return current;
}

function isDbBuildOutput(target: OutputTarget) {
  return target === "geoip" || target === "geosite";
}

async function sourcePayload(source: InputSourceItem) {
  if (source.kind === "text") return new TextEncoder().encode(source.text);
  if (source.file) return new Uint8Array(await source.file.arrayBuffer());
  throw new Error(
    `输入 ${source.key || source.fileName || "file"} 缺少文件内容`,
  );
}

function inputTargetFromSource(source: InputSourceItem | undefined) {
  return source?.target && source.target !== "auto" ? source.target : undefined;
}

function inputFormatFromSource(source: InputSourceItem | undefined) {
  return source?.format && source.format !== "auto" ? source.format : undefined;
}

function inputBehaviorFromSource(source: InputSourceItem | undefined) {
  return source?.behavior && source.behavior !== "auto"
    ? source.behavior
    : undefined;
}

function optionsFromSource(source: InputSourceItem) {
  return {
    inputTarget: inputTargetFromSource(source),
    inputFormat: inputFormatFromSource(source),
    inputBehavior: inputBehaviorFromSource(source),
  };
}

async function buildDbOptions(
  sources: InputSourceItem[],
  options: ConvertOptions,
): Promise<BuildDbOptions> {
  if (sources.length === 0) throw new Error("请先添加输入");
  const filter = dbBuildFilter(options);
  return {
    outputTarget: options.outputTarget,
    outputFormat: options.outputFormat,
    inputFormat: options.inputFormat,
    inputBehavior: options.inputBehavior,
    entries: await Promise.all(
      sources.map(async (source) => {
        const keys = dbBuildEntryKeys(source, filter);
        return {
          key: source.key,
          keys: isDatabaseSource(source) ? keys : undefined,
          inputTarget: inputTargetFromSource(source),
          inputFormat: inputFormatFromSource(source),
          inputBehavior: inputBehaviorFromSource(source),
          payload: await sourcePayload(source),
        };
      }),
    ),
  };
}

function dbBuildFilter(options: ConvertOptions) {
  if (options.outputTarget === "geoip") return new Set(options.countries ?? []);
  if (options.outputTarget === "geosite") return new Set(options.codes ?? []);
  return new Set<string>();
}

function dbBuildEntryKeys(source: InputSourceItem, filter: Set<string>) {
  if (!isDatabaseSource(source)) {
    const key = source.key.trim();
    return key && (filter.size === 0 || filter.has(key)) ? [key] : [];
  }
  return sourceIndexItems(source, source.target).filter(
    (key) =>
      filter.size === 0 ||
      filter.has(key) ||
      [...filter].some((value) => dbFilterMatchesSource(value, source, key)),
  );
}
