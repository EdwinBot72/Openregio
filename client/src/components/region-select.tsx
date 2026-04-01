import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PROVINCES_GEMEENTEN, PROVINCES } from "@shared/schema";

interface RegionSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  showAllOption?: boolean;
  className?: string;
  dark?: boolean;
  "data-testid"?: string;
}

export function RegionSelect({
  value,
  onValueChange,
  placeholder = "Selecteer gemeente",
  showAllOption = false,
  className,
  dark = false,
  "data-testid": testId,
}: RegionSelectProps) {
  const contentCls = dark
    ? "max-h-80 bg-slate-900 border-slate-700"
    : "max-h-80";
  const labelCls = dark
    ? "font-semibold text-blue-300"
    : "font-semibold text-primary";
  const itemCls = dark
    ? "pl-6 text-white focus:bg-white/15 focus:text-white"
    : "pl-6";

  return (
    <Select value={value || (showAllOption ? "all" : "")} onValueChange={(v) => onValueChange(v === "all" ? "" : v)}>
      <SelectTrigger className={className} data-testid={testId}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={contentCls}>
        {showAllOption && (
          <SelectItem value="all" className={dark ? "text-white focus:bg-white/15 focus:text-white" : ""}>
            Alle gemeenten
          </SelectItem>
        )}
        {PROVINCES.map((province) => (
          <SelectGroup key={province}>
            <SelectLabel className={labelCls}>{province}</SelectLabel>
            {PROVINCES_GEMEENTEN[province].map((gemeente) => (
              <SelectItem key={gemeente} value={gemeente} className={itemCls}>
                {gemeente}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
