import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, ExternalLink, ArrowRight } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const blogPosts = {
  'ha-chishuk': {
    title: 'הכירו את מיזם "החישוק" – המהפכה החברתית נגד יוקר המחיה',
    date: 'יולי 2025',
    badge: 'חדש',
    content: (
      <>
        <section>
          <p className="leading-relaxed text-foreground mb-4">
            "החישוק" הוא מיזם חברתי־כלכלי (חל"צ), שמטרתו לשבור את מנגנון המחיר של שוק המזון בישראל – בעזרת גישה פשוטה, שקופה ומשתפת פעולה: הם קונים בזול (לעיתים ישירות מסיטונאים או יצרנים) ומוכרים ללא רווח, כמעט כמו מחיר־עלות.
          </p>
          <p className="leading-relaxed text-foreground">
            מייסד המיזם, קסם לי, החל את הפעילות מתוך מהפכה נגד יוקר המחיה, לאחר שגילה פערים גדולים במחירי מוצרי יסוד בין שכונות סמוכות.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3 text-primary">🛒 איך זה עובד ואיפה חוסכים?</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">1. ביצוע קניה במקביל לסופר – בלי פערים</h4>
              <p className="text-foreground">באתר מוצגים מחירים של עשרות עד כמעט 50% פחות מרשתות מסחר רגילות, בעיקר עבור מוצרי מזווה יבשים כמו קמח, תבלינים ופסטה.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">2. צמצום עלויות תיווך ותפעול</h4>
              <p className="text-foreground">החברה פועלת ממחסן קטן בחולון, משתדלת לשמור על מבנה תפעולי מינימליסטי (שכירות, כח אדם), וכך מורידה את עלויות העיבוד והתפעול עד למינימום.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">3. איסוף שכונתי ושיתוף בקהילה</h4>
              <p className="text-foreground">במקום משלוחים יקרים עד הבית, מוצעות נקודות איסוף שכונתיות – במחיר של כ־5 ש"ח למשלוח עד 4 ק"ג, מה שמוזיל משמעותית את עלות הלוגיסטיקה. כיום פועלות כ־200 נקודות כאלה בארץ.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">4. מכירה של מוצרים עם תוקף קצר במחירי מציאה</h4>
              <p className="text-foreground">בקטגוריית "מציאון החישוק" נמכרים מוצרים שהם בעלי תוקף קצר (3–5 חודשים) במחיר מוזל במיוחד, ללא פיגור מלאי.</p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3 text-primary">📊 למה זה יכול לחסוך לכם כסף?</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <span>הוזלה של עשרות אחוזים בהשוואה לסופר רגיל, גם עבור מותגים אלטרנטיביים ואיכותיים</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <span>מודל שקוף: פירוט ברור של הוצאות והכנסות באתר, כולל המחסור לרווח</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <span>גישה קהילתית: ככל שהביקוש עולה – הם רוכשים עוד, וכך מורידים מחירים באופן דינמי</span>
            </li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3 text-primary">🧩 איך אתם יכולים להרוויח מזה?</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <span>לפני כל קנייה בסופר: בדקו באיזה מוצרים אפשר להוזיל דרך החישוק (מלח, קמח, תבלינים, חטיפים ועוד)</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <span>בחרו נקודת איסוף שכונתית הנמצאת בקרבתכם – כך תחסכו במשלוח (5 ₪ בלבד עד 4 ק"ג)</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <span>עקבו אחרי מציאוני תוקף קצר – יש שם חיסכון משמעותי באיכות גבוהה</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <span>בתמיכה מועילה: תוכלו לתרום באופן סמלי (לחיצת "חמצן לחישוק") או להפיץ את הרעיון ברשתות</span>
            </li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4 text-primary">✅ תזכורת קצרה:</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-border rounded-lg">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border p-3 text-right font-semibold">מרכיב</th>
                  <th className="border border-border p-3 text-right font-semibold">מה היתרון</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { component: 'רכישה במחיר סיטונאי (ללא רווח)', advantage: 'עד 50% פחות מהסופר' },
                  { component: 'משלוחים שיתופיים / נקודות איסוף', advantage: 'עלות משלוח מינימלית, יעילות לוגיסטית' },
                  { component: 'שקיפות מלאה', advantage: 'אפשר לראות כל חודש עדכונים על הוצאות והכנסות' },
                  { component: 'מציאון תוקף קצר', advantage: 'מוצרים איכותיים במחיר גרוטאות' },
                ].map((item, index) => (
                  <tr key={index} className="hover:bg-muted/50">
                    <td className="border border-border p-3 font-semibold">{item.component}</td>
                    <td className="border border-border p-3">{item.advantage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <p className="leading-relaxed text-foreground mt-4">
            לסיכום: "החישוק" משמש כאלטרנטיבה בעלת עוצמה לכל מי שרוצה להוריד מהחשבונית בסוף החודש. בזכות שילוב של רכישה חכמה, מודל חברתי וקהילה תומכת – אתם מקבלים איכות במחיר אנושי.
          </p>
        </section>
      </>
    )
  },
  'smart-shopping-list': {
    title: 'הרשימה שהופכת כל קנייה לחכמה יותר – וחוסכת לכם מאות שקלים בחודש',
    date: 'יולי 2025',
    badge: 'חדש',
    content: (
      <>
        <section>
          <p className="leading-relaxed text-foreground mb-4">
            רובנו רגילים לכתוב את רשימת הקניות על פתק, או בקבוצת וואטסאפ משפחתית. אבל ב-2025 – יש דרך הרבה יותר חכמה לעשות את זה.
          </p>
          <p className="leading-relaxed text-foreground">
            עם רשימת הקניות החכמה של SAVY אתם לא רק זוכרים מה לקנות – אתם גם יודעים איפה הכי משתלם לקנות כל פריט. 
            משתמשים דיווחו שבזכות המערכת הם הוזילו את סל הקניות שלהם בין 15%-25% שזה אלפי שקלים בשנה!
          </p>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3 text-primary">🛍️ למה זה חשוב?</h3>
          <p className="mb-3 text-foreground">כי אין רשת אחת שהכי זולה בהכול.</p>
          <p className="mb-3 text-foreground">חלק מהמוצרים זולים יותר ברשת אחת – ואחרים דווקא ברשת אחרת.</p>
          <p className="mb-3 text-foreground">למשל:</p>
          <ul className="space-y-2 mb-4">
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <span>בשר וגבינות משתלם לקנות ברשת X</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <span>פירות וירקות – ברשת Y</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <span>מוצרי טואלטיקה וניקיון – ברשת Z</span>
            </li>
          </ul>
          <p className="text-foreground">
            ככה מי שקונה חכם, קונה חכם באמת – ומחלק את הקנייה בצורה שממקסמת את החיסכון.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3 text-primary">🎯 מה SAVY נותנת לכם?</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <span>חיפוש חכם של כל מוצר לפי מחירים עדכניים באזורך</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <span>אפשרות לבנות כמה רשימות לפי קטגוריות, חנויות או ימי השבוע</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <span>המלצות אוטומטיות לחנות הכי משתלמת לכל רשימה</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <span>מעקב אחרי מבצעים משתלמים ושינויים במחירים</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <span>שיתוף נוח עם בני משפחה או שותפים</span>
            </li>
          </ul>
        </section>

        <section>
          <p className="leading-relaxed text-foreground mb-4">
            לא עוד רשימת קניות שעובדת רק בשביל הסדר – עכשיו היא גם עובדת בשביל הכסף שלכם.
          </p>
          
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-primary" />
              <span className="font-semibold">התחילו עכשיו:</span>
              <a href="https://receipt-o-meter.lovable.app/shopping-list" target="_blank" rel="noopener noreferrer" 
                 className="text-primary hover:underline">
                רשימת קניות חכמה
              </a>
            </div>
          </div>
        </section>
      </>
    )
  },
  'mishnat-yosef': {
    title: 'הכירו את "משנת יוסף" – המיזם החברתי שמוריד את יוקר המחיה',
    date: 'יולי 2025',
    badge: 'פוסט ראשון',
    content: (
      <>
        <section>
          <h3 className="text-xl font-semibold mb-3 text-primary">מי עומד מאחורי המיזם?</h3>
          <p className="leading-relaxed text-foreground">
            "משנת יוסף" היא רשת חנויות שצמחה מתוך צורך אמיתי – להציע מוצרי יסוד במחירים מוזלים למשפחות רבות בישראל, 
            בעיקר מהציבור החרדי, אך בפועל היא פתוחה לכולם. מדובר ביוזמה חברתית שנולדה מתוך חזון של עזרה הדדית, 
            ניהול צנוע ללא מטרות רווח, ותמיכה בקהילה דרך צרכנות חכמה ומוזלת.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3 text-primary">איך זה עובד?</h3>
          <p className="mb-3 text-foreground">הרשת פועלת במודל ייחודי:</p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <div>
                <strong>ללא רווח מסחרי</strong> – כל המוצרים נמכרים במחיר הקרוב ביותר לעלותם.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <div>
                <strong>רכישה מרוכזת</strong> – הרשת מקיימת שיתופי פעולה עם ספקים וסיטונאים, רוכשת בכמויות גדולות ומצליחה להשיג מחירים שנמוכים בעשרות אחוזים מהמחירים בשוק.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <div>
                <strong>תפעול חסכוני</strong> – מינימום פרסום, ניהול צנוע, ותפעול יעיל כדי שכל שקל יתורגם להוזלה לצרכן.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <div>
                <strong>מערכת הזמנות אינטרנטית נגישה</strong> – עם משלוחים בכל רחבי הארץ.
              </div>
            </li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4 text-primary">ומה לגבי המחירים?</h3>
          <p className="mb-4 text-foreground">המחירים מדברים בעד עצמם. הנה כמה דוגמאות שממחישות את פערי המחירים מול רשתות אחרות:</p>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-border rounded-lg">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border p-3 text-right font-semibold">מוצר</th>
                  <th className="border border-border p-3 text-right font-semibold">מחיר ב"משנת יוסף"</th>
                  <th className="border border-border p-3 text-right font-semibold">מחיר בשוק</th>
                  <th className="border border-border p-3 text-right font-semibold">חיסכון</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { product: 'חלב 3% טרה 1 ליטר', mishnat: '4.20 ₪', market: '6.10 ₪', savings: '31%' },
                  { product: 'שמן קנולה 1 ליטר', mishnat: '5.90 ₪', market: '9.80 ₪', savings: '40%' },
                  { product: 'לחם פרוס אחיד', mishnat: '3.80 ₪', market: '6.00 ₪', savings: '36%' },
                  { product: 'שקית עגבניות 1 ק"ג', mishnat: '2.90 ₪', market: '5.50 ₪', savings: '47%' },
                  { product: 'טיטולים מידה 4 – 60 יחידות', mishnat: '28 ₪', market: '49 ₪', savings: '43%' },
                  { product: 'גבינה לבנה 250 גרם', mishnat: '2.80 ₪', market: '5.20 ₪', savings: '46%' },
                  { product: 'עוף טרי לשניצל (לק"ג)', mishnat: '17.90 ₪', market: '26.90 ₪', savings: '33%' },
                ].map((item, index) => (
                  <tr key={index} className="hover:bg-muted/50">
                    <td className="border border-border p-3">{item.product}</td>
                    <td className="border border-border p-3 font-semibold text-green-600">{item.mishnat}</td>
                    <td className="border border-border p-3">{item.market}</td>
                    <td className="border border-border p-3">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {item.savings}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3 text-primary">למה זה חשוב?</h3>
          <p className="leading-relaxed text-foreground mb-4">
            במציאות הכלכלית הנוכחית, משפחות רבות נאבקות לסיים את החודש. כל חיסכון של 100–300 ₪ בחודש על קניית מצרכים 
            בסיסיים יכול לעשות את ההבדל. "משנת יוסף" לא רק מציעה מחירים נמוכים – היא מחזירה את השליטה לצרכן ומוכיחה 
            שאפשר אחרת.
          </p>
          
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-primary" />
              <span className="font-semibold">הזמנה דרך האתר:</span>
              <a href="https://mishnatyosef.org" target="_blank" rel="noopener noreferrer" 
                 className="text-primary hover:underline">
                mishnatyosef.org
              </a>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span>משלוחים בפריסה רחבה</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">👪</span>
              <span>פתוח לכולם – צרכנות ערכית שמשנה מציאות</span>
            </div>
          </div>
        </section>
      </>
    )
  }
};

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? blogPosts[slug as keyof typeof blogPosts] : null;

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">הפוסט לא נמצא</h1>
          <Link to="/blog">
            <Button variant="outline">
              חזרה לבלוג
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
      <div className="max-w-4xl mx-auto">
        <Link to="/blog" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowRight className="h-4 w-4 rotate-180" />
          חזרה לבלוג
        </Link>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Calendar className="h-4 w-4" />
              <span>{post.date}</span>
              <Badge variant="secondary">{post.badge}</Badge>
            </div>
            <CardTitle className="text-3xl">{post.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {post.content}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}