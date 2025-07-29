
import { OpenIsraeliPriceSearch } from "@/components/shopping/OpenIsraeliPriceSearch";

export default function LivePrices() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">מחירים בזמן אמת</h1>
      <p className="text-gray-600 mb-8">
        השוואת מחירים בזמן אמת בין רשתות השיווק השונות בישראל.
        המידע מתעדכן ברמה יומית ומתבסס על נתוני המחירונים שהרשתות מחויבות לפרסם לפי חוק.
      </p>
      
      <OpenIsraeliPriceSearch />
    </div>
  );
}
