
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

type PopularProduct = {
  name: string;
  product_code: string;
  count: number;
};

export const usePopularProducts = (limit: number = 5) => {
  return useQuery({
    queryKey: ['popular-products', limit],
    queryFn: async () => {
      // נסה לקבל מוצרים פופולריים באמצעות שאילתה רגילה ללא group
      const { data, error } = await supabase
        .from('shopping_list_items')
        .select('name, product_code')
        .not('product_code', 'is', null)
        .limit(50);

      if (error) {
        console.error('Error fetching popular products:', error);
        throw error;
      }

      // עיבוד המידע בצד הלקוח - ספירת המופעים של כל מוצר
      const productCounts: Record<string, { name: string; product_code: string; count: number }> = {};
      
      data.forEach(item => {
        const key = item.product_code || '';
        if (!productCounts[key]) {
          productCounts[key] = { 
            name: item.name, 
            product_code: item.product_code || '', 
            count: 0 
          };
        }
        productCounts[key].count += 1;
      });

      // המרה למערך וסידור לפי כמות יורדת
      const sortedProducts = Object.values(productCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);

      return sortedProducts as PopularProduct[];
    },
    enabled: limit > 0,
    staleTime: 5 * 60 * 1000, // 5 דקות
  });
};
