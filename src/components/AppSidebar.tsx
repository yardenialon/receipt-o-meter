import { Home, LogOut, Menu, PieChart, X } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

const items = [
  {
    title: "דף הבית",
    url: "/",
    icon: Home,
  },
  {
    title: "תובנות",
    url: "/insights",
    icon: PieChart,
  },
];

export function AppSidebar() {
  const location = useLocation();
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
    <>
      {/* המבורגר למובייל */}
      <div className="fixed top-0 left-0 p-4 z-50 md:hidden">
        <SidebarTrigger>
          <Menu className="h-6 w-6" />
        </SidebarTrigger>
      </div>

      <Sidebar>
        <SidebarContent className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex justify-between items-center p-4 md:hidden">
            <span className="font-semibold">תפריט</span>
            <SidebarTrigger>
              <X className="h-5 w-5" />
            </SidebarTrigger>
          </div>
          <SidebarGroup>
            <SidebarGroupLabel>תפריט</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.url}
                    >
                      <Link to={item.url}>
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={handleSignOut}>
                    <LogOut className="w-5 h-5" />
                    <span>התנתק</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </>
  );
}