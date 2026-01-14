import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PROVINCES_REGIONS, PROVINCES } from "@shared/schema";

interface RegionSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  showAllOption?: boolean;
  className?: string;
  "data-testid"?: string;
}

export function RegionSelect({
  value,
  onValueChange,
  placeholder = "Selecteer regio",
  showAllOption = false,
  className,
  "data-testid": testId,
}: RegionSelectProps) {
  return (
    <Select value={value || (showAllOption ? "all" : "")} onValueChange={(v) => onValueChange(v === "all" ? "" : v)}>
      <SelectTrigger className={className} data-testid={testId}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-80">
        {showAllOption && (
          <SelectItem value="all">Alle regio's</SelectItem>
        )}
        {PROVINCES.map((province) => (
          <SelectGroup key={province}>
            <SelectLabel className="font-semibold text-primary">{province}</SelectLabel>
            {PROVINCES_REGIONS[province].map((region) => (
              <SelectItem key={region} value={region} className="pl-6">
                {region}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
