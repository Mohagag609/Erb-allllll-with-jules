"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createDraftInvoice } from "@/services/accounting/invoices";
import { InvoiceType } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const InvoiceFormSchema = z.object({
  type: z.nativeEnum(InvoiceType),
  number: z.string().min(1, "رقم الفاتورة مطلوب"),
  date: z.string().min(1, "التاريخ مطلوب"),
  total: z.coerce.number().positive("المبلغ يجب أن يكون موجبًا"),
  // In a real app, you'd have one partyId and partyType,
  // and the available selection would change based on the invoice type.
  clientId: z.string().cuid().optional(),
});

type InvoiceFormValues = z.infer<typeof InvoiceFormSchema>;

export function InvoiceForm({ onFormSubmit }: { onFormSubmit: () => void }) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<InvoiceFormValues>();

  const processForm = async (data: InvoiceFormValues) => {
    try {
      const submissionData = {
        ...data,
        date: new Date(data.date),
      };
      await createDraftInvoice(submissionData);
      toast({ title: "نجاح", description: "تم إنشاء مسودة الفاتورة بنجاح." });
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
            <Label>نوع الفاتورة</Label>
            <Controller name="type" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger><SelectValue placeholder="اختر النوع..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value={InvoiceType.customer}>فاتورة عميل</SelectItem>
                        <SelectItem value={InvoiceType.supplier}>فاتورة مورد</SelectItem>
                        <SelectItem value={InvoiceType.contractor}>فاتورة مقاول</SelectItem>
                    </SelectContent>
                </Select>
            )} />
            {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
        </div>
        <div>
            <Label htmlFor="number">رقم الفاتورة</Label>
            <Input id="number" {...register("number")} />
            {errors.number && <p className="text-red-500 text-xs mt-1">{errors.number.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
            <Label htmlFor="total">المبلغ الإجمالي</Label>
            <Input id="total" type="number" {...register("total")} />
            {errors.total && <p className="text-red-500 text-xs mt-1">{errors.total.message}</p>}
        </div>
        <div>
            <Label htmlFor="date">تاريخ الفاتورة</Label>
            <Input id="date" type="date" {...register("date")} />
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
        </div>
      </div>

      {/* Add party selection here based on type */}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "جاري الحفظ..." : "حفظ كمسودة"}
      </Button>
    </form>
  );
}
