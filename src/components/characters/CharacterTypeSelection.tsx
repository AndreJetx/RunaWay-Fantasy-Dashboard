"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Users } from "lucide-react";
import { getXPForLevel } from "@/lib/xp-helper";

interface CharacterTypeSelectionProps {
    characterType: "campaign" | "standalone";
    onCharacterTypeChange: (type: "campaign" | "standalone") => void;
    selectedCampaignId: string | null;
    onCampaignChange: (campaignId: string | null) => void;
    availableCampaigns: Array<{ id: string; title: string }>;
    hasExistingCharacter: boolean;
    userId: string | null;
    startingLevel: number;
    onLevelChange: (level: number) => void;
}

export function CharacterTypeSelection({
    characterType,
    onCharacterTypeChange,
    selectedCampaignId,
    onCampaignChange,
    availableCampaigns,
    hasExistingCharacter,
    userId,
    startingLevel,
    onLevelChange,
}: CharacterTypeSelectionProps) {
    const [checkingExisting, setCheckingExisting] = useState(false);

    // Automatically detect character type based on campaign selection
    useEffect(() => {
        if (selectedCampaignId) {
            onCharacterTypeChange("campaign");
        } else {
            onCharacterTypeChange("standalone");
        }
    }, [selectedCampaignId, onCharacterTypeChange]);

    // Check for existing character when campaign is selected
    useEffect(() => {
        const checkExistingCharacter = async () => {
            if (selectedCampaignId && userId) {
                setCheckingExisting(true);
                try {
                    const res = await fetch(`/api/campaigns/${selectedCampaignId}/characters`);
                    if (res.ok) {
                        const characters = await res.json();
                        const userCharacter = characters.find((c: any) =>
                            c.playerId === userId && (c.currentHp ?? 0) > 0
                        );
                        // This will be handled by parent component
                    }
                } catch (error) {
                    console.error("Error checking existing character:", error);
                } finally {
                    setCheckingExisting(false);
                }
            }
        };

        checkExistingCharacter();
    }, [selectedCampaignId, userId]);

    const xpForLevel = getXPForLevel(startingLevel);

    return (
        <Card className="bg-card/60 border-white/10">
            <CardHeader>
                <CardTitle className="text-xl font-cinzel flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Configuração do Personagem
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Campaign Selection */}
                <div className="space-y-2">
                    <Label htmlFor="campaign-select">Campanha (Opcional)</Label>
                    <Select
                        value={selectedCampaignId || "none"}
                        onValueChange={(value) => onCampaignChange(value === "none" ? null : value)}
                    >
                        <SelectTrigger id="campaign-select">
                            <SelectValue placeholder="Selecione uma campanha ou deixe em branco para personagem avulso" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">
                                <span className="text-muted-foreground">🎭 Personagem Avulso (sem campanha)</span>
                            </SelectItem>
                            {availableCampaigns.length === 0 ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    Nenhuma campanha disponível
                                </div>
                            ) : (
                                availableCampaigns.map((campaign) => (
                                    <SelectItem key={campaign.id} value={campaign.id}>
                                        📚 {campaign.title}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>

                    {/* Info sobre tipo de personagem */}
                    {selectedCampaignId ? (
                        <p className="text-xs text-muted-foreground mt-2">
                            ✅ <strong>Personagem de Campanha:</strong> Vinculado à campanha selecionada. Limite de 1 personagem vivo por campanha.
                        </p>
                    ) : (
                        <p className="text-xs text-muted-foreground mt-2">
                            ✅ <strong>Personagem Avulso:</strong> Para testes ou uso fora de campanhas. Criação ilimitada.
                        </p>
                    )}

                    {hasExistingCharacter && selectedCampaignId && (
                        <Alert variant="destructive" className="mt-3">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Você já possui um personagem vivo nesta campanha. Apenas é permitido criar um novo personagem se o anterior estiver morto.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                {/* Starting Level Selection */}
                <div className="space-y-2">
                    <Label htmlFor="starting-level">Nível Inicial</Label>
                    <Select
                        value={startingLevel.toString()}
                        onValueChange={(value) => onLevelChange(parseInt(value))}
                    >
                        <SelectTrigger id="starting-level">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                            {Array.from({ length: 20 }, (_, i) => i + 1).map((level) => (
                                <SelectItem key={level} value={level.toString()}>
                                    Nível {level} {level > 1 && `(${getXPForLevel(level).toLocaleString()} XP)`}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {startingLevel > 1 && (
                        <Alert className="mt-2 border-amber-500/30 bg-amber-500/10">
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                            <AlertDescription className="text-sm">
                                <strong>Level-Ups Graduais:</strong> Seu personagem será criado em <strong>nível 1</strong> com {xpForLevel.toLocaleString()} XP.
                                <br />
                                Você precisará fazer <strong>{startingLevel - 1} level-up(s)</strong> gradualmente (1→2, 2→3, etc.) para chegar ao nível {startingLevel}.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
