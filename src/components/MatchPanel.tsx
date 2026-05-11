import { Button, Card } from "@heroui/react";
import type { DetectResult } from "../types";
import { DetectedInputSummary } from "./DetectedInputSummary";

interface MatchPanelProps {
  detectedInput: DetectResult | null;
  matchQuery: string;
  setMatchQuery: (value: string) => void;
  isMatching: boolean;
  handleMatch: () => void;
}

export function MatchPanel(props: MatchPanelProps) {
  return (
    <Card className="rounded-lg border border-separator shadow-sm">
      <Card.Header>
        <Card.Title>匹配测试</Card.Title>
        <Card.Description>
          使用当前输入构建临时匹配器，文件输入会自动读取可用索引。
        </Card.Description>
      </Card.Header>
      <Card.Content className="space-y-3">
        {props.detectedInput && (
          <DetectedInputSummary detectedInput={props.detectedInput} />
        )}

        <div className="grid gap-2">
          <label className="grid gap-1 text-sm">
            <span className="font-medium">查询</span>
            <input
              className="h-10 rounded-md border border-separator bg-surface px-3 text-sm shadow-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              value={props.matchQuery}
              onChange={(event) => props.setMatchQuery(event.target.value)}
              placeholder="域名、IP 或规则查询"
            />
          </label>
          <Button
            className="w-full"
            variant="primary"
            onPress={props.handleMatch}
            isPending={props.isMatching}
          >
            测试匹配
          </Button>
        </div>
      </Card.Content>
    </Card>
  );
}
