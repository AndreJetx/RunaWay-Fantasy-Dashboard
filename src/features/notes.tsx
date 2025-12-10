"use client";

import { useEffect, useState } from "react";
import { FantasyLayout } from "@/components/layout/FantasyLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Plus, Save, MoreVertical, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCampaign } from "@/contexts/CampaignContext";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/context";

interface Note {
  id: string;
  title: string;
  content: string | null;
  category: string;
  campaignId: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function Notes() {
  const { activeCampaign } = useCampaign();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    if (!activeCampaign) {
      setNotes([]);
      setLoading(false);
      return;
    }

    const fetchNotes = async () => {
      try {
        setLoading(true);
        // Usar rota otimizada de notes
        const res = await fetch(`/api/notes?campaignId=${activeCampaign.id}`);
        if (res.ok) {
          const campaignNotes = await res.json();
          setNotes(campaignNotes || []);
          if (campaignNotes.length > 0 && !activeNote) {
            setActiveNote(campaignNotes[0]);
          }
        } else {
          setNotes([]);
        }
      } catch (error) {
        console.error("Error fetching notes:", error);
        toast.error(t("notes.loadError"));
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [activeCampaign, t, activeNote]);

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!activeCampaign) {
    return (
      <FantasyLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              {t("notes.selectCampaign")}
            </p>
          </div>
        </div>
      </FantasyLayout>
    );
  }

  return (
    <FantasyLayout>
      <div className="h-[calc(100vh-8rem)] flex gap-6">
        {/* Sidebar List */}
        <Card className="w-80 bg-card/30 border-white/10 flex flex-col overflow-hidden backdrop-blur-sm">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-cinzel font-bold text-lg">{t("notes.title")}</h2>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
              <Input
                placeholder={t("notes.searchNotes")}
                className="pl-7 h-8 text-xs bg-black/20 border-white/5"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <Separator className="bg-white/5" />
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                {t("notes.loading")}
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                {searchTerm
                  ? t("notes.noNotesFound")
                  : t("notes.noNotes")}
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredNotes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => setActiveNote(note)}
                    className={cn(
                      "w-full text-left p-3 rounded-md transition-colors text-sm group",
                      activeNote?.id === note.id
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className="font-medium truncate mb-1">{note.title}</div>
                    <div className="flex justify-between items-center text-[10px] opacity-70">
                      <span>{note.category}</span>
                      <span>
                        {new Date(note.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>

        {/* Editor Area */}
        <Card className="flex-1 bg-card/30 border-white/10 flex flex-col overflow-hidden backdrop-blur-sm relative">
          {/* Magical Glow Effect */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

          {activeNote ? (
            <>
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold font-cinzel">
                    {activeNote.title}
                  </h1>
                  <div className="flex gap-2 mt-2">
                    <Badge
                      variant="outline"
                      className="text-xs border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer"
                    >
                      {activeNote.category}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/10 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                  >
                    <Save className="w-4 h-4 mr-2" /> {t("notes.save")}
                  </Button>
                  <Button size="icon" variant="ghost">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 p-6 relative">
                <textarea
                  className="w-full h-full bg-transparent border-none resize-none focus:ring-0 text-lg leading-relaxed font-serif text-foreground/90 placeholder-muted-foreground/50"
                  defaultValue={activeNote.content || ""}
                  placeholder={t("notes.magicPen")}
                />
                <div className="absolute bottom-4 right-4 text-xs text-muted-foreground opacity-50">
                  {t("notes.lastEdit")}:{" "}
                  {new Date(activeNote.updatedAt).toLocaleString()}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <p className="mb-4">
                  {notes.length === 0
                    ? t("notes.noNotes")
                    : t("notes.selectNote")}
                </p>
                {notes.length === 0 && (
                  <Button className="bg-primary text-primary-foreground">
                    <Plus className="mr-2 h-4 w-4" /> {t("notes.createFirst")}
                  </Button>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </FantasyLayout>
  );
}
