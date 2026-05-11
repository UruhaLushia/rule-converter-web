import { Card } from "@heroui/react";
import { useMemo, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import type { IndexSection, MatchResult, MatchRule } from "../types";

interface ToolResultsProps {
  matchResult: MatchResult | null;
  indexSections: IndexSection[];
}

export function ToolResults({ matchResult, indexSections }: ToolResultsProps) {
  if (!matchResult && indexSections.length === 0) return null;

  return (
    <Card className="rounded-[14px] border border-separator">
      <Card.Content className="space-y-3">
        {matchResult && (
          <div className="rounded-[10px] border border-separator bg-surface p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">匹配结果</span>
                <span className="rounded-[8px] bg-default px-2 py-0.5 font-mono text-xs text-muted">
                  {matchResult.query}
                </span>
                {matchResult.kind && (
                  <span className="rounded-[8px] bg-default px-2 py-0.5 text-xs text-muted">
                    {matchResult.kind}
                  </span>
                )}
              </div>
              <span
                className={
                  matchResult.matched
                    ? "rounded-[8px] bg-success/10 px-2 py-0.5 text-xs font-medium text-success"
                    : "rounded-[8px] bg-default px-2 py-0.5 text-xs font-medium text-muted"
                }
              >
                {matchResult.matched ? "已匹配" : "未匹配"}
              </span>
            </div>
            {matchResult.rules && matchResult.rules.length > 0 ? (
              <div className="mt-3 max-h-80 space-y-2 overflow-auto pr-1">
                {matchResult.rules.map((rule, index) => (
                  <MatchRuleItem
                    key={`${rule.rule}-${rule.set}-${index}`}
                    rule={rule}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-3 rounded-[10px] bg-default px-3 py-2 text-xs text-muted">
                没有命中规则。
              </div>
            )}
          </div>
        )}
        {indexSections.map((section) => (
          <IndexSectionResult key={section.title} section={section} />
        ))}
      </Card.Content>
    </Card>
  );
}

function IndexSectionResult({ section }: { section: IndexSection }) {
  const [query, setQuery] = useState("");
  const title = indexSectionTitle(section.title);
  const filteredItems = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return section.items;
    return section.items.filter((item) => item.toLowerCase().includes(value));
  }, [query, section.items]);

  return (
    <div className="space-y-2 text-sm">
      <div className="text-sm text-muted">
        {title} · {filteredItems.length}
        {query.trim() && filteredItems.length !== section.items.length
          ? ` / ${section.items.length}`
          : ""}
      </div>
      <input
        className="h-11 w-full rounded-[10px] border border-separator bg-surface px-3 text-sm outline-none focus:border-accent"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={`搜索${title}`}
      />
      <div className="rounded-[10px] bg-default/40 p-2">
        {filteredItems.length > 0 ? (
          <Virtuoso
            style={{ height: 288 }}
            data={filteredItems}
            itemContent={(_, item) => (
              <div className="mb-1 truncate rounded-[10px] bg-surface px-2 py-1 font-mono text-xs text-muted">
                {item}
              </div>
            )}
          />
        ) : (
          <div className="grid h-32 place-items-center text-xs text-muted">
            没有匹配的索引。
          </div>
        )}
      </div>
    </div>
  );
}

function indexSectionTitle(title: string) {
  if (title.startsWith("GeoIP")) return "国家代码";
  if (title.startsWith("Geosite")) return "Geosite code";
  if (title.startsWith("ASN")) return "ASN";
  return title;
}

function MatchRuleItem({ rule }: { rule: MatchRule }) {
  return (
    <div className="rounded-[10px] border border-separator bg-default/60 px-3 py-2">
      <div className="flex flex-wrap items-center gap-2">
        {rule.input && (
          <span className="rounded-[8px] bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
            {rule.input}
          </span>
        )}
        {rule.behavior && (
          <span className="rounded-[8px] bg-surface px-2 py-0.5 text-xs font-medium text-foreground">
            {rule.behavior}
          </span>
        )}
        {rule.source && (
          <span className="rounded-[8px] bg-surface px-2 py-0.5 text-xs text-muted">
            {rule.source}
          </span>
        )}
        {rule.set && (
          <span className="rounded-[8px] bg-surface px-2 py-0.5 text-xs text-muted">
            {rule.set}
          </span>
        )}
      </div>
      <div className="mt-2 break-all font-mono text-xs leading-relaxed text-foreground">
        {rule.rule}
      </div>
    </div>
  );
}
