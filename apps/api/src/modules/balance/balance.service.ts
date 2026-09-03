import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BalanceService {
  constructor(private readonly prisma: PrismaService) {}

  async getForUser(userId: string) {
    const [user, transactions] = await this.prisma.$transaction([
      this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { balance: true } }),
      this.prisma.balanceTransaction.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 }),
    ]);
    return {
      balance: user.balance.toString(),
      transactions: transactions.map((transaction) => ({
        ...transaction,
        amount: transaction.amount.toString(),
        createdAt: transaction.createdAt.toISOString(),
      })),
    };
  }
}
