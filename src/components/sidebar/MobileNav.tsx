import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, BarChart2, Package2, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const MobileNav = () => {
  const links = [
    { href: '/', label: 'קבלות', icon: Home },
    { href: '/analytics', label: 'ניתוח', icon: BarChart2 },
    { href: '/products', label: 'מוצרים', icon: Package2 },
  ];
  const location = useLocation();
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

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-50"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 14 }}
    >
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="mb-4 flex h-16 items-center justify-around rounded-t-3xl bg-white/80 px-6 pb-5 pt-5 shadow-lg backdrop-blur-md">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = location.pathname === href;
            return (
              <Link
                key={href}
                to={href}
                className="relative flex flex-col items-center"
              >
                <motion.div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full transition-colors',
                    isActive && 'bg-gradient-to-r from-primary-400 to-primary-500'
                  )}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className={cn('h-5 w-5', isActive ? 'text-white' : 'text-gray-600')} />
                </motion.div>
                <span className={cn(
                  'mt-1 text-xs',
                  isActive ? 'text-primary-500 font-medium' : 'text-gray-600'
                )}>
                  {label}
                </span>
                {isActive && (
                  <motion.div
                    className="absolute -bottom-1 h-1 w-4 rounded-full bg-primary-500"
                    layoutId="activeIndicator"
                  />
                )}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="relative flex flex-col items-center"
          >
            <motion.div
              className="flex h-12 w-12 items-center justify-center rounded-full transition-colors hover:bg-red-50"
              whileTap={{ scale: 0.95 }}
            >
              <LogOut className="h-5 w-5 text-red-500" />
            </motion.div>
            <span className="mt-1 text-xs text-red-500">התנתק</span>
          </button>
        </div>
      </div>
    </motion.nav>
  );
};