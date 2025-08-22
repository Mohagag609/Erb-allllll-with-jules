"use client";

import { useState, useEffect } from "react";
import { getJournalEntries } from "@/services/accounting/journal";
import { JournalEntry, JournalLine, AccountGL } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import { formatCurrency } from "@/lib/currency"; // I will create this helper file next

type JournalEntryWithRelations = JournalEntry & {
  lines: (JournalLine & { account: AccountGL })[];
};

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntryWithRelations[]>([]);

  useEffect(() => {
    async function fetchData() {
      const data = await getJournalEntries();
      setEntries(data as JournalEntryWithRelations[]);
    }
    fetchData();
  }, []);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">دفتر اليومية</h1>
        <Button>إنشاء قيد يدوي</Button>
      </div>
      <div className="space-y-6">
        {entries.map((entry) => (
          <Card key={entry.id}>
            <CardHeader className="flex flex-row justify-between">
              <div>
                <CardTitle>قيد رقم: {entry.id.substring(0, 8)}</CardTitle>
                <CardDescription>{entry.description}</CardDescription>
              </div>
              <div className="text-sm text-gray-500">
                {dayjs(entry.date).format("YYYY/MM/DD")}
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الحساب</TableHead>
                    <TableHead className="text-right">مدين</TableHead>
                    <TableHead className="text-right">دائن</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entry.lines.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell>{line.account.name} ({line.account.code})</TableCell>
                      <TableCell className="text-right font-mono">
                        {line.debit.toNumber() > 0 ? formatCurrency(line.debit.toNumber()) : "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {line.credit.toNumber() > 0 ? formatCurrency(line.credit.toNumber()) : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
                {/* Could add reversal button here */}
            </CardFooter>
          </Card>
        ))}
        {entries.length === 0 && (
            <p className="text-center text-gray-500">لا توجد قيود يومية لعرضها.</p>
        )}
      </div>
    </div>
  );
}
