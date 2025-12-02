import { FantasyLayout } from "@/components/layout/FantasyLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Plus, Save, MoreVertical, FolderOpen, Search } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const notes = [
  { id: 1, title: "Session 0: The Awakening", category: "Sessions", date: "2 days ago", preview: "The party met at the tavern..." },
  { id: 2, title: "NPC: Shopkeeper Gorn", category: "NPCs", date: "5 days ago", preview: "Grumpy dwarf with a heart of gold..." },
  { id: 3, title: "Loot Table: Dragon's Lair", category: "Loot", date: "1 week ago", preview: "1. Gold coins (x500)\n2. Ruby..." },
  { id: 4, title: "Quest: Lost Artifact", category: "Quests", date: "2 weeks ago", preview: "Find the ancient scepter..." },
];

export default function Notes() {
  const [activeNote, setActiveNote] = useState(notes[0]);

  return (
    <FantasyLayout>
      <div className="h-[calc(100vh-8rem)] flex gap-6">
        {/* Sidebar List */}
        <Card className="w-80 bg-card/30 border-white/10 flex flex-col overflow-hidden backdrop-blur-sm">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-cinzel font-bold text-lg">Grimoire</h2>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
              <Input placeholder="Search notes..." className="pl-7 h-8 text-xs bg-black/20 border-white/5" />
            </div>
          </div>
          <Separator className="bg-white/5" />
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {notes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => setActiveNote(note)}
                  className={cn(
                    "w-full text-left p-3 rounded-md transition-colors text-sm group",
                    activeNote.id === note.id 
                      ? "bg-primary/10 text-primary border border-primary/20" 
                      : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className="font-medium truncate mb-1">{note.title}</div>
                  <div className="flex justify-between items-center text-[10px] opacity-70">
                    <span>{note.category}</span>
                    <span>{note.date}</span>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Editor Area */}
        <Card className="flex-1 bg-card/30 border-white/10 flex flex-col overflow-hidden backdrop-blur-sm relative">
          {/* Magical Glow Effect */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold font-cinzel">{activeNote.title}</h1>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-xs border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer">
                  {activeNote.category}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="border-white/10 hover:bg-primary/10 hover:text-primary hover:border-primary/30">
                <Save className="w-4 h-4 mr-2" /> Save
              </Button>
              <Button size="icon" variant="ghost">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex-1 p-6 relative">
             <textarea 
                className="w-full h-full bg-transparent border-none resize-none focus:ring-0 text-lg leading-relaxed font-serif text-foreground/90 placeholder-muted-foreground/50"
                defaultValue={`# ${activeNote.title}\n\n${activeNote.preview}\n\nUse this magical quill to record the history of your world...`}
             />
             <div className="absolute bottom-4 right-4 text-xs text-muted-foreground opacity-50">
                Last saved just now
             </div>
          </div>
        </Card>
      </div>
    </FantasyLayout>
  );
}
