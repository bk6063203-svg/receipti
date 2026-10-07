import {
  EyeOff,
  FileWarning,
  Leaf,
  NotebookPen,
  PackageSearch,
  Receipt,
  Undo2,
} from "lucide-react";
import { Card, SectionHeader } from "@/components/ui";
import { Reveal } from "./Reveal";

const PROBLEMS = [
  { icon: Receipt, title: "Lost receipts", text: "One misplaced slip and the proof of purchase is gone." },
  { icon: FileWarning, title: "Fades and tears", text: "Thermal paper degrades — often before a warranty ends." },
  { icon: Undo2, title: "Painful returns", text: "No receipt, no return. Store credit roulette begins." },
  { icon: NotebookPen, title: "Manual record keeping", text: "Shoeboxes, photos, and spreadsheets to track spending." },
  { icon: EyeOff, title: "No visibility", text: "No search, no history, no sense of where money went." },
  { icon: PackageSearch, title: "Hard to access", text: "The receipt you need is never the one you can find." },
  { icon: Leaf, title: "Paper waste", text: "Billions of slips printed, glanced at, and thrown away." },
] as const;

export function Problem() {
  return (
    <section aria-labelledby="problem-heading" className="section-y">
      <div className="container-x">
        <Reveal>
          <SectionHeader
            id="problem-heading"
            eyebrow="The problem"
            title="The receipt shouldn't disappear when the paper does."
            description="Physical receipts were designed for a world before smartphones. They fail customers, merchants, and anyone who needs proof later."
          />
        </Reveal>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PROBLEMS.map((p, i) => (
            <Reveal key={p.title} delay={Math.min(i * 0.05, 0.3)}>
              <Card as="article" hover className="h-full">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-background text-ink">
                  <p.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-[0.9375rem] font-semibold">
                  {p.title}
                </h3>
                <p className="type-small mt-1 text-ink-muted">{p.text}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
