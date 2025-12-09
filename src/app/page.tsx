"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sword, Scroll, Map, Backpack, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/50 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,255,0.3)]">
              <Sword className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-cinzel font-bold text-lg tracking-wider text-foreground">
                Runway Fantasy
              </h1>
              <p className="text-xs text-muted-foreground tracking-widest uppercase">
                Dashboard
              </p>
            </div>
          </div>
          <Link href="/login">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Entrar
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4"
          >
            <Sparkles className="w-4 h-4" />
            Gerencie suas campanhas de RPG
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold font-cinzel text-foreground mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Runway Fantasy Dashboard
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            O painel completo para mestres e jogadores. Gerencie campanhas,
            personagens, inventário, mapas e muito mais em um só lugar.
          </p>

          <div className="flex gap-4 justify-center pt-4">
            <Link href="/login">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 h-auto"
              >
                Começar Agora
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 h-auto"
              >
                Entrar
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20 max-w-6xl w-full"
        >
          {[
            {
              icon: Scroll,
              title: "Campanhas",
              description: "Organize suas aventuras e sessões",
            },
            {
              icon: Sword,
              title: "Personagens",
              description: "Gerencie heróis e vilões",
            },
            {
              icon: Backpack,
              title: "Inventário",
              description: "Controle itens e equipamentos",
            },
            {
              icon: Map,
              title: "Mapas",
              description: "Visualize e marque locais",
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
              className="p-6 rounded-lg border border-border/40 bg-card/40 backdrop-blur-sm hover:border-primary/40 transition-colors group"
            >
              <feature.icon className="w-10 h-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-cinzel font-bold text-lg mb-2 text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border/40 py-6">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2024 Runway Fantasy Dashboard. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
