import { LogOut, ChartBar, ChartPie, BarChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { BillBeLogo } from '@/components/BillBeLogo';
import { Button } from '@/components/ui/button';
import { MonthlyTrends } from '@/components/analytics/MonthlyTrends';
import { SpendingByCategory } from '@/components/analytics/SpendingByCategory';
import { TopStores } from '@/components/analytics/TopStores';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function AppSidebar() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="fixed top-4 left-4 z-50 bg-white/50 backdrop-blur-sm hover:bg-white/80"
        >
          <BarChart className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="w-full sm:w-[540px] overflow-y-auto bg-white"
      >
        <SheetHeader className="space-y-4 pb-4 border-b">
          <SheetTitle className="flex items-center gap-3 justify-center">
            <BillBeLogo size={48} className="text-primary-600" />
            <div className="text-right">
              <h3 className="text-2xl font-bold">Bill Be</h3>
              <p className="text-sm text-muted-foreground">תובנות חכמות לניהול הוצאות</p>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ChartBar className="h-5 w-5 text-primary-600" />
              <h4 className="text-lg font-semibold">מגמות חודשיות</h4>
            </div>
            <MonthlyTrends />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ChartPie className="h-5 w-5 text-primary-600" />
              <h4 className="text-lg font-semibold">הוצאות לפי קטגוריה</h4>
            </div>
            <SpendingByCategory />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-primary-600" />
              <h4 className="text-lg font-semibold">חנויות מובילות</h4>
            </div>
            <TopStores />
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="absolute bottom-4 left-4 text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4 ml-2" />
          התנתק
        </Button>
      </SheetContent>
    </Sheet>
  );
}