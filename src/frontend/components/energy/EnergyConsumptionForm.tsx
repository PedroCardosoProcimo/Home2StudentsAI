import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, FileText } from 'lucide-react';
import { Button } from '@/frontend/components/ui/button';
import { Input } from '@/frontend/components/ui/input';
import { Checkbox } from '@/frontend/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/frontend/components/ui/card';
import { Alert, AlertDescription } from '@/frontend/components/ui/alert';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/frontend/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/frontend/components/ui/select';
import { PeriodSelector } from './PeriodSelector';
import { StudentSearchCombobox } from '@/frontend/components/contracts/StudentSearchCombobox';
import { createEnergyConsumption } from '@/backend/services/energyConsumption';
import { findContractForRoom } from '@/backend/services/contracts';
import { getResidenceById } from '@/backend/services/residences';
import { useAdminContracts } from '@/backend/hooks/admin/useAdminContracts';
import { useAdminResidences } from '@/backend/hooks/admin/useAdminResidences';
import { useToast } from '@/backend/hooks/use-toast';
import type { Contract, ContractForPeriod } from '@/shared/types';
import type { StudentWithUser } from '@/shared/types';

const consumptionSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  residenceId: z.string().min(1, 'Residence is required'),
  roomNumber: z.string().min(1, 'Room number is required'),
  billingMonth: z.number().min(1).max(12),
  billingYear: z.number().min(2020).max(2100),
  consumptionKwh: z.number().positive('Consumption must be positive'),
  sendNotification: z.boolean(),
});

type FormData = z.infer<typeof consumptionSchema>;

export function EnergyConsumptionForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [contractInfo, setContractInfo] = useState<ContractForPeriod | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithUser | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(consumptionSchema),
    defaultValues: {
      studentId: '',
      residenceId: '',
      roomNumber: '',
      billingMonth: new Date().getMonth() + 1,
      billingYear: new Date().getFullYear(),
      consumptionKwh: 0,
      sendNotification: false,
    },
  });

  // Fetch active contracts
  const { data: contracts = [], isLoading: contractsLoading } = useAdminContracts({ status: 'active' });
  // Fetch residences for getting residence names
  const { data: residences = [] } = useAdminResidences();

  const mutation = useMutation({
    mutationFn: createEnergyConsumption,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['energy-consumption'] });
      toast({
        title: 'Success',
        description: 'Consumption registered successfully',
      });
      navigate('/admin/energy');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to register consumption',
        variant: 'destructive',
      });
    },
  });

  // Watch form values
  const studentId = form.watch('studentId');
  const residenceId = form.watch('residenceId');
  const roomNumber = form.watch('roomNumber');
  const billingMonth = form.watch('billingMonth');
  const billingYear = form.watch('billingYear');
  const consumptionKwh = form.watch('consumptionKwh');

  // Handle student selection
  const handleStudentSelect = (selectedStudentId: string, student: StudentWithUser | null) => {
    setSelectedStudent(student);
    const contract = contracts.find(c => c.studentId === selectedStudentId);
    if (contract) {
      setSelectedContract(contract);
      form.setValue('studentId', selectedStudentId);
      form.setValue('residenceId', contract.residenceId);
      form.setValue('roomNumber', contract.roomNumber);
    } else {
      // If no contract found, still set student but clear contract fields
      form.setValue('studentId', selectedStudentId);
      form.setValue('residenceId', '');
      form.setValue('roomNumber', '');
      setSelectedContract(null);
    }
  };

  // Contract lookup effect for the specific billing period
  useEffect(() => {
    if (residenceId && roomNumber && billingMonth && billingYear) {
      setLookupLoading(true);
      findContractForRoom(residenceId, roomNumber, billingMonth, billingYear)
        .then(setContractInfo)
        .catch(() => setContractInfo(null))
        .finally(() => setLookupLoading(false));
    } else {
      setContractInfo(null);
    }
  }, [residenceId, roomNumber, billingMonth, billingYear]);

  // Calculate limit comparison
  const exceedsLimit =
    contractInfo && consumptionKwh > contractInfo.monthlyKwhLimit;
  const excessAmount = exceedsLimit
    ? consumptionKwh - contractInfo.monthlyKwhLimit
    : 0;

  const onSubmit = async (data: FormData) => {
    // Ensure we have required fields
    if (!data.residenceId || !data.roomNumber) {
      toast({
        title: 'Error',
        description: 'Residence and room are required',
        variant: 'destructive',
      });
      return;
    }

    // Try to find contract if not already found
    let finalContractInfo = contractInfo;
    if (!finalContractInfo && data.residenceId && data.roomNumber) {
      try {
        finalContractInfo = await findContractForRoom(
          data.residenceId,
          data.roomNumber,
          data.billingMonth,
          data.billingYear
        );
      } catch (error) {
        console.error('Error finding contract:', error);
      }
    }

    // Use contract info if available, otherwise use selected student info
    const studentId = finalContractInfo?.studentId || data.studentId;
    const studentName = finalContractInfo?.studentName || selectedStudent?.name || null;
    const studentEmail = finalContractInfo?.studentEmail || selectedStudent?.email || null;

    // Get residence name from contract, residences list, or fetch it
    let residenceName = selectedContract?.residenceName;
    if (!residenceName && data.residenceId) {
      // Try to find in the residences list first
      const residence = residences.find(r => r.id === data.residenceId);
      if (residence) {
        residenceName = residence.name;
      } else {
        // Fallback: fetch it
        try {
          const fetchedResidence = await getResidenceById(data.residenceId);
          residenceName = fetchedResidence?.name || 'Unknown Residence';
        } catch (error) {
          console.error('Error fetching residence:', error);
          residenceName = 'Unknown Residence';
        }
      }
    }

    await mutation.mutateAsync({
      residenceId: data.residenceId,
      residenceName: residenceName || 'Unknown',
      roomNumber: data.roomNumber,
      billingMonth: data.billingMonth,
      billingYear: data.billingYear,
      consumptionKwh: data.consumptionKwh,
      contractId: finalContractInfo?.contractId || null,
      studentId: studentId || null,
      studentName: studentName,
      studentEmail: studentEmail,
      contractMonthlyLimit: finalContractInfo?.monthlyKwhLimit || null,
    });

    // TODO: Send notification if checkbox checked
    if (data.sendNotification && finalContractInfo) {
      // await sendConsumptionNotification(record.id);
      console.log('Notification would be sent');
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Register Energy Consumption</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Student Selector */}
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student *</FormLabel>
                  <FormControl>
                    <StudentSearchCombobox
                      value={field.value}
                      onValueChange={handleStudentSelect}
                      disabled={contractsLoading}
                      placeholder={contractsLoading ? "Loading..." : "Search student..."}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Auto-filled Information (shown after student selection with contract) */}
            {selectedContract && (
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Residence</div>
                  <div className="font-medium">{selectedContract.residenceName}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Room Type</div>
                  <div className="font-medium">{selectedContract.roomTypeName}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Room</div>
                  <div className="font-medium">{selectedContract.roomNumber}</div>
                </div>
              </div>
            )}

            {/* Manual input fields (shown when student selected but no contract) */}
            {selectedStudent && !selectedContract && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <FormField
                  control={form.control}
                  name="residenceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Residence *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select residence" />
                        </SelectTrigger>
                        <SelectContent>
                          {residences.map((residence) => (
                            <SelectItem key={residence.id} value={residence.id}>
                              {residence.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="roomNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 101A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Billing Period and Consumption */}
            <div className="grid grid-cols-2 gap-4">
              <FormItem>
                <FormLabel>Billing Period *</FormLabel>
                <PeriodSelector
                  value={{
                    month: form.watch('billingMonth'),
                    year: form.watch('billingYear'),
                  }}
                  onChange={(period) => {
                    form.setValue('billingMonth', period.month);
                    form.setValue('billingYear', period.year);
                  }}
                  allowAnyPeriod={true}
                />
              </FormItem>

              <FormField
                control={form.control}
                name="consumptionKwh"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Consumption (kWh) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contract Info Card */}
            {lookupLoading && (
              <Alert>
                <AlertDescription>Looking for contract...</AlertDescription>
              </Alert>
            )}

            {!lookupLoading && contractInfo && (
              <Alert className={exceedsLimit ? 'border-destructive' : 'border-primary'}>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="font-semibold">📋 Contract Found</div>
                    <div className="text-sm space-y-1">
                      <div>Student: {contractInfo.studentName}</div>
                      <div>Monthly Limit: {contractInfo.monthlyKwhLimit} kWh</div>
                    </div>

                    {/* Coverage Warning */}
                    {contractInfo.coverageNote && (
                      <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
                        <div className="text-sm text-amber-800 dark:text-amber-200">
                          {contractInfo.coverageNote}
                        </div>
                      </div>
                    )}

                    {exceedsLimit && (
                      <div className="mt-3 p-3 bg-destructive/10 rounded-md flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                        <div className="text-sm text-destructive">
                          <strong>This consumption exceeds the limit by {excessAmount.toFixed(1)} kWh</strong>
                        </div>
                      </div>
                    )}

                    {!exceedsLimit && (
                      <div className="mt-3 p-3 bg-primary/10 rounded-md flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                        <div className="text-sm text-primary">
                          Consumption within contract limit
                        </div>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {!lookupLoading && !contractInfo && studentId && residenceId && roomNumber && (
              <Alert>
                <AlertDescription className="text-sm text-muted-foreground">
                  ℹ️ No active contract found for this student in the selected period
                </AlertDescription>
              </Alert>
            )}

            {/* Send Notification */}
            {contractInfo && (
              <FormField
                control={form.control}
                name="sendNotification"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">
                      Send email notification to student
                    </FormLabel>
                  </FormItem>
                )}
              />
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/energy')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving...' : 'Save Consumption'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
