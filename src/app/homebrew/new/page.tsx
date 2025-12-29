"use client";

import { FantasyLayout } from "@/components/layout/FantasyLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scroll, Sword, Skull, Shield, ArrowLeft, Users, Book } from "lucide-react";
import { useRouter } from "next/navigation";

const contentTypes = [
    {
        id: "spell",
        title: "Magia",
        description: "Crie feitiços arcanos ou divinos personalizados.",
        icon: Scroll,
        color: "text-blue-400",
        borderColor: "hover:border-blue-400/50",
    },
    {
        id: "item",
        title: "Item Mágico",
        description: "Forje armas, armaduras ou artefatos lendários.",
        icon: Sword,
        color: "text-yellow-400",
        borderColor: "hover:border-yellow-400/50",
    },
    {
        id: "monster",
        title: "Monstro / NPC",
        description: "Crie inimigos aterrorizantes ou aliados memoráveis.",
        icon: Skull,
        color: "text-red-400",
        borderColor: "hover:border-red-400/50",
    },
    {
        id: "subclass",
        title: "Subclasse",
        description: "Desenvolva novos arquétipos para classes existentes.",
        icon: Shield,
        color: "text-purple-400",
        borderColor: "hover:border-purple-400/50",
    },
    {
        id: "race",
        title: "Raça",
        description: "Crie novas origens e linhagens para personagens.",
        icon: Users,
        color: "text-green-400",
        borderColor: "hover:border-green-400/50",
    },
    {
        id: "class",
        title: "Classe",
        description: "Projete classes inteiras com mecânicas únicas.",
        icon: Book,
        color: "text-orange-400",
        borderColor: "hover:border-orange-400/50",
    },
];

export default function NewHomebrewPage() {
    const router = useRouter();

    return (
        <FantasyLayout>
            <div className="space-y-6 max-w-4xl mx-auto">
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => router.back()} className="gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50">
                        <ArrowLeft className="h-4 w-4" />
                        Voltar
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold font-cinzel text-primary">Criar Novo Conteúdo</h1>
                        <p className="text-muted-foreground">Escolha o tipo de conteúdo que deseja criar</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {contentTypes.map((type) => (
                        <Card
                            key={type.id}
                            className={`bg-card/60 border-white/10 cursor-pointer transition-all hover:bg-card/80 ${type.borderColor}`}
                            onClick={() => router.push(`/homebrew/create/${type.id}`)}
                        >
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <type.icon className={`h-6 w-6 ${type.color}`} />
                                    {type.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{type.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </FantasyLayout>
    );
}
