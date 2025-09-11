// components/reports/ReportsTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import { useRouter } from "next/navigation";

interface Report {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  profileId: string;
  downloadUrl?: string;
}

interface ReportsTableProps {
  reports: Report[];
}

export function ReportsTable({ reports }: ReportsTableProps) {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "text-green-600";
      case "FAILED":
        return "text-red-600";
      case "PROCESSING":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Previous Reports</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Report Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date Range</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4">
                No reports available
              </TableCell>
            </TableRow>
          ) : (
            reports.map((report) => (
              <TableRow
                key={report.id}
                className="cursor-pointer hover:bg-gray-100"
                onClick={() =>
                  router.push(
                    `/dashboard/reports/${report.id}?profileId=${report.profileId}`,
                  )
                }
              >
                <TableCell>{report.name}</TableCell>
                <TableCell className={getStatusColor(report.status)}>
                  {report.status}
                </TableCell>
                <TableCell>
                  {formatDate(report.startDate)} - {formatDate(report.endDate)}
                </TableCell>
                <TableCell>{formatDate(report.createdAt)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

