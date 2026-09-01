import type { ReactNode } from "react";

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}

export function FilterButton({ active, onClick, children }: FilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition ${
        active ? "bg-blush text-white shadow" : "bg-white text-plum/60 hover:bg-blush/10"
      }`}
    >
      {children}
    </button>
  );
}
