
import { Apple, Milk, Croissant, Drumstick, ShowerHead } from 'lucide-react';
import { cn } from '@/lib/utils';

const categories = [
  { name: 'פירות וירקות', icon: Apple, color: 'bg-green-50 text-green-600', borderColor: 'border-green-200' },
  { name: 'מוצרי חלב וביצים', icon: Milk, color: 'bg-blue-50 text-blue-600', borderColor: 'border-blue-200' },
  { name: 'מאפים ולחמים', icon: Croissant, color: 'bg-amber-50 text-amber-600', borderColor: 'border-amber-200' },
  { name: 'בשר, עוף ודגים', icon: Drumstick, color: 'bg-red-50 text-red-600', borderColor: 'border-red-200' },
  { name: 'ניקיון וטואלטיקה', icon: ShowerHead, color: 'bg-purple-50 text-purple-600', borderColor: 'border-purple-200' },
];

export function CategorySection() {
  return (
    <div className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">קטגוריות מובילות</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
          {categories.map((category) => (
            <div 
              key={category.name} 
              className={cn("flex flex-col items-center p-5 rounded-xl border-2 transition-all transform hover:scale-105 cursor-pointer", category.borderColor)}
            >
              <div className={cn("p-4 rounded-full mb-3", category.color)}>
                <category.icon className="h-8 w-8" />
              </div>
              <h3 className="text-base font-medium text-center">{category.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
