"use client";

import { useParams, useRouter } from "next/navigation";
import { FantasyLayout } from "@/components/layout/FantasyLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { HomebrewForms } from "@/components/homebrew/HomebrewForms";

export default function CreateHomebrewPage() {
    const params = useParams();
    const router = useRouter();
    const type = params?.type as string;

    const getTitle = (type: string) => {
        switch (type) {
            case "spell": return "Nova Magia";
            case "item": return "Novo Item Mágico";
            case "monster": return "Novo Monstro / NPC";
            case "subclass": return "Nova Subclasse";
            default: return "Novo Conteúdo";
        }
    };

    return (
        <FantasyLayout>
            <div className="space-y-6 max-w-4xl mx-auto">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold font-cinzel text-primary">{getTitle(type)}</h1>
                        <p className="text-muted-foreground">Preencha os detalhes abaixo</p>
                    </div>
                </div>

                <HomebrewForms type={type} />
            </div>
        </FantasyLayout>
    );
}
