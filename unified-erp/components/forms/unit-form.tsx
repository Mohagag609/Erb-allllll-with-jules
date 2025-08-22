"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createUnit } from "@/services/real-estate/units";
import { UnitStatus } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const UnitFormSchema = z.object({
  code: z.string().min(1, "الكود مطلوب"),
  type: z.string().min(2, "النوع مطلوب (سكني، تجاري، ...)"),
  price: z.coerce.number({ required_error: "السعر مطلوب" }).positive("يجب أن يكون السعر رقمًا موجبًا"),
  status: z.nativeEnum(UnitStatus),
  area: z.coerce.number().optional(),
  description: z.string().optional(),
});

type UnitFormValues = z.infer<typeof UnitFormSchema>;

export function UnitForm({ onFormSubmit }: { onFormSubmit: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
  } = useForm<UnitFormValues>({
    resolver: zodResolver(UnitFormSchema),
    defaultValues: {
        status: UnitStatus.available,
    }
  });

  const processForm = async (data: UnitFormValues) => {
    const formData = new FormData();
    // A bit of a pain to handle all fields, but necessary for server actions
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    try {
      await createUnit(formData);
      reset();
      onFormSubmit();
    } catch (error) {
      console.error("Failed to create unit:", error);
      // In a real app, show a toast notification
      alert((error as Error).message);
    }
  };

  return (
    <form onSubmit={handleSubmit(processForm)} className="grid grid-cols-2 gap-4">
      <div className="col-span-2 sm:col-span-1">
        <Label htmlFor="code">كود الوحدة</Label>
        <Input id="code" {...register("code")} />
        {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>}
      </div>

      <div className="col-span-2 sm:col-span-1">
        <Label htmlFor="type">نوع الوحدة</Label>
        <Input id="type" {...register("type")} />
        {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
      </div>

      <div className="col-span-2 sm:col-span-1">
        <Label htmlFor="price">السعر</Label>
        <Input id="price" type="number" step="0.01" {...register("price")} />
        {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
      </div>

      <div className="col-span-2 sm:col-span-1">
        <Label htmlFor="area">المساحة (م²)</Label>
        <Input id="area" type="number" step="0.01" {...register("area")} />
      </div>

      <div className="col-span-2 sm:col-span-1">
        <Label htmlFor="status">الحالة</Label>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger id="status">
                <SelectValue placeholder="اختر الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UnitStatus.available}>متاحة</SelectItem>
                <SelectItem value={UnitStatus.sold}>مباعة</SelectItem>
                <SelectItem value={UnitStatus.returned}>مرتجعة</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>}
      </div>

      <div className="col-span-2">
        <Label htmlFor="description">الوصف</Label>
        <Textarea id="description" {...register("description")} />
      </div>

      <div className="col-span-2 flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "جاري الحفظ..." : "حفظ الوحدة"}
        </Button>
      </div>
    </form>
  );
}
