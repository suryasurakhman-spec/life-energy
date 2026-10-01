export interface CategoryInput {
  id: string;
  name: string;
  emoji?: string;
  isDefault?: boolean;
}

export interface CategoryRecord extends CategoryInput {
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface CategoryRepository {
  save(category: CategoryInput): Promise<void>;
  findAll(): Promise<CategoryRecord[]>;
  seedDefaults(): Promise<void>;
}
