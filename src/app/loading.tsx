import { Loader2, Scissors } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-2">
        <Scissors className="h-8 w-8 text-primary animate-pulse" />
        <h1 className="text-2xl font-bold text-foreground">SnapCut</h1>
      </div>
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}
