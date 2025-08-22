"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/services/real-estate/clients";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ClientFormSchema = z.object({
  name: z.string().min(3, "الاسم مطلوب (3 أحرف على الأقل)"),
  phone: z.string().optional(),
  email: z.string().email("بريد إلكتروني غير صالح").optional().or(z.literal('')),
  address: z.string().optional(),
  note: z.string().optional(),
});

type ClientFormValues = z.infer<typeof ClientFormSchema>;

export function ClientForm({ onFormSubmit }: { onFormSubmit: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ClientFormValues>({
    resolver: zodResolver(ClientFormSchema),
  });

  const processForm = async (data: ClientFormValues) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value) {
        formData.append(key, value);
      }
    });

    try {
      await createClient(formData);
      reset();
      onFormSubmit(); // To close the dialog
    } catch (error) {
      console.error("Failed to create client:", error);
      // In a real app, show a toast notification
      alert((error as Error).message);
    }
  };

  return (
    <form onSubmit={handleSubmit(processForm)} className="space-y-4">
      <div>
        <Label htmlFor="name">اسم العميل</Label>
        <Input id="name" {...register("name")} />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="phone">رقم الهاتف</Label>
        <Input id="phone" {...register("phone")} />
      </div>

      <div>
        <Label htmlFor="email">البريد الإلكتروني</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <Label htmlFor="address">العنوان</Label>
        <Input id="address" {...register("address")} />
      </div>

      <div>
        <Label htmlFor="note">ملاحظات</Label>
        <Input id="note" {...register("note")} />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "جاري الحفظ..." : "حفظ العميل"}
      </Button>
    </form>
  );
}
