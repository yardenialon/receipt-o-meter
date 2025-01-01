import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { PurchasePattern, RecommendationSection } from './types';
import { Leaf, Tag, ShoppingCart } from 'lucide-react';
import { generateHealthyAlternatives, generateSavingOpportunities, generatePersonalizedRecommendations } from './recommendationGenerators';

export const useRecommendations = () => {
  return useQuery({
    queryKey: ['product-recommendations'],
    queryFn: async () => {
      // Get last 3 months of purchases
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const { data: items, error } = await supabase
        .from('receipt_items')
        .select(`
          name,
          price,
          quantity,
          category,
          receipts (
            created_at
          )
        `)
        .gte('receipts.created_at', threeMonthsAgo.toISOString());

      if (error) throw error;

      // Analyze purchase patterns by category
      const patterns: { [key: string]: PurchasePattern } = {};
      items.forEach(item => {
        const category = item.category || 'אחר';
        if (!patterns[category]) {
          patterns[category] = {
            category,
            avgPrice: 0,
            frequency: 0,
            items: []
          };
        }
        patterns[category].items.push(item.name);
        patterns[category].avgPrice += item.price || 0;
        patterns[category].frequency++;
      });

      // Calculate averages
      Object.values(patterns).forEach(pattern => {
        pattern.avgPrice = pattern.avgPrice / pattern.frequency;
      });

      // Generate recommendations
      const recommendations: RecommendationSection[] = [
        {
          title: 'חלופות בריאות יותר',
          icon: Leaf,
          items: await generateHealthyAlternatives(patterns)
        },
        {
          title: 'הזדמנויות לחיסכון',
          icon: Tag,
          items: await generateSavingOpportunities(patterns)
        },
        {
          title: 'המלצות מותאמות אישית',
          icon: ShoppingCart,
          items: await generatePersonalizedRecommendations(patterns)
        }
      ];

      return recommendations;
    }
  });
};