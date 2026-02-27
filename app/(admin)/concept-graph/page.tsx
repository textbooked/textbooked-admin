"use client";

import {
  Background,
  Controls,
  MarkerType,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
} from "@xyflow/react";
import { Network } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const initialNodes: Node[] = [
  {
    id: "1",
    position: { x: 80, y: 120 },
    data: { label: "Photosynthesis" },
    style: { borderRadius: 12, border: "1px solid #d4d4d8", padding: 8, background: "#fff" },
  },
  {
    id: "2",
    position: { x: 370, y: 70 },
    data: { label: "Chloroplast" },
    style: { borderRadius: 12, border: "1px solid #d4d4d8", padding: 8, background: "#fff" },
  },
  {
    id: "3",
    position: { x: 380, y: 220 },
    data: { label: "ATP / NADPH" },
    style: { borderRadius: 12, border: "1px solid #d4d4d8", padding: 8, background: "#fff" },
  },
  {
    id: "4",
    position: { x: 660, y: 150 },
    data: { label: "Calvin Cycle" },
    style: { borderRadius: 12, border: "1px solid #d4d4d8", padding: 8, background: "#fff" },
  },
];

const initialEdges: Edge[] = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    label: "occurs in",
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: "e1-3",
    source: "1",
    target: "3",
    label: "produces",
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: "e3-4",
    source: "3",
    target: "4",
    label: "powers",
    markerEnd: { type: MarkerType.ArrowClosed },
  },
];

export default function ConceptGraphPage() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="size-5" />
          Concept Graph Canvas
          <Badge variant="outline" className="rounded-lg">
            React Flow
          </Badge>
        </CardTitle>
        <CardDescription>
          Placeholder graph editor surface with in-memory mock nodes and edges.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-2xl border bg-card">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="text-sm font-medium">Graph Workspace</div>
            <div className="text-xs text-muted-foreground">
              Mock state only · no persistence wired yet
            </div>
          </div>
          <div className="h-[58vh] min-h-[420px] w-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              fitView
              proOptions={{ hideAttribution: true }}
            >
              <Background gap={20} size={1} />
              <Controls />
            </ReactFlow>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
