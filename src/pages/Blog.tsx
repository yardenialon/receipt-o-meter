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
    image: haChishukImage,
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

export default function Blog() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">מידע שימושי</h1>
          <p className="text-muted-foreground">בלוג עם מידע חשוב לצרכנים חכמים</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <Link key={post.id} to={`/blog/${post.id}`}>
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>{post.date}</span>
                    {post.badge && (
                      <Badge variant="secondary">{post.badge}</Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-1 text-primary mt-3 text-sm font-medium">
                    <Eye className="h-4 w-4" />
                    <span>קרא עוד</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}