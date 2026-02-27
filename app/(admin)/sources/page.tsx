"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { ChevronRight, Database, FileSearch } from "lucide-react";
import { useState } from "react";

import { DataTable } from "@/components/data-table/data-table";
import { JsonViewer } from "@/components/json-viewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type SourceRow = {
  id: string;
  kind: "textbook" | "paper" | "web";
  title: string;
  status: "ready" | "processing" | "error";
  updatedAt: string;
  raw: Record<string, unknown>;
};

const initialSources: SourceRow[] = [
  {
    id: "src_1",
    kind: "paper",
    title: "Plant Energy Conversion Review",
    status: "ready",
    updatedAt: "2026-02-25T08:42:00.000Z",
    raw: {
      provider: "openalex",
      doi: "10.1000/example-1",
      concepts: ["photosynthesis", "chloroplast"],
      ingestion: { importedBy: "hof@example.com", timestamp: "2026-02-25T08:42:00.000Z" },
    },
  },
  {
    id: "src_2",
    kind: "textbook",
    title: "Intro Physics Chapter 3",
    status: "processing",
    updatedAt: "2026-02-24T18:10:00.000Z",
    raw: {
      provider: "manual-upload",
      fileName: "chapter3.pdf",
      pages: 28,
      queue: { stage: "chunking" },
    },
  },
  {
    id: "src_3",
    kind: "web",
    title: "Mechanics Lecture Notes",
    status: "error",
    updatedAt: "2026-02-23T15:31:00.000Z",
    raw: {
      provider: "url",
      url: "https://example.com/mechanics",
      error: { code: "PARSE_FAILURE", message: "Unsupported markup block" },
    },
  },
];

export default function SourcesPage() {
  const [selected, setSelected] = useState<SourceRow | null>(initialSources[0] ?? null);

  const columns: ColumnDef<SourceRow>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium">{row.original.title}</div>
          <div className="text-xs text-muted-foreground">{row.original.id}</div>
        </div>
      ),
    },
    {
      accessorKey: "kind",
      header: "Kind",
      cell: ({ row }) => (
        <Badge variant="outline" className="rounded-lg capitalize">
          {row.original.kind}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={row.original.status === "error" ? "destructive" : "outline"}
          className="rounded-lg capitalize"
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "Updated",
      cell: ({ row }) => formatDate(row.original.updatedAt),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-lg"
            onClick={() => setSelected(row.original)}
          >
            View
            <ChevronRight className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="size-5" />
            Sources
          </CardTitle>
          <CardDescription>
            Source inventory table skeleton with a details drawer for record inspection.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={initialSources}
            emptyTitle="No sources yet"
            emptyDescription="Imported and uploaded sources will appear here."
          />
        </CardContent>
      </Card>

      <Sheet open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent side="right" className="w-full sm:max-w-2xl">
          {selected ? (
            <>
              <SheetHeader>
                <SheetTitle>{selected.title}</SheetTitle>
                <SheetDescription>
                  {selected.id} · {selected.kind} · updated {formatDate(selected.updatedAt)}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 px-4 pb-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <InfoStat label="Status" value={selected.status} />
                  <InfoStat label="Kind" value={selected.kind} />
                  <InfoStat label="Updated" value={formatDate(selected.updatedAt)} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <FileSearch className="size-4" />
                    Raw Source Payload
                  </div>
                  <JsonViewer value={selected.raw} />
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function InfoStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-muted/30 p-3">
      <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium capitalize">{value}</div>
    </div>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
