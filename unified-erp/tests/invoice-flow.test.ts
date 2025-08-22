import { describe, it, expect, vi, beforeEach } from 'vitest';
import { postInvoice } from '@/services/accounting/invoices';
import * as journalService from '@/services/accounting/journal';
import prisma from '@/lib/prisma';
import { InvoiceStatus, InvoiceType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Mock dependencies
vi.mock('@/lib/prisma');
vi.mock('@/services/accounting/journal');

describe('Invoice Service - postInvoice', () => {
  const mockTx = {
    invoice: { update: vi.fn() },
  };

  beforeEach(() => {
    vi.resetAllMocks();
    // Setup the mock for prisma transaction
    (prisma.$transaction as any).mockImplementation(async (callback: any) => callback(mockTx));
    // Mock prisma's findUnique used outside the transaction
    (prisma.invoice.findUnique as any) = vi.fn();
  });

  it('should post a draft invoice, update its status, and create a balanced journal entry', async () => {
    // 1. Setup
    const draftInvoice = {
      id: 'inv1',
      status: InvoiceStatus.draft,
      type: InvoiceType.customer,
      number: 'INV-001',
      date: new Date(),
      total: new Decimal(5000),
      clientId: 'client1',
    };
    (prisma.invoice.findUnique as any).mockResolvedValue(draftInvoice);

    const createJournalEntrySpy = vi.spyOn(journalService, 'createJournalEntry');
    createJournalEntrySpy.mockResolvedValue({ id: 'je-id',} as any);

    // 2. Execute
    await postInvoice('inv1');

    // 3. Assert
    // Check that invoice status is updated to 'posted'
    expect(mockTx.invoice.update).toHaveBeenCalledOnce();
    expect(mockTx.invoice.update).toHaveBeenCalledWith({
      where: { id: 'inv1' },
      data: { status: InvoiceStatus.posted },
    });

    // Check that the journal entry was created correctly
    expect(createJournalEntrySpy).toHaveBeenCalledOnce();
    const journalCall = createJournalEntrySpy.mock.calls[0][0];
    expect(journalCall.description).toContain('ترحيل فاتورة');
    expect(journalCall.lines).toHaveLength(2);

    const debitLine = journalCall.lines.find((l: any) => l.debit > 0);
    const creditLine = journalCall.lines.find((l: any) => l.credit > 0);

    // For a customer invoice: Dr: AR (1130), Cr: Revenue (4100)
    expect(debitLine?.accountId).toBe("1130");
    expect(debitLine?.debit).toBe(5000);
    expect(creditLine?.accountId).toBe("4100");
    expect(creditLine?.credit).toBe(5000);
  });

  it('should throw an error if trying to post an already posted invoice', async () => {
    const postedInvoice = {
      id: 'inv2',
      status: InvoiceStatus.posted,
      // ...other fields
    };
    (prisma.invoice.findUnique as any).mockResolvedValue(postedInvoice);

    await expect(postInvoice('inv2')).rejects.toThrow(
      "يمكن فقط ترحيل الفواتير في حالة 'مسودة'."
    );
  });
});
