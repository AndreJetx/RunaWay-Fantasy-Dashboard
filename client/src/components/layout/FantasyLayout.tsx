import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sword, 
  Scroll, 
  Map as MapIcon, 
  Backpack, 
  LayoutDashboard, 
  Feather, 
  Menu, 
  X,
  Settings,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import sidebarBg from "@assets/generated_images/mystical_dark_fantasy_background_texture.png";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Characters", icon: Sword, href: "/characters" },
  { label: "Inventory", icon: Backpack, href: "/inventory" },
  { label: "Campaigns", icon: Scroll, href: "/campaigns" },
  { label: "Maps", icon: MapIcon, href: "/maps" },
  { label: "DM Notes", icon: Feather, href: "/notes" },
];

export function FantasyLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex bg-background font-sans text-foreground overflow-hidden relative">
      {/* Background Texture Overlay */}
      <div 
        className="fixed inset-0 opacity-20 pointer-events-none z-0 mix-blend-overlay"
        style={{ backgroundImage: `url(${sidebarBg})`, backgroundSize: 'cover' }}
      />

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b border-border bg-card/80 backdrop-blur-md z-50 flex items-center px-4 justify-between">
        <div className="font-cinzel font-bold text-xl text-primary animate-pulse">Runway Fantasy</div>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(!isMobileOpen)}>
          {isMobileOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-card/90 backdrop-blur-xl border-r border-border transform transition-transform duration-300 lg:translate-x-0 lg:static lg:block shadow-2xl",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col relative overflow-hidden">
           {/* Decorative mystical glow at top */}
           <div className="absolute top-0 left-0 right-0 h-32 bg-primary/10 blur-3xl pointer-events-none" />

          <div className="p-6 flex items-center gap-3 z-10">
            <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/50 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,255,0.3)]">
              <Sword className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-cinzel font-bold text-lg tracking-wider text-foreground">Runway</h1>
              <p className="text-xs text-muted-foreground tracking-widest uppercase">Fantasy Dash</p>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-2 py-6 overflow-y-auto z-10">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div 
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group relative overflow-hidden cursor-pointer",
                      isActive 
                        ? "text-primary-foreground font-medium shadow-[0_0_20px_rgba(var(--primary),0.3)]" 
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    )}
                    onClick={() => setIsMobileOpen(false)}
                  >
                     {isActive && (
                        <motion.div
                          layoutId="activeNav"
                          className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-100"
                          initial={false}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                     )}
                    <item.icon className={cn("w-5 h-5 relative z-10", isActive && "text-primary-foreground animate-pulse")} />
                    <span className="relative z-10 font-cinzel tracking-wide">{item.label}</span>
                    
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border z-10 bg-black/20">
            <div className="flex items-center gap-3 mb-4">
               <Avatar className="border-2 border-primary/30 shadow-[0_0_10px_rgba(var(--primary),0.2)]">
                  <AvatarFallback className="bg-primary/20 text-primary font-bold">
                    {user?.username?.charAt(0).toUpperCase() || "DM"}
                  </AvatarFallback>
               </Avatar>
               <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate font-cinzel text-primary">{user?.username || "Guest"}</p>
                  <p className="text-xs text-muted-foreground truncate">Dungeon Master</p>
               </div>
            </div>
            <div className="flex gap-2">
               <Button variant="outline" size="sm" className="w-full border-border/50 hover:border-primary/50 hover:bg-primary/10">
                  <Settings className="w-4 h-4 mr-2" /> Settings
               </Button>
               <Button 
                  variant="ghost" 
                  size="icon" 
                  className="shrink-0 hover:text-destructive hover:bg-destructive/10"
                  onClick={() => logout()}
                  data-testid="button-logout"
               >
                  <LogOut className="w-4 h-4" />
               </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto pt-16 lg:pt-0 relative z-10 scroll-smooth">
        <div className="container mx-auto p-6 lg:p-8 max-w-7xl animate-in fade-in duration-500 slide-in-from-bottom-4">
          {children}
        </div>
      </main>
    </div>
  );
}
