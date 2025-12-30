'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { HomebrewForms } from '@/components/homebrew/HomebrewForms';
import { toast } from 'sonner';

export default function EditHomebrewPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState<any>(null);

    const fetchContent = useCallback(async () => {
        try {
            const res = await fetch(`/api/homebrew/${params.id}`);
            if (res.ok) {
                const data = await res.json();
                setContent(data);
            } else {
                toast.error("Erro ao carregar conteúdo");
                router.push('/homebrew');
            }
        } catch (error) {
            console.error("Error fetching content:", error);
            toast.error("Ocorreu um erro ao buscar o conteúdo.");
        } finally {
            setLoading(false);
        }
    }, [params.id, router]);

    useEffect(() => {
        fetchContent();
    }, [fetchContent]);

    if (loading) {
        return (
            <div className="container mx-auto py-8 flex justify-center">
                <p>Carregando...</p>
            </div>
        );
    }

    if (!content) {
        return null;
    }

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.push('/homebrew')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                </Button>
                <h1 className="text-3xl font-bold">Editar {content.type}</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Editar {content.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <HomebrewForms
                        type={content.type}
                        initialData={{
                            id: content.id,
                            name: content.name,
                            description: content.description,
                            isPublic: content.isPublic,
                            data: content.data
                        }}
                        onCancel={() => router.push('/homebrew')}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
