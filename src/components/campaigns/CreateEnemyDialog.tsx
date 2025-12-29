"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { ENEMY_DATA, BestiaryEnemy } from "@/lib/dnd/bestiary";


interface CreateEnemyDialogProps {
  campaignId: string;
  chapterId?: string | null;
  onEnemyCreated?: () => void;
  trigger?: React.ReactNode;
}

export function CreateEnemyDialog({
  campaignId,
  chapterId,
  onEnemyCreated,
  trigger,
}: CreateEnemyDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [crFilter, setCrFilter] = useState<string>("all");
  const [selectedEnemy, setSelectedEnemy] = useState<any>(null);
  const [customName, setCustomName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [creating, setCreating] = useState(false);

  // Obter todos os CRs únicos para o filtro
  const uniqueCRs = Array.from(new Set(ENEMY_DATA.map((enemy) => enemy.cr.toString()))).sort((a, b) => {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    return numA - numB;
  });

  const filteredEnemies = ENEMY_DATA.filter((enemy) => {
    const matchesSearch =
      enemy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enemy.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCR = crFilter === "all" || enemy.cr.toString() === crFilter;
    return matchesSearch && matchesCR;
  });

  const handleSelectEnemy = (enemy: any) => {
    setSelectedEnemy(enemy);
    setCustomName(enemy.name);
    setImageUrl("");
  };

  const handleCreate = async () => {
    if (!selectedEnemy) {
      toast.error("Selecione um inimigo primeiro");
      return;
    }

    setCreating(true);
    try {
      // Preparar dados do inimigo para envio
      const hpMatch = selectedEnemy.hp?.match(/\d+/);
      const hpValue = hpMatch ? parseInt(hpMatch[0], 10) : 10;

      const speedMatch = selectedEnemy.speed?.match(/\d+/);
      const speedValue = speedMatch ? parseInt(speedMatch[0], 10) : 30;

      const enemyData: any = {
        name: customName || selectedEnemy.name,
        challengeRating: selectedEnemy.cr?.toString() || undefined,
        type: "enemy", // Sempre definir como "enemy" quando criar através deste dialog
        size: selectedEnemy.size || undefined,
        alignment: selectedEnemy.alignment || undefined,
        armorClass: selectedEnemy.ac || 10,
        maxHp: hpValue,
        currentHp: hpValue,
        speed: speedValue,
        hitDice: selectedEnemy.hp || undefined,
        abilities: selectedEnemy.abilities || {},
        savingThrows: selectedEnemy.saving_throws || [],
        skills: selectedEnemy.skills || [],
        damageVulnerabilities: selectedEnemy.damage_vulnerabilities || [],
        damageResistances: selectedEnemy.damage_resistances || [],
        damageImmunities: selectedEnemy.damage_immunities || [],
        conditionImmunities: selectedEnemy.condition_immunities || [],
        senses: selectedEnemy.senses || undefined,
        languages: selectedEnemy.languages || undefined,
        actions: selectedEnemy.actions || [],
        specialTraits: selectedEnemy.special_traits || [],
        isHostile: true, // Sempre true para inimigos criados através deste dialog
      };

      // Adicionar campos opcionais apenas se tiverem valor
      if (imageUrl) {
        enemyData.image = imageUrl;
      }
      if (chapterId) {
        enemyData.chapterId = chapterId;
      }

      const res = await fetch(`/api/campaigns/${campaignId}/npcs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enemyData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro ao criar inimigo: ${res.status}`);
      }

      toast.success(`Inimigo "${customName || selectedEnemy.name}" criado!`);
      setOpen(false);
      setSelectedEnemy(null);
      setCustomName("");
      setImageUrl("");
      setSearchTerm("");
      setCrFilter("all");
      onEnemyCreated?.();
    } catch (error: any) {
      console.error("Error creating enemy:", error);
      toast.error(error.message || "Erro ao criar inimigo");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-primary text-primary-foreground">
            <Plus className="mr-2 h-4 w-4" /> Criar Inimigo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Criar Inimigo</DialogTitle>
          <DialogDescription>
            Selecione um inimigo da lista ou busque por nome/tipo
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
          {/* Lista de Inimigos */}
          <div className="flex flex-col space-y-4 min-h-0">
            <div className="flex flex-col gap-2 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar inimigo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div>
                <Select value={crFilter} onValueChange={setCrFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por CR (todos)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os CRs</SelectItem>
                    {uniqueCRs.map((cr) => (
                      <SelectItem key={cr} value={cr}>
                        CR {cr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <ScrollArea className="flex-1 min-h-0 border rounded-md">
              <div className="p-2 space-y-2">
                {filteredEnemies.map((enemy) => (
                  <div
                    key={enemy.name}
                    onClick={() => handleSelectEnemy(enemy)}
                    className={`p-3 rounded-md cursor-pointer transition-colors ${selectedEnemy?.name === enemy.name
                      ? "bg-primary/10 border-2 border-primary"
                      : "bg-card/40 border-2 border-transparent hover:bg-card/60"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{enemy.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {enemy.type} • CR {enemy.cr}
                        </div>
                      </div>
                      <Badge variant="outline">CA {enemy.ac}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Preview do Inimigo Selecionado */}
          <div className="flex flex-col space-y-4 min-h-0">
            {selectedEnemy ? (
              <>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <div>
                    <Label htmlFor="customName">Nome do Inimigo</Label>
                    <Input
                      id="customName"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder={selectedEnemy.name}
                    />
                  </div>
                  <div>
                    <Label htmlFor="imageUrl">URL da Imagem (opcional)</Label>
                    <Input
                      id="imageUrl"
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </div>
                </div>
                <ScrollArea className="flex-1 min-h-0 border rounded-md p-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-lg">{selectedEnemy.name}</h3>
                      <div className="flex gap-2 mt-1">
                        <Badge>{selectedEnemy.type}</Badge>
                        <Badge variant="outline">CR {selectedEnemy.cr}</Badge>
                        <Badge variant="outline">CA {selectedEnemy.ac}</Badge>
                        <Badge variant="outline">HP {selectedEnemy.hp}</Badge>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold">Atributos</h4>
                      <div className="grid grid-cols-6 gap-2 mt-1 text-sm">
                        {Object.entries(selectedEnemy.abilities || {}).map(
                          ([attr, value]: [string, any]) => (
                            <div key={attr} className="text-center">
                              <div className="font-medium">{attr.toUpperCase()}</div>
                              <div>{value}</div>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {selectedEnemy.actions && selectedEnemy.actions.length > 0 && (
                      <div>
                        <h4 className="font-semibold">Ações</h4>
                        <div className="space-y-2 mt-1">
                          {selectedEnemy.actions.map((action: any, idx: number) => (
                            <div key={idx} className="text-sm">
                              <div className="font-medium">
                                {action.name} {action.bonus && `+${action.bonus}`}
                              </div>
                              <div className="text-muted-foreground">
                                {action.damage} {action.type}
                              </div>
                              {action.description && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {action.description}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedEnemy.special_traits &&
                      selectedEnemy.special_traits.length > 0 && (
                        <div>
                          <h4 className="font-semibold">Traços Especiais</h4>
                          <div className="space-y-2 mt-1">
                            {selectedEnemy.special_traits.map(
                              (trait: any, idx: number) => (
                                <div key={idx} className="text-sm">
                                  <div className="font-medium">{trait.name}</div>
                                  <div className="text-muted-foreground">
                                    {trait.description}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {(selectedEnemy.damage_resistances?.length > 0 ||
                      selectedEnemy.damage_immunities?.length > 0 ||
                      selectedEnemy.damage_vulnerabilities?.length > 0) && (
                        <div>
                          <h4 className="font-semibold">Resistências/Imunidades</h4>
                          <div className="space-y-1 mt-1 text-sm">
                            {selectedEnemy.damage_resistances?.length > 0 && (
                              <div>
                                <span className="font-medium">Resistências: </span>
                                {selectedEnemy.damage_resistances.join(", ")}
                              </div>
                            )}
                            {selectedEnemy.damage_immunities?.length > 0 && (
                              <div>
                                <span className="font-medium">Imunidades: </span>
                                {selectedEnemy.damage_immunities.join(", ")}
                              </div>
                            )}
                            {selectedEnemy.damage_vulnerabilities?.length > 0 && (
                              <div>
                                <span className="font-medium">Vulnerabilidades: </span>
                                {selectedEnemy.damage_vulnerabilities.join(", ")}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </ScrollArea>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Selecione um inimigo da lista
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!selectedEnemy || creating}
            className="bg-primary text-primary-foreground"
          >
            {creating ? "Criando..." : "Criar Inimigo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

