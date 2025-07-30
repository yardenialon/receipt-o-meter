import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, ExternalLink } from 'lucide-react';

export default function Blog() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">מידע שימושי</h1>
          <p className="text-muted-foreground">בלוג עם מידע חשוב לצרכנים חכמים</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Calendar className="h-4 w-4" />
              <span>יולי 2025</span>
              <Badge variant="secondary">פוסט ראשון</Badge>
            </div>
            <CardTitle className="text-2xl">
              הכירו את "משנת יוסף" – המיזם החברתי שמוריד את יוקר המחיה
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}