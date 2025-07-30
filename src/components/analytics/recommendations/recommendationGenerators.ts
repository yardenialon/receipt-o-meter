import { supabase } from '@/lib/supabase';
import { PurchasePattern, Recommendation } from './types';

export async function generateHealthyAlternatives(patterns: { [key: string]: PurchasePattern }): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];
  
  // כרגע נשתמש ברשימה סטטית עד שתהיה לנו טבלת product_alternatives
  const staticHealthyAlternatives = [
    {
      product_name: 'דגנים',
      alternative_name: 'קינואה אורגנית',
      benefits: 'עשירה בחלבון ומינרלים',
      category: 'דגנים ותחליפים'
    },
    {
      product_name: 'מוצרי חלב',
      alternative_name: 'יוגורט יווני',
      benefits: 'פרוביוטיקה טבעית וחלבון גבוה',
      category: 'מוצרי חלב'
    }
  ];

  // Add general healthy recommendations
  recommendations.push({
    name: 'ירקות עונתיים',
    reason: 'להגדלת צריכת ויטמינים ומינרלים טבעיים'
  });

  recommendations.push({
    name: 'דגים פעמיים בשבוע',
    reason: 'למען צריכת אומגה 3 בריאה'
  });

  return recommendations;
}

export async function generateSavingOpportunities(patterns: { [key: string]: PurchasePattern }): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];

  // כרגע נשתמש ברשימה סטטית עד שתהיה לנו טבלת product_alternatives
  recommendations.push({
    name: 'מעקב אחר מבצעים',
    reason: 'שימוש באפליקציות השוואת מחירים לחיסכון משמעותי'
  });

  recommendations.push({
    name: 'קניות במלאי',
    reason: 'רכישת מוצרי יסוד במלאי כשיש מבצעים משתלמים'
  });

  return recommendations;
}

export async function generatePersonalizedRecommendations(patterns: { [key: string]: PurchasePattern }): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];

  // כרגע נשתמש ברשימה סטטית עד שתהיה לנו טבלת product_alternatives  
  const currentMonth = new Date().getMonth();
  recommendations.push(getSeasonalRecommendation(currentMonth));

  // Add a general personalized recommendation
  recommendations.push({
    name: 'תכנון קניות שבועי',
    reason: 'הכנת רשימת קניות מראש חוסכת זמן וכסף'
  });

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