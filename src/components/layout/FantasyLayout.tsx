"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
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
  LogOut,
  ShoppingBag,
  Sparkles,
  Crown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import sidebarBg from "@assets/generated_images/mystical_dark_fantasy_background_texture.png";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useCampaign } from "@/contexts/CampaignContext";
import { useTranslation } from "@/lib/i18n/context";

export function FantasyLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<"dm" | "player" | null>(null);
  const supabase = createClient();
  const { campaigns, activeCampaign, setActiveCampaign, loading: campaignsLoading } = useCampaign();
  const { t } = useTranslation();

  const navItemsDM = [
    { label: t("nav.dashboard"), icon: LayoutDashboard, href: "/dashboard" },
    { label: t("nav.characters"), icon: Sword, href: "/characters" },
    { label: t("nav.inventory"), icon: Backpack, href: "/inventory" },
    { label: t("nav.campaigns"), icon: Scroll, href: "/campaigns" },
    { label: t("nav.maps"), icon: MapIcon, href: "/maps" },
    { label: t("nav.notes"), icon: Feather, href: "/notes" },
    { label: t("nav.shop"), icon: ShoppingBag, href: "/shop" },
    { label: t("nav.spells"), icon: Sparkles, href: "/spells" },
    { label: t("nav.customize"), icon: Crown, href: "/homebrew", className: "text-amber-400" },
  ];

  const navItemsPlayer = [
    { label: t("nav.dashboard"), icon: LayoutDashboard, href: "/dashboard" },
    { label: t("nav.campaigns"), icon: Scroll, href: "/campaigns" },
    { label: t("nav.characters"), icon: Sword, href: "/characters" },
    { label: t("nav.inventory"), icon: Backpack, href: "/inventory" },
    { label: t("nav.shop"), icon: ShoppingBag, href: "/shop" },
    { label: t("nav.spells"), icon: Sparkles, href: "/spells" },
  ];

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      // Buscar role do usuário na tabela users
      if (user) {
        try {
          const res = await fetch("/api/users/me");
          if (res.ok) {
            const data = await res.json();
            const role = data.role || "player";
            // Normaliza o role para lowercase para comparação
            const normalizedRole = role.toLowerCase() === "dm" ? "dm" : "player";
            console.log("User role loaded:", {
              rawRole: role,
              normalizedRole: normalizedRole,
              userId: data.id,
              email: data.email,
            });
            setUserRole(normalizedRole);
          } else {
            console.error("Failed to fetch user role, status:", res.status);
            setUserRole("player"); // Default para player
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUserRole("player"); // Default para player
        }
      } else {
        setUserRole(null);
      }
    };
    getUser();
  }, [supabase]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(t("auth.logoutError"));
    } else {
      toast.success(t("auth.logoutSuccess"));
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex bg-background font-sans text-foreground overflow-x-hidden relative w-full">
      {/* Background Texture Overlay */}
      <div
        className="fixed inset-0 opacity-20 pointer-events-none z-0 mix-blend-overlay"
        style={{ backgroundImage: `url(${sidebarBg})`, backgroundSize: 'cover' }}
      />

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b border-border bg-card/80 backdrop-blur-md z-50 flex items-center px-4 justify-between">
        <div className="font-cinzel font-bold text-xl text-primary animate-pulse">RunaWay Fantasy</div>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(!isMobileOpen)}>
          {isMobileOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Mobile Overlay Backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-card/90 border-r border-border transform transition-transform duration-300 lg:translate-x-0 lg:static lg:block shadow-2xl shrink-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col relative overflow-hidden">
          {/* Decorative mystical glow at top */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-primary/10 blur-3xl pointer-events-none" />

          <div className="p-6 flex items-center gap-3 z-10">
            <div className="w-12 h-12 flex items-center justify-center relative">
              <Image
                src="/logo.png"
                alt="RunaWay Logo"
                width={48}
                height={48}
                className="object-contain w-full h-full drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]"
              />
            </div>
            <div>
              <h1 className="font-cinzel font-bold text-lg tracking-wider text-foreground">RunaWay</h1>
              <p className="text-xs text-muted-foreground tracking-widest uppercase">Fantasy Dash</p>
            </div>
          </div>

          {/* Campaign Selector */}
          {!campaignsLoading && campaigns.length > 0 && (
            <div className="px-4 mb-6 z-10">
              <div className="flex items-center gap-2 mb-2 px-1">
                <Scroll className="w-4 h-4 text-primary/70" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground/70">
                  {t("campaign.activeCampaign") || "Campanha Ativa"}
                </span>
              </div>
              <Select
                value={activeCampaign?.id || ""}
                onValueChange={(value) => {
                  const campaign = campaigns.find((c) => c.id === value);
                  if (campaign) setActiveCampaign(campaign);
                }}
              >
                <SelectTrigger className="w-full bg-black/40 border-primary/20 hover:border-primary/40 transition-all duration-300 backdrop-blur-sm group h-12 shadow-inner ring-offset-background focus:ring-1 focus:ring-primary/30">
                  <div className="flex items-center gap-2 overflow-hidden w-full">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0 shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                    <div className="truncate text-left flex-1 font-cinzel text-sm tracking-wide text-foreground/90 group-hover:text-primary transition-colors">
                      {activeCampaign?.title || t("campaign.selectCampaign") || "Selecione uma campanha"}
                    </div>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-card/95 border-primary/20 backdrop-blur-md">
                  {campaigns.map((campaign) => (
                    <SelectItem
                      key={campaign.id}
                      value={campaign.id}
                      className="focus:bg-primary/20 focus:text-primary transition-colors cursor-pointer py-3 px-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full transition-all",
                          activeCampaign?.id === campaign.id
                            ? "bg-primary shadow-[0_0_5px_rgba(var(--primary),0.5)]"
                            : "bg-muted-foreground/20 border border-muted-foreground/10"
                        )} />
                        <span className="font-cinzel text-sm tracking-wide">{campaign.title}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Subtle decorative glow line */}
              <div className="mt-4 mx-auto w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-50" />
            </div>
          )}

          <nav className="flex-1 px-4 space-y-2 py-6 overflow-y-auto z-10">
            {(userRole === "dm" ? navItemsDM : navItemsPlayer).map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href as any}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group relative overflow-hidden",
                    isActive
                      ? "text-primary-foreground font-medium shadow-[0_0_20px_rgba(var(--primary),0.3)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5",
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
                  <item.icon className={cn("w-5 h-5 relative z-10", isActive && "text-primary-foreground animate-pulse", (item as any).className)} />
                  <span className="relative z-10 font-cinzel tracking-wide">{item.label}</span>

                  {/* Hover glow effect */}
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border z-10 bg-black/20">
            <div className="flex items-start gap-3 mb-4">
              <Avatar className="border-2 border-primary/30 shadow-[0_0_10px_rgba(var(--primary),0.2)] shrink-0">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>
                  {user?.user_metadata?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "DM"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium font-cinzel text-primary truncate">
                    {user?.user_metadata?.username || "Dungeon Master"}
                  </p>
                  {userRole !== null && (
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 shrink-0 whitespace-nowrap ${userRole === "dm"
                        ? "border-purple-500/50 text-purple-400 bg-purple-500/10"
                        : "border-blue-500/50 text-blue-400 bg-blue-500/10"
                        }`}
                    >
                      {userRole === "dm" ? t("campaign.master") : t("campaign.player")}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email || "Level 20 Creator"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-border/50 hover:border-primary/50 hover:bg-primary/10"
                onClick={() => router.push("/settings")}
              >
                <Settings className="w-4 h-4 mr-2" /> {t("nav.settings")}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto overflow-x-hidden pt-16 lg:pt-0 relative z-10 scroll-smooth min-w-0">
        <div className="container mx-auto p-6 lg:p-8 max-w-7xl animate-in fade-in duration-500 slide-in-from-bottom-4 w-full max-w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
