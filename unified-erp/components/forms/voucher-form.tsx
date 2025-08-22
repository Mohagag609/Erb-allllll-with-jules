"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createVoucher } from "@/services/accounting/vouchers";
import { useEffect, useState } from "react";
import { Cashbox, AccountGL } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

// These would be fetched from the server
async function getCashboxes(): Promise<Cashbox[]> {
    const res = await fetch('/api/accounting/cashboxes'); // Assuming an API route exists
    if (!res.ok) return [];
    return res.json();
}
async function getChartOfAccounts(): Promise<AccountGL[]> {
    // This is a placeholder. In a real app, you'd fetch this.
    return [];
}


const VoucherFormSchema = z.object({
  kind: z.enum(["receipt", "payment"]),
  cashboxId: z.string().cuid("يجب تحديد الخزنة"),
  amount: z.coerce.number().positive("المبلغ يجب أن يكون موجبًا"),
  date: z.string().min(1, "التاريخ مطلوب"),
  note: z.string().min(1, "البيان مطلوب"),
  targetAccountId: z.string().cuid("يجب تحديد الحساب المقابل"),
});

type VoucherFormValues = z.infer<typeof VoucherFormSchema>;

export function VoucherForm({ onFormSubmit }: { onFormSubmit: () => void }) {
  const [cashboxes, setCashboxes] = useState<Cashbox[]>([]);
  const [accounts, setAccounts] = useState<AccountGL[]>([]);

  // Fetch data for dropdowns
  useEffect(() => {
    // In a real app, you would fetch cashboxes and accounts here.
    // For now, this is a placeholder.
  }, []);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<VoucherFormValues>();

  const processForm = async (data: VoucherFormValues) => {
    try {
      // The service expects a Date object for the date field
      const submissionData = {
        ...data,
        date: new Date(data.date),
      };
      await createVoucher(submissionData);
      toast({ title: "نجاح", description: "تم إنشاء السند بنجاح." });
      reset();
      onFormSubmit();
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: (error as Error).message });
    }
  };

  return (
    <form onSubmit={handleSubmit(processForm)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
            <Label>نوع السند</Label>
            <Controller name="kind" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger><SelectValue placeholder="اختر النوع..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="receipt">سند قبض</SelectItem>
                        <SelectItem value="payment">سند صرف</SelectItem>
                    </SelectContent>
                </Select>
            )} />
            {errors.kind && <p className="text-red-500 text-xs mt-1">{errors.kind.message}</p>}
        </div>
        <div>
            <Label>الخزنة / البنك</Label>
            <Controller name="cashboxId" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger><SelectValue placeholder="اختر الخزنة..." /></SelectTrigger>
                    <SelectContent>
                        {/* Placeholder */}
                        <SelectItem value="clgq0x1z00000v2q1h8g1z2x3">صندوق الإدارة</SelectItem>
                    </SelectContent>
                </Select>
            )} />
            {errors.cashboxId && <p className="text-red-500 text-xs mt-1">{errors.cashboxId.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
            <Label htmlFor="amount">المبلغ</Label>
            <Input id="amount" type="number" {...register("amount")} />
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
        </div>
        <div>
            <Label htmlFor="date">التاريخ</Label>
            <Input id="date" type="date" {...register("date")} />
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
        </div>
      </div>

      <div>
        <Label>الحساب المقابل</Label>
        <Controller name="targetAccountId" control={control} render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger><SelectValue placeholder="اختر الحساب..." /></SelectTrigger>
                <SelectContent>
                    {/* Placeholder */}
                    <SelectItem value="clgq0x1z00000v2q1h8g1z2x4">العملاء (الذمم المدينة)</SelectItem>
                    <SelectItem value="clgq0x1z00000v2q1h8g1z2x5">الموردون (الذمم الدائنة)</SelectItem>
                </SelectContent>
            </Select>
        )} />
        {errors.targetAccountId && <p className="text-red-500 text-xs mt-1">{errors.targetAccountId.message}</p>}
      </div>

      <div>
        <Label htmlFor="note">البيان / ملاحظات</Label>
        <Input id="note" {...register("note")} />
        {errors.note && <p className="text-red-500 text-xs mt-1">{errors.note.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "جاري الحفظ..." : "حفظ السند"}
      </Button>
    </form>
  );
}
