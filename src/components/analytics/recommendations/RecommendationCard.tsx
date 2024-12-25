import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecommendationSection } from './types';

interface RecommendationCardProps {
  recommendations: RecommendationSection[];
}

export const RecommendationCard = ({ recommendations }: RecommendationCardProps) => {
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