import { FantasyLayout } from "@/components/layout/FantasyLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Shield, Zap, Heart, Brain } from "lucide-react";
import { motion } from "framer-motion";
import avatarPlaceholder from "@assets/generated_images/fantasy_character_silhouette_avatar.png";

const characters = [
  { id: 1, name: "Eldric Shadowbane", class: "Rogue", level: 5, hp: 45, image: avatarPlaceholder, alignment: "Chaotic Neutral" },
  { id: 2, name: "Lyra Sunweaver", class: "Cleric", level: 4, hp: 38, image: avatarPlaceholder, alignment: "Lawful Good" },
  { id: 3, name: "Thorin Ironfist", class: "Warrior", level: 6, hp: 82, image: avatarPlaceholder, alignment: "Lawful Neutral" },
  { id: 4, name: "Sylas the Arcane", class: "Wizard", level: 5, hp: 32, image: avatarPlaceholder, alignment: "True Neutral" },
  { id: 5, name: "Kaelthas", class: "Paladin", level: 7, hp: 95, image: avatarPlaceholder, alignment: "Lawful Good" },
];

export default function Characters() {
  return (
    <FantasyLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
          <h1 className="text-3xl font-bold font-cinzel text-primary text-glow">Heroes & Villains</h1>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search characters..." className="pl-8 bg-card/50 border-primary/20 focus:border-primary/50" />
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="mr-2 h-4 w-4" /> Add Hero
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-primary/30 text-foreground sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="font-cinzel text-2xl text-primary text-center">Summon New Hero</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" className="col-span-3 bg-background/50 border-white/10" placeholder="Enter hero name" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="class" className="text-right">Class</Label>
                    <Input id="class" className="col-span-3 bg-background/50 border-white/10" placeholder="Warrior, Mage..." />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="level" className="text-right">Level</Label>
                    <Input id="level" type="number" className="col-span-3 bg-background/50 border-white/10" defaultValue={1} />
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity">
                  Create Character
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {characters.map((char, index) => (
            <motion.div
              key={char.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card/40 border-primary/20 backdrop-blur-sm overflow-hidden hover:border-primary/60 transition-all duration-300 group magic-border">
                <div className="relative h-48 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent z-10" />
                  <img 
                    src={char.image} 
                    alt={char.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <Badge className="absolute top-3 right-3 z-20 bg-black/60 border-primary/30 backdrop-blur text-primary">
                    Lvl {char.level}
                  </Badge>
                </div>
                <CardContent className="pt-4 relative z-20 -mt-12">
                  <h3 className="text-xl font-bold font-cinzel text-white mb-1">{char.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
                    {char.class} • {char.alignment}
                  </p>
                  
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="bg-white/5 p-2 rounded border border-white/5">
                      <Heart className="w-4 h-4 mx-auto mb-1 text-red-400" />
                      <span className="text-white font-bold">{char.hp}</span>
                    </div>
                    <div className="bg-white/5 p-2 rounded border border-white/5">
                      <Shield className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                      <span className="text-white font-bold">16</span>
                    </div>
                    <div className="bg-white/5 p-2 rounded border border-white/5">
                      <Zap className="w-4 h-4 mx-auto mb-1 text-yellow-400" />
                      <span className="text-white font-bold">12</span>
                    </div>
                    <div className="bg-white/5 p-2 rounded border border-white/5">
                      <Brain className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                      <span className="text-white font-bold">14</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </FantasyLayout>
  );
}
