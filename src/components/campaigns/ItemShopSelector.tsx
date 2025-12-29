"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Search, Loader2, Coins } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n/context";

interface EquipmentItem {
    index: string;
    name: string;
    url: string;
}

interface EquipmentDetail {
    index: string;
    name: string;
    equipment_category?: {
        index: string;
        name: string;
    };
    cost?: {
        quantity: number;
        unit: string;
    };
    weight?: number;
    desc?: string[];
    damage?: {
        damage_dice: string;
        damage_type: {
            index: string;
            name: string;
        };
    };
    armor_class?: {
        base: number;
        dex_bonus?: boolean;
        max_bonus?: number;
    };
}

const DND_API_BASE = "https://www.dnd5eapi.co";

interface Category {
    index: string;
    name: string;
    url: string;
}

interface ItemShopSelectorProps {
    onSelect: (item: EquipmentDetail) => void;
    selectedItem?: EquipmentDetail | null;
}

export function ItemShopSelector({ onSelect, selectedItem }: ItemShopSelectorProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [currentItems, setCurrentItems] = useState<EquipmentItem[]>([]);
    const [itemsDetails, setItemsDetails] = useState<Record<string, EquipmentDetail>>({});
    const [loading, setLoading] = useState(true);
    const [loadingItems, setLoadingItems] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const { t, translateDnd5e, translateEquipment } = useTranslation();

    const fetchCategoryItems = useCallback(async (categoryIndex: string) => {
        try {
            setLoadingItems(true);

            let items: EquipmentItem[] = [];

            if (categoryIndex === "all") {
                const res = await fetch(`${DND_API_BASE}/api/2014/equipment`);
                if (!res.ok) throw new Error("Failed to fetch equipment");
                const data = await res.json();
                items = data.results || [];
            } else {
                const res = await fetch(`${DND_API_BASE}/api/2014/equipment-categories/${categoryIndex}`);
                if (!res.ok) throw new Error("Failed to fetch category items");
                const data = await res.json();
                items = data.equipment || [];
            }

            setCurrentItems(items);

            // Preload details for first 20 items
            const itemsToPreload = items.slice(0, 20);
            const detailsPromises = itemsToPreload.map(async (item) => {
                try {
                    const res = await fetch(`${DND_API_BASE}${item.url}`);
                    if (res.ok) {
                        const detail: EquipmentDetail = await res.json();
                        return { index: item.index, detail };
                    }
                } catch (error) {
                    console.error(`Error preloading ${item.index}:`, error);
                }
                return null;
            });

            const results = await Promise.all(detailsPromises);
            const newDetails: Record<string, EquipmentDetail> = {};
            results.forEach((result) => {
                if (result) {
                    newDetails[result.index] = result.detail;
                }
            });

            setItemsDetails(prev => ({ ...prev, ...newDetails }));
        } catch (error) {
            console.error(`Error fetching items for category ${categoryIndex}:`, error);
            setCurrentItems([]);
        } finally {
            setLoadingItems(false);
        }
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`${DND_API_BASE}/api/2014/equipment-categories`);
            if (!res.ok) throw new Error("Failed to fetch categories");
            const data = await res.json();
            setCategories(data.results || []);
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        if (selectedCategory) {
            fetchCategoryItems(selectedCategory);
        }
    }, [selectedCategory, fetchCategoryItems]);

    const fetchItemDetails = async (url: string, itemIndex: string) => {
        try {
            if (itemsDetails[itemIndex]) {
                onSelect(itemsDetails[itemIndex]);
                return;
            }

            const res = await fetch(`${DND_API_BASE}${url}`);
            if (res.ok) {
                const detail: EquipmentDetail = await res.json();
                setItemsDetails(prev => ({ ...prev, [itemIndex]: detail }));
                onSelect(detail);
            }
        } catch (error) {
            console.error("Error fetching item details:", error);
        }
    };

    const searchFiltered = currentItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Carregando categorias...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-4 min-h-0">
            <div className="flex flex-col gap-2 flex-shrink-0">
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t("shop.searchItems") || "Buscar itens..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filtrar por categoria" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("shop.allCategories") || "Todas as categorias"}</SelectItem>
                            {categories.map((cat) => {
                                const translatedName = translateDnd5e(cat.index) || translateDnd5e(cat.name) || cat.name;
                                return (
                                    <SelectItem key={cat.index} value={cat.index}>
                                        {translatedName}
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <ScrollArea className="flex-1 min-h-0 border rounded-md">
                {loadingItems ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-2 text-muted-foreground">Carregando itens...</span>
                    </div>
                ) : (
                    <div className="p-2 space-y-2">
                        {searchFiltered.map((item) => {
                            const detail = itemsDetails[item.index];
                            return (
                                <div
                                    key={item.index}
                                    onClick={() => fetchItemDetails(item.url, item.index)}
                                    className={`p-3 rounded-md cursor-pointer transition-colors ${selectedItem?.index === item.index
                                            ? "bg-primary/10 border-2 border-primary"
                                            : "bg-card/40 border-2 border-transparent hover:bg-card/60"
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="font-medium">{translateEquipment(item.name)}</div>
                                            {detail?.equipment_category && (
                                                <div className="text-xs text-muted-foreground">
                                                    {translateDnd5e(detail.equipment_category.name)}
                                                </div>
                                            )}
                                        </div>
                                        {detail?.cost && (
                                            <Badge variant="outline" className="shrink-0 flex items-center gap-1">
                                                <Coins className="h-3 w-3" />
                                                {detail.cost.quantity} {translateDnd5e(detail.cost.unit).toLowerCase()}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}
