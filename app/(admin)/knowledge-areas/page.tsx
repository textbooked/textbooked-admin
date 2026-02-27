"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type ColumnDef } from "@tanstack/react-table";
import { FolderPlus, Layers } from "lucide-react";
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

type KnowledgeAreaRow = {
  id: string;
  name: string;
  slug: string;
  aliases: string[];
  description?: string;
  updatedAt: string;
};

const knowledgeAreaSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  aliases: z.string(),
  description: z.string(),
});

type KnowledgeAreaFormValues = z.infer<typeof knowledgeAreaSchema>;

const initialKnowledgeAreas: KnowledgeAreaRow[] = [
  {
    id: "ka1",
    name: "Classical Mechanics",
    slug: "classical-mechanics",
    aliases: ["mechanics"],
    description: "Motion, force, energy, and momentum concepts.",
    updatedAt: "2026-02-20T09:00:00.000Z",
  },
  {
    id: "ka2",
    name: "Cell Biology",
    slug: "cell-biology",
    aliases: ["cells"],
    description: "Cell structure, function, transport, and metabolism.",
    updatedAt: "2026-02-25T07:22:00.000Z",
  },
];

export default function KnowledgeAreasPage() {
  const [rows, setRows] = useState<KnowledgeAreaRow[]>(initialKnowledgeAreas);
  const [open, setOpen] = useState(false);

  const form = useForm<KnowledgeAreaFormValues>({
    resolver: zodResolver(knowledgeAreaSchema),
    defaultValues: {
      name: "",
      slug: "",
      aliases: "",
      description: "",
    },
  });

  const columns: ColumnDef<KnowledgeAreaRow>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium">{row.original.name}</div>
          <div className="flex flex-wrap gap-1">
            {row.original.aliases.map((alias) => (
              <Badge key={alias} variant="outline" className="rounded-lg">
                {alias}
              </Badge>
            ))}
          </div>
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

  async function onSubmit(values: KnowledgeAreaFormValues) {
    const aliases = values.aliases
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    // TODO: Replace local state with Orval-generated hooks once knowledge-area endpoints exist.
    setRows((prev) => [
      {
        id: crypto.randomUUID(),
        name: values.name,
        slug: values.slug,
        aliases,
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
              Knowledge Areas
              <Badge variant="outline" className="rounded-lg">
                Skeleton
              </Badge>
            </CardTitle>
            <CardDescription>
              Same workflow pattern as concepts with a separate local dataset and form schema.
            </CardDescription>
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button className="rounded-xl">
                <FolderPlus className="size-4" />
                Create Knowledge Area
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-xl">
              <SheetHeader>
                <SheetTitle>Create Knowledge Area</SheetTitle>
                <SheetDescription>
                  Placeholder form for admin editorial workflows.
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
                    placeholder="organic-chemistry"
                  />
                  <FormCommaListField control={form.control} name="aliases" label="Aliases" />
                  <FormTextareaField
                    control={form.control}
                    name="description"
                    label="Description"
                    rows={6}
                    placeholder="What concept cluster does this knowledge area cover?"
                  />

                  <div className="rounded-xl border bg-muted/40 p-3 text-xs text-muted-foreground">
                    <div className="mb-1 flex items-center gap-2 font-medium text-foreground">
                      <Layers className="size-3.5" />
                      Local-only stub
                    </div>
                    Submit adds a row locally. Replace with Orval mutations later.
                  </div>

                  <SheetFooter className="mt-auto px-0 pb-0">
                    <Button type="submit" className="rounded-xl">
                      Save Knowledge Area
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
            emptyTitle="No knowledge areas yet"
            emptyDescription="Create the first knowledge area to populate the table."
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
