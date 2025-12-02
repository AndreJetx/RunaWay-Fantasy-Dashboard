import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FantasyLayout } from "@/components/layout/FantasyLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, 
  Scroll, 
  Sword, 
  Bell, 
  Plus, 
  ArrowLeft,
  Clock,
  Eye,
  Shield,
  Heart,
  Zap,
  Brain
} from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import avatarPlaceholder from "@assets/generated_images/fantasy_character_avatar_placeholder.png";

const DND5E_CLASSES = ["Bárbaro", "Bardo", "Clérigo", "Druida", "Guerreiro", "Monge", "Paladino", "Patrulheiro", "Ladino", "Feiticeiro", "Bruxo", "Mago"];
const TORMENTA20_CLASSES = ["Arcanista", "Bárbaro", "Bardo", "Bucaneiro", "Caçador", "Cavaleiro", "Clérigo", "Druida", "Guerreiro", "Inventor", "Ladino", "Lutador", "Nobre", "Paladino"];

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { isDm, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newCharOpen, setNewCharOpen] = useState(false);
  const [newChar, setNewChar] = useState({
    name: "",
    characterClass: "",
    race: "",
    level: 1,
  });

  const { data: campaign, isLoading: loadingCampaign } = useQuery({
    queryKey: ["campaign", id],
    queryFn: () => api.getCampaign(id!),
    enabled: !!id,
  });

  const { data: characters = [] } = useQuery({
    queryKey: ["characters", id],
    queryFn: () => api.getCharactersByCampaign(id!),
    enabled: !!id,
  });

  const { data: members = [] } = useQuery({
    queryKey: ["members", id],
    queryFn: () => api.getCampaignMembers(id!),
    enabled: !!id,
  });

  const { data: changeLogs = [] } = useQuery({
    queryKey: ["changelog", id],
    queryFn: () => api.getChangeLogs(id!, true),
    enabled: !!id && isDm,
    refetchInterval: 30000,
  });

  const createCharMutation = useMutation({
    mutationFn: (data: any) => api.createCharacter({
      ...data,
      campaignId: id,
      system: campaign?.system || "dnd5e",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["characters", id] });
      setNewCharOpen(false);
      setNewChar({ name: "", characterClass: "", race: "", level: 1 });
      toast({ title: "Personagem criado!", description: "Sua ficha está pronta" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    },
  });

  const markSeenMutation = useMutation({
    mutationFn: () => api.markChangeLogsSeen(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["changelog", id] });
    },
  });

  if (loadingCampaign) {
    return (
      <FantasyLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </FantasyLayout>
    );
  }

  if (!campaign) {
    return (
      <FantasyLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-cinzel text-destructive">Campanha não encontrada</h2>
        </div>
      </FantasyLayout>
    );
  }

  const classes = campaign.system === "tormenta20" ? TORMENTA20_CLASSES : DND5E_CLASSES;

  return (
    <FantasyLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/campaigns")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold font-cinzel text-primary">{campaign.title}</h1>
              <Badge variant="outline" className="border-accent/50 text-accent">
                {campaign.system === "tormenta20" ? "Tormenta 20" : "D&D 5e"}
              </Badge>
            </div>
            <p className="text-muted-foreground">{campaign.description}</p>
          </div>
          
          {isDm && changeLogs.length > 0 && (
            <Button variant="outline" className="relative border-accent/50" onClick={() => markSeenMutation.mutate()}>
              <Bell className="w-4 h-4 mr-2" />
              {changeLogs.length} alterações
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse" />
            </Button>
          )}
        </div>

        <Tabs defaultValue="characters" className="space-y-6">
          <TabsList className="bg-card/50 border border-white/10">
            <TabsTrigger value="characters" className="data-[state=active]:bg-primary/20">
              <Sword className="w-4 h-4 mr-2" /> Personagens
            </TabsTrigger>
            <TabsTrigger value="members" className="data-[state=active]:bg-primary/20">
              <Users className="w-4 h-4 mr-2" /> Jogadores
            </TabsTrigger>
            {isDm && (
              <TabsTrigger value="changelog" className="data-[state=active]:bg-primary/20">
                <Clock className="w-4 h-4 mr-2" /> Histórico
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="characters" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-cinzel">Heróis da Campanha</h2>
              {!isDm && (
                <Dialog open={newCharOpen} onOpenChange={setNewCharOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary">
                      <Plus className="w-4 h-4 mr-2" /> Criar Personagem
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-primary/30">
                    <DialogHeader>
                      <DialogTitle className="font-cinzel text-2xl text-primary">Novo Personagem</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Nome</Label>
                        <Input 
                          value={newChar.name}
                          onChange={(e) => setNewChar({ ...newChar, name: e.target.value })}
                          placeholder="Nome do personagem"
                          className="bg-black/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Classe</Label>
                        <Select 
                          value={newChar.characterClass} 
                          onValueChange={(v) => setNewChar({ ...newChar, characterClass: v })}
                        >
                          <SelectTrigger className="bg-black/20">
                            <SelectValue placeholder="Escolha a classe" />
                          </SelectTrigger>
                          <SelectContent>
                            {classes.map(c => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Raça</Label>
                        <Input 
                          value={newChar.race}
                          onChange={(e) => setNewChar({ ...newChar, race: e.target.value })}
                          placeholder="Humano, Elfo, Anão..."
                          className="bg-black/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Nível</Label>
                        <Input 
                          type="number"
                          min={1}
                          max={20}
                          value={newChar.level}
                          onChange={(e) => setNewChar({ ...newChar, level: parseInt(e.target.value) || 1 })}
                          className="bg-black/20"
                        />
                      </div>
                      <Button 
                        onClick={() => createCharMutation.mutate(newChar)}
                        disabled={!newChar.name || !newChar.characterClass || createCharMutation.isPending}
                        className="w-full bg-gradient-to-r from-primary to-secondary"
                      >
                        Criar Personagem
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {characters.length === 0 ? (
              <Card className="bg-card/40 border-dashed border-2 border-primary/20 py-12">
                <CardContent className="text-center">
                  <Sword className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-cinzel mb-2">Nenhum personagem</h3>
                  <p className="text-muted-foreground">
                    {isDm ? "Aguardando jogadores criarem seus personagens" : "Crie seu primeiro personagem para começar"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {characters.map((char, index) => {
                  const isOwner = char.playerId === user?.id;
                  return (
                    <motion.div
                      key={char.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card 
                        className={`bg-card/40 border-primary/20 backdrop-blur-sm overflow-hidden hover:border-primary/60 transition-all duration-300 group magic-border cursor-pointer ${isOwner ? 'ring-2 ring-primary/30' : ''}`}
                        onClick={() => setLocation(`/character/${char.id}`)}
                      >
                        <div className="relative h-40 overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent z-10" />
                          <img 
                            src={char.image || avatarPlaceholder} 
                            alt={char.name} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                          />
                          <Badge className="absolute top-3 right-3 z-20 bg-black/60 border-primary/30 backdrop-blur text-primary">
                            Lvl {char.level}
                          </Badge>
                          {isOwner && (
                            <Badge className="absolute top-3 left-3 z-20 bg-accent/80 border-accent text-black">
                              Seu
                            </Badge>
                          )}
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
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="members">
            <Card className="bg-card/40">
              <CardHeader>
                <CardTitle className="font-cinzel">Jogadores ({members.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {members.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum jogador entrou ainda. Compartilhe o código de convite!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center gap-4 p-3 rounded-lg bg-white/5">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="font-bold text-primary">{member.username.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-medium">{member.username}</p>
                          <p className="text-xs text-muted-foreground">
                            Entrou em {new Date(member.joinedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {isDm && (
            <TabsContent value="changelog">
              <Card className="bg-card/40">
                <CardHeader>
                  <CardTitle className="font-cinzel flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Histórico de Alterações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    {changeLogs.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        Nenhuma alteração recente
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {changeLogs.map((log) => (
                          <div key={log.id} className="p-3 rounded-lg bg-white/5 border-l-2 border-primary">
                            <p className="text-sm">{log.description}</p>
                            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                              <span>Tipo: {log.changeType}</span>
                              {log.fieldChanged && <span>Campo: {log.fieldChanged}</span>}
                              <span>{new Date(log.createdAt).toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </FantasyLayout>
  );
}
