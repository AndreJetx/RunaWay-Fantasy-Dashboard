import { FantasyLayout } from "@/components/layout/FantasyLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scroll, Clock, Users, MapPin, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import mapBg from "@assets/generated_images/fantasy_world_map_parchment.png";

const campaigns = [
  {
    id: 1,
    title: "The Shadow of Eldoria",
    status: "Active",
    nextSession: "Dec 15, 20:00",
    location: "Eldoria Ruins",
    players: 5,
    progress: 65,
    image: mapBg
  },
  {
    id: 2,
    title: "Rise of the Dragon Queen",
    status: "Paused",
    nextSession: "TBD",
    location: "Dragonspire",
    players: 4,
    progress: 20,
    image: mapBg
  }
];

export default function Campaigns() {
  return (
    <FantasyLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold font-cinzel text-primary">Chronicles</h1>
            <p className="text-muted-foreground">Manage your ongoing adventures and sagas.</p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Scroll className="mr-2 h-4 w-4" /> New Campaign
          </Button>
        </div>

        <div className="grid gap-8">
          {campaigns.map((camp, i) => (
            <motion.div
              key={camp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
            >
              <Card className="bg-card/60 border-white/10 overflow-hidden hover:border-primary/40 transition-colors group">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3 h-48 md:h-auto relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/10 mix-blend-overlay z-10" />
                    <img 
                      src={camp.image} 
                      alt={camp.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 sepia-[.3]" 
                    />
                  </div>
                  <div className="md:w-2/3 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <Badge variant="outline" className="mb-2 border-primary/50 text-primary bg-primary/10">
                            {camp.status}
                          </Badge>
                          <h2 className="text-2xl font-bold font-cinzel text-foreground group-hover:text-primary transition-colors">
                            {camp.title}
                          </h2>
                        </div>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                          <ChevronRight className="w-6 h-6" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 text-primary" />
                          {camp.nextSession}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 text-primary" />
                          {camp.location}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="w-4 h-4 text-primary" />
                          {camp.players} Heroes
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs uppercase tracking-widest text-muted-foreground">
                        <span>Story Progress</span>
                        <span>{camp.progress}%</span>
                      </div>
                      <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-primary to-secondary"
                          initial={{ width: 0 }}
                          animate={{ width: `${camp.progress}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </FantasyLayout>
  );
}
