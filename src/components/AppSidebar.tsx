import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home, BarChart2, Package2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSidebar } from './ui/sidebar';
import { BillBeLogo } from './BillBeLogo';
import { motion, AnimatePresence } from 'framer-motion';

const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: any }) => {
  const location = useLocation();
  const isActive = location.pathname === href;

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

const MobileNav = () => {
  const links = [
    { href: '/', label: 'קבלות', icon: Home },
    { href: '/analytics', label: 'ניתוח', icon: BarChart2 },
    { href: '/products', label: 'מוצרים', icon: Package2 },
  ];
  const location = useLocation();

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-50"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 14 }}
    >
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="mb-4 flex h-16 items-center justify-around rounded-t-3xl bg-white/80 px-6 shadow-lg backdrop-blur-md">
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
        </div>
      </div>
    </motion.nav>
  );
};

export function AppSidebar() {
  const isMobile = useIsMobile();
  const { openMobile, setOpenMobile } = useSidebar();

  const links = [
    { href: '/', label: 'קבלות', icon: Home },
    { href: '/analytics', label: 'ניתוח', icon: BarChart2 },
    { href: '/products', label: 'מוצרים', icon: Package2 },
  ];

  const sidebarContent = (
    <div className="flex flex-col gap-4 py-4">
      <div className="px-3 py-2">
        <BillBeLogo size={isMobile ? 100 : 150} />
      </div>
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          ניווט
        </h2>
        <div className="space-y-1">
          {links.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="pr-0">
            <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
              {sidebarContent}
            </ScrollArea>
          </SheetContent>
        </Sheet>
        <MobileNav />
      </>
    );
  }

  return (
    <div className="hidden border-l lg:block">
      <ScrollArea className="h-screen w-64">
        {sidebarContent}
      </ScrollArea>
    </div>
  );
}