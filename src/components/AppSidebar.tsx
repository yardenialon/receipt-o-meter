import { Home, Menu, PieChart } from "lucide-react";
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
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";

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

  return (
    <>
      {/* המבורגר למובייל */}
      <div className="flex items-center p-4 md:hidden">
        <SidebarTrigger>
          <Menu className="h-6 w-6" />
        </SidebarTrigger>
      </div>

      <Sidebar>
        <SidebarContent>
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
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </>
  );
}