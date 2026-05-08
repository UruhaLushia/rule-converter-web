import { Button, Card } from "@heroui/react";
import { useMemo, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import type {
  DbFilterOption,
  OptionItem,
  OutputBehavior,
  OutputFormat,
  OutputTarget,
} from "../types";
import { OptionSelect } from "./OptionSelect";

interface ControlPanelProps {
  outputTarget: OutputTarget;
  setOutputTarget: (value: OutputTarget) => void;
  outputTargets: OptionItem<OutputTarget>[];
  outputFormat: OutputFormat;
  setOutputFormatWithBehavior: (value: OutputFormat) => void;
  outputFormats: OptionItem<OutputFormat>[];
  outputBehavior: OutputBehavior;
  setOutputBehavior: (value: OutputBehavior) => void;
  outputBehaviorItems: OptionItem<OutputBehavior>[];
  outputBehaviorSupported: boolean;
  behaviorHint: string | null;
  outputName: string;
  setOutputName: (value: string | ((current: string) => string)) => void;
  databaseFilterKinds: {
    countries: boolean;
    codes: boolean;
    asns: boolean;
  };
  databaseFilterOptions: {
    countries: DbFilterOption[];
    codes: DbFilterOption[];
    asns: DbFilterOption[];
  };
  filterCountries: string[];
  setFilterCountries: (value: string[]) => void;
  filterCodes: string[];
  setFilterCodes: (value: string[]) => void;
  filterAsns: string[];
  setFilterAsns: (value: string[]) => void;
  splitOutput: boolean;
  setSplitOutput: (value: boolean) => void;
  supportsSplitOutput: boolean;
  isPending: boolean;
  handleConvert: () => void;
  withCurrentOutputExtension: (name: string) => string;
}

export function ControlPanel(props: ControlPanelProps) {
  const supportsDatabaseFilters =
    props.databaseFilterKinds.countries ||
    props.databaseFilterKinds.codes ||
    props.databaseFilterKinds.asns;

  return (
    <Card className="rounded-lg border border-separator shadow-sm">
      <Card.Header>
        <Card.Title>转换选项</Card.Title>
      </Card.Header>
      <Card.Content className="space-y-3">
        <div className="space-y-2.5">
          <div className="text-xs font-medium uppercase text-muted">输出</div>
          <OptionSelect
            label="目标"
            value={props.outputTarget}
            onChange={props.setOutputTarget}
            items={props.outputTargets}
          />
          <OptionSelect
            label="格式"
            value={props.outputFormat}
            onChange={props.setOutputFormatWithBehavior}
            items={props.outputFormats}
          />
          {props.outputBehaviorSupported ? (
            <OptionSelect
              label="行为"
              value={props.outputBehavior}
              onChange={props.setOutputBehavior}
              items={props.outputBehaviorItems}
            />
          ) : (
            <div className="rounded-md bg-default px-3 py-2 text-sm text-muted">
              {props.behaviorHint}
            </div>
          )}
          <label className="grid gap-1 text-sm">
            <span className="font-medium">文件名</span>
            <input
              className="h-10 rounded-md border border-separator bg-surface px-3 text-sm shadow-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              value={props.outputName}
              onChange={(event) => props.setOutputName(event.target.value)}
              onBlur={() =>
                props.setOutputName((current) =>
                  props.withCurrentOutputExtension(current),
                )
              }
            />
          </label>
          {supportsDatabaseFilters && (
            <div className="grid gap-2 rounded-md border border-separator bg-surface p-3 text-sm">
              <div className="font-medium">数据库筛选</div>
              {props.databaseFilterKinds.countries && (
                <DbFilterAutocomplete
                  label="国家代码"
                  placeholder="默认导出全部国家"
                  searchPlaceholder="搜索国家代码"
                  items={props.databaseFilterOptions.countries}
                  value={props.filterCountries}
                  onChange={props.setFilterCountries}
                />
              )}
              {props.databaseFilterKinds.codes && (
                <DbFilterAutocomplete
                  label="Geosite code"
                  placeholder="默认导出全部集合"
                  searchPlaceholder="搜索 Geosite code"
                  items={props.databaseFilterOptions.codes}
                  value={props.filterCodes}
                  onChange={props.setFilterCodes}
                />
              )}
              {props.databaseFilterKinds.asns && (
                <DbFilterAutocomplete
                  label="ASN"
                  placeholder="默认导出全部 ASN"
                  searchPlaceholder="搜索 ASN"
                  items={props.databaseFilterOptions.asns}
                  value={props.filterAsns}
                  onChange={props.setFilterAsns}
                />
              )}
              {props.supportsSplitOutput && (
                <label className="flex items-center gap-2 text-sm text-muted">
                  <input
                    type="checkbox"
                    checked={props.splitOutput}
                    onChange={(event) =>
                      props.setSplitOutput(event.target.checked)
                    }
                  />
                  按筛选项拆分输出
                </label>
              )}
            </div>
          )}
        </div>
        <Button
          className="w-full"
          variant="primary"
          onPress={props.handleConvert}
          isPending={props.isPending}
        >
          开始转换
        </Button>
      </Card.Content>
    </Card>
  );
}

interface DbFilterAutocompleteProps {
  label: string;
  placeholder: string;
  searchPlaceholder: string;
  items: DbFilterOption[];
  value: string[];
  onChange: (value: string[]) => void;
}

function DbFilterAutocomplete({
  label,
  placeholder,
  searchPlaceholder,
  items,
  value,
  onChange,
}: DbFilterAutocompleteProps) {
  const [query, setQuery] = useState("");
  const selectedSet = useMemo(() => new Set(value), [value]);
  const selectedRealCodes = useMemo(
    () => new Set(value.map(realFilterValue)),
    [value],
  );
  const visibleItems = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return [];
    const lower = trimmed.toLowerCase();
    return items.filter(
      (item) =>
        item.value.toLowerCase().includes(lower) ||
        item.label.toLowerCase().includes(lower),
    );
  }, [items, query]);
  const compactSelected = value.slice(0, 4);
  const hiddenSelectedCount = value.length - compactSelected.length;
  const labelsByValue = useMemo(
    () => new Map(items.map((item) => [item.value, item.label])),
    [items],
  );

  const toggleItem = (item: DbFilterOption) => {
    if (selectedSet.has(item.value)) {
      onChange(value.filter((valueItem) => valueItem !== item.value));
    } else {
      const itemCode = realFilterValue(item.value);
      onChange([
        ...value.filter((valueItem) => realFilterValue(valueItem) !== itemCode),
        item.value,
      ]);
    }
  };

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="rounded bg-default px-2 py-0.5 text-xs text-muted">
          {value.length > 0
            ? `${value.length} / ${items.length}`
            : items.length}
        </span>
      </div>
      <div className="rounded-md bg-default/40 p-2">
        <input
          className="h-9 w-full rounded-md border border-separator bg-surface px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={searchPlaceholder}
        />
        {value.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {compactSelected.map((item) => (
              <button
                key={item}
                type="button"
                className="rounded-full bg-surface px-2 py-1 font-mono text-xs text-foreground shadow-sm hover:bg-danger/10 hover:text-danger"
                onClick={() =>
                  toggleItem({
                    value: item,
                    label: labelsByValue.get(item) ?? item,
                  })
                }
              >
                {labelsByValue.get(item) ?? item} ×
              </button>
            ))}
            {hiddenSelectedCount > 0 && (
              <span className="rounded-full bg-surface px-2 py-1 text-xs text-muted shadow-sm">
                +{hiddenSelectedCount}
              </span>
            )}
          </div>
        ) : (
          <div className="mt-2 text-xs text-muted">{placeholder}</div>
        )}
      </div>
      {query.trim() && (
        <div className="rounded-md bg-default/40 p-2">
          {visibleItems.length > 0 ? (
            <Virtuoso
              style={{ height: 144 }}
              data={visibleItems}
              itemContent={(_, item) => (
                <button
                  type="button"
                  className={[
                    "mb-1 flex h-8 w-full items-center justify-between rounded px-2 text-left font-mono text-xs transition-colors",
                    selectedSet.has(item.value)
                      ? "bg-accent/15 text-accent"
                      : selectedRealCodes.has(realFilterValue(item.value))
                        ? "bg-warning/10 text-warning hover:text-warning"
                        : "bg-surface text-muted hover:text-foreground",
                  ].join(" ")}
                  onClick={() => toggleItem(item)}
                >
                  <span className="truncate">{item.label}</span>
                  {selectedSet.has(item.value) ? (
                    <span className="text-xs">已选</span>
                  ) : selectedRealCodes.has(realFilterValue(item.value)) ? (
                    <span className="text-xs">替换</span>
                  ) : null}
                </button>
              )}
            />
          ) : (
            <div className="grid h-20 place-items-center text-xs text-muted">
              {items.length === 0 ? "没有可选索引" : "没有匹配项"}
            </div>
          )}
        </div>
      )}
      {value.length > 0 && (
        <button
          type="button"
          className="justify-self-start text-xs text-muted hover:text-foreground"
          onClick={() => onChange([])}
        >
          清空选择
        </button>
      )}
    </div>
  );
}

function realFilterValue(value: string) {
  const index = value.indexOf(":");
  return index === -1 ? value : value.slice(index + 1);
}
