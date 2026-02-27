"use client";

import { Search, Upload } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type OpenAlexResult = {
  id: string;
  title: string;
  authors: string[];
  year: number;
  relevance: "high" | "medium";
};

const mockResults: OpenAlexResult[] = [
  {
    id: "W123",
    title: "Energy transfer pathways in photosynthetic systems",
    authors: ["J. Lee", "A. Patel"],
    year: 2023,
    relevance: "high",
  },
  {
    id: "W124",
    title: "Mechanics misconceptions in introductory courses",
    authors: ["S. Chen"],
    year: 2022,
    relevance: "medium",
  },
  {
    id: "W125",
    title: "Knowledge graph alignment for STEM education resources",
    authors: ["R. Gomez", "T. Brown"],
    year: 2024,
    relevance: "high",
  },
];

export default function OpenAlexImportsPage() {
  const [query, setQuery] = useState("");

  const results = mockResults.filter((result) =>
    query.trim()
      ? `${result.title} ${result.authors.join(" ")}`.toLowerCase().includes(query.toLowerCase())
      : true,
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,28rem)_1fr]">
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle>Search OpenAlex</CardTitle>
          <CardDescription>
            Placeholder import UI with local mock results. No backend call is made yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title, author, topic..."
              className="rounded-xl pl-9"
            />
          </div>

          <div className="rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
            Use this panel to stage external records before import. Final import action will be
            wired to admin API endpoints later.
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Results
            <Badge variant="outline" className="rounded-lg">
              {results.length}
            </Badge>
          </CardTitle>
          <CardDescription>Mock result list and import controls.</CardDescription>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <EmptyState
              title="No matches"
              description="Adjust the query to see mock OpenAlex records."
            />
          ) : (
            <div className="space-y-3">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="rounded-2xl border bg-card p-4 transition-colors hover:bg-muted/20"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">{result.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {result.authors.join(", ")} · {result.year} · {result.id}
                      </div>
                    </div>
                    <Badge variant="outline" className="rounded-lg capitalize">
                      {result.relevance}
                    </Badge>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      className="rounded-xl"
                      onClick={() => {
                        // No API call yet: placeholder action only.
                      }}
                    >
                      <Upload className="size-4" />
                      Import
                    </Button>
                    <Button variant="outline" className="rounded-xl">
                      Preview
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
