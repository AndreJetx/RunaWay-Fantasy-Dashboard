"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Users, User } from "lucide-react";
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

    // Check for existing character when campaign is selected
    useEffect(() => {
        const checkExistingCharacter = async () => {
            if (characterType === "campaign" && selectedCampaignId && userId) {
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
    }, [characterType, selectedCampaignId, userId]);

    const xpForLevel = getXPForLevel(startingLevel);

    return (
        <Card className="bg-card/60 border-white/10">
            <CardHeader>
                <CardTitle className="text-xl font-cinzel flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Tipo e Configuração do Personagem
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Character Type Selection */}
                <div className="space-y-3">
                    <Label className="text-base font-semibold">Tipo de Personagem</Label>
                    <RadioGroup
                        value={characterType}
                        onValueChange={(value) => onCharacterTypeChange(value as "campaign" | "standalone")}
                    >
                        <div className="flex items-start space-x-3 p-4 rounded-lg border border-white/10 hover:border-primary/30 transition-colors">
                            <RadioGroupItem value="campaign" id="campaign" className="mt-1" />
                            <div className="flex-1">
                                <Label htmlFor="campaign" className="cursor-pointer font-semibold flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Personagem de Campanha
                                </Label>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Vinculado a uma campanha ativa. Limite de 1 personagem vivo por campanha.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3 p-4 rounded-lg border border-white/10 hover:border-primary/30 transition-colors">
                            <RadioGroupItem value="standalone" id="standalone" className="mt-1" />
                            <div className="flex-1">
                                <Label htmlFor="standalone" className="cursor-pointer font-semibold flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Personagem Avulso
                                </Label>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Para testes ou uso fora de campanhas. Criação ilimitada.
                                </p>
                            </div>
                        </div>
                    </RadioGroup>
                </div>

                {/* Campaign Selection (only if campaign type) */}
                {characterType === "campaign" && (
                    <div className="space-y-2">
                        <Label htmlFor="campaign-select">Selecione a Campanha</Label>
                        <Select value={selectedCampaignId || undefined} onValueChange={onCampaignChange}>
                            <SelectTrigger id="campaign-select">
                                <SelectValue placeholder="Escolha uma campanha..." />
                            </SelectTrigger>
                            <SelectContent>
                                {availableCampaigns.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                        Nenhuma campanha disponível
                                    </div>
                                ) : (
                                    availableCampaigns.map((campaign) => (
                                        <SelectItem key={campaign.id} value={campaign.id}>
                                            {campaign.title}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>

                        {hasExistingCharacter && selectedCampaignId && (
                            <Alert variant="destructive" className="mt-3">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Você já possui um personagem vivo nesta campanha. Apenas é permitido criar um novo personagem se o anterior estiver morto.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                )}

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
