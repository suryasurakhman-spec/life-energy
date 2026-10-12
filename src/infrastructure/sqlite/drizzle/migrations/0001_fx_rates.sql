CREATE TABLE `fx_rates` (
	`base` text NOT NULL,
	`quote` text NOT NULL,
	`rate` real NOT NULL,
	`as_of` text NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`base`, `quote`)
);
