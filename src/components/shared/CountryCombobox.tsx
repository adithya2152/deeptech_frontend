import * as React from 'react';

import { Check, ChevronsUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type CountryComboboxOption = { value: string; label: string };

type Props = {
  value?: string | null;
  onValueChange: (value: string) => void;
  options: CountryComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
};

export function CountryCombobox({
  value,
  onValueChange,
  options,
  placeholder = 'Select country…',
  searchPlaceholder = 'Search country…',
  emptyText = 'No country found.',
  disabled,
  className,
}: Props) {
  const [open, setOpen] = React.useState(false);

  const selected = React.useMemo(() => {
    const normalized = (value ?? '').trim();
    if (!normalized) return null;
    return options.find((o) => o.value.toLowerCase() === normalized.toLowerCase()) ?? {
      value: normalized,
      label: normalized,
    };
  }, [options, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn('w-full justify-between', className)}
        >
          <span className={cn('truncate', !selected?.label && 'text-muted-foreground')}>
            {selected?.label ?? placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected =
                  (selected?.value ?? '').toLowerCase() === option.value.toLowerCase();

                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      onValueChange(option.value);
                      setOpen(false);
                    }}
                  >
                    <Check className={cn('mr-2 h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')} />
                    {option.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
