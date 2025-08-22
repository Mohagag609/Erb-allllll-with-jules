import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createJournalEntry } from '@/services/accounting/journal';
import prisma from '@/lib/prisma';

// Mock dependencies
vi.mock('@/lib/prisma');

describe('Journal Service - createJournalEntry', () => {
  const mockTx = {
    journalEntry: { create: vi.fn() },
    journalLine: { createMany: vi.fn() },
  };

  beforeEach(() => {
    vi.resetAllMocks();
    // Setup the mock for prisma transaction
    (prisma.$transaction as any).mockImplementation(async (callback: any) => {
      return callback(mockTx);
    });
  });

  it('should create a balanced journal entry with lines', async () => {
    // 1. Setup
    const mockJournalEntry = { id: 'je-1', date: new Date(), description: 'Test Entry' };
    mockTx.journalEntry.create.mockResolvedValue(mockJournalEntry);
    mockTx.journalLine.createMany.mockResolvedValue({ count: 2 });

    const journalInput = {
      date: new Date(),
      description: 'Test Journal Entry',
      lines: [
        { accountId: 'acc1', debit: 1000, credit: 0 },
        { accountId: 'acc2', debit: 0, credit: 1000 },
      ],
    };

    // 2. Execute
    const result = await createJournalEntry(journalInput);

    // 3. Assert
    expect(mockTx.journalEntry.create).toHaveBeenCalledWith({
      data: {
        date: journalInput.date,
        description: journalInput.description,
        posted: true,
        createdBy: 'system',
      },
    });

    expect(mockTx.journalLine.createMany).toHaveBeenCalledWith({
      data: [
        {
          accountId: 'acc1',
          debit: 1000,
          credit: 0,
          entryId: 'je-1',
        },
        {
          accountId: 'acc2',
          debit: 0,
          credit: 1000,
          entryId: 'je-1',
        },
      ],
    });

    expect(result).toEqual(mockJournalEntry);
  });

  it('should throw error for unbalanced journal entry', async () => {
    const journalInput = {
      date: new Date(),
      description: 'Unbalanced Entry',
      lines: [
        { accountId: 'acc1', debit: 1000, credit: 0 },
        { accountId: 'acc2', debit: 0, credit: 500 }, // Unbalanced
      ],
    };

    await expect(createJournalEntry(journalInput)).rejects.toThrow('القيد غير متوازن');
  });
});
