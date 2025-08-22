import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createJournalEntry } from '@/services/accounting/journal';
import prisma from '@/lib/prisma';

// Mock the prisma client to avoid database calls in unit tests
vi.mock('@/lib/prisma', () => ({
  default: {
    $transaction: vi.fn(),
  },
}));

describe('Journal Service - createJournalEntry', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw an error for an unbalanced journal entry', async () => {
    const unbalancedInput = {
      date: new Date(),
      description: 'Test unbalanced entry',
      lines: [
        { accountId: 'clgq0x1z00000v2q1h8g1z2x1', debit: 100, credit: 0 },
        { accountId: 'clgq0x1z00000v2q1h8g1z2x2', debit: 0, credit: 99.99 }, // Unbalanced
      ],
    };

    // We expect the function to throw an error containing the specific message
    await expect(createJournalEntry(unbalancedInput)).rejects.toThrow(
      /القيد غير متوازن/
    );
  });

  it('should successfully process a balanced journal entry', async () => {
    // Mock the transaction to simulate a successful database operation
    (prisma.$transaction as vi.Mock).mockImplementation(async (callback) => {
      const mockTx = {
        journalEntry: { create: vi.fn().mockResolvedValue({ id: 'test-entry-id' }) },
        journalLine: { createMany: vi.fn().mockResolvedValue({ count: 2 }) },
      };
      return await callback(mockTx);
    });

    const balancedInput = {
      date: new Date(),
      description: 'Test balanced entry',
      lines: [
        { accountId: 'clgq0x1z00000v2q1h8g1z2x1', debit: 100, credit: 0 },
        { accountId: 'clgq0x1z00000v2q1h8g1z2x2', debit: 0, credit: 100 },
      ],
    };

    // We expect it not to throw and to resolve with the created entry
    await expect(createJournalEntry(balancedInput)).resolves.toBeDefined();
    // Check if the transaction was actually called
    expect(prisma.$transaction).toHaveBeenCalledOnce();
  });

  it('should throw an error if a line has both debit and credit values > 0', async () => {
    const invalidLineInput = {
      date: new Date(),
      description: 'Test invalid line',
      lines: [
        { accountId: 'clgq0x1z00000v2q1h8g1z2x1', debit: 100, credit: 0 },
        { accountId: 'clgq0x1z00000v2q1h8g1z2x2', debit: 50, credit: 50 }, // Invalid line
      ],
    };

    // This check is in the Zod schema, so it should throw a validation error.
    await expect(createJournalEntry(invalidLineInput)).rejects.toThrow(
      'بيانات القيد غير صالحة'
    );
  });

  it('should throw an error for a zero-value entry', async () => {
    const zeroValueInput = {
      date: new Date(),
      description: 'Test zero value entry',
      lines: [
        { accountId: 'clgq0x1z00000v2q1h8g1z2x1', debit: 0, credit: 0 },
        { accountId: 'clgq0x1z00000v2q1h8g1z2x2', debit: 0, credit: 0 },
      ],
    };

    await expect(createJournalEntry(zeroValueInput)).rejects.toThrow(
      /القيد غير متوازن/ // The check for zero is combined with the balance check
    );
  });
});
