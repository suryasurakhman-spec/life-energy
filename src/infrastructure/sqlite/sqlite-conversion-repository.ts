import { db } from './db';
import { conversions } from './drizzle/schema';
import type { ConversionRepository, ConversionInput } from '@/application/ports/conversion-repository.port';

export class SqliteConversionRepository implements ConversionRepository {
  async save(conversion: ConversionInput): Promise<void> {
    await db.insert(conversions).values({
      id:           conversion.id,
      priceMinor:   Number(conversion.priceMinor),
      currency:     conversion.currency,
      hoursMinutes: conversion.hoursMinutes,
      verdict:      conversion.verdict ?? null,
      source:       conversion.source,
      createdAt:    new Date().toISOString(),
    });
  }
}
