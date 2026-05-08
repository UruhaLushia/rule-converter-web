import { Button, Card } from "@heroui/react";
import { INPUT_BEHAVIORS, INPUT_TARGETS } from "../constants";
import type {
  Behavior,
  DetectResult,
  InputFormat,
  InputTarget,
  OptionItem,
} from "../types";
import { DetectedInputSummary } from "./DetectedInputSummary";
import { OptionSelect } from "./OptionSelect";

interface MatchPanelProps {
  inputTarget: InputTarget;
  setInputTarget: (value: InputTarget) => void;
  inputFormat: InputFormat;
  setInputFormat: (value: InputFormat) => void;
  inputFormats: OptionItem<InputFormat>[];
  inputBehavior: Behavior;
  setInputBehavior: (value: Behavior) => void;
  inputBehaviorSupported: boolean;
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
        <div className="space-y-2.5">
          <div className="text-xs font-medium uppercase text-muted">输入</div>
          {props.detectedInput ? (
            <DetectedInputSummary detectedInput={props.detectedInput} />
          ) : (
            <>
              <OptionSelect
                label="目标"
                value={props.inputTarget}
                onChange={props.setInputTarget}
                items={INPUT_TARGETS}
              />
              <OptionSelect
                label="格式"
                value={props.inputFormat}
                onChange={props.setInputFormat}
                items={props.inputFormats}
              />
              {props.inputBehaviorSupported ? (
                <OptionSelect
                  label="行为"
                  value={props.inputBehavior}
                  onChange={props.setInputBehavior}
                  items={INPUT_BEHAVIORS}
                />
              ) : (
                <div className="rounded-md bg-default px-3 py-2 text-sm text-muted">
                  数据库输入不需要规则行为。
                </div>
              )}
            </>
          )}
        </div>

        <div className="grid gap-2 border-t border-separator pt-3">
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
