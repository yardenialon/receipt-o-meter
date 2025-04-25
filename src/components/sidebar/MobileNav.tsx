import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Package2, LogOut, ListCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const MobileNav = () => {
  const links = [
    { href: '/', label: 'ראשי', icon: Home },
    { href: '/products', label: 'מוצרים', icon: Package2 },
    { href: '/shopping-list', label: 'רשימות', icon: ListCheck },
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
    <>
      {/* Add padding div to prevent content overlap */}
      <div className="h-20" />

      <motion.nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-lg border-t"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 14 }}
      >
        <div className="flex items-center justify-around h-20">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = location.pathname === href;
            return (
              <Link
                key={href}
                to={href}
                className="relative flex flex-col items-center w-full h-full pt-3"
              >
                <motion.div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full transition-colors',
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
                    className="absolute -bottom-[1px] h-[2px] w-12 bg-primary-500"
                    layoutId="activeIndicator"
                  />
                )}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="relative flex flex-col items-center w-full h-full pt-3"
          >
            <motion.div
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-red-50"
              whileTap={{ scale: 0.95 }}
            >
              <LogOut className="h-5 w-5 text-red-500" />
            </motion.div>
            <span className="mt-1 text-xs text-red-500">התנתק</span>
          </button>
        </div>
      </motion.nav>
    </>
  );
};
