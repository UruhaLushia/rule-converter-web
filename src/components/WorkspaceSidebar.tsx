import { RiCloseLine } from "react-icons/ri";
import type { WorkspaceMode } from "../types";

interface WorkspaceSidebarProps {
  value: WorkspaceMode;
  onChange: (value: WorkspaceMode) => void;
  open: boolean;
  onClose: () => void;
}

const ITEMS: { id: WorkspaceMode; label: string; description: string }[] = [
  {
    id: "convert",
    label: "转换",
    description: "规则集、数据库和文本格式互转",
  },
  {
    id: "match",
    label: "匹配",
    description: "测试域名/IP 命中并查看索引",
  },
  {
    id: "index",
    label: "索引",
    description: "查看数据库文件包含的 code",
  },
];

export function WorkspaceSidebar({
  value,
  onChange,
  open,
  onClose,
}: WorkspaceSidebarProps) {
  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="关闭侧栏"
          className="fixed inset-0 z-30 bg-background/60 backdrop-blur-sm sm:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 w-72 border-r border-separator bg-[var(--color-panel)] p-3 transition-transform duration-200 ease-out sm:sticky sm:inset-auto sm:top-4 sm:z-auto sm:w-auto sm:translate-x-0 sm:rounded-[14px] sm:border sm:p-2",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="mb-4 flex items-center justify-between sm:hidden">
          <div className="text-sm font-semibold">Rule Converter</div>
          <button
            type="button"
            aria-label="关闭侧栏"
            className="grid size-9 place-items-center rounded-[10px] bg-default text-lg leading-none text-foreground"
            onClick={onClose}
          >
            <RiCloseLine className="size-4" aria-hidden="true" />
          </button>
        </div>

        <nav className="grid gap-1" aria-label="工作区">
          {ITEMS.map((item) => {
            const active = value === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={active ? "page" : undefined}
                className={[
                  "rounded-[10px] px-3 py-3 text-left transition-colors focus:outline-none sm:py-2.5 lg:py-3",
                  active
                    ? "bg-foreground text-background dark:bg-default dark:text-foreground"
                    : "text-foreground hover:bg-default",
                ].join(" ")}
                onClick={() => {
                  onChange(item.id);
                  onClose();
                }}
              >
                <span className="block text-sm font-semibold">
                  {item.label}
                </span>
                <span
                  className={[
                    "mt-1 block text-xs leading-5 sm:hidden lg:block",
                    active ? "opacity-75" : "text-muted",
                  ].join(" ")}
                >
                  {item.description}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
