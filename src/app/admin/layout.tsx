
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Menu } from "lucide-react";
import { useAdminConfig } from "@/contexts/AdminConfigContext";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, loading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useAdminConfig();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on route change on mobile
  useEffect(() => {
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);


  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/signin?message=Admin%20access%20required');
    }
  }, [isAdmin, loading, router, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">{t('loadingAdminArea')}</p>
      </div>
    );
  }
  
  if (!isAdmin && !loading) {
     return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-lg text-destructive">{t('accessDeniedRedirecting')}</p>
      </div>
    );
  }


  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1 pt-16"> {/* Adjust pt to match navbar height */}
        <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <main 
          className="flex-1 p-6 pt-12 md:pt-6 ml-0 md:ml-64 bg-background relative transition-all duration-300"
          onClick={() => {
            if (isSidebarOpen) {
              setIsSidebarOpen(false);
            }
          }}
        >
           <Button
            variant="ghost"
            size="icon"
            className="md:hidden absolute top-4 left-4 z-30"
            onClick={(e) => {
              e.stopPropagation(); // Prevent main's onClick from firing
              setIsSidebarOpen(!isSidebarOpen);
            }}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-6 w-6" />
          </Button>
          {children}
        </main>
      </div>
    </div>
  );
}
