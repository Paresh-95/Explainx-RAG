import { Progress } from "@repo/ui/components/ui/progress";
import { Button } from "@repo/ui/components/ui/button";

interface ReportStatusProps {
  status: {
    reportId: string;
    status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
    url?: string;
  } | null;
  onRetry: () => void;
}

export function ReportStatus({ status, onRetry }: ReportStatusProps) {
  if (!status) return null;

  return (
    <div className="mt-4 p-4 border rounded-lg">
      <h2 className="text-xl font-semibold mb-2">Report Status</h2>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span>Status: {status.status}</span>
          {(status.status === "PENDING" || status.status === "PROCESSING") && (
            <div className="w-1/2">
              <Progress value={status.status === "PROCESSING" ? 50 : 25} />
            </div>
          )}
        </div>
        {status.status === "FAILED" && (
          <Button onClick={onRetry} variant="secondary">
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}

