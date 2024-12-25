import { LogOut, Home, PieChart } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { BillBeLogo } from '@/components/BillBeLogo';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  const { data: totalRefundable } = useQuery({
    queryKey: ['total-refundable'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('receipts')
        .select('total_refundable')
        .eq('user_id', user?.id);

      if (error) throw error;

      return data.reduce((sum, receipt) => sum + (receipt.total_refundable || 0), 0);
    },
    enabled: !!user
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const menuItems = [
    { icon: Home, label: 'דף הבית', path: '/' },
    { icon: PieChart, label: 'תובנות', path: '/analytics' },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="fixed top-4 left-4 z-50 bg-white/50 backdrop-blur-sm hover:bg-white/80"
        >
          <PieChart className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="w-full sm:w-[300px] overflow-y-auto bg-white"
      >
        <SheetHeader className="space-y-4 pb-4 border-b">
          <SheetTitle className="flex items-center gap-3 justify-center">
            <BillBeLogo size={48} className="text-primary-600" />
            <div className="text-right">
              <h3 className="text-2xl font-bold">Bill Be</h3>
              <p className="text-sm text-primary-600">
                סה"כ צברת {new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(totalRefundable || 0)} להחזר
              </p>
            </div>
          </SheetTitle>
        </SheetHeader>

        <nav className="mt-8 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary-50 text-primary-600'
                  : 'hover:bg-gray-100'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

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