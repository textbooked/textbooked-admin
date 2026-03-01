"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { ArrowRight, Link2, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useDeferredValue, useState } from "react";
import { toast } from "sonner";

import type {
  ConceptEdgeDirection,
  ConceptEdgeRow,
  ConceptRelationKind,
  ConceptSummary,
} from "@/app/(admin)/concepts/types";
import { CONCEPT_RELATION_KINDS, getConceptRelationLabel } from "@/app/(admin)/concepts/types";
import {
  conceptAdminList,
  conceptEdgeAdminList,
  useConceptEdgeAdminCreate,
  useConceptEdgeAdminRemove,
  useConceptEdgeAdminUpdate,
} from "@/lib/api/generated/admin-client";
import type { AdminCreateDto, AdminListDto, AdminListResponseDto, AdminUpdateDto } from "@/lib/api/generated/schemas";
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
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type ConceptLinksSheetProps = {
  concept: ConceptSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type EditorState = {
  mode: "create" | "edit";
  direction: ConceptEdgeDirection;
  edge?: ConceptEdgeRow;
  relationKind: ConceptRelationKind;
  counterpartId: string;
  counterpartQuery: string;
};

const DEFAULT_RELATION_KIND: ConceptRelationKind = "REQUIRES";

export type { ConceptSummary } from "@/app/(admin)/concepts/types";

export function ConceptLinksSheet({ concept, open, onOpenChange }: ConceptLinksSheetProps) {
  const conceptId = concept?.id ?? null;
  const queryClient = useQueryClient();
  const [editor, setEditor] = useState<EditorState | null>(null);

  const deferredCounterpartQuery = useDeferredValue(editor?.counterpartQuery ?? "");

  const linksQuery = useQuery({
    queryKey: ["concept-links", conceptId],
    enabled: open && Boolean(conceptId),
    queryFn: async ({ signal }) => {
      const basePayload: Pick<AdminListDto, "pagination" | "sort"> = {
        pagination: { page: 1, perPage: 200 },
        sort: { field: "id", order: "DESC" },
      };

      const [outgoingResult, incomingResult] = await Promise.all([
        conceptEdgeAdminList({ ...basePayload, filter: { fields: { fromId: conceptId } } }, undefined, signal),
        conceptEdgeAdminList({ ...basePayload, filter: { fields: { toId: conceptId } } }, undefined, signal),
      ]);

      return {
        outgoing: toRows<ConceptEdgeRow>(outgoingResult),
        incoming: toRows<ConceptEdgeRow>(incomingResult),
      };
    },
  });

  const counterpartQuery = useQuery({
    queryKey: ["concept-links", "counterparts", conceptId, deferredCounterpartQuery],
    enabled: open && Boolean(conceptId) && Boolean(editor),
    queryFn: async ({ signal }) => {
      const payload: AdminListDto = {
        filter: { query: deferredCounterpartQuery.trim() || undefined },
        pagination: { page: 1, perPage: 20 },
        sort: { field: "name", order: "ASC" },
      };
      const result = await conceptAdminList(payload, undefined, signal);
      return toRows<ConceptSummary>(result);
    },
  });

  const createMutation = useConceptEdgeAdminCreate<AxiosError<ApiErrorBody>>();
  const updateMutation = useConceptEdgeAdminUpdate<AxiosError<ApiErrorBody>>();
  const removeMutation = useConceptEdgeAdminRemove<AxiosError<ApiErrorBody>>();

  const outgoingLinks = linksQuery.data?.outgoing ?? [];
  const incomingLinks = linksQuery.data?.incoming ?? [];
  const counterpartOptions = (counterpartQuery.data ?? []).filter((candidate) => candidate.id !== conceptId);

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const deletingId = removeMutation.isPending ? removeMutation.variables?.id ?? null : null;

  function openCreateEditor(direction: ConceptEdgeDirection) {
    setEditor({
      mode: "create",
      direction,
      relationKind: DEFAULT_RELATION_KIND,
      counterpartId: "",
      counterpartQuery: "",
    });
  }

  function openEditEditor(direction: ConceptEdgeDirection, edge: ConceptEdgeRow) {
    const counterpart = direction === "outgoing" ? edge.to : edge.from;

    setEditor({
      mode: "edit",
      direction,
      edge,
      relationKind: edge.kind,
      counterpartId: counterpart.id,
      counterpartQuery: counterpart.name,
    });
  }

  function closeEditor() {
    setEditor(null);
  }

  function handleSheetOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      closeEditor();
    }

    onOpenChange(nextOpen);
  }

  async function refreshLinks() {
    if (!conceptId) {
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["concept-links", conceptId] });
  }

  async function saveLink() {
    if (!conceptId || !editor) {
      return;
    }

    if (!editor.counterpartId) {
      toast.error("Select a counterpart concept.");
      return;
    }

    if (editor.counterpartId === conceptId) {
      toast.error("A concept cannot link to itself.");
      return;
    }

    const writeData = buildEdgeWriteData({
      selectedConceptId: conceptId,
      counterpartId: editor.counterpartId,
      direction: editor.direction,
      kind: editor.relationKind,
    });

    try {
      if (editor.mode === "edit" && editor.edge) {
        const payload: AdminUpdateDto = { data: writeData };
        await updateMutation.mutateAsync({ id: editor.edge.id, data: payload });
        toast.success("Concept link updated.");
      } else {
        const payload: AdminCreateDto = { data: writeData };
        await createMutation.mutateAsync({ data: payload });
        toast.success("Concept link created.");
      }

      closeEditor();
      await refreshLinks();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save concept link."));
    }
  }

  async function deleteLink(edge: ConceptEdgeRow) {
    if (!conceptId) {
      return;
    }

    if (!window.confirm("Delete this concept link?")) {
      return;
    }

    try {
      await removeMutation.mutateAsync({ id: edge.id });
      toast.success("Concept link deleted.");
      await refreshLinks();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete concept link."));
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleSheetOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Link2 className="size-5" />
            Concept Links
          </SheetTitle>
          <SheetDescription>
            {concept ? (
              <>
                Manage relationships for <span className="font-medium text-foreground">{concept.name}</span> (
                <code>{concept.slug}</code>). Outgoing links start from this concept; incoming links point into this
                concept.
              </>
            ) : (
              "Select a concept to configure links."
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="flex h-full flex-col gap-4 px-4 pb-4">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => openCreateEditor("outgoing")}
              disabled={!concept}
            >
              <Plus className="size-4" />
              Add Outgoing Link
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => openCreateEditor("incoming")}
              disabled={!concept}
            >
              <Plus className="size-4" />
              Add Incoming Link
            </Button>
          </div>

          {editor ? (
            <Card className="rounded-2xl border border-primary/20">
              <CardHeader>
                <CardTitle className="text-base">
                  {editor.mode === "edit" ? "Edit Link" : "Create Link"} ·{" "}
                  {editor.direction === "outgoing" ? "Outgoing" : "Incoming"}
                </CardTitle>
                <CardDescription>
                  {editor.direction === "outgoing"
                    ? "Selected concept is the source and points to a counterpart concept."
                    : "Selected concept is the target and another concept points to it."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Relation Kind</div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="outline" className="w-full justify-between rounded-xl">
                        <span>{getConceptRelationLabel(editor.relationKind)}</span>
                        <Badge variant="outline">{editor.relationKind}</Badge>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[320px]">
                      <DropdownMenuRadioGroup
                        value={editor.relationKind}
                        onValueChange={(value) =>
                          setEditor((current) =>
                            current ? { ...current, relationKind: value as ConceptRelationKind } : current,
                          )
                        }
                      >
                        {CONCEPT_RELATION_KINDS.map((kind) => (
                          <DropdownMenuRadioItem key={kind} value={kind}>
                            <div className="flex w-full items-center justify-between gap-3">
                              <span>{getConceptRelationLabel(kind)}</span>
                              <Badge variant="outline">{kind}</Badge>
                            </div>
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Counterpart Concept</div>
                  <div className="relative">
                    <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                    <Input
                      value={editor.counterpartQuery}
                      onChange={(event) =>
                        setEditor((current) =>
                          current ? { ...current, counterpartQuery: event.target.value } : current,
                        )
                      }
                      placeholder="Search concepts by name or slug..."
                      className="pl-9"
                    />
                  </div>

                  <ScrollArea className="h-40 rounded-xl border">
                    <div className="space-y-1 p-2">
                      {counterpartOptions.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() =>
                            setEditor((current) =>
                              current
                                ? {
                                    ...current,
                                    counterpartId: option.id,
                                    counterpartQuery: option.name,
                                  }
                                : current,
                            )
                          }
                          className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                            editor.counterpartId === option.id
                              ? "border-primary bg-primary/5"
                              : "border-transparent hover:border-border hover:bg-muted/30"
                          }`}
                        >
                          <div className="font-medium">{option.name}</div>
                          <div className="text-xs text-muted-foreground">{option.slug}</div>
                        </button>
                      ))}

                      {!counterpartOptions.length && !counterpartQuery.isFetching ? (
                        <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                          No concepts found for this search.
                        </div>
                      ) : null}

                      {counterpartQuery.isFetching ? (
                        <div className="px-3 py-6 text-center text-sm text-muted-foreground">Searching concepts...</div>
                      ) : null}
                    </div>
                  </ScrollArea>

                  <div className="text-xs text-muted-foreground">
                    Self-links are blocked. Select another concept as the counterpart.
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button type="button" className="rounded-xl" onClick={() => void saveLink()} disabled={isSaving}>
                    {editor.mode === "edit" ? "Save Link" : "Create Link"}
                  </Button>
                  <Button type="button" variant="outline" className="rounded-xl" onClick={closeEditor}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {linksQuery.isLoading ? (
            <div className="flex min-h-[260px] items-center justify-center rounded-2xl border bg-muted/20">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading links...
              </div>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="rounded-2xl border">
                <CardHeader>
                  <CardTitle className="text-base">Outgoing</CardTitle>
                  <CardDescription>This concept points to...</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!outgoingLinks.length ? (
                    <div className="rounded-xl border border-dashed bg-muted/20 px-3 py-8 text-center text-sm text-muted-foreground">
                      No outgoing links yet.
                    </div>
                  ) : null}

                  {outgoingLinks.map((edge) => (
                    <div key={edge.id} className="space-y-3 rounded-xl border p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">{getConceptRelationLabel(edge.kind)}</Badge>
                            <Badge variant="outline">{edge.kind}</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">{concept?.name ?? "—"}</span>
                            <ArrowRight className="size-3.5 text-muted-foreground" />
                            <span className="font-medium">{edge.to.name}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Counterpart: {edge.to.name} ({edge.to.slug})
                          </div>
                        </div>

                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="rounded-lg"
                            onClick={() => openEditEditor("outgoing", edge)}
                          >
                            <Pencil className="size-4" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="rounded-lg text-destructive hover:text-destructive"
                            onClick={() => void deleteLink(edge)}
                            disabled={deletingId === edge.id}
                          >
                            {deletingId === edge.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-2xl border">
                <CardHeader>
                  <CardTitle className="text-base">Incoming</CardTitle>
                  <CardDescription>...points to this concept</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!incomingLinks.length ? (
                    <div className="rounded-xl border border-dashed bg-muted/20 px-3 py-8 text-center text-sm text-muted-foreground">
                      No incoming links yet.
                    </div>
                  ) : null}

                  {incomingLinks.map((edge) => (
                    <div key={edge.id} className="space-y-3 rounded-xl border p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">{getConceptRelationLabel(edge.kind)}</Badge>
                            <Badge variant="outline">{edge.kind}</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">{edge.from.name}</span>
                            <ArrowRight className="size-3.5 text-muted-foreground" />
                            <span className="font-medium">{concept?.name ?? "—"}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Counterpart: {edge.from.name} ({edge.from.slug})
                          </div>
                        </div>

                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="rounded-lg"
                            onClick={() => openEditEditor("incoming", edge)}
                          >
                            <Pencil className="size-4" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="rounded-lg text-destructive hover:text-destructive"
                            onClick={() => void deleteLink(edge)}
                            disabled={deletingId === edge.id}
                          >
                            {deletingId === edge.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function toRows<T>(response: AdminListResponseDto): T[] {
  return (response.data ?? []) as T[];
}

function buildEdgeWriteData(input: {
  selectedConceptId: string;
  counterpartId: string;
  direction: ConceptEdgeDirection;
  kind: ConceptRelationKind;
}) {
  if (input.direction === "outgoing") {
    return {
      fromId: input.selectedConceptId,
      toId: input.counterpartId,
      kind: input.kind,
    };
  }

  return {
    fromId: input.counterpartId,
    toId: input.selectedConceptId,
    kind: input.kind,
  };
}
