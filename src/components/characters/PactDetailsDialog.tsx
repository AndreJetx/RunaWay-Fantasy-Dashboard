"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Sword, Link2, Sparkles } from "lucide-react";

interface PactDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pactName: string;
    pactDescription?: string;
    bookOfShadowsCantrips?: string[];
}

const PACT_DETAILS: Record<
    string,
    {
        icon: any;
        description: string;
        features: string[];
        benefits: string[];
    }
> = {
    "Pacto da Lâmina": {
        icon: Sword,
        description:
            "Seu patrono lhe dá uma arma mágica - sua lâmina de pacto.",
        features: [
            "Você pode usar sua ação para criar uma arma de pacto em sua mão vazia",
            "Você pode escolher a forma que esta arma corpo a corpo assume cada vez que a cria",
            "Você é proficiente com ela enquanto a empunha",
            "Esta arma conta como mágica para ultrapassar resistência e imunidade a ataques e dano não mágico",
            "A arma desaparece se estiver a mais de 1,5m de você por 1 minuto ou mais",
            "A arma também desaparece se você usar essa característica novamente, se você dispensá-la, ou se você morrer",
        ],
        benefits: [
            "Arma do Pacto no inventário",
            "Permite invocações que requerem Pact of the Blade",
        ],
    },
    "Pacto da Corrente": {
        icon: Link2,
        description:
            "Você aprende a magia encontrar familiar e pode conjurá-la como um ritual.",
        features: [
            "Você aprende a magia 'Encontrar Familiar' e pode conjurá-la como ritual",
            "A magia não conta contra seu número de magias conhecidas",
            "Você pode escolher uma das formas normais para seu familiar",
            "Formas especiais disponíveis: diabrete, pseudodragão, quasit ou sprite",
            "Seu familiar pode atacar usando sua reação",
        ],
        benefits: [
            "Magia Find Familiar adicionada às magias conhecidas",
            "Permite invocações que requerem Pact of the Chain",
        ],
    },
    "Pacto do Tomo": {
        icon: BookOpen,
        description:
            "Seu patrono lhe dá um grimório chamado Livro das Sombras.",
        features: [
            "Você recebe um Livro das Sombras do seu patrono",
            "Escolha três truques de qualquer lista de magias de classe",
            "Os truques não precisam ser da mesma lista",
            "Enquanto o livro estiver com você, você pode conjurar esses truques à vontade",
            "Eles não contam contra seu número de truques conhecidos",
            "Se não estiverem na lista de bruxo, são considerados magias de bruxo para você",
        ],
        benefits: [
            "Livro das Sombras no inventário",
            "3 truques de qualquer classe",
            "Permite invocações que requerem Pact of the Tome",
        ],
    },
    "Pacto do Talismã": {
        icon: Sparkles,
        description:
            "Seu patrono lhe dá um amuleto, um talismã que pode ajudar o portador quando a necessidade é grande.",
        features: [
            "Você recebe um talismã mágico do seu patrono",
            "Quando o portador faz um teste de habilidade no qual não é proficiente, pode adicionar 1d4 ao teste",
            "O bônus pode ser usado uma vez, depois é preciso terminar um descanso longo",
            "Se o talismã for perdido, você pode realizar uma cerimônia de 1 hora para receber um substituto",
        ],
        benefits: [
            "Talismã do Pacto no inventário",
            "+1d4 em testes de habilidade não proficientes",
            "Permite invocações que requerem Pact of the Talisman",
        ],
    },
};

export function PactDetailsDialog({
    open,
    onOpenChange,
    pactName,
    pactDescription,
    bookOfShadowsCantrips = [],
}: PactDetailsDialogProps) {
    const details = PACT_DETAILS[pactName];

    if (!details) {
        return null;
    }

    const Icon = details.icon;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 font-cinzel text-2xl">
                        <Icon className="w-6 h-6 text-purple-400" />
                        {pactName}
                    </DialogTitle>
                    <DialogDescription>{details.description}</DialogDescription>
                </DialogHeader>

                <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-6">
                        {/* Features */}
                        <div>
                            <h3 className="font-semibold text-lg mb-3">Características</h3>
                            <ul className="space-y-2">
                                {details.features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <span className="text-purple-400 mt-1">•</span>
                                        <span className="text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Book of Shadows Cantrips */}
                        {pactName === "Pacto do Tomo" && bookOfShadowsCantrips.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-lg mb-3">
                                    Truques do Livro das Sombras
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {bookOfShadowsCantrips.map((cantrip) => (
                                        <Badge key={cantrip} variant="secondary" className="text-sm">
                                            {cantrip}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Benefits */}
                        <div>
                            <h3 className="font-semibold text-lg mb-3">Benefícios</h3>
                            <div className="space-y-2">
                                {details.benefits.map((benefit, index) => (
                                    <div
                                        key={index}
                                        className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg"
                                    >
                                        <p className="text-sm">{benefit}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
