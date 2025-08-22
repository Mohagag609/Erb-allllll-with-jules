"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createContract } from "@/services/real-estate/contracts";
import { getClients } from "@/services/real-estate/clients";
import { getUnits } from "@/services/real-estate/units";
import { Client, Unit, PlanType, UnitStatus } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const NewContractSchema = z.object({
  clientId: z.string().cuid("يجب تحديد عميل"),
  unitId: z.string().cuid("يجب تحديد وحدة"),
  startDate: z.string().min(1, "تاريخ البدء مطلوب"),
  totalAmount: z.coerce.number().positive(),
  downPayment: z.coerce.number().min(0),
  months: z.coerce.number().int().positive(),
  planType: z.nativeEnum(PlanType),
});

type NewContractValues = z.infer<typeof NewContractSchema>;

export default function NewContractPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [availableUnits, setAvailableUnits] = useState<Unit[]>([]);

  useEffect(() => {
    async function fetchData() {
      const allClients = await getClients();
      const allUnits = await getUnits();
      setClients(allClients);
      setAvailableUnits(allUnits.filter(u => u.status === UnitStatus.available));
    }
    fetchData();
  }, []);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<NewContractValues>({
    resolver: zodResolver(NewContractSchema),
  });

  const processForm = async (data: NewContractValues) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => formData.append(key, String(value)));

    try {
      await createContract(formData);
      router.push("/real-estate/contracts");
    } catch (error) {
      // In a real app, show a toast notification
      console.error(error);
      alert((error as Error).message);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>إنشاء عقد جديد</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(processForm)} className="grid grid-cols-2 gap-6">
          <div className="col-span-2 sm:col-span-1">
            <Label>العميل</Label>
            <Controller
              name="clientId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger><SelectValue placeholder="اختر عميل..." /></SelectTrigger>
                  <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              )}
            />
            {errors.clientId && <p className="text-red-500 text-xs mt-1">{errors.clientId.message}</p>}
          </div>

          <div className="col-span-2 sm:col-span-1">
            <Label>الوحدة المتاحة</Label>
            <Controller
              name="unitId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger><SelectValue placeholder="اختر وحدة..." /></SelectTrigger>
                  <SelectContent>{availableUnits.map(u => <SelectItem key={u.id} value={u.id}>{u.code} - {u.type}</SelectItem>)}</SelectContent>
                </Select>
              )}
            />
            {errors.unitId && <p className="text-red-500 text-xs mt-1">{errors.unitId.message}</p>}
          </div>

          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor="totalAmount">المبلغ الإجمالي</Label>
            <Input id="totalAmount" type="number" {...register("totalAmount")} />
            {errors.totalAmount && <p className="text-red-500 text-xs mt-1">{errors.totalAmount.message}</p>}
          </div>

          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor="downPayment">الدفعة المقدمة</Label>
            <Input id="downPayment" type="number" {...register("downPayment")} />
            {errors.downPayment && <p className="text-red-500 text-xs mt-1">{errors.downPayment.message}</p>}
          </div>

          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor="startDate">تاريخ بداية العقد</Label>
            <Input id="startDate" type="date" {...register("startDate")} />
            {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>}
          </div>

          <div className="col-span-2 sm:col-span-1">
            <Label>نظام السداد</Label>
             <Controller
              name="planType"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger><SelectValue placeholder="اختر نظام السداد..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PlanType.MONTHLY}>شهري</SelectItem>
                    <SelectItem value={PlanType.QUARTERLY}>ربع سنوي</SelectItem>
                    <SelectItem value={PlanType.YEARLY}>سنوي</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.planType && <p className="text-red-500 text-xs mt-1">{errors.planType.message}</p>}
          </div>

          <div className="col-span-2">
             <Label htmlFor="months">مدة العقد (بالأشهر)</Label>
            <Input id="months" type="number" {...register("months")} />
            {errors.months && <p className="text-red-500 text-xs mt-1">{errors.months.message}</p>}
          </div>

          <div className="col-span-2 flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "جاري الإنشاء..." : "إنشاء العقد وتوليد الأقساط"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
