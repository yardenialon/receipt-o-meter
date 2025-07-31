import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import mishnatYosefImage from '@/assets/mishnat-yosef-blog.jpg';
import smartShoppingListImage from '@/assets/smart-shopping-list-blog.jpg';
import haChishukImage from '@/assets/ha-chishuk-blog.jpg';

const blogPosts = [
  {
    id: 'super-chevrati',
    title: 'הכירו את "הסופר החברתי" – המהפכה החברתית נגד יוקר המחיה',
    excerpt: 'מיזם ממשי של ההסתדרות הכללית החדשה שמאפשר רכישה של מוצרי מזון, פארם וניקיון במחירים מסובסדים',
    image: '/lovable-uploads/9b89ade0-0000-48ab-9c9d-98ad3041adfb.png',
    date: 'יולי 2025',
    badge: 'חדש'
  },
  {
    id: 'ha-chishuk',
    title: 'הכירו את מיזם "החישוק" – המהפכה החברתית נגד יוקר המחיה',
    excerpt: 'מיזם חברתי שקונה בזול ומוכר ללא רווח, כמעט כמו מחיר עלות – עד 50% פחות מהסופר',
    image: '/lovable-uploads/c1fdc5f7-dbe7-43c3-9d71-09b92ea5085e.png',
    date: 'יולי 2025',
    badge: 'עדכון'
  },
  {
    id: 'smart-shopping-list',
    title: 'הרשימה שהופכת כל קנייה לחכמה יותר – וחוסכת לכם מאות שקלים בחודש',
    excerpt: 'עם רשימת הקניות החכמה של SAVY אתם לא רק זוכרים מה לקנות – אתם גם יודעים איפה הכי משתלם לקנות כל פריט',
    image: smartShoppingListImage,
    date: 'יולי 2025',
    badge: 'פופולרי'
  },
  {
    id: 'mishnat-yosef',
    title: 'הכירו את "משנת יוסף" – המיזם החברתי שמוריד את יוקר המחיה',
    excerpt: 'רשת חנויות שצמחה מתוך צורך אמיתי – להציע מוצרי יסוד במחירים מוזלים למשפחות רבות בישראל',
    image: mishnatYosefImage,
    date: 'יולי 2025',
    badge: 'פוסט ראשון'
  }
];

export function BlogPostsSection() {
  return (
    <div className="py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">מידע שימושי לצרכנים חכמים</h2>
          <p className="text-muted-foreground text-lg">בלוג עם מידע חשוב וכלים לחסכון והשוואת מחירים</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
          {blogPosts.map((post) => (
            <Link key={post.id} to={`/blog/${post.id}`} className="group">
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden h-full">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>{post.date}</span>
                    {post.badge && (
                      <Badge variant="secondary" className="text-xs">{post.badge}</Badge>
                    )}
                  </div>
                  <CardTitle className="text-base group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-1 text-primary text-sm font-medium">
                    <Eye className="h-4 w-4" />
                    <span>קרא עוד</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <span>כל המאמרים</span>
            <Eye className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}