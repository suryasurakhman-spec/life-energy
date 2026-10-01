CREATE TABLE `capital_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`month` text NOT NULL,
	`capital_minor` integer NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`annual_rate_pct` integer DEFAULT 4 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`emoji` text,
	`is_default` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE TABLE `conversions` (
	`id` text PRIMARY KEY NOT NULL,
	`price_minor` integer NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`hours_minutes` integer NOT NULL,
	`verdict` text,
	`source` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` text PRIMARY KEY NOT NULL,
	`amount_minor` integer NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`category_id` text,
	`spent_at` text NOT NULL,
	`note` text,
	`wage_profile_id` text NOT NULL,
	`verdict` text,
	`source` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE TABLE `incomes` (
	`id` text PRIMARY KEY NOT NULL,
	`amount_minor` integer NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`month` text NOT NULL,
	`source` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE TABLE `monthly_reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`month` text NOT NULL,
	`category_id` text NOT NULL,
	`q1_verdict` text,
	`q2_verdict` text,
	`q3_verdict` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `wage_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`effective_from` text NOT NULL,
	`net_pay_minor` integer NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`pay_period` text NOT NULL,
	`paid_hours_per_week` integer NOT NULL,
	`job_costs_minor` integer DEFAULT 0 NOT NULL,
	`job_hours_per_month` integer DEFAULT 0 NOT NULL,
	`real_wage_cached` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text
);
