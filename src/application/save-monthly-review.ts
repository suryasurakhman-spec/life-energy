import { randomUUID } from 'expo-crypto';
import { db } from '@/infrastructure/sqlite/db';
import { monthlyReviews } from '@/infrastructure/sqlite/drizzle/schema';
import { and, eq } from 'drizzle-orm';

export type ReviewVerdict = 'worth_it' | 'not_sure' | 'not_worth_it';

export interface MonthlyReviewInput {
  month: string;      // 'YYYY-MM'
  categoryId: string;
  q1Verdict?: ReviewVerdict;
  q2Verdict?: ReviewVerdict;
  q3Verdict?: ReviewVerdict;
}

export async function saveMonthlyReview(input: MonthlyReviewInput): Promise<void> {
  const now = new Date().toISOString();
  const existing = await db.select().from(monthlyReviews)
    .where(and(eq(monthlyReviews.month, input.month), eq(monthlyReviews.categoryId, input.categoryId)))
    .limit(1);

  if (existing.length > 0) {
    await db.update(monthlyReviews)
      .set({
        q1Verdict: input.q1Verdict ?? null,
        q2Verdict: input.q2Verdict ?? null,
        q3Verdict: input.q3Verdict ?? null,
        updatedAt: now,
      })
      .where(and(eq(monthlyReviews.month, input.month), eq(monthlyReviews.categoryId, input.categoryId)));
  } else {
    await db.insert(monthlyReviews).values({
      id:         randomUUID(),
      month:      input.month,
      categoryId: input.categoryId,
      q1Verdict:  input.q1Verdict ?? null,
      q2Verdict:  input.q2Verdict ?? null,
      q3Verdict:  input.q3Verdict ?? null,
      createdAt:  now,
      updatedAt:  now,
    });
  }
}
