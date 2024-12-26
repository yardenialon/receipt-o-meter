import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSidebar } from './ui/sidebar';
import { BillBeLogo } from './BillBeLogo';

export function AppSidebar() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { state, openMobile, setOpenMobile } = useSidebar();

  const links = [
    { href: '/', label: 'קבלות' },
    { href: '/analytics', label: 'ניתוח' },
    { href: '/products', label: 'מוצרים' },
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
          {links.map(({ href, label }) => (
            <Button
              key={href}
              variant={location.pathname === href ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start',
                location.pathname === href && 'bg-muted font-medium'
              )}
              asChild
            >
              <Link to={href}>{label}</Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
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