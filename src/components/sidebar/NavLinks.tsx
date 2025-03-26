
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, BarChart2, Package2, LogOut, ListCheck, Tag, ShoppingCart, Receipt, Gauge, BarChart3, Package, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface NavLinkProps {
  href: string;
  label: string;
  icon: any;
}

export const NavLink = ({ href, label, icon: Icon }: NavLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === href || location.pathname.startsWith(`${href}/`);

  return (
    <Button
      variant={isActive ? 'secondary' : 'ghost'}
      className={cn(
        'w-full justify-start gap-3 transition-all duration-300',
        'relative overflow-hidden',
        isActive && 'bg-gradient-to-r from-primary-400 to-primary-500 text-white'
      )}
      asChild
    >
      <Link to={href}>
        <Icon className="h-5 w-5" />
        <span>{label}</span>
        {isActive && (
          <motion.div
            className="absolute inset-0 bg-white/10"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: 'linear',
            }}
          />
        )}
      </Link>
    </Button>
  );
};

export const NavLinks = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
      toast.success('התנתקת בהצלחה');
    } catch (error) {
      toast.error('אירעה שגיאה בהתנתקות');
    }
  };

  const links = [
    { href: '/', label: 'ראשי', icon: Home },
    { href: '/analytics', label: 'ניתוח', icon: BarChart2 },
    { href: '/products', label: 'מוצרים', icon: Package2 },
    { href: '/shopping-list', label: 'רשימת קניות', icon: ListCheck },
    { href: '/live-prices', label: 'מחירים בזמן אמת', icon: CreditCard },
  ];

  return (
    <div className="space-y-1">
      {links.map((link) => (
        <NavLink key={link.href} {...link} />
      ))}
      <Button
        variant="ghost"
        className="w-full justify-start gap-3 text-red-500 hover:bg-red-50 hover:text-red-500"
        onClick={handleLogout}
      >
        <LogOut className="h-5 w-5" />
        <span>התנתק</span>
      </Button>
    </div>
  );
};
