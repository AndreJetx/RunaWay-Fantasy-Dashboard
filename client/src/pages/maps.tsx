import { FantasyLayout } from "@/components/layout/FantasyLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Map as MapIcon, Move, Tag } from "lucide-react";
import { useState } from "react";
import mapBg from "@assets/generated_images/fantasy_world_map_parchment.png";
import { motion } from "framer-motion";

export default function Maps() {
  const [zoom, setZoom] = useState(1);

  return (
    <FantasyLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold font-cinzel text-primary">Cartography</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setZoom(Math.min(2, zoom + 0.1))}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button className="bg-primary text-primary-foreground">
              <MapIcon className="mr-2 h-4 w-4" /> Upload Map
            </Button>
          </div>
        </div>

        <Card className="flex-1 bg-black/40 border-primary/30 overflow-hidden relative group">
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
            <Button size="sm" variant="secondary" className="opacity-50 hover:opacity-100 transition-opacity">
              <Tag className="w-4 h-4 mr-2" /> Add Marker
            </Button>
          </div>

          <div className="w-full h-full overflow-hidden flex items-center justify-center bg-[#1a1510] cursor-grab active:cursor-grabbing relative">
             {/* Grid overlay */}
             <div 
                className="absolute inset-0 pointer-events-none opacity-10" 
                style={{ 
                   backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
                   backgroundSize: '50px 50px' 
                }} 
             />
             
            <motion.div 
              className="relative shadow-2xl"
              animate={{ scale: zoom }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              drag
              dragConstraints={{ left: -500, right: 500, top: -300, bottom: 300 }}
            >
              <img 
                src={mapBg} 
                alt="World Map" 
                className="max-w-none rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-[#3d342b]"
                style={{ height: '800px' }}
              />
              
              {/* Map Marker Example */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 group/marker">
                <MapPinIcon className="w-8 h-8 text-red-500 drop-shadow-lg animate-bounce" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover/marker:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
                  Capital City
                </div>
              </div>
            </motion.div>
          </div>
        </Card>
      </div>
    </FantasyLayout>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" clipRule="evenodd" />
    </svg>
  );
}
