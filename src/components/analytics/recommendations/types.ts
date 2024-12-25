import { Leaf, Tag, ShoppingCart } from 'lucide-react';

export interface PurchasePattern {
  category: string;
  avgPrice: number;
  frequency: number;
  items: string[];
}

export interface Recommendation {
  name: string;
  reason: string;
}

export interface RecommendationSection {
  title: string;
  icon: typeof Leaf | typeof Tag | typeof ShoppingCart;
  items: Recommendation[];
}