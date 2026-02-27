"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { DataTable } from "@/components/data-table/data-table";
import { FormCommaListField } from "@/components/forms/form-comma-list-field";
import { FormTextField } from "@/components/forms/form-text-field";
import { FormTextareaField } from "@/components/forms/form-textarea-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type ConceptRow = {
  id: string;
  name: string;
  slug: string;
  aliases: string[];
  description?: string;
  updatedAt: string;
};

const conceptFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  aliases: z.string(),
  description: z.string(),
});

type ConceptFormValues = z.infer<typeof conceptFormSchema>;

const initialConcepts: ConceptRow[] = [
  {
    id: "c1",
    name: "Photosynthesis",
    slug: "photosynthesis",
    aliases: ["photo synthesis", "light reaction overview"],
    description: "Core concept linking light-dependent and light-independent reactions.",
    updatedAt: "2026-02-21T10:12:00.000Z",
  },
  {
    id: "c2",
    name: "Newton's Second Law",
    slug: "newtons-second-law",
    aliases: ["F=ma"],
    description: "Relationship between force, mass, and acceleration.",
    updatedAt: "2026-02-24T16:45:00.000Z",
  },
];

export default function ConceptsPage() {
  const [rows, setRows] = useState<ConceptRow[]>(initialConcepts);
  const [open, setOpen] = useState(false);

  const form = useForm<ConceptFormValues>({
    resolver: zodResolver(conceptFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      aliases: "",
      description: "",
    },
  });

  const columns: ColumnDef<ConceptRow>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium">{row.original.name}</div>
          {row.original.aliases.length ? (
            <div className="flex flex-wrap gap-1">
              {row.original.aliases.slice(0, 3).map((alias) => (
                <Badge key={alias} variant="outline" className="rounded-lg">
                  {alias}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => (
        <code className="rounded bg-muted px-2 py-1 text-xs">{row.original.slug}</code>
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
      cell: () => (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" className="rounded-lg">
            Edit
          </Button>
        </div>
      ),
    },
  ];

  async function onSubmit(values: ConceptFormValues) {
    const normalizedAliases = values.aliases
      .split(",")
      .map((alias) => alias.trim())
      .filter(Boolean);

    // TODO: Replace local state with Orval-generated hooks once admin endpoints are finalized.
    setRows((prev) => [
      {
        id: crypto.randomUUID(),
        name: values.name,
        slug: values.slug,
        aliases: normalizedAliases,
        description: values.description || undefined,
        updatedAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    form.reset();
    setOpen(false);
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Concepts
              <Badge variant="outline" className="rounded-lg">
                Skeleton
              </Badge>
            </CardTitle>
            <CardDescription>
              Table + create flow scaffold for concept operations. Data is mocked locally for now.
            </CardDescription>
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button className="rounded-xl">
                <Plus className="size-4" />
                Create Concept
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-xl">
              <SheetHeader>
                <SheetTitle>Create Concept</SheetTitle>
                <SheetDescription>
                  Capture a concept record skeleton. API integration is intentionally stubbed.
                </SheetDescription>
              </SheetHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex h-full flex-col gap-4 px-4 pb-4"
                >
                  <FormTextField control={form.control} name="name" label="Name" />
                  <FormTextField
                    control={form.control}
                    name="slug"
                    label="Slug"
                    placeholder="cellular-respiration"
                  />
                  <FormCommaListField control={form.control} name="aliases" label="Aliases" />
                  <FormTextareaField
                    control={form.control}
                    name="description"
                    label="Description"
                    placeholder="Short editorial description or notes..."
                    rows={6}
                  />

                  <div className="rounded-xl border bg-muted/40 p-3 text-xs text-muted-foreground">
                    <div className="mb-1 flex items-center gap-2 font-medium text-foreground">
                      <Sparkles className="size-3.5" />
                      Stubbed submission
                    </div>
                    Local state only. Wire this form to Orval hooks when admin concept endpoints are
                    available.
                  </div>

                  <SheetFooter className="mt-auto px-0 pb-0">
                    <Button type="submit" className="rounded-xl">
                      Save Concept
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => setOpen(false)}
                    >
                      Cancel
                    </Button>
                  </SheetFooter>
                </form>
              </Form>
            </SheetContent>
          </Sheet>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={rows}
            emptyTitle="No concepts yet"
            emptyDescription="Use Create Concept to add the first concept record."
          />
        </CardContent>
      </Card>
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
