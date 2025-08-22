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
    projectPartner: { findMany: vi.fn(), update: vi.fn() },
    journalLine: { aggregate: vi.fn() },
  };

  beforeEach(() => {
    vi.resetAllMocks();
    // Setup the mock for prisma transaction
    (prisma.$transaction as any).mockImplementation(async (callback: any) => callback(mockTx));
  });

  it('should run partner settlement successfully', async () => {
    // 1. Setup
    const mockPartners = [
      { id: 'p1', projectId: 'proj1', walletAccountId: 'acc1', previousCarry: new Decimal(0) },
      { id: 'p2', projectId: 'proj1', walletAccountId: 'acc2', previousCarry: new Decimal(0) },
    ];

    mockTx.projectPartner.findMany.mockResolvedValue(mockPartners);
    mockTx.journalLine.aggregate
      .mockResolvedValueOnce({ _sum: { debit: new Decimal(1000), credit: new Decimal(0) } })
      .mockResolvedValueOnce({ _sum: { debit: new Decimal(0), credit: new Decimal(0) } });

    const createJournalEntrySpy = vi.spyOn(journalService, 'createJournalEntry');
    createJournalEntrySpy.mockResolvedValue({ id: 'je-1' } as any);

    // 2. Execute
    const result = await runPartnerSettlement('proj1');

    // 3. Assert
    expect(mockTx.projectPartner.findMany).toHaveBeenCalledWith({
      where: { projectId: 'proj1' },
    });

    expect(createJournalEntrySpy).toHaveBeenCalledWith({
      date: expect.any(Date),
      description: 'تسوية الشركاء للمشروع proj1',
      lines: expect.arrayContaining([
        expect.objectContaining({ accountId: 'acc1', debit: 500, credit: 0 }),
        expect.objectContaining({ accountId: 'acc2', debit: 0, credit: 500 }),
      ]),
    });

    expect(result).toEqual({ newAverage: new Decimal(500) });
  });

  it('should throw error for insufficient partners', async () => {
    mockTx.projectPartner.findMany.mockResolvedValue([{ id: 'p1' }]);

    await expect(runPartnerSettlement('proj1')).rejects.toThrow(
      'يجب وجود شريكين على الأقل لتنفيذ التسوية'
    );
  });
});
