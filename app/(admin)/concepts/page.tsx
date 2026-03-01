"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { FolderPlus, Link2, Loader2, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { ConceptLinksSheet } from "@/app/(admin)/concepts/components/links-sheet";
import type { ConceptFormValues, ConceptRow, ConceptSummary } from "@/app/(admin)/concepts/types";
import { getListRows, getListTotal } from "@/components/table/list-result";
import { EntityTable } from "@/components/table/table";
import { useEntityTableState } from "@/components/table/use-table-state";
import { FormCommaListField } from "@/components/forms/form-comma-list-field";
import { FormTextField } from "@/components/forms/form-text-field";
import { FormTextareaField } from "@/components/forms/form-textarea-field";
import {
  conceptAdminList,
  knowledgeAreaAdminList,
  useConceptAdminCreate,
  useConceptAdminRemove,
  useConceptAdminUpdate,
} from "@/lib/api/generated/admin-client";
import type { AdminCreateDto, AdminListDto, AdminUpdateDto } from "@/lib/api/generated/schemas";
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

const defaultValues: ConceptFormValues = {
  name: "",
  slug: "",
  aliases: "",
  description: "",
};

export default function ConceptsPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [linksSheetOpen, setLinksSheetOpen] = useState(false);
  const [linksConcept, setLinksConcept] = useState<ConceptSummary | null>(null);
  const [knowledgeAreaId, setKnowledgeAreaId] = useState("");
  const [activeRow, setActiveRow] = useState<ConceptRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const createMutation = useConceptAdminCreate<AxiosError<ApiErrorBody>>();
  const updateMutation = useConceptAdminUpdate<AxiosError<ApiErrorBody>>();
  const removeMutation = useConceptAdminRemove<AxiosError<ApiErrorBody>>();
  const table = useEntityTableState({ initialSortField: null, initialSortOrder: null, initialPerPage: 100 });

  const form = useForm<ConceptFormValues>({ defaultValues });

  const conceptListPayload = useMemo<AdminListDto>(() => {
    if (!knowledgeAreaId) {
      return table.payload;
    }

    return {
      ...table.payload,
      filter: {
        ...(table.payload.filter ?? {}),
        fields: {
          ...(table.payload.filter?.fields ?? {}),
          knowledgeAreas: {
            some: {
              knowledgeAreaId,
            },
          },
        },
      },
    };
  }, [knowledgeAreaId, table.payload]);

  const listQuery = useQuery({
    queryKey: ["admin-concepts-list", conceptListPayload],
    queryFn: ({ signal }) => conceptAdminList(conceptListPayload, undefined, signal),
  });

  const knowledgeAreasQuery = useQuery({
    queryKey: ["admin-knowledge-area-options"],
    queryFn: ({ signal }) =>
      knowledgeAreaAdminList(
        {
          pagination: { page: 1, perPage: 300 },
          sort: { field: "name", order: "ASC" },
        },
        undefined,
        signal,
      ),
  });

  const rows = getListRows<ConceptRow>(listQuery.data);
  const total = getListTotal(listQuery.data);
  const knowledgeAreaOptions = getListRows<KnowledgeAreaFilterOption>(knowledgeAreasQuery.data).filter(
    (item) => Boolean(item?.id && item?.name),
  );
  const selectedKnowledgeAreaName = knowledgeAreaOptions.find((item) => item.id === knowledgeAreaId)?.name;
  const isLoading = listQuery.isLoading;
  const isSaving = createMutation.isPending || updateMutation.isPending;

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

  function openLinks(row: ConceptRow) {
    setLinksConcept({
      id: row.id,
      name: row.name,
      slug: row.slug,
    });
    setLinksSheetOpen(true);
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
      await listQuery.refetch();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete concept."));
    } finally {
      setDeletingId(null);
    }
  }

  async function onSubmit(values: ConceptFormValues) {
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
        toast.success("Concept updated.");
      } else {
        const payload: AdminCreateDto = { data };
        await createMutation.mutateAsync({ data: payload });
        toast.success("Concept created.");
      }

      closeSheet();
      await listQuery.refetch();
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
          <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => openLinks(row.original)}>
            <Link2 className="size-4" />
            Links
          </Button>
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
          <EntityTable
            columns={columns}
            rows={rows}
            total={total}
            isLoading={isLoading}
            controller={table}
            leftSlot={
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="outline" className="rounded-xl">
                    Knowledge Area: {selectedKnowledgeAreaName ?? "All"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  <DropdownMenuRadioGroup
                    value={knowledgeAreaId || "__all__"}
                    onValueChange={(value) => setKnowledgeAreaId(value === "__all__" ? "" : value)}
                  >
                    <DropdownMenuRadioItem value="__all__">All</DropdownMenuRadioItem>
                    {knowledgeAreaOptions.map((item) => (
                      <DropdownMenuRadioItem key={item.id} value={item.id}>
                        {item.name}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            }
            searchPlaceholder="Search concepts..."
            loadingLabel="Loading concepts..."
            emptyTitle="No concepts yet"
            emptyDescription="Use Create Concept to add the first record."
            onRefresh={() => void listQuery.refetch()}
            isRefreshing={listQuery.isFetching}
          />
        </CardContent>
      </Card>

      <ConceptLinksSheet
        concept={linksConcept}
        open={linksSheetOpen}
        onOpenChange={(nextOpen) => {
          setLinksSheetOpen(nextOpen);
          if (!nextOpen) {
            setLinksConcept(null);
          }
        }}
      />
    </div>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

type KnowledgeAreaFilterOption = {
  id: string;
  name: string;
};
