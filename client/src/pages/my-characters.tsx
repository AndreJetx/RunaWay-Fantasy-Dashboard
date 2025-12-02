import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { FantasyLayout } from "@/components/layout/FantasyLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sword, 
  Heart, 
  Shield, 
  Zap, 
  Eye
} from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

export default function MyCharacters() {
  const [, setLocation] = useLocation();

  const { data: characters = [], isLoading } = useQuery({
    queryKey: ["myCharacters"],
    queryFn: api.getMyCharacters,
  });

  return (
    <FantasyLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-cinzel text-primary">Meus Personagens</h1>
          <p className="text-muted-foreground">Todos os seus heróis em um só lugar</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : characters.length === 0 ? (
          <Card className="bg-card/40 border-dashed border-2 border-primary/20 py-12">
            <CardContent className="text-center">
              <Sword className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-cinzel mb-2">Nenhum personagem</h3>
              <p className="text-muted-foreground">
                Entre em uma campanha e crie seu primeiro personagem
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((char, index) => (
              <motion.div
                key={char.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="bg-card/40 border-primary/20 backdrop-blur-sm overflow-hidden hover:border-primary/60 transition-all duration-300 group cursor-pointer"
                  onClick={() => setLocation(`/character/${char.id}`)}
                >
                  <div className="relative h-40 overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
                    <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent z-10" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sword className="w-20 h-20 text-primary/30" />
                    </div>
                    <Badge className="absolute top-3 right-3 z-20 bg-black/60 border-primary/30 backdrop-blur text-primary">
                      Lvl {char.level}
                    </Badge>
                  </div>
                  <CardContent className="pt-4 relative z-20 -mt-8">
                    <h3 className="text-xl font-bold font-cinzel text-white mb-1">{char.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {char.race} • {char.characterClass}
                    </p>
                    
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="bg-white/5 p-2 rounded border border-white/5">
                        <Heart className="w-4 h-4 mx-auto mb-1 text-red-400" />
                        <span className="text-white font-bold">{char.currentHp}/{char.maxHp}</span>
                      </div>
                      <div className="bg-white/5 p-2 rounded border border-white/5">
                        <Shield className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                        <span className="text-white font-bold">{char.armorClass}</span>
                      </div>
                      <div className="bg-white/5 p-2 rounded border border-white/5">
                        <Zap className="w-4 h-4 mx-auto mb-1 text-yellow-400" />
                        <span className="text-white font-bold">{char.initiative}</span>
                      </div>
                      <div className="bg-white/5 p-2 rounded border border-white/5">
                        <Eye className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                        <span className="text-white font-bold">{char.speed}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </FantasyLayout>
  );
}
