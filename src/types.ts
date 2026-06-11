export interface Ingredient {
  name: string;
  amount: number; // base amount (for 2 servings)
  unit: string;
  optional?: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  time: number; // minutes
  difficulty: "简单" | "中等" | "困难";
  budgetCost: number; // price in RMB
  calories: number; // kcal
  ingredients: Ingredient[];
  steps: string[];
  description: string;
  isBuiltIn: boolean;
  imageEmoji: string; // Emoji character representing the food
  colorBg: string; // Tailwind gradient starting color, e.g. "from-orange-400 to-red-500"
}

export interface FridgeItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
  expiryDate: string; // YYYY-MM-DD
  purchaseDate: string; // YYYY-MM-DD
}

export interface CookingRecord {
  id: string;
  recipeId: string;
  recipeName: string;
  date: string; // YYYY-MM-DD
  servings: number;
}

export interface WeeklyMenu {
  Monday: string[]; // array of recipeIds
  Tuesday: string[];
  Wednesday: string[];
  Thursday: string[];
  Friday: string[];
  Saturday: string[];
  Sunday: string[];
}

export interface ShoppingItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
  purchased: boolean;
  recipeSource?: string; // name of the recipe this came from
}

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  category: "count" | "variety" | "cuisine" | "fridge" | "custom";
  threshold: number;
  icon: string;
  unlockedAt?: string; // YYYY-MM-DD
}
