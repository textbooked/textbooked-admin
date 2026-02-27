import { ArrowUpRight, Link2, Tags, UploadCloud } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const WORKFLOW_CARDS = [
  {
    title: "Concept Operations",
    description: "Bulk tagging, metadata cleanup, and concept creation workflows.",
    icon: Tags,
    cta: "Open Concepts",
    href: "/concepts",
  },
  {
    title: "Graph Editing",
    description: "Inspect and shape concept relationships in the graph canvas.",
    icon: Link2,
    cta: "Open Graph",
    href: "/concept-graph",
  },
  {
    title: "Source Ingestion",
    description: "Monitor source records and prep imports from external feeds.",
    icon: UploadCloud,
    cta: "Open Sources",
    href: "/sources",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Workflow-oriented admin
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
          Operational tooling for Textbooked content systems
        </h2>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground md:text-base">
          This skeleton focuses on layout, auth, route structure, and UI primitives for graph
          editing, bulk tagging, source management, and import workflows.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {WORKFLOW_CARDS.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.title} className="rounded-2xl border shadow-sm">
              <CardHeader>
                <div className="mb-2 inline-flex size-10 items-center justify-center rounded-xl border bg-muted">
                  <Icon className="size-5" />
                </div>
                <CardTitle>{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" asChild className="rounded-xl">
                  <Link href={card.href}>
                    {card.cta}
                    <ArrowUpRight className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
