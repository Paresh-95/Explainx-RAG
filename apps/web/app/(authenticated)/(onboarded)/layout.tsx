import {
  SidebarProvider,
} from "@repo/ui/components/ui/sidebar";
import { AppSidebar } from "../../../components/navigation/app-sidebar";
import DashboardNavbar from "../../../components/dashboard-navbar";
import { auth } from "../../../auth";
import { redirect } from "next/navigation";
import { SpacesProvider } from "../../../contexts/space-provider";
import { RecentsProvider } from "../../../contexts/recents-provider";




interface LayoutProps {
  children: React.ReactNode;
}

export default async function Layout({ children }: LayoutProps) {
  const session = await auth();

  if (!session.user?.username) {
    redirect("./onboarding");
  }



  return (
    <SidebarProvider>
      <SpacesProvider>
        <RecentsProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar user={session.user} />
        <main className="flex-1 overflow-auto bg-background"> 
          <DashboardNavbar/>  
          <div >
            <div className="mt-10">{children}</div>
          </div>
        </main>
      </div>
      </RecentsProvider>
      </SpacesProvider>
    </SidebarProvider>
  );
}
