"use client";

import { useState } from "react";
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
import { Search } from "lucide-react";
import { ENEMY_DATA, BestiaryEnemy } from "@/lib/dnd/bestiary";

interface BestiarySelectorProps {
    onSelect: (enemy: BestiaryEnemy) => void;
    selectedEnemy?: BestiaryEnemy | null;
}

export function BestiarySelector({ onSelect, selectedEnemy }: BestiarySelectorProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [crFilter, setCrFilter] = useState<string>("all");

    // Get unique CRs for filter
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

    return (
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
                            onClick={() => onSelect(enemy)}
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
    );
}
