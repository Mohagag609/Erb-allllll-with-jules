import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runPartnerSettlement } from '@/services/settlements/partner';
import * as journalService from '@/services/accounting/journal';
import prisma from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

// Mock dependencies
vi.mock('@/lib/prisma');
vi.mock('@/services/accounting/journal');

describe('Partner Settlement Service', () => {
  const mockTx = {
    projectPartner: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
    journalLine: {
      aggregate: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.resetAllMocks();
    // Setup the mock for prisma transaction
    (prisma.$transaction as vi.Mock).mockImplementation(async (callback) => callback(mockTx));
  });

  it('should correctly calculate and generate a settlement transaction', async () => {
    // 1. Setup: Define the partners and their wallet balances
    const mockPartners = [
      { id: 'p1', projectId: 'proj1', partnerId: 'partner1', walletAccountId: 'w1', previousCarry: new Decimal(0) },
      { id: 'p2', projectId: 'proj1', partnerId: 'partner2', walletAccountId: 'w2', previousCarry: new Decimal(0) },
    ];

    mockTx.projectPartner.findMany.mockResolvedValue(mockPartners);

    // Mock the balance fetching for each wallet
    mockTx.journalLine.aggregate
      .mockResolvedValueOnce({ _sum: { debit: new Decimal(1000), credit: new Decimal(0) } }) // Partner 1 balance = 1000
      .mockResolvedValueOnce({ _sum: { debit: new Decimal(3000), credit: new Decimal(0) } }); // Partner 2 balance = 3000

    // Mock the createJournalEntry function to capture its input
    const createJournalEntrySpy = vi.spyOn(journalService, 'createJournalEntry');
    createJournalEntrySpy.mockResolvedValue({ id: 'settlement-je-id', createdBy: '', date: new Date(), description: '', posted: true, reversedEntryId: null, updatedAt: new Date(), createdAt: new Date(), projectId: null, ref: null });

    // 2. Execute: Run the settlement process
    const result = await runPartnerSettlement('proj1');

    // 3. Assert: Verify the results

    // Average should be (1000 + 3000) / 2 = 2000
    expect(result.newAverage.toNumber()).toBe(2000);

    // The journal entry should be called once
    expect(createJournalEntrySpy).toHaveBeenCalledOnce();

    // Check the lines of the journal entry
    const journalCall = createJournalEntrySpy.mock.calls[0][0];
    expect(journalCall.description).toContain('تسوية الشركاء');
    expect(journalCall.lines).toHaveLength(2);

    const creditLine = journalCall.lines.find(l => l.credit > 0);
    const debitLine = journalCall.lines.find(l => l.debit > 0);

    // Partner 2 (creditor in this context, has 3000, needs 2000) has to pay 1000. So their wallet is credited.
    expect(creditLine?.accountId).toBe('w2');
    expect(creditLine?.credit).toBe(1000);

    // Partner 1 (debtor, has 1000, needs 2000) has to receive 1000. So their wallet is debited.
    expect(debitLine?.accountId).toBe('w1');
    expect(debitLine?.debit).toBe(1000);

    // Check that previousCarry is updated correctly for both partners
    expect(mockTx.projectPartner.update).toHaveBeenCalledTimes(2);
    expect(mockTx.projectPartner.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: { previousCarry: new Decimal(2000) },
    });
    expect(mockTx.projectPartner.update).toHaveBeenCalledWith({
      where: { id: 'p2' },
      data: { previousCarry: new Decimal(2000) },
    });
  });
});
