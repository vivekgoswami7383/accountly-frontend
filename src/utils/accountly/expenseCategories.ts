import { Utensils, Car, Home, Zap, ShoppingBag, MoreHorizontal, LucideIcon } from 'lucide-react';
import { ExpenseCategory } from 'services/accountly/types';

export const EXPENSE_CATEGORY_LIST: ExpenseCategory[] = ['food', 'travel', 'rent', 'utilities', 'shopping', 'other'];

export const EXPENSE_CATEGORY_ICONS: Record<ExpenseCategory, LucideIcon> = {
  food: Utensils,
  travel: Car,
  rent: Home,
  utilities: Zap,
  shopping: ShoppingBag,
  other: MoreHorizontal
};

export const expenseCategoryLabelKey = (category: ExpenseCategory) => `expense.category.${category}`;
