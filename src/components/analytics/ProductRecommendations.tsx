import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Tag, ShoppingCart, TrendingDown } from 'lucide-react';

interface PurchasePattern {
  category: string;
  avgPrice: number;
  frequency: number;
  items: string[];
}

export const ProductRecommendations = () => {
  const { data: recommendations } = useQuery({
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
          receipts!inner(created_at)
        `)
        .gte('receipts.created_at', threeMonthsAgo.toISOString())
        .order('receipts.created_at', { ascending: false });

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

      // Calculate averages and generate recommendations
      Object.values(patterns).forEach(pattern => {
        pattern.avgPrice = pattern.avgPrice / pattern.frequency;
      });

      // Generate personalized recommendations
      const recommendations = [
        {
          title: 'חלופות בריאות יותר',
          icon: Leaf,
          items: generateHealthyAlternatives(patterns)
        },
        {
          title: 'הזדמנויות לחיסכון',
          icon: Tag,
          items: generateSavingOpportunities(patterns)
        },
        {
          title: 'המלצות מותאמות אישית',
          icon: ShoppingCart,
          items: generatePersonalizedRecommendations(patterns)
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

// Helper functions to generate recommendations based on purchase patterns
function generateHealthyAlternatives(patterns: { [key: string]: PurchasePattern }) {
  const recommendations = [];
  
  if (patterns['חטיפים'] || patterns['ממתקים']) {
    recommendations.push({
      name: 'פירות טריים',
      reason: 'חלופה טבעית ובריאה יותר לחטיפים מתוקים'
    });
  }

  if (patterns['משקאות']) {
    recommendations.push({
      name: 'מים מינרלים',
      reason: 'להפחתת צריכת משקאות ממותקים'
    });
  }

  // Add general healthy recommendations if we don't have enough data
  if (recommendations.length < 2) {
    recommendations.push({
      name: 'ירקות עונתיים',
      reason: 'להגדלת צריכת ויטמינים ומינרלים טבעיים'
    });
  }

  return recommendations;
}

function generateSavingOpportunities(patterns: { [key: string]: PurchasePattern }) {
  const recommendations = [];

  // Find categories with high average prices
  const expensiveCategories = Object.values(patterns)
    .filter(p => p.avgPrice > 50)
    .sort((a, b) => b.avgPrice - a.avgPrice);

  if (expensiveCategories.length > 0) {
    recommendations.push({
      name: `קניות מרוכזות ב${expensiveCategories[0].category}`,
      reason: `חיסכון של עד 20% בקנייה בסיטונאות`
    });
  }

  // Add general saving recommendations
  recommendations.push({
    name: 'מעקב אחר מבצעים',
    reason: 'שימוש באפליקציות השוואת מחירים לחיסכון משמעותי'
  });

  return recommendations;
}

function generatePersonalizedRecommendations(patterns: { [key: string]: PurchasePattern }) {
  const recommendations = [];

  // Find most frequent categories
  const frequentCategories = Object.values(patterns)
    .sort((a, b) => b.frequency - a.frequency);

  if (frequentCategories.length > 0) {
    const topCategory = frequentCategories[0];
    recommendations.push({
      name: `מבצעי ${topCategory.category}`,
      reason: `התראות על מבצעים בקטגוריה המועדפת עליך`
    });
  }

  // Add seasonal recommendation
  const currentMonth = new Date().getMonth();
  const seasonalRec = getSeasonalRecommendation(currentMonth);
  recommendations.push(seasonalRec);

  return recommendations;
}

function getSeasonalRecommendation(month: number) {
  // Seasonal recommendations based on the current month
  const seasons = {
    winter: [11, 0, 1],
    spring: [2, 3, 4],
    summer: [5, 6, 7],
    autumn: [8, 9, 10]
  };

  if (seasons.winter.includes(month)) {
    return {
      name: 'מרק ביתי',
      reason: 'חסכוני ובריא במיוחד לחורף'
    };
  } else if (seasons.summer.includes(month)) {
    return {
      name: 'פירות קיץ',
      reason: 'במחירים נמוכים במיוחד בעונה'
    };
  } else if (seasons.spring.includes(month)) {
    return {
      name: 'ירקות אביביים',
      reason: 'טריים ובמחיר טוב בעונה זו'
    };
  } else {
    return {
      name: 'פירות וירקות סתוויים',
      reason: 'טריים ועשירים בויטמינים לחיזוק החורף'
    };
  }
}