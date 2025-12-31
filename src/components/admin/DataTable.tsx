import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DataTableProps<T> {
  columns: {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T) => React.ReactNode;
    className?: string;
  }[];
  data: T[];
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
  currentPage?: number;
  totalPages?: number;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  isLoading,
  currentPage = 1,
  totalPages = 1,
  onPageChange
}: DataTableProps<T>) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border border-zinc-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow>
              {columns.map((col, index) => (
                <TableHead 
                  key={index} 
                  className={`font-semibold text-zinc-700 ${col.className}`}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-zinc-500">
                  <div className="flex items-center justify-center h-full">Loading data...</div>
                </TableCell>
              </TableRow>
            ) : !data || data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-zinc-500">
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id} className="hover:bg-zinc-50/50 transition-colors">
                  {columns.map((col, index) => (
                    <TableCell key={index} className={col.className}>
                      {col.cell ? col.cell(item) : (item[col.accessorKey as keyof T] as React.ReactNode)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-zinc-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}