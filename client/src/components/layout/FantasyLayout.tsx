import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sword, 
  Scroll, 
  LayoutDashboard, 
  Menu, 
  X,
  LogOut,
  Crown,
  User,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";

export function FantasyLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, isDm, logout } = useAuth();

  const navItems = [
    { label: "Início", icon: LayoutDashboard, href: "/" },
    { label: "Campanhas", icon: Scroll, href: "/campaigns" },
    ...(!isDm ? [{ label: "Meus Personagens", icon: Sword, href: "/my-characters" }] : []),
  ];

  return (
    <div className="min-h-screen flex bg-background font-sans text-foreground overflow-hidden relative">
      <div 
        className="fixed inset-0 opacity-20 pointer-events-none z-0"
        style={{ 
          background: 'radial-gradient(ellipse at 50% 0%, rgba(0, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 40%)'
        }}
      />

      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b border-border bg-card/80 backdrop-blur-md z-50 flex items-center px-4 justify-between">
        <div className="font-cinzel font-bold text-xl text-primary flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Runway Fantasy
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(!isMobileOpen)}>
          {isMobileOpen ? <X /> : <Menu />}
        </Button>
      </div>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-30 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-card/90 backdrop-blur-xl border-r border-border transform transition-transform duration-300 lg:translate-x-0 lg:static lg:block shadow-2xl",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-32 bg-primary/10 blur-3xl pointer-events-none" />

          <div className="p-6 flex items-center gap-3 z-10">
            <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/50 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,255,0.3)]">
              <Sparkles className="w-6 h-6 text-primary" />
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
                    <item.icon className={cn("w-5 h-5 relative z-10", isActive && "text-primary-foreground")} />
                    <span className="relative z-10 font-cinzel tracking-wide">{item.label}</span>
                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border z-10 bg-black/20">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="border-2 border-primary/30 shadow-[0_0_10px_rgba(var(--primary),0.2)]">
                <AvatarFallback className={cn(
                  "font-bold",
                  isDm ? "bg-accent/20 text-accent" : "bg-primary/20 text-primary"
                )}>
                  {isDm ? <Crown className="w-5 h-5" /> : user?.username?.charAt(0).toUpperCase() || "J"}
                </AvatarFallback>
              </Avatar>
              <div className="overflow-hidden flex-1">
                <p className="text-sm font-medium truncate font-cinzel">{user?.username || "Visitante"}</p>
                <Badge variant="outline" className={cn(
                  "text-xs mt-1",
                  isDm ? "border-accent/50 text-accent bg-accent/10" : "border-primary/50 text-primary bg-primary/10"
                )}>
                  {isDm ? "Mestre" : "Jogador"}
                </Badge>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="w-full justify-start hover:text-destructive hover:bg-destructive/10"
              onClick={() => logout()}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" /> Sair
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 h-screen overflow-y-auto pt-16 lg:pt-0 relative z-10 scroll-smooth">
        <div className="container mx-auto p-6 lg:p-8 max-w-7xl animate-in fade-in duration-500 slide-in-from-bottom-4">
          {children}
        </div>
      </main>
    </div>
  );
}
