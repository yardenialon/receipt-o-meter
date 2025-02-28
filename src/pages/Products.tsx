
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  ShoppingBag, 
  Tag, 
  ArrowUpDown,
  Plus,
  Apple,
  Milk,
  Croissant,
  Drumstick,
  ShowerHead,
  Package,
  Baby,
  Coffee,
  Beer,
  Utensils
} from 'lucide-react';

// קטגוריות מוצרים
const categories = [
  { id: 'all', name: 'כל המוצרים', icon: Package },
  { id: 'fruits-vegetables', name: 'פירות וירקות', icon: Apple },
  { id: 'dairy-eggs', name: 'מוצרי חלב וביצים', icon: Milk },
  { id: 'bakery', name: 'מאפים ולחמים', icon: Croissant },
  { id: 'meat-fish', name: 'בשר, עוף ודגים', icon: Drumstick },
  { id: 'cleaning', name: 'ניקיון וטואלטיקה', icon: ShowerHead },
  { id: 'baby', name: 'מוצרי תינוקות', icon: Baby },
  { id: 'snacks', name: 'חטיפים וממתקים', icon: Coffee },
  { id: 'drinks', name: 'משקאות', icon: Beer },
  { id: 'prepared-food', name: 'מזון מוכן', icon: Utensils },
];

// תצוגות מוצרים
const views = [
  { id: 'grid', label: 'תצוגת רשת' },
  { id: 'list', label: 'תצוגת רשימה' },
];

// מיונים אפשריים
const sortOptions = [
  { value: 'price-asc', label: 'מחיר: מהנמוך לגבוה' },
  { value: 'price-desc', label: 'מחיר: מהגבוה לנמוך' },
  { value: 'name-asc', label: 'שם: א-ת' },
  { value: 'name-desc', label: 'שם: ת-א' },
];

export default function Products() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState('grid');
  const [sortBy, setSortBy] = useState('price-asc');

  // שאילתה להבאת המוצרים לפי הקטגוריה שנבחרה
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', activeCategory, searchQuery, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('store_products')
        .select(`
          id,
          product_code,
          product_name,
          manufacturer,
          price,
          category,
          store_chain
        `)
        .limit(100);

      // נוסיף סינון לפי קטגוריה אם לא נבחרה האופציה "כל המוצרים"
      if (activeCategory !== 'all') {
        // ממיר את ה-id של הקטגוריה למילות מפתח בעברית לשימוש ב-ilike
        const categoryKeywords: Record<string, string> = {
          'fruits-vegetables': 'פירות|ירקות',
          'dairy-eggs': 'חלב|ביצים|גבינה|יוגורט',
          'bakery': 'לחם|מאפה|מאפים|בייגלה',
          'meat-fish': 'בשר|עוף|דגים|הודו',
          'cleaning': 'ניקוי|ניקיון|סבון|כביסה',
          'baby': 'תינוק|מטרנה|חיתולים',
          'snacks': 'חטיף|ממתק|שוקולד|במבה',
          'drinks': 'משקה|מים|קולה|סודה|מיץ',
          'prepared-food': 'מוכן|מזון מוכן|סלט מוכן',
        };
        
        const keyword = categoryKeywords[activeCategory] || activeCategory;
        query = query.or(`category.ilike.%${keyword}%,product_name.ilike.%${keyword}%`);
      }

      // נוסיף סינון לפי מילות מפתח אם יש חיפוש
      if (searchQuery) {
        query = query.ilike('product_name', `%${searchQuery}%`);
      }

      // נוסיף מיון לפי האפשרות שנבחרה
      switch (sortBy) {
        case 'price-asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price-desc':
          query = query.order('price', { ascending: false });
          break;
        case 'name-asc':
          query = query.order('product_name', { ascending: true });
          break;
        case 'name-desc':
          query = query.order('product_name', { ascending: false });
          break;
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      // קבצו מוצרים זהים (לפי קוד מוצר) ומצאו את טווח המחירים
      const productGroups: Record<string, any> = {};
      data.forEach(product => {
        if (!productGroups[product.product_code]) {
          productGroups[product.product_code] = {
            ...product,
            min_price: product.price,
            max_price: product.price,
            store_chains: [product.store_chain],
          };
        } else {
          // עדכון טווח המחירים והוספת רשת אם עוד לא קיימת
          const group = productGroups[product.product_code];
          group.min_price = Math.min(group.min_price, product.price);
          group.max_price = Math.max(group.max_price, product.price);
          if (!group.store_chains.includes(product.store_chain)) {
            group.store_chains.push(product.store_chain);
          }
        }
      });

      const groupedProducts = Object.values(productGroups);
      
      // מיון מוצרים מקובצים לפי הבחירה
      if (sortBy === 'price-asc') {
        return groupedProducts.sort((a, b) => a.min_price - b.min_price);
      } else if (sortBy === 'price-desc') {
        return groupedProducts.sort((a, b) => b.max_price - a.max_price);
      } else if (sortBy === 'name-asc') {
        return groupedProducts.sort((a, b) => a.product_name.localeCompare(b.product_name));
      } else if (sortBy === 'name-desc') {
        return groupedProducts.sort((a, b) => b.product_name.localeCompare(a.product_name));
      }

      return groupedProducts;
    },
  });

  // רינדור כרטיס מוצר בתצוגת רשת
  const renderProductGrid = (product: any) => (
    <Card key={product.product_code} className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="p-4 pb-2 space-y-1">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base line-clamp-2 text-right">
            {product.product_name}
          </CardTitle>
        </div>
        {product.manufacturer && (
          <p className="text-xs text-muted-foreground text-right">{product.manufacturer}</p>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="h-32 flex items-center justify-center bg-gray-50 rounded-md mb-3">
          <Package className="h-12 w-12 text-gray-300" />
        </div>
        <div className="flex items-center justify-between mt-2">
          <Badge variant="outline" className="text-xs font-normal">
            {product.category || 'כללי'}
          </Badge>
          <span className="text-sm font-medium">
            {product.min_price === product.max_price 
              ? `₪${product.min_price.toFixed(2)}` 
              : `₪${product.min_price.toFixed(2)} - ₪${product.max_price.toFixed(2)}`}
          </span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Badge variant="secondary" className="text-xs">
          {product.store_chains.length} חנויות
        </Badge>
        <Button variant="outline" size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          <span>הוסף לרשימה</span>
        </Button>
      </CardFooter>
    </Card>
  );

  // רינדור שורת מוצר בתצוגת רשימה
  const renderProductRow = (product: any) => (
    <div 
      key={product.product_code}
      className="flex items-center justify-between p-3 border-b hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center">
        <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center mr-3">
          <Package className="h-6 w-6 text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{product.product_name}</h3>
          <div className="flex items-center text-sm text-muted-foreground">
            <span>{product.manufacturer || 'לא ידוע'}</span>
            <span className="mx-2">•</span>
            <Badge variant="outline" className="text-xs">
              {product.category || 'כללי'}
            </Badge>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="font-medium">
            {product.min_price === product.max_price 
              ? `₪${product.min_price.toFixed(2)}` 
              : `₪${product.min_price.toFixed(2)} - ₪${product.max_price.toFixed(2)}`}
          </div>
          <div className="text-xs text-muted-foreground">
            {product.store_chains.length} חנויות
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-1" />
          הוסף
        </Button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">מרקטפלייס מוצרים</h1>
          <p className="text-muted-foreground mt-1">
            גלה מוצרים והשווה מחירים בין רשתות השיווק השונות
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs defaultValue="grid" value={view} onValueChange={setView} className="w-full md:w-auto">
            <TabsList>
              {views.map(v => (
                <TabsTrigger key={v.id} value={v.id}>{v.label}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* סרגל חיפוש */}
        <div className="md:col-span-3 order-2 md:order-1">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="חיפוש מוצרים..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[220px]">
                <div className="flex items-center">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="מיון לפי" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {/* כפתורי פעולה */}
        <div className="flex justify-end md:col-span-1 order-1 md:order-2">
          <Button className="w-full md:w-auto gap-2">
            <ShoppingBag className="h-4 w-4" />
            ראה רשימת קניות
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* סרגל קטגוריות */}
        <div className="hidden md:block">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">קטגוריות</CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-2">
              <div className="space-y-1">
                {categories.map(category => (
                  <Button
                    key={category.id}
                    variant={activeCategory === category.id ? "secondary" : "ghost"}
                    className="w-full justify-start gap-2 text-right"
                    onClick={() => setActiveCategory(category.id)}
                  >
                    <category.icon className="h-4 w-4" />
                    <span>{category.name}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* תצוגת קטגוריות במובייל */}
        <div className="md:hidden overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-max">
            {categories.map(category => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "secondary" : "outline"}
                className="flex gap-2"
                onClick={() => setActiveCategory(category.id)}
              >
                <category.icon className="h-4 w-4" />
                <span>{category.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* רשימת מוצרים */}
        <div className="md:col-span-3">
          <h2 className="text-xl font-bold mb-4">
            {categories.find(c => c.id === activeCategory)?.name || 'כל המוצרים'}
            {products && <span className="text-muted-foreground text-sm font-normal mr-2">
              ({products.length} מוצרים)
            </span>}
          </h2>

          {isLoading ? (
            // סקלטון - טעינה
            view === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <Skeleton className="h-32 w-full mb-3" />
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-1/4" />
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Skeleton className="h-9 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="border rounded-md divide-y">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="p-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-md" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-9 w-20" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : products?.length === 0 ? (
            <div className="text-center py-16 border rounded-lg bg-gray-50">
              <Package className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">לא נמצאו מוצרים</h3>
              <p className="text-muted-foreground mb-4">
                לא נמצאו מוצרים התואמים את החיפוש או הקטגוריה שבחרת.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setActiveCategory('all');
                  setSearchQuery('');
                }}
              >
                נקה מסננים
              </Button>
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(renderProductGrid)}
            </div>
          ) : (
            <div className="border rounded-md divide-y">
              {products.map(renderProductRow)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
