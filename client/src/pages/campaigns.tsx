import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FantasyLayout } from "@/components/layout/FantasyLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Scroll, Clock, Users, MapPin, ChevronRight, Plus, Copy, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import mapBg from "@assets/generated_images/fantasy_world_map_parchment.png";

export default function Campaigns() {
  const { isDm, isPlayer } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [newCampaignOpen, setNewCampaignOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [newCampaign, setNewCampaign] = useState({
    title: "",
    description: "",
    system: "dnd5e",
  });

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: api.getCampaigns,
  });

  const createMutation = useMutation({
    mutationFn: api.createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      setNewCampaignOpen(false);
      setNewCampaign({ title: "", description: "", system: "dnd5e" });
      toast({ title: "Campanha criada!", description: "Sua nova aventura está pronta" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    },
  });

  const joinMutation = useMutation({
    mutationFn: api.joinCampaign,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      setJoinOpen(false);
      setInviteCode("");
      toast({ title: "Entrou na campanha!", description: `Bem-vindo a "${data.campaign.title}"` });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    },
  });

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Código copiado!", description: "Compartilhe com seus jogadores" });
  };

  return (
    <FantasyLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold font-cinzel text-primary">Campanhas</h1>
            <p className="text-muted-foreground">
              {isDm ? "Gerencie suas aventuras e jogadores" : "Participe de aventuras épicas"}
            </p>
          </div>
          
          {isDm ? (
            <Dialog open={newCampaignOpen} onOpenChange={setNewCampaignOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Scroll className="mr-2 h-4 w-4" /> Nova Campanha
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-primary/30">
                <DialogHeader>
                  <DialogTitle className="font-cinzel text-2xl text-primary">Criar Campanha</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input 
                      value={newCampaign.title}
                      onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
                      placeholder="A Sombra de Eldoria"
                      className="bg-black/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sistema</Label>
                    <Select 
                      value={newCampaign.system} 
                      onValueChange={(v) => setNewCampaign({ ...newCampaign, system: v })}
                    >
                      <SelectTrigger className="bg-black/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dnd5e">D&D 5e</SelectItem>
                        <SelectItem value="tormenta20">Tormenta 20</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea
                      value={newCampaign.description}
                      onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                      placeholder="Descreva sua campanha..."
                      className="bg-black/20 min-h-[100px]"
                    />
                  </div>
                  <Button 
                    onClick={() => createMutation.mutate(newCampaign)}
                    disabled={!newCampaign.title || createMutation.isPending}
                    className="w-full bg-gradient-to-r from-primary to-secondary"
                  >
                    Criar Campanha
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <UserPlus className="mr-2 h-4 w-4" /> Entrar em Campanha
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-primary/30">
                <DialogHeader>
                  <DialogTitle className="font-cinzel text-2xl text-primary">Entrar em Campanha</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Código de Convite</Label>
                    <Input 
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      placeholder="Digite o código do mestre"
                      className="bg-black/20"
                    />
                  </div>
                  <Button 
                    onClick={() => joinMutation.mutate(inviteCode)}
                    disabled={!inviteCode || joinMutation.isPending}
                    className="w-full bg-gradient-to-r from-primary to-secondary"
                  >
                    Entrar na Aventura
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : campaigns.length === 0 ? (
          <Card className="bg-card/40 border-dashed border-2 border-primary/20 py-12">
            <CardContent className="text-center">
              <Scroll className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-cinzel mb-2">Nenhuma campanha encontrada</h3>
              <p className="text-muted-foreground">
                {isDm ? "Crie sua primeira campanha para começar" : "Entre em uma campanha usando o código de convite"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {campaigns.map((camp, i) => (
              <motion.div
                key={camp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card 
                  className="bg-card/60 border-white/10 overflow-hidden hover:border-primary/40 transition-colors group cursor-pointer"
                  onClick={() => setLocation(`/campaign/${camp.id}`)}
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3 h-48 md:h-auto relative overflow-hidden">
                      <div className="absolute inset-0 bg-primary/10 mix-blend-overlay z-10" />
                      <img 
                        src={camp.image || mapBg} 
                        alt={camp.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 sepia-[.3]" 
                      />
                    </div>
                    <div className="md:w-2/3 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex gap-2 mb-2">
                              <Badge variant="outline" className="border-primary/50 text-primary bg-primary/10">
                                {camp.status}
                              </Badge>
                              <Badge variant="outline" className="border-accent/50 text-accent bg-accent/10">
                                {camp.system === "tormenta20" ? "Tormenta 20" : "D&D 5e"}
                              </Badge>
                            </div>
                            <h2 className="text-2xl font-bold font-cinzel text-foreground group-hover:text-primary transition-colors">
                              {camp.title}
                            </h2>
                          </div>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                            <ChevronRight className="w-6 h-6" />
                          </Button>
                        </div>
                        
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {camp.description || "Sem descrição"}
                        </p>
                        
                        {camp.nextSession && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                            <Clock className="w-4 h-4 text-primary" />
                            Próxima sessão: {camp.nextSession}
                          </div>
                        )}
                      </div>

                      {isDm && camp.inviteCode && (
                        <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                          <span className="text-xs text-muted-foreground">Código:</span>
                          <code className="bg-black/40 px-2 py-1 rounded text-primary text-sm font-mono">
                            {camp.inviteCode}
                          </code>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={(e) => { e.stopPropagation(); copyInviteCode(camp.inviteCode!); }}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </FantasyLayout>
  );
}
