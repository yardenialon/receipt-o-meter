import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { 
  Home, 
  Package, 
  ListChecks, 
  Settings,
  LogOut,
  ImageIcon,
} from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function NavItem({ to, icon, children }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
          isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
        )
      }
    >
      {icon}
      {children}
    </NavLink>
  );
}

export function NavLinks() {
  const { signOut } = useAuth();
  
  return (
    <div className="flex flex-col gap-1">
      <NavItem to="/" icon={<Home className="mr-2 h-4 w-4" />}>
        דף הבית
      </NavItem>
      
      <NavItem to="/products" icon={<Package className="mr-2 h-4 w-4" />}>
        מוצרים
      </NavItem>
      
      <NavItem to="/shopping-list" icon={<ListChecks className="mr-2 h-4 w-4" />}>
        רשימת קניות
      </NavItem>
      
      <NavItem to="/settings" icon={<Settings className="mr-2 h-4 w-4" />}>
        הגדרות
      </NavItem>
      
      <NavItem to="/product-images" icon={<ImageIcon className="mr-2 h-4 w-4" />}>
        ניהול תמונות מוצרים
      </NavItem>

      <button
        onClick={signOut}
        className="group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      >
        <LogOut className="mr-2 h-4 w-4" />
        התנתק
      </button>
    </div>
  );
}
