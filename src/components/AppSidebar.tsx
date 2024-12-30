import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSidebar } from './ui/sidebar';
import { BillBeLogo } from './BillBeLogo';
import { NavLinks } from './sidebar/NavLinks';
import { MobileNav } from './sidebar/MobileNav';

export function AppSidebar() {
  const isMobile = useIsMobile();
  const { openMobile, setOpenMobile } = useSidebar();

  const sidebarContent = (
    <div className="flex flex-col gap-4 py-4">
      <div className="px-3 py-2">
        <BillBeLogo size={isMobile ? 120 : 180} />
      </div>
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          ניווט
        </h2>
        <NavLinks />
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