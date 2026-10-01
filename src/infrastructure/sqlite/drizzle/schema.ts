import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const wageProfiles = sqliteTable('wage_profiles', {
  id:               text('id').primaryKey(),
  effectiveFrom:    text('effective_from').notNull(),
  netPayMinor:      integer('net_pay_minor').notNull(),      // stored as number, cast to bigint in repo
  currency:         text('currency').notNull().default('USD'),
  payPeriod:        text('pay_period').notNull(),
  paidHoursPerWeek: integer('paid_hours_per_week').notNull(),
  jobCostsMinor:    integer('job_costs_minor').notNull().default(0),
  jobHoursPerMonth: integer('job_hours_per_month').notNull().default(0),
  realWageCached:   integer('real_wage_cached').notNull(),   // cents per hour * 100
  createdAt:        text('created_at').notNull(),
  updatedAt:        text('updated_at').notNull(),
  deletedAt:        text('deleted_at'),
});

export const expenses = sqliteTable('expenses', {
  id:            text('id').primaryKey(),
  amountMinor:   integer('amount_minor').notNull(),          // stored as number, cast to bigint in repo
  currency:      text('currency').notNull().default('USD'),
  categoryId:    text('category_id'),
  spentAt:       text('spent_at').notNull(),
  note:          text('note'),
  wageProfileId: text('wage_profile_id').notNull(),
  verdict:       text('verdict'),
  source:        text('source').notNull(),
  createdAt:     text('created_at').notNull(),
  updatedAt:     text('updated_at').notNull(),
  deletedAt:     text('deleted_at'),
});

export const categories = sqliteTable('categories', {
  id:        text('id').primaryKey(),
  name:      text('name').notNull(),
  emoji:     text('emoji'),
  isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
});

export const monthlyReviews = sqliteTable('monthly_reviews', {
  id:          text('id').primaryKey(),
  month:       text('month').notNull(),       // 'YYYY-MM'
  categoryId:  text('category_id').notNull(),
  q1Verdict:   text('q1_verdict'),            // 'worth_it' | 'not_sure' | 'not_worth_it'
  q2Verdict:   text('q2_verdict'),
  q3Verdict:   text('q3_verdict'),
  createdAt:   text('created_at').notNull(),
  updatedAt:   text('updated_at').notNull(),
});

export const incomes = sqliteTable('incomes', {
  id:          text('id').primaryKey(),
  amountMinor: integer('amount_minor').notNull(),
  currency:    text('currency').notNull().default('USD'),
  month:       text('month').notNull(),       // 'YYYY-MM'
  source:      text('source'),
  createdAt:   text('created_at').notNull(),
  updatedAt:   text('updated_at').notNull(),
  deletedAt:   text('deleted_at'),
});

export const capitalSnapshots = sqliteTable('capital_snapshots', {
  id:            text('id').primaryKey(),
  month:         text('month').notNull(),       // 'YYYY-MM'
  capitalMinor:  integer('capital_minor').notNull(),
  currency:      text('currency').notNull().default('USD'),
  annualRatePct: integer('annual_rate_pct').notNull().default(4), // stored * 100 (e.g. 400 = 4%)
  createdAt:     text('created_at').notNull(),
  updatedAt:     text('updated_at').notNull(),
});

export const conversions = sqliteTable('conversions', {
  id:           text('id').primaryKey(),
  priceMinor:   integer('price_minor').notNull(),
  currency:     text('currency').notNull().default('USD'),
  hoursMinutes: integer('hours_minutes').notNull(),
  verdict:      text('verdict'),
  source:       text('source').notNull(),
  createdAt:    text('created_at').notNull(),
});
