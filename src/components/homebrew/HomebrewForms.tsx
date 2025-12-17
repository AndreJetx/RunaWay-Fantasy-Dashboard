"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface HomebrewFormsProps {
    type: string;
    initialData?: any;
    onCancel?: () => void;
}

export function HomebrewForms({ type, initialData, onCancel }: HomebrewFormsProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(initialData || {
        name: "",
        description: "",
        isPublic: false,
        data: {}
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = initialData ? `/api/homebrew/${initialData.id}` : "/api/homebrew";
            const method = initialData ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type,
                    ...formData
                }),
            });

            if (!res.ok) throw new Error("Failed to save");

            toast.success("Conteúdo salvo com sucesso!");
            router.push("/homebrew");
        } catch (error) {
            console.error("Error saving homebrew:", error);
            toast.error("Erro ao salvar conteúdo");
        } finally {
            setLoading(false);
        }
    };

    const updateData = (field: string, value: any) => {
        setFormData((prev: any) => ({
            ...prev,
            data: {
                ...prev.data,
                [field]: value
            }
        }));
    };

    const renderSpecificFields = () => {
        switch (type) {
            case "spell":
                return (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nível</Label>
                                <Select
                                    onValueChange={(v) => updateData("level", parseInt(v))}
                                    defaultValue={formData.data.level?.toString()}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o nível" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">Truque</SelectItem>
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(l => (
                                            <SelectItem key={l} value={l.toString()}>{l}º Círculo</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Escola</Label>
                                <Select
                                    onValueChange={(v) => updateData("school", v)}
                                    defaultValue={formData.data.school}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a escola" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Abjuration">Abjuração</SelectItem>
                                        <SelectItem value="Conjuration">Conjuração</SelectItem>
                                        <SelectItem value="Divination">Adivinhação</SelectItem>
                                        <SelectItem value="Enchantment">Encantamento</SelectItem>
                                        <SelectItem value="Evocation">Evocação</SelectItem>
                                        <SelectItem value="Illusion">Ilusão</SelectItem>
                                        <SelectItem value="Necromancy">Necromancia</SelectItem>
                                        <SelectItem value="Transmutation">Transmutação</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Tempo de Conjuração</Label>
                                <Input
                                    placeholder="ex: 1 ação"
                                    value={formData.data.castingTime || ""}
                                    onChange={(e) => updateData("castingTime", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Alcance</Label>
                                <Input
                                    placeholder="ex: 18 metros"
                                    value={formData.data.range || ""}
                                    onChange={(e) => updateData("range", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Duração</Label>
                                <Input
                                    placeholder="ex: Instantânea"
                                    value={formData.data.duration || ""}
                                    onChange={(e) => updateData("duration", e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Componentes</Label>
                            <Input
                                placeholder="ex: V, S, M (uma pitada de enxofre)"
                                value={formData.data.components || ""}
                                onChange={(e) => updateData("components", e.target.value)}
                            />
                        </div>
                    </>
                );

            case "item":
                return (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tipo de Item</Label>
                                <Select
                                    onValueChange={(v) => updateData("itemType", v)}
                                    defaultValue={formData.data.itemType}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Weapon">Arma</SelectItem>
                                        <SelectItem value="Armor">Armadura</SelectItem>
                                        <SelectItem value="Potion">Poção</SelectItem>
                                        <SelectItem value="Ring">Anel</SelectItem>
                                        <SelectItem value="Wondrous Item">Item Maravilhoso</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Raridade</Label>
                                <Select
                                    onValueChange={(v) => updateData("rarity", v)}
                                    defaultValue={formData.data.rarity}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a raridade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Common">Comum</SelectItem>
                                        <SelectItem value="Uncommon">Incomum</SelectItem>
                                        <SelectItem value="Rare">Raro</SelectItem>
                                        <SelectItem value="Very Rare">Muito Raro</SelectItem>
                                        <SelectItem value="Legendary">Lendário</SelectItem>
                                        <SelectItem value="Artifact">Artefato</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="attunement"
                                checked={formData.data.requiresAttunement}
                                onCheckedChange={(c) => updateData("requiresAttunement", c)}
                            />
                            <Label htmlFor="attunement">Requer Sintonização</Label>
                        </div>
                    </>
                );

            case "subclass":
                return (
                    <>
                        <div className="space-y-2">
                            <Label>Classe Base</Label>
                            <Select
                                onValueChange={(v) => updateData("baseClass", v)}
                                defaultValue={formData.data.baseClass}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a classe" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Barbarian">Bárbaro</SelectItem>
                                    <SelectItem value="Bard">Bardo</SelectItem>
                                    <SelectItem value="Cleric">Clérigo</SelectItem>
                                    <SelectItem value="Druid">Druida</SelectItem>
                                    <SelectItem value="Fighter">Guerreiro</SelectItem>
                                    <SelectItem value="Monk">Monge</SelectItem>
                                    <SelectItem value="Paladin">Paladino</SelectItem>
                                    <SelectItem value="Ranger">Patrulheiro</SelectItem>
                                    <SelectItem value="Rogue">Ladino</SelectItem>
                                    <SelectItem value="Sorcerer">Feiticeiro</SelectItem>
                                    <SelectItem value="Warlock">Bruxo</SelectItem>
                                    <SelectItem value="Wizard">Mago</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Perícias Concedidas</Label>
                            <Input
                                placeholder="ex: Arcanismo, Religião"
                                value={formData.data.skills || ""}
                                onChange={(e) => updateData("skills", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Modificadores Situacionais (JSON)</Label>
                            <Textarea
                                placeholder='[{"condition": "em florestas", "modifier": "+2 em Furtividade"}]'
                                value={typeof formData.data.situationalModifiers === 'string' ? formData.data.situationalModifiers : JSON.stringify(formData.data.situationalModifiers || [], null, 2)}
                                onChange={(e) => {
                                    try {
                                        const parsed = JSON.parse(e.target.value);
                                        updateData("situationalModifiers", parsed);
                                    } catch {
                                        updateData("situationalModifiers", e.target.value);
                                    }
                                }}
                                className="font-mono text-xs"
                            />
                        </div>
                    </>
                );

            case "monster":
                return (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tamanho</Label>
                                <Select
                                    onValueChange={(v) => updateData("size", v)}
                                    defaultValue={formData.data.size}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o tamanho" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Tiny">Minúsculo</SelectItem>
                                        <SelectItem value="Small">Pequeno</SelectItem>
                                        <SelectItem value="Medium">Médio</SelectItem>
                                        <SelectItem value="Large">Grande</SelectItem>
                                        <SelectItem value="Huge">Enorme</SelectItem>
                                        <SelectItem value="Gargantuan">Imenso</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Tipo</Label>
                                <Input
                                    placeholder="ex: Besta, Dragão, Morto-vivo"
                                    value={formData.data.type || ""}
                                    onChange={(e) => updateData("type", e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Classe de Armadura (CA)</Label>
                                <Input
                                    type="number"
                                    value={formData.data.armorClass || ""}
                                    onChange={(e) => updateData("armorClass", parseInt(e.target.value))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Pontos de Vida (PV)</Label>
                                <Input
                                    type="number"
                                    value={formData.data.hitPoints || ""}
                                    onChange={(e) => updateData("hitPoints", parseInt(e.target.value))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Deslocamento</Label>
                                <Input
                                    placeholder="ex: 9m, voo 18m"
                                    value={formData.data.speed || ""}
                                    onChange={(e) => updateData("speed", e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Atributos (FOR / DES / CON / INT / SAB / CAR)</Label>
                            <div className="grid grid-cols-6 gap-2">
                                {["str", "dex", "con", "int", "wis", "cha"].map((stat) => (
                                    <Input
                                        key={stat}
                                        type="number"
                                        placeholder={stat.toUpperCase()}
                                        value={formData.data.stats?.[stat] || ""}
                                        onChange={(e) => updateData("stats", { ...formData.data.stats, [stat]: parseInt(e.target.value) })}
                                        className="text-center px-1"
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Nível de Desafio (ND)</Label>
                            <Input
                                placeholder="ex: 1/4, 5, 10"
                                value={formData.data.challengeRating || ""}
                                onChange={(e) => updateData("challengeRating", e.target.value)}
                            />
                        </div>
                    </>
                );

            case "race":
                return (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tamanho</Label>
                                <Select
                                    onValueChange={(v) => updateData("size", v)}
                                    defaultValue={formData.data.size}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o tamanho" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Small">Pequeno</SelectItem>
                                        <SelectItem value="Medium">Médio</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Deslocamento</Label>
                                <Input
                                    placeholder="ex: 9m"
                                    value={formData.data.speed || ""}
                                    onChange={(e) => updateData("speed", e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Bônus de Atributos</Label>
                            <div className="grid grid-cols-6 gap-2">
                                {["str", "dex", "con", "int", "wis", "cha"].map((stat) => (
                                    <div key={stat} className="flex flex-col items-center gap-1">
                                        <span className="text-xs uppercase text-muted-foreground">{stat}</span>
                                        <Input
                                            type="number"
                                            value={formData.data.abilityBonuses?.[stat] || 0}
                                            onChange={(e) => updateData("abilityBonuses", { ...formData.data.abilityBonuses, [stat]: parseInt(e.target.value) })}
                                            className="text-center px-1"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Traços Raciais (JSON)</Label>
                            <Textarea
                                placeholder='[{"name": "Visão no Escuro", "description": "..."}]'
                                value={typeof formData.data.traits === 'string' ? formData.data.traits : JSON.stringify(formData.data.traits || [], null, 2)}
                                onChange={(e) => {
                                    try {
                                        const parsed = JSON.parse(e.target.value);
                                        updateData("traits", parsed);
                                    } catch {
                                        // Allow typing invalid JSON temporarily
                                        updateData("traits", e.target.value);
                                    }
                                }}
                                className="font-mono text-xs"
                            />
                            <p className="text-xs text-muted-foreground">Insira os traços como uma lista de objetos JSON.</p>
                        </div>
                    </>
                );

            case "class":
                return (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Dado de Vida</Label>
                                <Select
                                    onValueChange={(v) => updateData("hitDie", v)}
                                    defaultValue={formData.data.hitDie}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o dado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="d6">d6</SelectItem>
                                        <SelectItem value="d8">d8</SelectItem>
                                        <SelectItem value="d10">d10</SelectItem>
                                        <SelectItem value="d12">d12</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Proficiências em Testes de Resistência</Label>
                                <Input
                                    placeholder="ex: Força, Constituição"
                                    value={formData.data.savingThrows || ""}
                                    onChange={(e) => updateData("savingThrows", e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Perícias de Classe</Label>
                            <Input
                                placeholder="ex: Escolha duas entre Atletismo, Intuição..."
                                value={formData.data.skills || ""}
                                onChange={(e) => updateData("skills", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Equipamento Inicial</Label>
                            <Textarea
                                placeholder="Lista de equipamentos..."
                                value={formData.data.equipment || ""}
                                onChange={(e) => updateData("equipment", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Features de Classe (JSON)</Label>
                            <Textarea
                                placeholder='[{"level": 1, "name": "Ataque Furtivo", "description": "..."}]'
                                value={typeof formData.data.features === 'string' ? formData.data.features : JSON.stringify(formData.data.features || [], null, 2)}
                                onChange={(e) => {
                                    try {
                                        const parsed = JSON.parse(e.target.value);
                                        updateData("features", parsed);
                                    } catch {
                                        updateData("features", e.target.value);
                                    }
                                }}
                                className="font-mono text-xs"
                            />
                        </div>
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <Card className="bg-card/60 border-white/10">
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label>Nome</Label>
                        <Input
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Nome do conteúdo"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Descrição</Label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Descrição detalhada..."
                            className="min-h-[100px]"
                        />
                    </div>

                    {renderSpecificFields()}

                    <div className="flex items-center space-x-2 pt-4 border-t border-white/10">
                        <Switch
                            id="public"
                            checked={formData.isPublic}
                            onCheckedChange={(c) => setFormData({ ...formData, isPublic: c })}
                        />
                        <Label htmlFor="public">Tornar Público (Visível para outros Mestres)</Label>
                    </div>

                    <div className="flex gap-2">
                        {onCancel && (
                            <Button type="button" variant="outline" className="w-full" onClick={onCancel}>
                                Cancelar
                            </Button>
                        )}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                "Salvar Conteúdo"
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
