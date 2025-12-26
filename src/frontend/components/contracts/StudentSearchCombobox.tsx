import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/frontend/lib/utils";
import { Button } from "@/frontend/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/frontend/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/frontend/components/ui/popover";
import { searchStudents } from "@/backend/services/students";
import type { StudentWithUser } from "@/shared/types";

interface StudentSearchComboboxProps {
  value?: string;
  onValueChange: (studentId: string, student: StudentWithUser | null) => void;
  disabled?: boolean;
  placeholder?: string;
  filterStudentIds?: string[]; // Optional: only show students with these IDs
}

export function StudentSearchCombobox({
  value,
  onValueChange,
  disabled = false,
  placeholder = "Select student...",
  filterStudentIds,
}: StudentSearchComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState("");

  // Debounce search term with 300ms delay
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch students - only when popover is open and search term is not empty
  const { data: allStudents = [], isLoading } = useQuery({
    queryKey: ["students", "search", debouncedSearchTerm],
    queryFn: () => searchStudents(debouncedSearchTerm),
    enabled: open && debouncedSearchTerm.trim().length > 0,
    staleTime: 30000, // 30 seconds
  });

  // Filter students if filterStudentIds is provided
  const students = React.useMemo(() => {
    if (!filterStudentIds || filterStudentIds.length === 0) {
      return allStudents;
    }
    return allStudents.filter(student => filterStudentIds.includes(student.id));
  }, [allStudents, filterStudentIds]);

  // Find selected student
  const selectedStudent = students.find((s) => s.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between hover:bg-transparent hover:text-foreground"
          disabled={disabled}
        >
          {selectedStudent ? (
            <span className="truncate">
              {selectedStudent.name} ({selectedStudent.email})
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search by name or email..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            {isLoading ? (
              <div className="py-6 text-center text-sm">Loading...</div>
            ) : debouncedSearchTerm.trim().length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Start typing to search students...
              </div>
            ) : students.length === 0 ? (
              <CommandEmpty>No students found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {students.map((student) => (
                  <CommandItem
                    key={student.id}
                    value={student.id}
                    onSelect={(currentValue) => {
                      const selected = students.find((s) => s.id === currentValue);
                      onValueChange(currentValue, selected || null);
                      setOpen(false);
                    }}
                    className="cursor-pointer data-[selected=true]:bg-muted/50 data-[selected=true]:text-foreground"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === student.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{student.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {student.email}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
