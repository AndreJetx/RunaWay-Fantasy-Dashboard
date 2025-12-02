import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion } from "framer-motion";
import { Sword, Sparkles, Crown, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import sidebarBg from "@assets/generated_images/dark_fantasy_background_texture.png";

export default function Login() {
  const [, setLocation] = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"dm" | "player">("player");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const body = isLogin 
        ? { username, password }
        : { username, password, role };
        
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      toast({
        title: isLogin ? "Welcome back!" : "Account created!",
        description: `Successfully ${isLogin ? "logged in" : "registered"} as ${data.user.role === "dm" ? "Dungeon Master" : "Player"}`,
      });

      setLocation("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
      <div 
        className="fixed inset-0 opacity-30 pointer-events-none z-0"
        style={{ backgroundImage: `url(${sidebarBg})`, backgroundSize: 'cover' }}
      />
      
      <div className="absolute inset-0 bg-gradient-radial from-primary/10 to-transparent pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="bg-card/80 backdrop-blur-xl border-primary/30 shadow-2xl">
          <CardHeader className="text-center pb-6 relative">
            <div className="absolute top-0 left-0 right-0 h-32 bg-primary/5 blur-3xl pointer-events-none" />
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,255,255,0.3)]">
              <Sword className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-cinzel text-primary text-glow">
              Runway Fantasy
            </CardTitle>
            <p className="text-muted-foreground text-sm mt-2">
              {isLogin ? "Entre no seu reino" : "Comece sua aventura"}
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="font-cinzel">Usuário</Label>
                <Input
                  id="username"
                  data-testid="input-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Digite seu nome"
                  required
                  className="bg-black/20 border-primary/20 focus:border-primary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-cinzel">Senha</Label>
                <Input
                  id="password"
                  data-testid="input-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  required
                  className="bg-black/20 border-primary/20 focus:border-primary/50"
                />
              </div>

              {!isLogin && (
                <div className="space-y-3">
                  <Label className="font-cinzel">Escolha seu papel</Label>
                  <RadioGroup value={role} onValueChange={(v) => setRole(v as "dm" | "player")} className="grid grid-cols-2 gap-4">
                    <div>
                      <RadioGroupItem value="player" id="player" className="peer sr-only" />
                      <Label
                        htmlFor="player"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-black/20 p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer transition-all"
                      >
                        <User className="mb-3 h-6 w-6 text-primary" />
                        <span className="font-cinzel text-sm">Jogador</span>
                        <span className="text-xs text-muted-foreground mt-1">Controle sua ficha</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="dm" id="dm" className="peer sr-only" />
                      <Label
                        htmlFor="dm"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-black/20 p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/10 cursor-pointer transition-all"
                      >
                        <Crown className="mb-3 h-6 w-6 text-accent" />
                        <span className="font-cinzel text-sm">Mestre</span>
                        <span className="text-xs text-muted-foreground mt-1">Crie campanhas</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              <Button
                type="submit"
                data-testid="button-submit"
                className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white shadow-[0_0_20px_rgba(var(--primary),0.4)]"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    {isLogin ? "Entrando..." : "Criando..."}
                  </span>
                ) : (
                  isLogin ? "Entrar no Reino" : "Criar Conta"
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {isLogin ? "Não tem conta? Registre-se" : "Já tem conta? Entre"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
