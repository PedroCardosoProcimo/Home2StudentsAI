import { useState, useMemo, useEffect } from "react";
import { useResidences } from "@/backend/hooks/useResidences";
import { useAcceptanceStatusByResidence } from "@/backend/hooks/useAcceptanceStatus";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/frontend/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { Input } from "@/frontend/components/ui/input";
import { Badge } from "@/frontend/components/ui/badge";
import { Button } from "@/frontend/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/frontend/components/ui/table";
import { Loader2, CheckCircle2, Clock, Users, FileText, AlertCircle } from "lucide-react";
import type { StudentAcceptanceStatus } from "@/shared/types";
import { Timestamp } from "firebase/firestore";

type StatusFilter = "all" | "accepted" | "pending";
type SortField = "studentName" | "studentEmail" | "residenceName" | "status" | "acceptedAt";
type SortDirection = "asc" | "desc";

const AcceptanceStatusDashboard = () => {
  const { data: residences, isLoading: residencesLoading } = useResidences(false);

  const [selectedResidenceId, setSelectedResidenceId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("studentName");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const {
    data: acceptanceStatus,
    isLoading: statusLoading,
    error: statusError,
  } = useAcceptanceStatusByResidence(selectedResidenceId || undefined);

  // Handle sort toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filtered and sorted students
  const filteredStudents = useMemo(() => {
    if (!acceptanceStatus?.students) return [];

    let filtered = acceptanceStatus.students;

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.studentName.toLowerCase().includes(query) ||
          s.studentEmail.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "studentName":
          comparison = a.studentName.localeCompare(b.studentName);
          break;
        case "studentEmail":
          comparison = a.studentEmail.localeCompare(b.studentEmail);
          break;
        case "residenceName":
          comparison = a.residenceName.localeCompare(b.residenceName);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "acceptedAt":
          if (!a.acceptedAt && !b.acceptedAt) comparison = 0;
          else if (!a.acceptedAt) comparison = 1;
          else if (!b.acceptedAt) comparison = -1;
          else comparison = a.acceptedAt.seconds - b.acceptedAt.seconds;
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [acceptanceStatus?.students, statusFilter, searchQuery, sortField, sortDirection]);

  // Paginated students
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredStudents.length / pageSize);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery, selectedResidenceId]);

  // Format date
  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString();
  };

  // Loading state
  if (residencesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Regulation Acceptance Status</h1>
        <p className="text-muted-foreground mt-1">
          Monitor which students have accepted the current residence regulations
        </p>
      </div>

      {/* Residence Selector */}
      <div className="max-w-md">
        <label className="text-sm font-medium mb-2 block">Select Residence</label>
        <Select
          value={selectedResidenceId || ""}
          onValueChange={(value) => setSelectedResidenceId(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose a residence..." />
          </SelectTrigger>
          <SelectContent>
            {residences?.map((residence) => (
              <SelectItem key={residence.id} value={residence.id}>
                {residence.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content based on selection */}
      {!selectedResidenceId ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Select a residence to view acceptance status
            </p>
          </CardContent>
        </Card>
      ) : statusLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : statusError ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <p className="text-destructive font-medium mb-2">Error Loading Data</p>
            <p className="text-sm text-muted-foreground">
              {statusError instanceof Error ? statusError.message : "Unknown error occurred"}
            </p>
          </CardContent>
        </Card>
      ) : !acceptanceStatus?.hasActiveRegulation ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
            <p className="font-medium mb-2">No Active Regulation</p>
            <p className="text-sm text-muted-foreground">
              No active regulation found for this residence. Upload and activate a regulation first.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Current Regulation Info */}
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Current Regulation</p>
            <p className="font-medium">
              Version {acceptanceStatus.currentRegulationVersion}
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{acceptanceStatus.totalStudents}</div>
                <p className="text-xs text-muted-foreground">Active contracts</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => setStatusFilter("accepted")}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Accepted</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {acceptanceStatus.acceptedCount}
                </div>
                <p className="text-xs text-muted-foreground">
                  {acceptanceStatus.acceptanceRate.toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => setStatusFilter("pending")}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">
                  {acceptanceStatus.pendingCount}
                </div>
                <p className="text-xs text-muted-foreground">
                  {(100 - acceptanceStatus.acceptanceRate).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>
          </div>

          {acceptanceStatus.totalStudents === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No active contracts found for this residence
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Filters and Search */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex gap-2">
                      <Button
                        variant={statusFilter === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter("all")}
                      >
                        All
                      </Button>
                      <Button
                        variant={statusFilter === "accepted" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter("accepted")}
                      >
                        Accepted
                      </Button>
                      <Button
                        variant={statusFilter === "pending" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter("pending")}
                      >
                        Pending
                      </Button>
                    </div>

                    <div className="w-full sm:w-64">
                      <Input
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {filteredStudents.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-muted-foreground">
                        No students match your search criteria
                      </p>
                      {searchQuery && (
                        <Button
                          variant="link"
                          onClick={() => setSearchQuery("")}
                          className="mt-2"
                        >
                          Clear search
                        </Button>
                      )}
                    </div>
                  ) : (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead
                              className="cursor-pointer hover:bg-muted"
                              onClick={() => handleSort("studentName")}
                            >
                              Student {sortField === "studentName" && (sortDirection === "asc" ? "↑" : "↓")}
                            </TableHead>
                            <TableHead
                              className="cursor-pointer hover:bg-muted"
                              onClick={() => handleSort("studentEmail")}
                            >
                              Email {sortField === "studentEmail" && (sortDirection === "asc" ? "↑" : "↓")}
                            </TableHead>
                            <TableHead
                              className="cursor-pointer hover:bg-muted"
                              onClick={() => handleSort("residenceName")}
                            >
                              Residence {sortField === "residenceName" && (sortDirection === "asc" ? "↑" : "↓")}
                            </TableHead>
                            <TableHead
                              className="cursor-pointer hover:bg-muted"
                              onClick={() => handleSort("status")}
                            >
                              Status {sortField === "status" && (sortDirection === "asc" ? "↑" : "↓")}
                            </TableHead>
                            <TableHead
                              className="cursor-pointer hover:bg-muted"
                              onClick={() => handleSort("acceptedAt")}
                            >
                              Accepted {sortField === "acceptedAt" && (sortDirection === "asc" ? "↑" : "↓")}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedStudents.map((student) => (
                            <TableRow key={student.studentId}>
                              <TableCell className="font-medium">{student.studentName}</TableCell>
                              <TableCell>{student.studentEmail}</TableCell>
                              <TableCell>{student.residenceName}</TableCell>
                              <TableCell>
                                {student.status === "accepted" ? (
                                  <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Accepted
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Pending
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>{formatDate(student.acceptedAt)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                          <p className="text-sm text-muted-foreground">
                            Showing {(currentPage - 1) * pageSize + 1} to{" "}
                            {Math.min(currentPage * pageSize, filteredStudents.length)} of{" "}
                            {filteredStudents.length}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(currentPage - 1)}
                              disabled={currentPage === 1}
                            >
                              Previous
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(currentPage + 1)}
                              disabled={currentPage === totalPages}
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AcceptanceStatusDashboard;
