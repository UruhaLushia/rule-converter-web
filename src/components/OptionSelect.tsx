import { Label, ListBox, Select } from "@heroui/react";
import type { OptionItem } from "../types";

interface OptionSelectProps<T extends string> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  items: OptionItem<T>[];
  isDisabled?: boolean;
}

export function OptionSelect<T extends string>({
  label,
  value,
  onChange,
  items,
  isDisabled,
}: OptionSelectProps<T>) {
  return (
    <Select
      value={value}
      isDisabled={isDisabled}
      onChange={(next) => {
        if (typeof next === "string") onChange(next as T);
      }}
      className="w-full"
    >
      <Label>{label}</Label>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {items.map((item) => (
            <ListBox.Item key={item.id} id={item.id} textValue={item.label}>
              {item.label}
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
