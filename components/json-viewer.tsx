import { ScrollArea } from "@/components/ui/scroll-area";

type JsonViewerProps = {
  value: unknown;
  maxHeightClassName?: string;
};

export function JsonViewer({
  value,
  maxHeightClassName = "max-h-[28rem]",
}: JsonViewerProps) {
  return (
    <ScrollArea
      className={`rounded-xl border bg-muted/30 p-4 ${maxHeightClassName}`}
    >
      <pre className="text-xs leading-5 text-foreground/90">
        <code>{JSON.stringify(value, null, 2)}</code>
      </pre>
    </ScrollArea>
  );
}
