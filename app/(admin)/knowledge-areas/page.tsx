"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { ChevronDown, FolderPlus, Loader2, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { KnowledgeAreaFormValues, KnowledgeAreaKind, KnowledgeAreaRow } from "@/app/(admin)/knowledge-areas/types";
import { KNOWLEDGE_AREA_KINDS } from "@/app/(admin)/knowledge-areas/types";
import { getListRows, getListTotal } from "@/components/table/list-result";
import { EntityTable } from "@/components/table/table";
import { useEntityTableState } from "@/components/table/use-table-state";
import { FormCommaListField } from "@/components/forms/form-comma-list-field";
import { FormTextField } from "@/components/forms/form-text-field";
import { FormTextareaField } from "@/components/forms/form-textarea-field";
import {
  knowledgeAreaAdminList,
  useKnowledgeAreaAdminCreate,
  useKnowledgeAreaAdminRemove,
  useKnowledgeAreaAdminUpdate,
} from "@/lib/api/generated/admin-client";
import type { AdminCreateDto, AdminUpdateDto } from "@/lib/api/generated/schemas";
import { getApiErrorMessage, type ApiErrorBody } from "@/lib/api/get-api-error-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const defaultValues: KnowledgeAreaFormValues = {
  name: "",
  slug: "",
  kind: "TOPIC",
  aliases: "",
  description: "",
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default function KnowledgeAreasPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeRow, setActiveRow] = useState<KnowledgeAreaRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const createMutation = useKnowledgeAreaAdminCreate<AxiosError<ApiErrorBody>>();
  const updateMutation = useKnowledgeAreaAdminUpdate<AxiosError<ApiErrorBody>>();
  const removeMutation = useKnowledgeAreaAdminRemove<AxiosError<ApiErrorBody>>();
  const table = useEntityTableState({ initialSortField: null, initialSortOrder: null, initialPerPage: 100 });

  const form = useForm<KnowledgeAreaFormValues>({ defaultValues });

  const listQuery = useQuery({
    queryKey: ["admin-knowledge-areas-list", table.payload],
    queryFn: ({ signal }) => knowledgeAreaAdminList(table.payload, undefined, signal),
  });

  const rows = getListRows<KnowledgeAreaRow>(listQuery.data);
  const total = getListTotal(listQuery.data);
  const isLoading = listQuery.isLoading;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  function openCreate() {
    setActiveRow(null);
    form.reset(defaultValues);
    setSheetOpen(true);
  }

  function openEdit(row: KnowledgeAreaRow) {
    setActiveRow(row);
    form.reset({
      name: row.name,
      slug: row.slug,
      kind: row.kind,
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

  async function handleDelete(row: KnowledgeAreaRow) {
    if (!window.confirm(`Delete knowledge area "${row.name}"?`)) {
      return;
    }

    try {
      setDeletingId(row.id);
      await removeMutation.mutateAsync({ id: row.id });
      toast.success("Knowledge area deleted.");
      await listQuery.refetch();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete knowledge area."));
    } finally {
      setDeletingId(null);
    }
  }

  async function onSubmit(values: KnowledgeAreaFormValues) {
    const name = values.name.trim();
    const slug = values.slug.trim();

    if (!name || !slug) {
      if (!name) {
        form.setError("name", { type: "manual", message: "Name is required" });
      }
      if (!slug) {
        form.setError("slug", { type: "manual", message: "Slug is required" });
      }
      return;
    }

    const data = {
      name,
      slug,
      kind: values.kind,
      aliases: values.aliases
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean),
      description: values.description.trim() || null,
    };

    try {
      if (activeRow) {
        const payload: AdminUpdateDto = { data };
        await updateMutation.mutateAsync({ id: activeRow.id, data: payload });
        toast.success("Knowledge area updated.");
      } else {
        const payload: AdminCreateDto = { data };
        await createMutation.mutateAsync({ data: payload });
        toast.success("Knowledge area created.");
      }

      closeSheet();
      await listQuery.refetch();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save knowledge area."));
    }
  }

  const columns: ColumnDef<KnowledgeAreaRow>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium">{row.original.name}</div>
          {row.original.aliases.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {row.original.aliases.map((alias) => (
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
      accessorKey: "kind",
      header: "Kind",
      cell: ({ row }) => <Badge className="rounded-lg">{row.original.kind}</Badge>,
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
      cell: ({ row }) => dateFormatter.format(new Date(row.original.updatedAt)),
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
              Knowledge Areas
              <Badge variant="outline" className="rounded-lg">
                Live API
              </Badge>
            </CardTitle>
            <CardDescription>Connected to admin CRUD endpoints via generated Orval hooks.</CardDescription>
          </div>

          <Sheet open={sheetOpen} onOpenChange={(open) => (open ? setSheetOpen(true) : closeSheet())}>
            <SheetTrigger asChild>
              <Button className="rounded-xl" onClick={openCreate}>
                <FolderPlus className="size-4" />
                Create Knowledge Area
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-xl">
              <SheetHeader>
                <SheetTitle>{activeRow ? "Edit Knowledge Area" : "Create Knowledge Area"}</SheetTitle>
                <SheetDescription>
                  Manage canonical knowledge area records used across admin workflows.
                </SheetDescription>
              </SheetHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full flex-col gap-4 px-4 pb-4">
                  <FormTextField control={form.control} name="name" label="Name" />
                  <FormTextField
                    control={form.control}
                    name="slug"
                    label="Slug"
                    placeholder="organic-chemistry"
                  />

                  <FormField
                    control={form.control}
                    name="kind"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kind</FormLabel>
                        <FormControl>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button type="button" variant="outline" className="w-full justify-between rounded-md font-normal">
                                {field.value}
                                <ChevronDown className="size-4 opacity-60" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56">
                              <DropdownMenuRadioGroup
                                value={field.value}
                                onValueChange={(value) => field.onChange(value as KnowledgeAreaKind)}
                              >
                                {KNOWLEDGE_AREA_KINDS.map((kind) => (
                                  <DropdownMenuRadioItem key={kind} value={kind}>
                                    {kind}
                                  </DropdownMenuRadioItem>
                                ))}
                              </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormCommaListField control={form.control} name="aliases" label="Aliases" />
                  <FormTextareaField
                    control={form.control}
                    name="description"
                    label="Description"
                    rows={6}
                    placeholder="What concept cluster does this knowledge area cover?"
                  />

                  <SheetFooter className="mt-auto px-0 pb-0">
                    <Button type="submit" className="rounded-xl" disabled={isSaving}>
                      {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
                      {activeRow ? "Save Changes" : "Save Knowledge Area"}
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
          <EntityTable
            columns={columns}
            rows={rows}
            total={total}
            isLoading={isLoading}
            controller={table}
            searchPlaceholder="Search knowledge areas..."
            loadingLabel="Loading knowledge areas..."
            emptyTitle="No knowledge areas yet"
            emptyDescription="Use Create Knowledge Area to add the first record."
            onRefresh={() => void listQuery.refetch()}
            isRefreshing={listQuery.isFetching}
          />
        </CardContent>
      </Card>
    </div>
  );
}
