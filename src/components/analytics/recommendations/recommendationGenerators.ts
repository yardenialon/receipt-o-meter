import { supabase } from '@/lib/supabase';
import { PurchasePattern, Recommendation } from './types';

export async function generateHealthyAlternatives(patterns: { [key: string]: PurchasePattern }): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];
  
  // Get healthy alternatives from the database
  const { data: alternatives } = await supabase
    .from('product_alternatives')
    .select('*')
    .eq('alternative_type', 'healthy');

  if (alternatives) {
    for (const pattern of Object.values(patterns)) {
      const matchingAlternatives = alternatives.filter(alt => 
        pattern.items.some(item => 
          alt.product_name.toLowerCase().includes(item.toLowerCase()) ||
          alt.category === pattern.category
        )
      );

      recommendations.push(...matchingAlternatives.map(alt => ({
        name: alt.alternative_name,
        reason: alt.benefits
      })));
    }
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

export async function generateSavingOpportunities(patterns: { [key: string]: PurchasePattern }): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];

  // Get budget alternatives from the database
  const { data: alternatives } = await supabase
    .from('product_alternatives')
    .select('*')
    .eq('alternative_type', 'budget');

  if (alternatives) {
    // Find categories with high average prices
    const expensiveCategories = Object.values(patterns)
      .filter(p => p.avgPrice > 50)
      .sort((a, b) => b.avgPrice - a.avgPrice);

    for (const category of expensiveCategories) {
      const matchingAlternatives = alternatives.filter(alt => 
        alt.category === category.category
      );

      recommendations.push(...matchingAlternatives.map(alt => ({
        name: alt.alternative_name,
        reason: `חיסכון של ${Math.round((category.avgPrice - (alt.price_range_max || 0)) / category.avgPrice * 100)}% - ${alt.benefits}`
      })));
    }
  }

  // Add general saving recommendations
  if (recommendations.length < 2) {
    recommendations.push({
      name: 'מעקב אחר מבצעים',
      reason: 'שימוש באפליקציות השוואת מחירים לחיסכון משמעותי'
    });
  }

  return recommendations;
}

export async function generatePersonalizedRecommendations(patterns: { [key: string]: PurchasePattern }): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];

  // Get seasonal alternatives from the database
  const { data: alternatives } = await supabase
    .from('product_alternatives')
    .select('*')
    .eq('alternative_type', 'seasonal');

  if (alternatives) {
    // Find most frequent categories
    const frequentCategories = Object.values(patterns)
      .sort((a, b) => b.frequency - a.frequency);

    for (const category of frequentCategories.slice(0, 2)) {
      const matchingAlternatives = alternatives.filter(alt => 
        alt.category === category.category
      );

      recommendations.push(...matchingAlternatives.map(alt => ({
        name: alt.alternative_name,
        reason: alt.benefits
      })));
    }
  }

  // Add seasonal recommendation if we don't have enough
  if (recommendations.length < 2) {
    const currentMonth = new Date().getMonth();
    recommendations.push(getSeasonalRecommendation(currentMonth));
  }

  return recommendations;
}

function getSeasonalRecommendation(month: number): Recommendation {
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