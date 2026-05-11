import { Button, Card } from "@heroui/react";

interface IndexPanelProps {
  isReading: boolean;
  handleReadIndexes: () => void;
}

export function IndexPanel({ isReading, handleReadIndexes }: IndexPanelProps) {
  return (
    <Card className="rounded-[14px] border border-separator">
      <Card.Header>
        <Card.Title>索引读取</Card.Title>
        <Card.Description>
          读取单个数据库文件中的 GeoIP、Geosite 或 ASN 索引。
        </Card.Description>
      </Card.Header>
      <Card.Content className="space-y-3">
        <div className="rounded-[10px] border border-separator bg-surface px-3 py-2 text-sm text-muted">
          请保留一个文件输入。适合只查看数据库文件包含哪些国家代码、Geosite code
          或 ASN。
        </div>
        <Button
          className="w-full"
          variant="primary"
          onPress={handleReadIndexes}
          isPending={isReading}
        >
          读取索引
        </Button>
      </Card.Content>
    </Card>
  );
}
