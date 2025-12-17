"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Card, CardHeader } from "@/components/ui/card";
import { FEATS, Feat } from "@/lib/feats";
import { Search, Award, TrendingUp } from "lucide-react";

interface FeatSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (feat: Feat) => void;
}

export function FeatSelector({ open, onOpenChange, onSelect }: FeatSelectorProps) {
  const [search, setSearch] = useState("");
  const [selectedFeat, setSelectedFeat] = useState<Feat | null>(null);

  const filteredFeats = FEATS.filter((feat) =>
    feat.name.toLowerCase().includes(search.toLowerCase()) ||
    feat.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = () => {
    if (selectedFeat) {
      onSelect(selectedFeat);
      onOpenChange(false);
      setSelectedFeat(null);
      setSearch("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Escolher Talento (Feat)
          </DialogTitle>
          <DialogDescription>
            Escolha um talento para seu personagem. Alguns concedem +1 em atributo.
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar talentos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4 flex-1 overflow-hidden min-h-0">
          {/* LISTA */}
          <ScrollArea className="h-full pr-2">
            <div className="space-y-2">
              {filteredFeats.map((feat) => (
                <Card
                  key={feat.name}
                  className={`cursor-pointer transition-all hover:border-primary/50 ${
                    selectedFeat?.name === feat.name
                      ? 'border-primary bg-primary/5'
                      : 'border-border/50'
                  }`}
                  onClick={() => setSelectedFeat(feat)}
                >
                  <CardHeader className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold">{feat.name}</h3>
                      {feat.attributeBonus && (
                        <Badge variant="secondary" className="flex items-center gap-1 flex-shrink-0">
                          <TrendingUp className="w-3 h-3" />
                          +1
                        </Badge>
                      )}
                    </div>
                    {feat.prerequisite && (
                      <p className="text-xs text-amber-400 mt-1">
                        📋 {feat.prerequisite}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {feat.description}
                    </p>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </ScrollArea>

          {/* DETALHES */}
          <ScrollArea className="h-full">
            {selectedFeat ? (
              <div className="space-y-3 pr-2">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-primary" />
                    {selectedFeat.name}
                  </h2>
                  {selectedFeat.prerequisite && (
                    <Badge variant="outline" className="bg-amber-500/20 border-amber-500 text-amber-300 mb-2">
                      📋 {selectedFeat.prerequisite}
                    </Badge>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {selectedFeat.description}
                  </p>
                </div>

                {selectedFeat.attributeBonus && (
                  <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
                    <h3 className="font-semibold text-primary flex items-center gap-2 mb-1 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      Bônus de Atributo
                    </h3>
                    <p className="text-sm">
                      +{selectedFeat.attributeBonus.bonus} em{" "}
                      {selectedFeat.attributeBonus.attribute === "any"
                        ? "um atributo à escolha"
                        : selectedFeat.attributeBonus.attribute}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-primary mb-2 text-sm">✨ Benefícios</h3>
                  <ul className="space-y-2">
                    {selectedFeat.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex gap-2 bg-background/50 rounded p-2 text-sm">
                        <span className="text-green-400">✓</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                Selecione um talento para ver detalhes
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Botão fixo no rodapé */}
        {selectedFeat && (
          <div className="flex-shrink-0 pt-4 border-t">
            <Button onClick={handleSelect} size="lg" className="w-full">
              Escolher {selectedFeat.name}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
