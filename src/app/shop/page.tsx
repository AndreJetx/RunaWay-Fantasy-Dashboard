"use client";

import { useState, useEffect } from "react";
import { FantasyLayout } from "@/components/layout/FantasyLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Package, Coins, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "@/lib/i18n/context";
import { getEquipmentDescription } from "@/lib/i18n/equipment-descriptions";

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
  quantity?: number; // Quantidade de itens que vêm pelo preço (para munições, etc)
  weight?: number;
  desc?: string[];
  properties?: Array<{
    index: string;
    name: string;
    url: string;
  }>;
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
  range?: {
    normal: number;
    long?: number;
  };
  throw_range?: {
    normal: number;
    long?: number;
  };
  two_handed_damage?: {
    damage_dice: string;
    damage_type: {
      index: string;
      name: string;
    };
  };
  weapon_range?: string;
  weapon_category?: string;
  category_range?: string;
  special?: string[];
  contents?: Array<{
    item: {
      index: string;
      name: string;
      url: string;
    };
    quantity: number;
  }>;
}

const DND_API_BASE = "https://www.dnd5eapi.co";

interface Category {
  index: string;
  name: string;
  url: string;
}

export default function ShopPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentItems, setCurrentItems] = useState<EquipmentItem[]>([]);
  const [itemsDetails, setItemsDetails] = useState<Record<string, EquipmentDetail>>({});
  const [selectedItem, setSelectedItem] = useState<EquipmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { t, translateDnd5e, translateEquipment, locale } = useTranslation();

  // Buscar categorias ao carregar
  useEffect(() => {
    fetchCategories();
  }, []);

  // Buscar itens quando mudar categoria
  useEffect(() => {
    if (selectedCategory) {
      fetchCategoryItems(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${DND_API_BASE}/api/2014/equipment-categories`);
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(data.results || []);
      
      // Buscar itens de todas as categorias para o "all"
      if (selectedCategory === "all") {
        fetchAllItems();
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllItems = async () => {
    try {
      setLoadingItems(true);
      const res = await fetch(`${DND_API_BASE}/api/2014/equipment`);
      if (!res.ok) throw new Error("Failed to fetch equipment");
      const data = await res.json();
      setCurrentItems(data.results || []);
    } catch (error) {
      console.error("Error fetching all items:", error);
    } finally {
      setLoadingItems(false);
    }
  };

  const fetchCategoryItems = async (categoryIndex: string) => {
    try {
      setLoadingItems(true);
      
      if (categoryIndex === "all") {
        await fetchAllItems();
        return;
      }

      // Buscar itens da categoria específica
      const res = await fetch(`${DND_API_BASE}/api/2014/equipment-categories/${categoryIndex}`);
      if (!res.ok) throw new Error("Failed to fetch category items");
      const data = await res.json();
      
      setCurrentItems(data.equipment || []);
    } catch (error) {
      console.error(`Error fetching items for category ${categoryIndex}:`, error);
      setCurrentItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  const fetchItemDetails = async (url: string, itemIndex: string) => {
    try {
      // Verificar se já temos os detalhes em cache
      if (itemsDetails[itemIndex]) {
        setSelectedItem(itemsDetails[itemIndex]);
        return;
      }

      const res = await fetch(`${DND_API_BASE}${url}`);
      if (res.ok) {
        const detail: EquipmentDetail = await res.json();
        
        // Salvar no cache
        setItemsDetails(prev => ({ ...prev, [itemIndex]: detail }));
        setSelectedItem(detail);
      }
    } catch (error) {
      console.error("Error fetching item details:", error);
    }
  };

  const searchFiltered = currentItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCost = (cost?: { quantity: number; unit: string }) => {
    if (!cost) return t("common.na") || "N/A";
    const translatedUnit = translateDnd5e(cost.unit);
    return `${cost.quantity} ${translatedUnit}`;
  };
  
  const formatWeight = (weight?: number) => {
    if (weight === undefined) return "";
    // Converter lbs para kg (1 lb = 0.453592 kg)
    const weightInKg = (weight * 0.453592).toFixed(2);
    return `${weightInKg} kg (${weight} lb)`;
  };
  
  const formatRange = (range?: { normal: number; long?: number }) => {
    if (!range) return "";
    const normalMeters = Math.round(range.normal * 0.3048); // ft para metros
    if (range.long) {
      const longMeters = Math.round(range.long * 0.3048);
      return `${normalMeters}m (${range.normal} ft) / ${longMeters}m (${range.long} ft)`;
    }
    return `${normalMeters}m (${range.normal} ft)`;
  };

  return (
    <FantasyLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-cinzel text-primary">{t("nav.shop")}</h1>
            <p className="text-muted-foreground mt-2">
              {t("shop.explore") || "Explore equipamentos e itens do D&D 5e"}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Carregando categorias...</span>
          </div>
        ) : (
          <>
            <Card className="bg-card/60 border-white/10">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t("shop.searchItems") || "Buscar itens..."}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="all">{t("shop.allCategories") || "Todas as categorias"}</option>
                    {categories.map((cat) => {
                      // Tentar traduzir primeiro pelo index, depois pelo name
                      const translatedName = translateDnd5e(cat.index) || translateDnd5e(cat.name) || cat.name;
                      return (
                        <option key={cat.index} value={cat.index}>
                          {translatedName}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </CardContent>
            </Card>

            {loadingItems ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Carregando itens...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchFiltered.map((item) => (
                    <Card
                      key={item.index}
                      className="bg-card/60 border-white/10 hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => fetchItemDetails(item.url, item.index)}
                    >
                      <CardHeader>
                        <CardTitle className="text-lg">{translateEquipment(item.name)}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" size="sm" className="w-full">
                          {t("shop.viewDetails") || "Ver Detalhes"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {searchFiltered.length === 0 && !loadingItems && (
                  <Card className="bg-card/40 border-border/40 p-8 text-center">
                    <p className="text-muted-foreground">
                      {t("common.noResults") || "Nenhum item encontrado"}
                    </p>
                  </Card>
                )}
              </>
            )}
          </>
        )}

        {/* Dialog de Detalhes do Item */}
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedItem && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-cinzel">{translateEquipment(selectedItem.name)}</DialogTitle>
                  <DialogDescription>
                    {selectedItem.equipment_category?.name 
                      ? translateDnd5e(selectedItem.equipment_category.name) 
                      : t("shop.equipment") || "Equipamento"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {selectedItem.cost && (
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Coins className="h-4 w-4" />
                        {translateDnd5e("Cost")}
                      </h3>
                      <p>
                        {formatCost(selectedItem.cost)}
                        {selectedItem.quantity && selectedItem.quantity > 1 && (
                          <span className="text-muted-foreground ml-2">
                            ({selectedItem.quantity} {t("common.quantity") || "unidades"})
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                  {selectedItem.weight !== undefined && (
                    <div>
                      <h3 className="font-semibold mb-2">{translateDnd5e("Weight")}</h3>
                      <p>{formatWeight(selectedItem.weight)}</p>
                    </div>
                  )}
                  {selectedItem.desc && selectedItem.desc.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">{t("common.description")}</h3>
                      {(() => {
                        const translatedDesc = getEquipmentDescription(selectedItem.name, locale);
                        if (translatedDesc) {
                          return (
                            <div className="space-y-2">
                              {translatedDesc.map((desc, idx) => (
                                <p key={idx} className="text-sm text-muted-foreground">{desc}</p>
                              ))}
                            </div>
                          );
                        }
                        return (
                          <>
                            <p className="text-xs text-muted-foreground/70 italic mb-2">
                              {t("shop.descriptionInEnglish")}
                            </p>
                            <div className="space-y-2">
                              {selectedItem.desc.map((desc, idx) => (
                                <p key={idx} className="text-sm text-muted-foreground">{desc}</p>
                              ))}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                  {selectedItem.properties && selectedItem.properties.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">{translateDnd5e("Properties")}</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.properties.map((prop) => (
                          <Badge key={prop.index} variant="outline">
                            {translateDnd5e(prop.name)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedItem.damage && (
                    <div>
                      <h3 className="font-semibold mb-2">{translateDnd5e("Damage")}</h3>
                      <p>
                        {selectedItem.damage.damage_dice} {translateDnd5e(selectedItem.damage.damage_type.name)}
                      </p>
                    </div>
                  )}
                  {selectedItem.armor_class && (
                    <div>
                      <h3 className="font-semibold mb-2">{translateDnd5e("Armor Class")}</h3>
                      <p>
                        {translateDnd5e("Base")}: {selectedItem.armor_class.base}
                        {selectedItem.armor_class.dex_bonus && ` + ${t("character.attributes.dexterity")} ${t("common.modifier") || "modificador"}`}
                        {selectedItem.armor_class.max_bonus && ` (${t("common.max") || "máx."} +${selectedItem.armor_class.max_bonus})`}
                      </p>
                    </div>
                  )}
                  {selectedItem.range && (
                    <div>
                      <h3 className="font-semibold mb-2">{translateDnd5e("Range")}</h3>
                      <p>{formatRange(selectedItem.range)}</p>
                    </div>
                  )}
                  {selectedItem.special && selectedItem.special.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">{translateDnd5e("Special")}</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedItem.special.map((spec, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground">{spec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedItem.contents && selectedItem.contents.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">{translateDnd5e("Contents")}</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedItem.contents.map((content, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground">
                            {content.quantity}x {translateEquipment(content.item.name)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </FantasyLayout>
  );
}

