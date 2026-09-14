"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/lib/types";

export default function Accordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-line">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
              aria-expanded={open}
            >
              <span className="font-semibold text-ink">{item.question}</span>
              <ChevronDown
                className={`size-5 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
              />
            </button>
            {open && <p className="pb-5 text-sm leading-relaxed text-muted">{item.answer}</p>}
          </div>
        );
      })}
    </div>
  );
}
