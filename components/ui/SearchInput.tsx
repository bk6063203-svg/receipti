"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input, type InputProps } from "./Input";

export interface SearchInputProps extends Omit<InputProps, "type" | "leftAddon" | "rightAddon"> {
  onClear?: () => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput({ value, onClear, onChange, className, ...rest }, ref) {
    const innerRef = React.useRef<HTMLInputElement>(null);
    const setRefs = (el: HTMLInputElement | null) => {
      (innerRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    };
    const showClear = value !== undefined && value !== "" && !!onClear;

    return (
      <Input
        ref={setRefs}
        type="search"
        role="searchbox"
        value={value}
        onChange={onChange}
        leftAddon={<Search className="h-4 w-4" aria-hidden="true" />}
        rightAddon={
          showClear ? (
            <button
              type="button"
              onClick={() => {
                onClear?.();
                innerRef.current?.focus();
              }}
              aria-label="Clear search"
              className="rounded p-0.5 transition-colors hover:bg-background hover:text-ink"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : undefined
        }
        className={cn("[&::-webkit-search-cancel-button]:hidden", className)}
        {...rest}
      />
    );
  }
);
