import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
    ZoomIn,
    ZoomOut,
    Grid3X3,
    Move,
    Upload,
    UserPlus,
    Swords,
    Maximize2,
    Minimize2,
    ChevronLeft,
    ChevronRight,
    PanelRightClose,
    PanelRightOpen,
    ArrowLeft
} from "lucide-react";
import Image from "next/image";
import { VTTGrid } from "./components/VTTGrid";
import { TokenMarker } from "./components/TokenMarker";
import { InitiativeTracker, Combatant } from "./components/InitiativeTracker";
import { CharacterSheetPanel } from "./components/CharacterSheetPanel";
import { DamageDialog } from "./components/DamageDialog";
import { AttackRollDialog } from "./components/AttackRollDialog";
import { useCampaign } from "@/contexts/CampaignContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateEnemyDialog } from "@/components/campaigns/CreateEnemyDialog";
import { CreateNPCDialog } from "@/components/campaigns/CreateNPCDialog";
import { motion, AnimatePresence } from "framer-motion";
import mapBg from "@assets/generated_images/fantasy_world_map_parchment.png";

// Interfaces para os tipos de dados do VTT
interface VTTToken {
    id: string; // ID único da instância no mapa
    referenceId: string; // ID do personagem/npc original
    type: "player" | "npc" | "enemy";
    x: number;
    y: number;
    name: string;
    image: string | null;
    initiative: number;
    race?: string | null;
    characterClass?: string | null;
    isDead?: boolean;
    damageTaken: number;
    // Dados simulados para a ficha
    stats: {
        hp: { current: number; max: number };
        ac: number;
        speed: number;
        initiativeBonus: number; // Bônus total de iniciativa vindo da ficha
        attributes: Record<string, number>;
        attacks?: Array<{
            name: string;
            bonus: number;
            damage: string;
            type: string;
            description: string;
        }>;
    };
}

interface VTTEngineProps {
    initialMapImage?: string | null;
    initialCampaignId?: string;
    onExit?: () => void;
}

export default function VTTEngine({ initialMapImage, initialCampaignId, onExit }: VTTEngineProps) {
    const { activeCampaign } = useCampaign();

    // Estado do Mapa
    const [mapImage, setMapImage] = useState<string | null>(initialMapImage || null);
    const [mapDimensions, setMapDimensions] = useState({ width: 2000, height: 2000 });
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDraggingMap, setIsDraggingMap] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Estado do Grid
    const [showGrid, setShowGrid] = useState(true);
    const [cellSize, setCellSize] = useState(50);
    const [gridOpacity, setGridOpacity] = useState(0.3);
    const [gridOffset, setGridOffset] = useState({ x: 0, y: 0 });
    const [isEditingGrid, setIsEditingGrid] = useState(false);

    // Estado dos Tokens e Combate
    const [tokens, setTokens] = useState<VTTToken[]>([]);
    const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
    const [showInitiative, setShowInitiative] = useState(true);
    const [fullscreen, setFullscreen] = useState(false);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [damageTokenId, setDamageTokenId] = useState<string | null>(null);
    const [attackTokenId, setAttackTokenId] = useState<string | null>(null);
    const [currentTurnId, setCurrentTurnId] = useState<string | null>(null);

    // Referências
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Lista lateral para arrastar (Mockup inicial, depois integraria com SWR/React Query)
    const [sidebarCharacters, setSidebarCharacters] = useState<any[]>([]);

    const fetchAvailableEntities = async () => {
        const cId = activeCampaign?.id || initialCampaignId;
        if (!cId) return;

        try {
            const [overviewRes, npcsRes] = await Promise.all([
                fetch(`/api/campaigns/${cId}/overview`),
                fetch(`/api/campaigns/${cId}/npcs`)
            ]);

            let charsData = [];
            if (overviewRes.ok) {
                const overview = await overviewRes.json();
                charsData = overview.characters || [];
            }

            let npcsData = { npcs: [] };
            if (npcsRes.ok) {
                npcsData = await npcsRes.json();
            }

            const entities = [
                ...charsData.map((c: any) => ({ ...c, vttType: 'player' })),
                ...(npcsData.npcs ? npcsData.npcs.map((n: any) => ({
                    ...n,
                    vttType: n.isHostile ? 'enemy' : 'npc',
                    characterClass: n.characterClass || n.type
                })) : [])
            ];

            setSidebarCharacters(entities);
        } catch (error) {
            console.error("Erro ao carregar banco de dados do VTT:", error);
        }
    };

    useEffect(() => {
        fetchAvailableEntities();
    }, [activeCampaign?.id, initialCampaignId]);

    // Handlers do Mapa (Pan/Zoom)
    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            const newZoom = Math.min(Math.max(0.2, zoom + delta), 4);
            setZoom(newZoom);
        }
    };

    const startPan = (e: React.MouseEvent) => {
        // Só inicia PAN se clicar no fundo (não em um token) e se não estiver arrastando token
        if ((e.target as HTMLElement).closest('.token-marker')) return;

        setIsDraggingMap(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };

    const doPan = (e: React.MouseEvent) => {
        if (!isDraggingMap) return;
        setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    };

    const stopPan = () => {
        setIsDraggingMap(false);
    };

    // Upload Local de Mapa
    const handleMapUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (mapImage && mapImage.startsWith("blob:")) {
                URL.revokeObjectURL(mapImage);
            }
            const startUrl = URL.createObjectURL(file);
            setMapImage(startUrl);
            toast.success("Mapa temporário carregado!");
        }
    };

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { naturalWidth, naturalHeight } = e.currentTarget;
        if (naturalWidth > 0 && naturalHeight > 0) {
            setMapDimensions({ width: naturalWidth, height: naturalHeight });
        }
    };

    // Adicionar Token ao Grid
    const addTokenToMap = (entity: any) => {
        // Garantir que attributes seja um objeto válido
        // Função para normalizar chaves de atributos para o padrão str/dex/...
        const normalizeAttributes = (attrs: any) => {
            if (!attrs || typeof attrs !== 'object') return { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };

            // Mapeamento de possíveis chaves para o padrão
            const map: Record<string, string> = {
                strength: 'str', força: 'str', forca: 'str', str: 'str',
                dexterity: 'dex', destreza: 'dex', dex: 'dex',
                constitution: 'con', constituicao: 'con', con: 'con',
                intelligence: 'int', inteligencia: 'int', int: 'int',
                wisdom: 'wis', sabedoria: 'wis', wis: 'wis',
                charisma: 'cha', carisma: 'cha', cha: 'cha'
            };

            const normalized: Record<string, number> = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };

            Object.entries(attrs).forEach(([key, value]) => {
                const lowerKey = key.toLowerCase();
                // Tenta encontrar mapeamento direto ou por prefixo (ex: 'strength_save')
                const mappedKey = map[lowerKey] || Object.keys(map).find(k => lowerKey.startsWith(k))?.substring(0, 3);

                if (map[lowerKey]) {
                    normalized[map[lowerKey]] = Number(value) || 10;
                } else if (['str', 'dex', 'con', 'int', 'wis', 'cha'].includes(lowerKey.substring(0, 3))) {
                    normalized[lowerKey.substring(0, 3)] = Number(value) || 10;
                }
            });

            return normalized;
        };

        const safeAttributes = normalizeAttributes(entity.attributes);

        const nt = entity.vttType || entity.type; // Categoria VTT
        const isPlayer = nt === 'player';

        const dexMod = Math.floor(((safeAttributes.dex || 10) - 10) / 2);

        const newToken: VTTToken = {
            id: crypto.randomUUID(),
            referenceId: entity.id,
            type: nt as any,
            name: entity.name,
            image: entity.image,
            race: entity.race || entity.raceName || (!isPlayer ? entity.type : null), // Se não for player, usa o type como raça
            characterClass: entity.characterClass || entity.class || entity.job || (!isPlayer ? (entity.challengeRating ? `ND ${entity.challengeRating}` : (entity.role || entity.type)) : null),
            x: 5, // Posição padrão
            y: 5,
            initiative: 0,
            damageTaken: 0,
            isDead: false,
            stats: {
                hp: { current: Number(entity.currentHp) || Number(entity.hp?.current) || 10, max: Number(entity.maxHp) || Number(entity.hp?.max) || 10 },
                ac: Number(entity.armorClass) || Number(entity.ac) || 10,
                speed: Number(entity.speed) || 30,
                initiativeBonus: (entity.initiative !== undefined && entity.initiative !== null && Number(entity.initiative) !== 0)
                    ? Number(entity.initiative)
                    : dexMod,
                attributes: safeAttributes,
                attacks: entity.attacks || []
            }
        };

        setTokens(prev => [...prev, newToken]);
        toast.success(`${entity.name} adicionado ao mapa`);
    };

    // Gerenciamento de Tokens
    const moveToken = (id: string, x: number, y: number) => {
        setTokens(prev => prev.map(t => t.id === id ? { ...t, x, y } : t));
    };

    const removeToken = (id: string) => {
        setTokens(prev => prev.filter(t => t.id !== id));
        if (selectedTokenId === id) setSelectedTokenId(null);
        toast.info("Token removido");
    };

    // Iniciativa
    const getCombatants = (): Combatant[] => {
        return tokens.map(t => {
            const initBonus = Number(t.stats.initiativeBonus) || 0;
            const roll = Number(t.initiative) || 0;

            return {
                id: t.id,
                name: t.name,
                initiative: roll, // Valor do dado (d20)
                dexterityModifier: initBonus,
                totalInitiative: roll + initBonus, // Total calculado
                type: t.type,
                image: t.image,
                isDead: t.isDead,
                damageTaken: t.damageTaken
            };
        }).sort((a, b) => {
            // Ordenar por Total. Desempate por Modificador.
            if (b.totalInitiative !== a.totalInitiative) {
                return b.totalInitiative - a.totalInitiative;
            }
            return b.dexterityModifier - a.dexterityModifier;
        });
    };

    const updateInitiative = (id: string, value: number) => {
        setTokens(prev => prev.map(t => t.id === id ? { ...t, initiative: value } : t));
    };

    const handleNextTurn = () => {
        const sortedCombatants = getCombatants().filter(c => !c.isDead);
        if (sortedCombatants.length === 0) return;

        if (!currentTurnId) {
            setCurrentTurnId(sortedCombatants[0].id);
            return;
        }

        const currentIndex = sortedCombatants.findIndex(c => c.id === currentTurnId);
        const nextIndex = (currentIndex + 1) % sortedCombatants.length;
        setCurrentTurnId(sortedCombatants[nextIndex].id);

        // Auto-select the token of the current turn
        setSelectedTokenId(sortedCombatants[nextIndex].id);
    };

    const rollNPCsIndices = () => {
        setTokens(prev => prev.map(t => {
            if (t.type !== 'player') {
                // Rola apenas o dado (1d20). O modificador é somado dinamicamente no getCombatants
                const roll = Math.floor(Math.random() * 20) + 1;
                return { ...t, initiative: roll };
            }
            return t;
        }));
        toast.info("Iniciativa de NPCs rolada (d20 puro)!");
    };

    // Helpers de Seleção
    // Aplicar Dano
    const syncHPtoDatabase = async (token: VTTToken) => {
        try {
            const isPlayer = token.type === 'player';
            const url = isPlayer
                ? `/api/characters/${token.referenceId}`
                : `/api/campaigns/${initialCampaignId}/npcs/${token.referenceId}`;

            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentHp: token.stats.hp.current })
            });

            if (!response.ok) {
                console.error("Erro ao sincronizar HP com o banco");
            }
        } catch (e) {
            console.error("Erro na requisição de sincronização de HP", e);
        }
    };

    const applyDamage = (tokenId: string, amount: number) => {
        let updatedToken: VTTToken | null = null;

        setTokens(prev => prev.map(t => {
            if (t.id === tokenId) {
                const currentHp = t.stats.hp.current - amount;
                const isDead = currentHp <= 0;

                updatedToken = {
                    ...t,
                    damageTaken: t.damageTaken + amount,
                    isDead,
                    stats: {
                        ...t.stats,
                        hp: {
                            ...t.stats.hp,
                            current: Math.max(0, currentHp)
                        }
                    }
                };
                return updatedToken;
            }
            return t;
        }));

        if (updatedToken) {
            syncHPtoDatabase(updatedToken);
        }

        if (amount > 0) {
            toast.error(`Aplicado ${amount} de dano!`);
        } else if (amount < 0) {
            toast.success(`Curado ${Math.abs(amount)} PV!`);
        }
    };

    const selectedTokenData = tokens.find(t => t.id === selectedTokenId)
        ? {
            ...tokens.find(t => t.id === selectedTokenId)!,
            attributes: tokens.find(t => t.id === selectedTokenId)!.stats.attributes
        }
        : null;

    return (
        <div className={`flex flex-row w-full h-[calc(100vh-4rem)] bg-[#1a1510] relative overflow-hidden ${fullscreen ? 'fixed inset-0 z-50 h-screen' : ''}`}>
            {/* Arena Container (Map + Floating Controls) */}
            <div className="flex-1 relative overflow-hidden flex flex-col min-w-0">
                {/* --- Toolbar --- */}
                <div className="absolute top-4 left-4 z-30 flex flex-col gap-2 bg-black/80 p-2 rounded-lg border border-white/10 backdrop-blur-sm shadow-2xl">
                    <div className="flex flex-col gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.min(z + 0.2, 4))}>
                            <ZoomIn className="w-5 h-5" />
                        </Button>
                        <span className="text-center text-xs font-mono">{Math.round(zoom * 100)}%</span>
                        <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.max(z - 0.2, 0.2))}>
                            <ZoomOut className="w-5 h-5" />
                        </Button>
                    </div>
                    <div className="h-px bg-white/10 my-1" />
                    <Button
                        variant={showGrid ? "default" : "ghost"}
                        size="icon"
                        onClick={() => setShowGrid(!showGrid)}
                        title="Toggle Grid"
                    >
                        <Grid3X3 className="w-5 h-5" />
                    </Button>
                    <Button
                        variant={isEditingGrid ? "destructive" : "ghost"}
                        size="icon"
                        onClick={() => setIsEditingGrid(!isEditingGrid)}
                        title="Ajustar Grid (Arraste o mapa)"
                    >
                        <Move className="w-5 h-5" />
                    </Button>

                    <div className="h-px bg-white/10 my-1" />

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        title="Upload Mapa"
                    >
                        <Upload className="w-5 h-5" />
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleMapUpload}
                    />

                    <Button
                        variant={fullscreen ? "secondary" : "ghost"}
                        size="icon"
                        onClick={() => setFullscreen(!fullscreen)}
                        title="Fullscreen"
                    >
                        {fullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                    </Button>

                    <div className="h-px bg-white/10 my-1" />

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onExit}
                        className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                        title="Sair do VTT"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </div>

                {/* --- Main Arena (Canvas) --- */}
                <div
                    ref={mapContainerRef}
                    className="flex-1 relative overflow-hidden bg-[#2a2a2a] cursor-move"
                    onMouseDown={startPan}
                    onMouseMove={doPan}
                    onMouseUp={stopPan}
                    onMouseLeave={stopPan}
                    onWheel={handleWheel}
                >
                    <div
                        className="absolute origin-top-left transition-transform duration-75"
                        style={{
                            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        }}
                    >
                        {/* Camada do Mapa */}
                        <div
                            className="relative transition-all duration-300"
                            style={{
                                width: mapDimensions.width,
                                height: mapDimensions.height,
                                opacity: isEditingGrid ? 0.7 : 1
                            }}
                        >
                            {mapImage ? (
                                <img
                                    src={mapImage}
                                    alt="Map"
                                    onLoad={handleImageLoad}
                                    className="absolute top-0 left-0 max-w-none pointer-events-none select-none"
                                    style={{
                                        transform: isEditingGrid
                                            ? `translate(${gridOffset.x}px, ${gridOffset.y}px)`
                                            : 'none'
                                    }}
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground pointer-events-none" style={{ width: 2000, height: 2000 }}>
                                    <div className="text-center p-4 bg-black/50 rounded backdrop-blur-md">
                                        <Upload className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>Arraste um mapa ou use o botão de upload</p>
                                    </div>
                                </div>
                            )}

                            {showGrid && (
                                <VTTGrid
                                    width={mapDimensions.width}
                                    height={mapDimensions.height}
                                    cellSize={cellSize}
                                    offsetX={0}
                                    offsetY={0}
                                    opacity={gridOpacity}
                                    color="#ffffff"
                                />
                            )}

                            {/* Camada de Tokens */}
                            {tokens.map(token => (
                                <TokenMarker
                                    // Key composta para forçar recriação e evitar bug de drag
                                    key={`${token.id}-${token.x}-${token.y}`}
                                    {...token}
                                    size={cellSize}
                                    selected={selectedTokenId === token.id}
                                    onSelect={() => {
                                        setSelectedTokenId(token.id);
                                        setIsSidebarVisible(true); // Auto-expand ao selecionar
                                    }}
                                    onDragEnd={moveToken.bind(null, token.id)}
                                    onApplyDamage={() => setDamageTokenId(token.id)}
                                    onRollAttacks={() => setAttackTokenId(token.id)}
                                    isHostile={token.type === 'enemy'}
                                    isDead={token.isDead}
                                    isCurrentTurn={currentTurnId === token.id}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Sidebar Toggle Button (Floating when sidebar hidden) --- */}
            {!isSidebarVisible && (
                <div className="absolute top-4 right-4 z-[40]">
                    <Button
                        variant="default"
                        size="icon"
                        className="bg-primary hover:bg-primary/90 shadow-xl"
                        onClick={() => setIsSidebarVisible(true)}
                    >
                        <PanelRightOpen className="w-5 h-5" />
                    </Button>
                </div>
            )}

            {/* --- Sidebar Direita (Iniciativa & Entidades) --- */}
            <AnimatePresence>
                {isSidebarVisible && (
                    <motion.div
                        initial={{ x: 320, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 320, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="flex border-l border-white/10 bg-card/90 z-20 shadow-xl relative max-w-[90vw] sm:max-w-none"
                    >
                        {/* Character Sheet Panel (Shows when a token is selected) */}
                        <CharacterSheetPanel
                            character={selectedTokenData as any}
                            onClose={() => setSelectedTokenId(null)}
                        />

                        {/* Sidebar Main Content (Combat/Library) */}
                        <div className="w-[320px] shrink-0 flex flex-col bg-black/20">
                            <Tabs defaultValue="combat" className="flex flex-col h-full">
                                <TabsList className="grid grid-cols-2 rounded-none bg-black/40 h-12">
                                    <TabsTrigger value="combat"><Swords className="w-4 h-4 mr-2" /> Combate</TabsTrigger>
                                    <TabsTrigger value="library"><UserPlus className="w-4 h-4 mr-2" /> Biblioteca</TabsTrigger>
                                </TabsList>

                                <div className="flex-1 flex flex-col overflow-hidden relative">
                                    {/* Sidebar Close Button (Inner) */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 z-30 h-8 w-8 text-white/50 hover:text-white"
                                        onClick={() => setIsSidebarVisible(false)}
                                    >
                                        <PanelRightClose className="w-4 h-4" />
                                    </Button>

                                    <TabsContent value="combat" className="flex-1 mt-0">
                                        <InitiativeTracker
                                            combatants={getCombatants()}
                                            onUpdateInitiative={updateInitiative}
                                            onSort={() => {
                                                toast.info("Lista ordenada por iniciativa");
                                            }}
                                            onRollNPCs={rollNPCsIndices}
                                            onRemove={removeToken}
                                            currentTurnId={currentTurnId || undefined}
                                            onNextTurn={handleNextTurn}
                                        />
                                    </TabsContent>

                                    <TabsContent value="library" className="flex-1 mt-0 overflow-hidden flex flex-col">
                                        <div className="p-4 border-b border-white/10 bg-black/20 mt-10">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="font-bold text-sm text-muted-foreground uppercase">Biblioteca</h3>
                                                <div className="flex gap-2">
                                                    <CreateNPCDialog
                                                        campaignId={activeCampaign?.id || initialCampaignId || ""}
                                                        onSuccess={fetchAvailableEntities}
                                                        trigger={
                                                            <Button size="sm" variant="outline" className="h-7 text-[10px] px-2 py-0">
                                                                + NPC
                                                            </Button>
                                                        }
                                                    />
                                                    <CreateEnemyDialog
                                                        campaignId={activeCampaign?.id || initialCampaignId || ""}
                                                        onEnemyCreated={fetchAvailableEntities}
                                                        trigger={
                                                            <Button size="sm" variant="outline" className="h-7 text-[10px] px-2 py-0 border-red-500/50 text-red-400 hover:bg-red-500/10">
                                                                + INI
                                                            </Button>
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <ScrollArea className="flex-1 p-4">
                                            <div className="space-y-2">
                                                {sidebarCharacters.map((char) => (
                                                    <div
                                                        key={char.id}
                                                        className="flex items-center gap-3 p-2 rounded bg-card/40 border border-white/5 hover:bg-primary/20 cursor-pointer transition-colors"
                                                        onClick={() => addTokenToMap(char)}
                                                    >
                                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-muted relative">
                                                            {char.image ? (
                                                                <Image src={char.image} alt={char.name} fill className="object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-xs">{char.name[0]}</div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold text-sm truncate">{char.name}</p>
                                                            <p className="text-xs text-muted-foreground capitalize">{char.type === 'enemy' ? 'Inimigo' : char.characterClass || 'NPC'}</p>
                                                        </div>
                                                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0"><UserPlus className="w-4 h-4" /></Button>
                                                    </div>
                                                ))}
                                                {sidebarCharacters.length === 0 && (
                                                    <p className="text-center text-sm text-muted-foreground mt-4">Nenhum personagem encontrado na campanha.</p>
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- Controles de Grid (Visível apenas quando editando) --- */}
            {isEditingGrid && (
                <div className="absolute bottom-4 left-4 right-80 z-30 flex justify-center pointer-events-none">
                    <Card className="p-4 bg-black/90 pointer-events-auto border-red-500/50 flex gap-8 items-center">
                        <span className="text-red-400 font-bold uppercase text-xs flex items-center"><Move className="w-3 h-3 mr-1" /> Modo Ajuste de Grid</span>

                        <div className="w-40 space-y-2">
                            <label className="text-xs text-muted-foreground block">Tamanho da Célula: {cellSize}px</label>
                            <Slider
                                value={[cellSize]}
                                min={20}
                                max={200}
                                step={1}
                                onValueChange={([val]) => setCellSize(val)}
                            />
                        </div>

                        <div className="w-40 space-y-2">
                            <label className="text-xs text-muted-foreground block">Deslocamento X: {gridOffset.x}px</label>
                            <Slider
                                value={[gridOffset.x]}
                                min={-200}
                                max={200}
                                step={1}
                                onValueChange={([val]) => setGridOffset(prev => ({ ...prev, x: val }))}
                            />
                        </div>

                        <div className="w-40 space-y-2">
                            <label className="text-xs text-muted-foreground block">Deslocamento Y: {gridOffset.y}px</label>
                            <Slider
                                value={[gridOffset.y]}
                                min={-200}
                                max={200}
                                step={1}
                                onValueChange={([val]) => setGridOffset(prev => ({ ...prev, y: val }))}
                            />
                        </div>

                        <Button size="sm" onClick={() => setIsEditingGrid(false)}>Concluir</Button>
                    </Card>
                </div>
            )}

            {/* --- Dialog de Ataques --- */}
            <AttackRollDialog
                isOpen={!!attackTokenId}
                onClose={() => setAttackTokenId(null)}
                tokenName={tokens.find(t => t.id === attackTokenId)?.name || ""}
                attacks={tokens.find(t => t.id === attackTokenId)?.stats.attacks || []}
            />

            {/* --- Dialog de Dano/Cura --- */}
            <DamageDialog
                isOpen={!!damageTokenId}
                onClose={() => setDamageTokenId(null)}
                tokenName={tokens.find(t => t.id === damageTokenId)?.name || ""}
                onApply={(amount) => damageTokenId && applyDamage(damageTokenId, amount)}
            />
        </div>
    );
}

