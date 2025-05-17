import '@/app/globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { AppSidebar } from '@/components/app-sidebar';
import { DynamicBreadcrumb } from '@/components/dynamic-breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Lego Planner - Weekly Planning Tool',
  description: 'A weekly planning tool where calendar and quarters are displayed in weekly blocks',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <NuqsAdapter>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset className="overflow-hidden">
                <header className="flex sticky top-0 bg-background h-16 shrink-0 items-center gap-2 border-b px-4">
                  <SidebarTrigger className="-ml-1" />
                  <Separator orientation="vertical" className="mr-2 h-4" />
                  <DynamicBreadcrumb />
                </header>
                <div className="flex-1 flex flex-col mx-auto p-6 w-full">{children}</div>
              </SidebarInset>
            </SidebarProvider>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
