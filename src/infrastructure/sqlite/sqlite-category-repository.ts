import { randomUUID } from 'expo-crypto';
import { db } from './db';
import { categories } from './drizzle/schema';
import { isNull } from 'drizzle-orm';
import type { CategoryRepository, CategoryInput, CategoryRecord } from '@/application/ports/category-repository.port';

const DEFAULT_CATEGORIES: { name: string; emoji: string }[] = [
  { name: 'Groceries',   emoji: '🛒' },
  { name: 'Dining',      emoji: '🍽️' },
  { name: 'Transport',   emoji: '🚌' },
  { name: 'Health',      emoji: '💊' },
  { name: 'Household',   emoji: '🏠' },
  { name: 'Other',       emoji: '📦' },
];

export class SqliteCategoryRepository implements CategoryRepository {
  async save(cat: CategoryInput): Promise<void> {
    const now = new Date().toISOString();
    await db.insert(categories).values({
      id:        cat.id,
      name:      cat.name,
      emoji:     cat.emoji ?? null,
      isDefault: cat.isDefault ?? false,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    }).onConflictDoUpdate({
      target: categories.id,
      set: { name: cat.name, emoji: cat.emoji ?? null, updatedAt: now },
    });
  }

  async findAll(): Promise<CategoryRecord[]> {
    const rows = await db.select().from(categories).where(isNull(categories.deletedAt));
    return rows.map(r => ({
      id:        r.id,
      name:      r.name,
      ...(r.emoji != null ? { emoji: r.emoji } : {}),
      isDefault: r.isDefault,
      createdAt: new Date(r.createdAt),
      updatedAt: new Date(r.updatedAt),
      ...(r.deletedAt != null ? { deletedAt: new Date(r.deletedAt) } : {}),
    }));
  }

  async seedDefaults(): Promise<void> {
    const existing = await this.findAll();
    if (existing.length > 0) return;
    const now = new Date().toISOString();
    for (const cat of DEFAULT_CATEGORIES) {
      await db.insert(categories).values({
        id:        randomUUID(),
        name:      cat.name,
        emoji:     cat.emoji,
        isDefault: true,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      }).onConflictDoNothing();
    }
  }
}
