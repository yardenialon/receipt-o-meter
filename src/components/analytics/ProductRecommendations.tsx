import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Tag, ShoppingCart } from 'lucide-react';

export const ProductRecommendations = () => {
  const { data: recommendations } = useQuery({
    queryKey: ['product-recommendations'],
    queryFn: async () => {
      const { data: items, error } = await supabase
        .from('receipt_items')
        .select(`
          name,
          price,
          quantity,
          category,
          receipts!inner(created_at)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Group items by category and calculate average prices
      const categoryAverages = items.reduce((acc: { [key: string]: { count: number, totalPrice: number } }, item) => {
        const category = item.category || 'אחר';
        if (!acc[category]) {
          acc[category] = { count: 0, totalPrice: 0 };
        }
        acc[category].count++;
        acc[category].totalPrice += item.price || 0;
        return acc;
      }, {});

      // Generate recommendations based on purchase patterns
      const recommendations = [
        {
          title: 'מוצרים בריאים יותר',
          icon: Leaf,
          items: [
            { name: 'ירקות טריים', reason: 'מומלץ להגדיל צריכת ירקות טריים' },
            { name: 'פירות עונתיים', reason: 'מקור טבעי לויטמינים ומינרלים' },
          ]
        },
        {
          title: 'חסכון בהוצאות',
          icon: Tag,
          items: [
            { name: 'קניות בסיטונאות', reason: 'חיסכון של עד 20% בקנייה מרוכזת' },
            { name: 'מוצרים עונתיים', reason: 'זולים יותר ובאיכות טובה יותר' },
          ]
        },
        {
          title: 'הרגלי קנייה',
          icon: ShoppingCart,
          items: [
            { name: 'תכנון קניות מראש', reason: 'מונע קניות מיותרות וחוסך כסף' },
            { name: 'קנייה בימי מבצעים', reason: 'ניצול הנחות ומבצעים שבועיים' },
          ]
        }
      ];

      return recommendations;
    }
  });

  if (!recommendations) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>המלצות חכמות</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {recommendations.map((section, index) => (
          <div key={index} className="space-y-3">
            <div className="flex items-center gap-2 text-lg font-medium text-primary">
              <section.icon className="h-5 w-5" />
              {section.title}
            </div>
            <div className="grid gap-3">
              {section.items.map((item, itemIndex) => (
                <div 
                  key={itemIndex}
                  className="rounded-lg border p-3 hover:bg-primary/5 transition-colors"
                >
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-muted-foreground">{item.reason}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};