import { FantasyLayout } from "@/components/layout/FantasyLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { Sword, Shield, FlaskConical, Gem, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const inventory = [
  { id: 1, name: "Blade of Aether", type: "Weapon", rarity: "Legendary", weight: 4.5, icon: Sword, color: "text-orange-400", border: "border-orange-500/50" },
  { id: 2, name: "Potion of Healing", type: "Consumable", rarity: "Common", weight: 0.5, icon: FlaskConical, color: "text-slate-300", border: "border-slate-500/30" },
  { id: 3, name: "Mithril Vest", type: "Armor", rarity: "Epic", weight: 12.0, icon: Shield, color: "text-purple-400", border: "border-purple-500/50" },
  { id: 4, name: "Ruby of Fire", type: "Gem", rarity: "Rare", weight: 0.1, icon: Gem, color: "text-blue-400", border: "border-blue-500/50" },
  { id: 5, name: "Steel Longsword", type: "Weapon", rarity: "Common", weight: 5.0, icon: Sword, color: "text-slate-300", border: "border-slate-500/30" },
  { id: 6, name: "Elixir of Mana", type: "Consumable", rarity: "Rare", weight: 0.5, icon: FlaskConical, color: "text-blue-400", border: "border-blue-500/50" },
  { id: 7, name: "Dragon Scale", type: "Material", rarity: "Legendary", weight: 2.0, icon: Gem, color: "text-orange-400", border: "border-orange-500/50" },
  { id: 8, name: "Iron Shield", type: "Armor", rarity: "Common", weight: 8.0, icon: Shield, color: "text-slate-300", border: "border-slate-500/30" },
];

export default function Inventory() {
  return (
    <FantasyLayout>
      <div className="space-y-6 h-full flex flex-col">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold font-cinzel text-accent text-glow">Party Inventory</h1>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Filter loot..." className="pl-8 bg-card/50 border-accent/20 focus:border-accent/50" />
          </div>
        </div>

        <ScrollArea className="flex-1 pr-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {inventory.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`aspect-square bg-black/40 backdrop-blur-sm border-2 flex flex-col items-center justify-center p-4 hover:bg-white/5 transition-colors cursor-pointer group relative overflow-hidden ${item.border}`}>
                  {/* Rarity Glow Background */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-${item.color.split('-')[1]}-500`} />
                  
                  <item.icon className={`w-12 h-12 mb-3 ${item.color} drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-transform group-hover:scale-110 duration-300`} />
                  
                  <h4 className="font-cinzel font-bold text-sm text-center leading-tight mb-1">{item.name}</h4>
                  <p className="text-xs text-muted-foreground">{item.type}</p>
                  
                  <Badge variant="outline" className={`mt-2 text-[10px] border-white/10 bg-black/50 ${item.color}`}>
                    {item.rarity}
                  </Badge>
                  
                  <div className="absolute bottom-2 right-2 text-[10px] text-muted-foreground">
                    {item.weight}kg
                  </div>
                </Card>
              </motion.div>
            ))}
            
            {/* Empty Slots */}
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square border-2 border-dashed border-white/5 rounded-lg flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity">
                <div className="w-2 h-2 rounded-full bg-white/10" />
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </FantasyLayout>
  );
}
