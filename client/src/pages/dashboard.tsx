import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { FantasyLayout } from "@/components/layout/FantasyLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Scroll, 
  Sword, 
  Users, 
  TrendingUp,
  Clock,
  Crown,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

export default function Dashboard() {
  const { user, isDm } = useAuth();
  const [, setLocation] = useLocation();

  const { data: campaigns = [] } = useQuery({
    queryKey: ["campaigns"],
    queryFn: api.getCampaigns,
  });

  const { data: characters = [] } = useQuery({
    queryKey: ["myCharacters"],
    queryFn: api.getMyCharacters,
    enabled: !isDm,
  });

  const stats = [
    {
      label: isDm ? "Campanhas Criadas" : "Campanhas",
      value: campaigns.length,
      icon: Scroll,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
    },
    ...(isDm ? [] : [{
      label: "Meus Personagens",
      value: characters.length,
      icon: Sword,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    }]),
    {
      label: isDm ? "Total de Jogadores" : "Nível mais alto",
      value: isDm ? 0 : (characters.length > 0 ? Math.max(...characters.map(c => c.level)) : 0),
      icon: isDm ? Users : TrendingUp,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
  ];

  return (
    <FantasyLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-3">
            {isDm ? (
              <Crown className="w-8 h-8 text-accent" />
            ) : (
              <Sparkles className="w-8 h-8 text-primary" />
            )}
            <h1 className="text-3xl font-bold font-cinzel">
              Bem-vindo, <span className="text-primary">{user?.username}</span>
            </h1>
          </div>
          <p className="text-muted-foreground">
            {isDm 
              ? "Gerencie suas campanhas e acompanhe os personagens dos jogadores"
              : "Continue sua jornada épica"
            }
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="bg-card/40 border-white/10 hover:border-primary/30 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-4xl font-bold font-cinzel mt-1">{stat.value}</p>
                      </div>
                      <div className={`w-14 h-14 rounded-xl ${stat.bg} flex items-center justify-center`}>
                        <Icon className={`w-7 h-7 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-card/40 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-cinzel flex items-center gap-2">
                <Scroll className="w-5 h-5 text-primary" />
                {isDm ? "Suas Campanhas" : "Campanhas Ativas"}
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setLocation("/campaigns")}
              >
                Ver todas <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  {isDm ? "Crie sua primeira campanha" : "Entre em uma campanha para começar"}
                </p>
              ) : (
                <div className="space-y-3">
                  {campaigns.slice(0, 3).map((camp) => (
                    <div 
                      key={camp.id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                      onClick={() => setLocation(`/campaign/${camp.id}`)}
                    >
                      <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Scroll className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{camp.title}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                            {camp.system === "tormenta20" ? "T20" : "D&D 5e"}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {camp.status}
                          </Badge>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {!isDm && (
            <Card className="bg-card/40 border-white/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-cinzel flex items-center gap-2">
                  <Sword className="w-5 h-5 text-purple-400" />
                  Seus Personagens
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setLocation("/my-characters")}
                >
                  Ver todos <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                {characters.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Crie um personagem em uma campanha
                  </p>
                ) : (
                  <div className="space-y-3">
                    {characters.slice(0, 3).map((char) => (
                      <div 
                        key={char.id}
                        className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                        onClick={() => setLocation(`/character/${char.id}`)}
                      >
                        <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                          <Sword className="w-6 h-6 text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{char.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {char.race} • {char.characterClass} • Lvl {char.level}
                          </p>
                        </div>
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                          {char.currentHp}/{char.maxHp} HP
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {isDm && (
            <Card className="bg-card/40 border-white/10">
              <CardHeader>
                <CardTitle className="font-cinzel flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Acompanhe as modificações dos jogadores aqui
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </FantasyLayout>
  );
}
