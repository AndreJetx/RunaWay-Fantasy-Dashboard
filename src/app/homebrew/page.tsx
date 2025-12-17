"use client";

import { useState, useEffect } from "react";
import { FantasyLayout } from "@/components/layout/FantasyLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Edit, Trash2, Scroll, Shield, Sword, Skull } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/context";

interface HomebrewItem {
    id: string;
    type: string;
    name: string;
    description: string;
    isPublic: boolean;
    createdAt: string;
}

export default function HomebrewPage() {
    const router = useRouter();
    const [items, setItems] = useState<HomebrewItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const { t } = useTranslation();

    useEffect(() => {
        fetchHomebrew();
    }, []);

    const fetchHomebrew = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/homebrew");
            if (res.ok) {
                const data = await res.json();
                setItems(data);
            }
        } catch (error) {
            console.error("Error fetching homebrew:", error);
            toast.error("Erro ao carregar conteúdo homebrew");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Tem certeza que deseja excluir este item?")) return;

        try {
            const res = await fetch(`/api/homebrew/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                toast.success("Item excluído com sucesso");
                setItems(prev => prev.filter(item => item.id !== id));
            } else {
                throw new Error("Failed to delete");
            }
        } catch (error) {
            toast.error("Erro ao excluir item");
        }
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = activeTab === "all" || item.type === activeTab;
        return matchesSearch && matchesType;
    });

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "spell": return <Scroll className="h-5 w-5 text-blue-400" />;
            case "item": return <Sword className="h-5 w-5 text-yellow-400" />;
            case "monster": return <Skull className="h-5 w-5 text-red-400" />;
            case "subclass": return <Shield className="h-5 w-5 text-purple-400" />;
            default: return <Scroll className="h-5 w-5" />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case "spell": return "Magia";
            case "item": return "Item";
            case "monster": return "Monstro";
            case "subclass": return "Subclasse";
            case "background": return "Antecedente";
            case "race": return "Raça";
            case "class": return "Classe";
            default: return type;
        }
    };

    return (
        <FantasyLayout>
            <div className="space-y-6 max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-cinzel text-primary">Homebrew</h1>
                        <p className="text-muted-foreground">Crie e gerencie seu conteúdo personalizado</p>
                    </div>
                    <Button onClick={() => router.push("/homebrew/new")} className="bg-primary hover:bg-primary/90">
                        <Plus className="mr-2 h-4 w-4" />
                        Criar Novo
                    </Button>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 bg-card/50"
                        />
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                        <TabsList className="bg-card/50">
                            <TabsTrigger value="all">Todos</TabsTrigger>
                            <TabsTrigger value="spell">Magias</TabsTrigger>
                            <TabsTrigger value="item">Itens</TabsTrigger>
                            <TabsTrigger value="monster">Monstros</TabsTrigger>
                            <TabsTrigger value="subclass">Subclasses</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {loading ? (
                    <div className="text-center py-12">Carregando...</div>
                ) : filteredItems.length === 0 ? (
                    <Card className="bg-card/60 border-white/10">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <Scroll className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">Nenhum conteúdo encontrado</h3>
                            <p className="text-muted-foreground mb-4">
                                {searchTerm
                                    ? "Tente buscar com outros termos"
                                    : "Comece criando seu primeiro conteúdo homebrew!"}
                            </p>
                            {!searchTerm && (
                                <Button onClick={() => router.push("/homebrew/new")} variant="outline">
                                    Criar Conteúdo
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredItems.map((item) => (
                            <Card
                                key={item.id}
                                className="bg-card/60 border-white/10 hover:border-primary/50 transition-colors cursor-pointer group"
                                onClick={() => router.push(`/homebrew/${item.id}` as any)}
                            >
                                <CardHeader className="flex flex-row items-start justify-between pb-2">
                                    <div className="flex items-center gap-2">
                                        {getTypeIcon(item.type)}
                                        <CardTitle className="text-lg truncate">{item.name}</CardTitle>
                                    </div>
                                    <Badge variant="outline" className="capitalize">
                                        {getTypeLabel(item.type)}
                                    </Badge>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4 h-14">
                                        {item.description || "Sem descrição"}
                                    </p>
                                    <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </span>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 hover:text-blue-400"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(`/homebrew/${item.id}/edit`);
                                                }}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 hover:text-red-400"
                                                onClick={(e) => handleDelete(item.id, e)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </FantasyLayout>
    );
}
