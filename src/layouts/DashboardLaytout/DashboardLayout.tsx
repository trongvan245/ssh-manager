import { AppSidebar } from "@/components/App-Sidebar";
import { ModeToggle } from "@/components/ModeToggle";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";
import { Outlet } from "react-router-dom";

interface Props {
  children?: React.ReactNode;
}

export default function DashBoardLayout({ children }: Props) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="px-3 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 ">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="ml-auto">
            <ModeToggle />
          </div>
        </header>
        {children}
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
