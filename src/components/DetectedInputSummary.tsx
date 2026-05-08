import type { DetectResult } from "../types";

interface DetectedInputSummaryProps {
  detectedInput: DetectResult;
}

export function DetectedInputSummary({
  detectedInput,
}: DetectedInputSummaryProps) {
  return (
    <div className="rounded-md border border-separator bg-surface p-3 text-sm">
      <div className="flex flex-wrap gap-2 text-xs">
        <DetectChip label={detectedInput.kind === "db" ? "数据库" : "规则集"} />
        <DetectChip label={detectedInput.target} />
        <DetectChip label={detectedInput.format} />
        {detectedInput.behavior && detectedInput.behavior !== "auto" && (
          <DetectChip label={detectedInput.behavior} />
        )}
      </div>
    </div>
  );
}

function DetectChip({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-separator bg-default px-2.5 py-1 font-medium text-muted">
      {label}
    </span>
  );
}
