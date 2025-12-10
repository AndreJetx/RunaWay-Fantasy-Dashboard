"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FantasyLayout } from "@/components/layout/FantasyLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Shield, Zap, Heart, Brain } from "lucide-react";
import { motion } from "framer-motion";
import avatarPlaceholder from "@assets/generated_images/fantasy_character_silhouette_avatar.png";
import Image from "next/image";
import { useCampaign } from "@/contexts/CampaignContext";
import { toast } from "sonner";

interface Character {
  id: string;
  name: string;
  characterClass: string;
  playerId?: string;
  level: number;
  currentHp: number;
  maxHp: number;
  armorClass: number;
  alignment: string | null;
  image: string | null;
  attributes: any;
}

export default function Characters() {
  const router = useRouter();
  const { activeCampaign } = useCampaign();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDM, setIsDM] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const res = await fetch("/api/users/me");
        if (res.ok) {
          const data = await res.json();
          setIsDM(data.role === "dm");
          setUserId(data.id);
        }
      } catch (error) {
        console.error("Error checking role:", error);
      }
    };
    checkRole();
  }, []);

  useEffect(() => {
    if (!activeCampaign) {
      setCharacters([]);
      setLoading(false);
      return;
    }

    const fetchCharacters = async () => {
      try {
        const res = await fetch(`/api/campaigns/${activeCampaign.id}/overview`);
        if (res.ok) {
          const data = await res.json();
          let chars = data.characters || [];
          
          // Se for jogador, mostrar apenas seus personagens
          if (!isDM && userId) {
            chars = chars.filter((char: Character) => char.playerId === userId);
          }
          
          setCharacters(chars);
        }
      } catch (error) {
        console.error("Error fetching characters:", error);
        toast.error("Erro ao carregar personagens");
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, [activeCampaign, isDM, userId]);

  const filteredCharacters = characters.filter((char) =>
    char.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    char.characterClass.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!activeCampaign) {
    return (
      <FantasyLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Selecione uma campanha para ver os personagens
            </p>
          </div>
        </div>
      </FantasyLayout>
    );
  }

  return (
    <FantasyLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
          <div>
            <h1 className="text-3xl font-bold font-cinzel text-primary text-glow">
              Heroes & Villains
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {activeCampaign.title}
            </p>
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar personagens..."
                className="pl-8 bg-card/50 border-primary/20 focus:border-primary/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => {
                if (activeCampaign) {
                  router.push(`/characters/new?campaignId=${activeCampaign.id}`);
                } else {
                  toast.error("Selecione uma campanha primeiro");
                }
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Criar Personagem
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Carregando personagens...
          </div>
        ) : filteredCharacters.length === 0 ? (
          <Card className="bg-card/40 border-primary/20 p-12 text-center">
            <p className="text-muted-foreground">
              {searchTerm
                ? "Nenhum personagem encontrado com esse termo"
                : "Nenhum personagem nesta campanha ainda"}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCharacters.map((char, index) => {
              const attributes = char.attributes || {};
              const strength = attributes.strength || 10;
              const dexterity = attributes.dexterity || 10;
              const intelligence = attributes.intelligence || 10;

              return (
                <motion.div
                  key={char.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className="bg-card/40 border-primary/20 backdrop-blur-sm overflow-hidden hover:border-primary/60 transition-all duration-300 group magic-border cursor-pointer"
                    onClick={() => router.push(`/characters/${char.id}`)}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent z-10" />
                      <Image
                        src={char.image || avatarPlaceholder}
                        alt={char.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      />
                      <Badge className="absolute top-3 right-3 z-20 bg-black/60 border-primary/30 backdrop-blur text-primary">
                        Nv {char.level}
                      </Badge>
                    </div>
                    <CardContent className="pt-4 relative z-20 -mt-12">
                      <h3 className="text-xl font-bold font-cinzel text-white mb-1">
                        {char.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
                        {char.characterClass}
                        {char.alignment && ` • ${char.alignment}`}
                      </p>
                      
                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        <div className="bg-white/5 p-2 rounded border border-white/5">
                          <Heart className="w-4 h-4 mx-auto mb-1 text-red-400" />
                          <span className="text-white font-bold">
                            {char.currentHp}/{char.maxHp}
                          </span>
                        </div>
                        <div className="bg-white/5 p-2 rounded border border-white/5">
                          <Shield className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                          <span className="text-white font-bold">{char.armorClass}</span>
                        </div>
                        <div className="bg-white/5 p-2 rounded border border-white/5">
                          <Zap className="w-4 h-4 mx-auto mb-1 text-yellow-400" />
                          <span className="text-white font-bold">{dexterity}</span>
                        </div>
                        <div className="bg-white/5 p-2 rounded border border-white/5">
                          <Brain className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                          <span className="text-white font-bold">{intelligence}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </FantasyLayout>
  );
}
