import { useMemo } from "react";

import { Combobox, type ComboboxOption } from "@/components/Combobox";
import { useDistinctCountries } from "@/hooks/useDistinctCountries";
import type { CountriesFilter } from "@/services/types";

type Props = {
  value: string | null;
  onChange: (next: string | null) => void;
  filter?: CountriesFilter;
  ariaLabel?: string;
  className?: string;
};

export function CountryCombobox({
  value,
  onChange,
  filter,
  ariaLabel = "Country",
  className,
}: Props) {
  const { data, isLoading, isError } = useDistinctCountries(filter ?? {});

  const options = useMemo<ComboboxOption[]>(() => {
    const rows = data?.countries ?? [];
    return rows.map(({ code, count }) => ({
      value: code,
      label: code,
      description: `${count}`,
    }));
  }, [data]);

  const placeholder = isLoading
    ? "Loading countries…"
    : isError
      ? "Failed to load"
      : options.length === 0
        ? "No countries yet"
        : "Any country";

  return (
    <Combobox
      ariaLabel={ariaLabel}
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      searchPlaceholder="Search countries…"
      emptyMessage="No countries match."
      className={className}
      disabled={isLoading || isError}
    />
  );
}
