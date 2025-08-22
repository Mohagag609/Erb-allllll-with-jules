"use server"

import prisma from "@/lib/prisma";
import { createJournalEntry } from "../accounting/journal";
import { Decimal } from "@prisma/client/runtime/library";

async function getAccountBalance(accountId: string, tx: any): Promise<Decimal> {
    const { _sum } = await tx.journalLine.aggregate({
        where: { accountId },
        _sum: {
            debit: true,
            credit: true,
        },
    });
    return (_sum.debit ?? new Decimal(0)).sub(_sum.credit ?? new Decimal(0));
}

export async function runPartnerSettlement(projectId: string) {
    return await prisma.$transaction(async (tx: any) => {
        const projectPartners = await tx.projectPartner.findMany({
            where: { projectId },
        });

        if (projectPartners.length < 2) {
            throw new Error("يجب وجود شريكين على الأقل لتنفيذ التسوية.");
        }

        const partnerData = await Promise.all(projectPartners.map(async (p: any) => {
            const balance = await getAccountBalance(p.walletAccountId, tx);
            return { ...p, balance };
        }));

        const totalContributions = partnerData.reduce((sum, p) => sum.add(p.balance), new Decimal(0));
        const averageContribution = totalContributions.div(partnerData.length);

        const debtors = partnerData
            .map(p => ({ ...p, due: p.balance.sub(averageContribution) }))
            .filter(p => p.due.isNegative())
            .sort((a, b) => a.due.comparedTo(b.due));

        const creditors = partnerData
            .map(p => ({ ...p, due: p.balance.sub(averageContribution) }))
            .filter(p => p.due.isPositive())
            .sort((a, b) => b.due.comparedTo(a.due));

        const journalLines = [];
        let debtorIndex = 0;
        let creditorIndex = 0;

        while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
            const debtor = debtors[debtorIndex];
            const creditor = creditors[creditorIndex];

            const amountToTransfer = Decimal.min(creditor.due, debtor.due.abs());

            journalLines.push({ accountId: creditor.walletAccountId, debit: amountToTransfer.toNumber(), credit: 0 });
            journalLines.push({ accountId: debtor.walletAccountId, debit: 0, credit: amountToTransfer.toNumber() });

            creditor.due = creditor.due.sub(amountToTransfer);
            debtor.due = debtor.due.add(amountToTransfer);

            if (creditor.due.isZero()) creditorIndex++;
            if (debtor.due.isZero()) debtorIndex++;
        }

        if (journalLines.length > 0) {
            // Create journal entry outside the transaction to avoid nested transaction issues
            await createJournalEntry({
                date: new Date(),
                description: `تسوية الشركاء للمشروع ${projectId}`,
                lines: journalLines,
            });
        }

        // After settlement, every partner's effective balance is the average.
        // We update the previousCarry to this new baseline for the next period.
        await Promise.all(projectPartners.map((p: any) =>
            tx.projectPartner.update({
                where: { id: p.id },
                data: { previousCarry: averageContribution },
            })
        ));

        return { newAverage: averageContribution };
    }, {
        maxWait: 10000, // 10 seconds
        timeout: 20000, // 20 seconds
    });
}
