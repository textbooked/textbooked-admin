"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type ColumnDef } from "@tanstack/react-table";
import type { AxiosError } from "axios";
import { FolderPlus, Loader2, Pencil, RefreshCcw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { DataTable } from "@/components/data-table/data-table";
import { FormCommaListField } from "@/components/forms/form-comma-list-field";
import { FormTextField } from "@/components/forms/form-text-field";
import { FormTextareaField } from "@/components/forms/form-textarea-field";
import {
  useConceptAdminCreate,
  useConceptAdminList,
  useConceptAdminRemove,
  useConceptAdminUpdate,
} from "@/lib/api/generated/admin-client";
import type { AdminCreateDto, AdminListDto, AdminUpdateDto } from "@/lib/api/generated/schemas";
import { getApiErrorMessage, type ApiErrorBody } from "@/lib/api/get-api-error-message";
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
  description?: string | null;
  updatedAt: string;
};

type AdminListResponse<T> = {
  data: T[];
  total: number;
};

const conceptFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  aliases: z.string(),
  description: z.string().optional(),
});

type ConceptFormValues = z.infer<typeof conceptFormSchema>;

const defaultValues: ConceptFormValues = {
  name: "",
  slug: "",
  aliases: "",
  description: "",
};

export default function ConceptsPage() {
  const [rows, setRows] = useState<ConceptRow[]>([]);
  const [total, setTotal] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeRow, setActiveRow] = useState<ConceptRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const listMutation = useConceptAdminList<AxiosError<ApiErrorBody>>();
  const createMutation = useConceptAdminCreate<AxiosError<ApiErrorBody>>();
  const updateMutation = useConceptAdminUpdate<AxiosError<ApiErrorBody>>();
  const removeMutation = useConceptAdminRemove<AxiosError<ApiErrorBody>>();

  const form = useForm<ConceptFormValues>({
    resolver: zodResolver(conceptFormSchema),
    defaultValues,
  });

  const isLoading = listMutation.isPending && rows.length === 0;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  async function loadRows() {
    try {
      const payload: AdminListDto = {
        pagination: { page: 1, perPage: 100 },
        sort: { field: "updatedAt", order: "DESC" },
      };

      const result =
        (await listMutation.mutateAsync({ data: payload })) as unknown as AdminListResponse<ConceptRow>;

      setRows(Array.isArray(result?.data) ? result.data : []);
      setTotal(typeof result?.total === "number" ? result.total : result?.data?.length ?? 0);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load concepts."));
    }
  }

  useEffect(() => {
    void loadRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setActiveRow(null);
    form.reset(defaultValues);
    setSheetOpen(true);
  }

  function openEdit(row: ConceptRow) {
    setActiveRow(row);
    form.reset({
      name: row.name,
      slug: row.slug,
      aliases: row.aliases.join(", "),
      description: row.description ?? "",
    });
    setSheetOpen(true);
  }

  function closeSheet() {
    setActiveRow(null);
    form.reset(defaultValues);
    setSheetOpen(false);
  }

  async function handleDelete(row: ConceptRow) {
    if (!window.confirm(`Delete concept "${row.name}"?`)) {
      return;
    }

    try {
      setDeletingId(row.id);
      await removeMutation.mutateAsync({ id: row.id });
      toast.success("Concept deleted.");
      await loadRows();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete concept."));
    } finally {
      setDeletingId(null);
    }
  }

  async function onSubmit(values: ConceptFormValues) {
    const data = {
      name: values.name.trim(),
      slug: values.slug.trim(),
      aliases: splitAliases(values.aliases),
      description: toNullable(values.description),
    };

    try {
      if (activeRow) {
        const payload: AdminUpdateDto = { data };
        await updateMutation.mutateAsync({ id: activeRow.id, data: payload });
        toast.success("Concept updated.");
      } else {
        const payload: AdminCreateDto = { data };
        await createMutation.mutateAsync({ data: payload });
        toast.success("Concept created.");
      }

      closeSheet();
      await loadRows();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save concept."));
    }
  }

  const columns: ColumnDef<ConceptRow>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium">{row.original.name}</div>
          {row.original.aliases.length > 0 ? (
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
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => openEdit(row.original)}>
            <Pencil className="size-4" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-lg text-destructive hover:text-destructive"
            disabled={deletingId === row.original.id}
            onClick={() => void handleDelete(row.original)}
          >
            {deletingId === row.original.id ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Concepts
              <Badge variant="outline" className="rounded-lg">
                Live API
              </Badge>
            </CardTitle>
            <CardDescription>Connected to admin CRUD endpoints via generated Orval hooks.</CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-lg">
              {total} total
            </Badge>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => void loadRows()}
              disabled={listMutation.isPending}
            >
              {listMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCcw className="size-4" />
              )}
              Refresh
            </Button>
          </div>

          <Sheet open={sheetOpen} onOpenChange={(open) => (open ? setSheetOpen(true) : closeSheet())}>
            <SheetTrigger asChild>
              <Button className="rounded-xl" onClick={openCreate}>
                <FolderPlus className="size-4" />
                Create Concept
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-xl">
              <SheetHeader>
                <SheetTitle>{activeRow ? "Edit Concept" : "Create Concept"}</SheetTitle>
                <SheetDescription>
                  Manage canonical concept records used across admin workflows.
                </SheetDescription>
              </SheetHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full flex-col gap-4 px-4 pb-4">
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
                    rows={6}
                    placeholder="Short editorial description or notes..."
                  />

                  <SheetFooter className="mt-auto px-0 pb-0">
                    <Button type="submit" className="rounded-xl" disabled={isSaving}>
                      {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
                      {activeRow ? "Save Changes" : "Save Concept"}
                    </Button>
                    <Button type="button" variant="outline" className="rounded-xl" onClick={closeSheet}>
                      Cancel
                    </Button>
                  </SheetFooter>
                </form>
              </Form>
            </SheetContent>
          </Sheet>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex min-h-[280px] items-center justify-center rounded-2xl border bg-muted/20">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading concepts...
              </div>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={rows}
              emptyTitle="No concepts yet"
              emptyDescription="Use Create Concept to add the first record."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function splitAliases(value: string): string[] {
  return value
    .split(",")
    .map((alias) => alias.trim())
    .filter(Boolean);
}

function toNullable(value?: string): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
