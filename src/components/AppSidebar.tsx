import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSidebar } from './ui/sidebar';
import { SavvyLogo } from './SavvyLogo';
import { NavLinks } from './sidebar/NavLinks';
import { MobileNav } from './sidebar/MobileNav';

export function AppSidebar() {
  const isMobile = useIsMobile();
  const { openMobile, setOpenMobile } = useSidebar();
  
  console.log('🎭 AppSidebar component - isMobile:', isMobile);

  const sidebarContent = (
    <div className="flex flex-col gap-4 py-4">
      <div className="px-3 py-2">
        <SavvyLogo size={isMobile ? 180 : 180} />
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
    return <MobileNav />;
  }

  return (
    <div className="hidden border-l lg:block">
      <ScrollArea className="h-screen w-64">
        {sidebarContent}
      </ScrollArea>
    </div>
  );
}