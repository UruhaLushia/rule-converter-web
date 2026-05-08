import { Button, Card } from "@heroui/react";
import { TEXT_PREVIEW_LIMIT } from "../constants";
import type { ConvertResult } from "../types";
import {
  byteLength,
  decodePreview,
  downloadBytes,
  formatBytes,
  isTextOutput,
  outputFileName,
} from "../utils";

interface OutputPanelProps {
  result: ConvertResult | null;
  outputName: string;
  totalOutputBytes: number;
}

export function OutputPanel({
  result,
  outputName,
  totalOutputBytes,
}: OutputPanelProps) {
  if (!result) return null;

  return (
    <Card className="rounded-lg border border-separator shadow-sm">
      <Card.Header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Card.Title>输出</Card.Title>
          <Card.Description>
            {result.outputs.length} 个文件，{formatBytes(totalOutputBytes)}
            ，跳过 {result.skipped.length} 条
          </Card.Description>
        </div>
        <Button
          variant="outline"
          onPress={() =>
            result.outputs.forEach((output, index) =>
              downloadBytes(
                output.bytes,
                outputFileName(
                  output,
                  index,
                  result.outputs.length,
                  outputName,
                ),
              ),
            )
          }
          isDisabled={result.outputs.length === 0}
        >
          下载全部
        </Button>
      </Card.Header>
      <Card.Content className="space-y-3">
        {result.outputs.map((output, index) => {
          const fileName = outputFileName(
            output,
            index,
            result.outputs.length,
            outputName,
          );
          const preview = isTextOutput(output.format)
            ? decodePreview(output)
            : null;
          const isLargeText = isTextOutput(output.format) && preview === null;
          return (
            <div
              key={`${output.behavior}-${output.format}-${index}`}
              className="rounded-md border border-separator bg-surface p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{fileName}</span>
                    <span className="rounded bg-default px-2 py-0.5 font-mono text-xs text-muted">
                      {output.format}
                    </span>
                    <span className="text-xs text-muted">
                      {output.count} 条
                    </span>
                    <span className="text-xs text-muted">
                      {formatBytes(byteLength(output.bytes))}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onPress={() => downloadBytes(output.bytes, fileName)}
                >
                  下载
                </Button>
              </div>
              {preview !== null && (
                <textarea
                  readOnly
                  className="mt-3 max-h-72 min-h-32 w-full resize-y rounded-md border border-separator bg-background px-3 py-2 font-mono text-xs leading-5 outline-none"
                  value={preview}
                  spellCheck={false}
                />
              )}
              {isLargeText && (
                <div className="mt-3 rounded-md bg-default px-3 py-2 text-sm text-muted">
                  文本输出超过 {formatBytes(TEXT_PREVIEW_LIMIT)}
                  ，已跳过页面预览以降低内存占用。
                </div>
              )}
            </div>
          );
        })}

        {result.skipped.length > 0 && (
          <details className="rounded-md border border-separator bg-surface">
            <summary className="cursor-pointer px-3 py-2 text-sm text-muted">
              查看跳过规则
            </summary>
            <div className="max-h-56 overflow-auto border-t border-separator px-3 py-2">
              {result.skipped.slice(0, 200).map((item, index) => (
                <div
                  key={`${item.rule}-${index}`}
                  className="grid gap-1 py-1 text-xs sm:grid-cols-[minmax(0,1fr)_220px]"
                >
                  <code className="truncate">{item.rule}</code>
                  <span className="text-muted">{item.reason}</span>
                </div>
              ))}
              {result.skipped.length > 200 && (
                <div className="py-2 text-xs text-muted">仅显示前 200 条。</div>
              )}
            </div>
          </details>
        )}
      </Card.Content>
    </Card>
  );
}
