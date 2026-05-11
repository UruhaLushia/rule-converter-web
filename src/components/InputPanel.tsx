import { Button, Card, Drawer, Dropdown } from "@heroui/react";
import { detectBuf, listIndexes } from "@uruhalushia/rule-converter-wasm";
import { useRef, useState } from "react";
import {
  INPUT_BEHAVIORS,
  inputFormatsForSourceKind,
  inputTargetsForSourceKind,
} from "../constants";
import type {
  Behavior,
  DetectResult,
  IndexSection,
  InputFormat,
  InputSourceItem,
  InputSourceKind,
  InputTarget,
} from "../types";
import { formatBytes, stripExtension } from "../utils";
import { OptionSelect } from "./OptionSelect";

interface InputPanelProps {
  sources: InputSourceItem[];
  mode?: "multiple" | "single-file";
  onAdd: (source: InputSourceItem) => void;
  onReplace?: (source: InputSourceItem) => void;
  onUpdate: (source: InputSourceItem) => void;
  onRemove: (id: string) => void;
}

type Draft = Omit<InputSourceItem, "id">;

const emptyDraft: Draft = {
  key: "",
  kind: "text",
  target: "auto",
  format: "auto",
  behavior: "auto",
  text: "",
};

export function InputPanel({
  sources,
  mode = "multiple",
  onAdd,
  onReplace,
  onUpdate,
  onRemove,
}: InputPanelProps) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const addFileInputRef = useRef<HTMLInputElement>(null);

  const openAdd = (kind: InputSourceKind) => {
    if (kind === "file") {
      addFileInputRef.current?.click();
      return;
    }
    setEditingId(null);
    setDraft({ ...emptyDraft, kind });
  };

  const openAddFile = (file: File | null) => {
    if (!file) return;
    if (mode === "single-file") {
      const source = { ...draftFromFile(file), id: crypto.randomUUID() };
      onReplace?.(source);
      void detectFileDraft(file, (detected) => {
        onReplace?.({ ...applyDetectedInput(source, detected), id: source.id });
      });
      return;
    }
    setEditingId(null);
    openFileDraft(draftFromFile(file));
  };

  const openEdit = (source: InputSourceItem) => {
    setEditingId(source.id);
    setDraft({ ...source });
  };

  const openFileDraft = (nextDraft: Draft) => {
    setDraft(nextDraft);
    void detectFileDraft(nextDraft.file, (detected) => {
      setDraft((current) => {
        if (!current || current.file !== nextDraft.file) return current;
        return applyDetectedInput(current, detected);
      });
    });
  };

  const saveDraft = () => {
    if (!draft) return;
    const key = uniqueEntryKey(
      draft.key.trim() || fallbackKey(draft),
      sources,
      editingId,
    );
    const source = { ...draft, key, id: editingId ?? crypto.randomUUID() };
    if (editingId) onUpdate(source);
    else onAdd(source);
    setDraft(null);
    setEditingId(null);
  };

  const singleFileMode = mode === "single-file";

  return (
    <Card className="rounded-[14px] border border-separator">
      <Card.Header>
        <div className="min-w-0">
          <Card.Title>输入</Card.Title>
          <Card.Description>
            {singleFileMode
              ? "选择一个数据库文件读取索引。"
              : "多个文本或文件会作为独立条目构建数据库。"}
          </Card.Description>
        </div>
      </Card.Header>
      <Card.Content className="space-y-2 pt-0">
        {singleFileMode && (
          <button
            type="button"
            className="grid min-h-40 w-full place-items-center rounded-[10px] border border-dashed border-separator bg-surface px-4 text-center text-sm text-muted transition-colors hover:border-accent hover:text-foreground"
            onClick={() => addFileInputRef.current?.click()}
          >
            {sources[0]?.kind === "file" ? (
              <span>
                <span className="block font-medium text-foreground">
                  {sources[0].fileName}
                </span>
                <span className="mt-1 block">
                  {formatBytes(sources[0].size ?? 0)}
                </span>
                <span className="mt-2 flex flex-wrap justify-center gap-1.5">
                  {sources[0].detecting ? (
                    <Badge>检测中</Badge>
                  ) : sources[0].target !== "auto" ? (
                    <>
                      <Badge>{sources[0].target}</Badge>
                      <Badge>{sources[0].format}</Badge>
                      {sources[0].behavior !== "auto" && (
                        <Badge>{sources[0].behavior}</Badge>
                      )}
                    </>
                  ) : (
                    <Badge>未识别</Badge>
                  )}
                </span>
              </span>
            ) : (
              "选择索引文件"
            )}
          </button>
        )}
        {!singleFileMode && (
          <>
            {sources.map((source) => (
              <div
                key={source.id}
                className="grid gap-2 rounded-[10px] border border-separator bg-surface px-3 py-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
              >
                <button
                  type="button"
                  className="min-w-0 text-left"
                  onClick={() => openEdit(source)}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-base font-medium">
                      {source.key}
                    </span>
                    <Badge>{source.kind === "text" ? "文本" : "文件"}</Badge>
                    {source.detecting ? (
                      <Badge>检测中</Badge>
                    ) : (
                      <>
                        <Badge>{source.target}</Badge>
                        <Badge>{source.format}</Badge>
                        {source.target !== "geoip" &&
                          source.target !== "geosite" &&
                          source.target !== "asn" &&
                          source.behavior !== "auto" && (
                            <Badge>{source.behavior}</Badge>
                          )}
                      </>
                    )}
                  </div>
                  <div className="mt-1 truncate text-xs text-muted">
                    {source.kind === "file"
                      ? `${source.fileName} · ${formatBytes(source.size ?? 0)}`
                      : source.text.split("\n").find(Boolean) || "空文本"}
                  </div>
                </button>
                <div className="flex justify-end gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onPress={() => openEdit(source)}
                  >
                    编辑
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onPress={() => onRemove(source.id)}
                  >
                    删除
                  </Button>
                </div>
              </div>
            ))}
            {sources.length === 0 && (
              <div className="grid min-h-32 w-full place-items-center rounded-[10px] border border-dashed border-separator bg-surface px-4 text-center text-sm text-muted">
                暂无输入条目
              </div>
            )}
            <AddSourceDropdown onAdd={openAdd} />
          </>
        )}
        <input
          ref={addFileInputRef}
          type="file"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            event.target.value = "";
            openAddFile(file);
          }}
        />
      </Card.Content>
      <InputSourceDialog
        draft={draft}
        onChange={setDraft}
        onCancel={() => setDraft(null)}
        onFileDraft={openFileDraft}
        onSave={saveDraft}
      />
    </Card>
  );
}

function AddSourceDropdown({
  onAdd,
}: {
  onAdd: (kind: InputSourceKind) => void;
}) {
  return (
    <Dropdown>
      <Dropdown.Trigger>
        <Button className="w-full" variant="primary">
          增加输入
        </Button>
      </Dropdown.Trigger>
      <Dropdown.Popover placement="top start">
        <Dropdown.Menu
          aria-label="选择输入类型"
          onAction={(key) => onAdd(key === "file" ? "file" : "text")}
        >
          <Dropdown.Item id="text" textValue="文本">
            文本
          </Dropdown.Item>
          <Dropdown.Item id="file" textValue="文件">
            文件
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}

function InputSourceDialog({
  draft,
  onChange,
  onCancel,
  onFileDraft,
  onSave,
}: {
  draft: Draft | null;
  onChange: (draft: Draft | null) => void;
  onCancel: () => void;
  onFileDraft: (draft: Draft) => void;
  onSave: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isOpen = draft !== null;
  const targets = draft ? inputTargetsForSourceKind(draft.kind) : [];
  const formats = draft
    ? inputFormatsForSourceKind(draft.kind, draft.target)
    : [];
  const typeLocked = Boolean(draft?.locked);

  const setTarget = (target: InputTarget) => {
    if (!draft) return;
    const nextFormats = inputFormatsForSourceKind(draft.kind, target);
    onChange({
      ...draft,
      target,
      format: nextFormats.some((item) => item.id === draft.format)
        ? draft.format
        : nextFormats[0].id,
    });
  };

  const setFile = (file: File | null) => {
    if (!file || !draft) return;
    onFileDraft({
      ...draft,
      ...fileFields(file),
      key: draft.key || stripExtension(file.name),
      detecting: true,
      locked: false,
    });
  };

  return (
    <Drawer.Backdrop
      isOpen={isOpen}
      onOpenChange={(open) => !open && onCancel()}
    >
      <Drawer.Content placement="right">
        <Drawer.Dialog className="w-full max-w-2xl bg-background">
          <Drawer.CloseTrigger />
          <Drawer.Header>
            <Drawer.Heading>
              输入条目
              {draft ? ` · ${draft.kind === "text" ? "文本" : "文件"}` : ""}
            </Drawer.Heading>
          </Drawer.Header>
          {draft && (
            <Drawer.Body className="grid content-start gap-3">
              <label className="grid gap-1 text-sm">
                <span className="font-medium">条目名称</span>
                <input
                  className="h-11 rounded-[10px] border border-separator bg-surface px-3 text-sm outline-none focus:border-accent"
                  value={draft.key}
                  onChange={(event) =>
                    onChange({ ...draft, key: event.target.value })
                  }
                  placeholder={entryPlaceholder(draft)}
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                <OptionSelect
                  label="目标"
                  value={draft.target}
                  onChange={setTarget}
                  items={targets}
                  isDisabled={typeLocked}
                />
                <OptionSelect
                  label="格式"
                  value={draft.format}
                  onChange={(format: InputFormat) =>
                    onChange({ ...draft, format })
                  }
                  items={formats}
                  isDisabled={typeLocked}
                />
                <OptionSelect
                  label="行为"
                  value={draft.behavior}
                  onChange={(behavior: Behavior) =>
                    onChange({ ...draft, behavior })
                  }
                  items={INPUT_BEHAVIORS}
                  isDisabled={typeLocked}
                />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
              {draft.kind === "text" ? (
                <textarea
                  className="h-72 min-h-48 w-full resize-none rounded-[10px] border border-separator bg-surface px-3 py-2 font-mono text-sm leading-6 outline-none focus:border-accent"
                  value={draft.text}
                  onChange={(event) =>
                    onChange({ ...draft, text: event.target.value })
                  }
                  placeholder="粘贴 payload、ruleset 或 plain text 规则"
                  spellCheck={false}
                />
              ) : (
                <div className="grid gap-3 rounded-[10px] border border-dashed border-separator bg-surface p-4 text-sm text-muted">
                  <div>
                    {draft.fileName
                      ? `${draft.fileName} · ${formatBytes(draft.size ?? 0)}`
                      : "请选择文件"}
                  </div>
                  <Button
                    className="w-fit"
                    size="sm"
                    variant="outline"
                    onPress={() => fileInputRef.current?.click()}
                  >
                    {draft.fileName ? "重新选择" : "选择文件"}
                  </Button>
                </div>
              )}
            </Drawer.Body>
          )}
          <Drawer.Footer>
            <Button slot="close" variant="outline">
              取消
            </Button>
            <Button
              variant="primary"
              onPress={onSave}
              isDisabled={draft?.detecting}
            >
              {draft?.detecting ? "检测中" : "保存"}
            </Button>
          </Drawer.Footer>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  );
}

function Badge({ children }: { children: string }) {
  return (
    <span className="rounded-2xl bg-default px-2 py-0.5 text-xs text-muted">
      {children}
    </span>
  );
}

function fallbackKey(draft: Draft) {
  if (draft.fileName) return stripExtension(draft.fileName);
  return "rules";
}

function uniqueEntryKey(
  value: string,
  sources: InputSourceItem[],
  editingId: string | null,
) {
  const base = stripExtension(value);
  const used = new Set(
    sources
      .filter((source) => source.id !== editingId)
      .map((source) => source.key.trim().toLowerCase()),
  );
  if (!used.has(base.toLowerCase())) return base;
  for (let index = 2; ; index += 1) {
    const next = `${base}-${index}`;
    if (!used.has(next.toLowerCase())) return next;
  }
}

function draftFromFile(file: File): Draft {
  return {
    ...emptyDraft,
    kind: "file",
    key: stripExtension(file.name),
    ...fileFields(file),
  };
}

function fileFields(file: File) {
  return {
    file,
    fileName: file.name,
    size: file.size,
    detecting: true,
  };
}

async function detectFileDraft(
  file: File | undefined,
  onDetected: (
    detected: (DetectResult & { indexes?: IndexSection[] }) | null,
  ) => void,
) {
  if (!file) return;
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const detected = detectBuf(bytes) as DetectResult;
    onDetected({ ...detected, indexes: listIndexes(bytes) as IndexSection[] });
  } catch {
    onDetected(null);
  }
}

function applyDetectedInput(
  draft: Draft,
  detected: (DetectResult & { indexes?: IndexSection[] }) | null,
): Draft {
  if (!detected) return { ...draft, detecting: false, locked: false };
  return {
    ...draft,
    target: detected.target as InputTarget,
    format: detected.format as InputFormat,
    behavior: (detected.behavior ?? "auto") as Behavior,
    detecting: false,
    locked: true,
    indexes: detected.indexes,
  };
}

function entryPlaceholder(draft: Draft) {
  if (draft.kind === "text") return "例如 rules、proxy、direct";
  if (draft.target === "geoip") return "例如 cn、private";
  if (draft.target === "geosite") return "例如 apple、category-ai-!cn";
  if (draft.target === "asn") return "例如 AS13335";
  return "例如 rules、cn、apple";
}
