"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Coins, ShoppingCart, X } from "lucide-react";
import { getItemIcon } from "@/lib/icon-mapper";
import { useTranslation } from "@/lib/i18n/context";
import { getEquipmentDescription } from "@/lib/i18n/equipment-descriptions";

const DND_API_BASE = "https://www.dnd5eapi.co";

interface EquipmentItem {
  index: string;
  name: string;
  url: string;
}

interface EquipmentDetail {
  index: string;
  name: string;
  cost?: {
    quantity: number;
    unit: string;
  };
  weight?: number;
  desc?: string[];
  equipment_category?: {
    index: string;
    name: string;
  };
  // Para armas
  damage?: {
    damage_dice?: string;
    damage_type?: {
      name: string;
      index: string;
    };
  };
  weapon_range?: string;
  range?: {
    normal?: number;
    long?: number;
  };
  // Para armaduras
  armor_class?: {
    base?: number;
    dex_bonus?: boolean;
    max_bonus?: number;
  };
  stealth_disadvantage?: boolean;
}

interface ShopDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentMoney: number; // Dinheiro em po (gold pieces)
  onPurchase: (items: Array<{ index: string; name: string; cost: number; quantity: number }>) => void;
}

export function ShopDialog({ open, onOpenChange, currentMoney, onPurchase }: ShopDialogProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [currentItems, setCurrentItems] = useState<EquipmentItem[]>([]);
  const [itemsDetails, setItemsDetails] = useState<Record<string, EquipmentDetail>>({});
  const [selectedItem, setSelectedItem] = useState<EquipmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [cart, setCart] = useState<Array<{ index: string; name: string; cost: number; quantity: number }>>([]);
  const { t, translateDnd5e, translateEquipment, locale } = useTranslation();

  const fetchAllItems = useCallback(async () => {
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
  }, []);

  const fetchCategoryItems = useCallback(async (categoryIndex: string) => {
    try {
      setLoadingItems(true);
      setItemsDetails({}); // Limpar detalhes anteriores
      
      if (categoryIndex === "all") {
        await fetchAllItems();
        return;
      }

      const res = await fetch(`${DND_API_BASE}/api/2014/equipment-categories/${categoryIndex}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch category items: ${res.statusText}`);
      }
      const data = await res.json();
      
      const items = data.equipment || [];
      setCurrentItems(items);
      
      if (items.length === 0) {
        console.warn(`No items found for category: ${categoryIndex}`);
      }
    } catch (error) {
      console.error(`Error fetching items for category ${categoryIndex}:`, error);
      setCurrentItems([]);
    } finally {
      setLoadingItems(false);
    }
  }, [fetchAllItems]);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${DND_API_BASE}/api/2014/equipment-categories`);
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      const categoriesList = data.results || [];
      setCategories(categoriesList);
      
      // Se "all" estiver selecionado, buscar todos os itens
      if (selectedCategory === "all") {
        await fetchAllItems();
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, fetchAllItems]);

  useEffect(() => {
    if (open) {
      setSelectedCategory("all");
      setSearchTerm("");
      setCart([]);
      fetchCategories();
    }
  }, [open, fetchCategories]);

  useEffect(() => {
    if (open && selectedCategory) {
      fetchCategoryItems(selectedCategory);
    }
  }, [selectedCategory, open, fetchCategoryItems]);

  // Carregar detalhes dos itens automaticamente
  useEffect(() => {
    if (currentItems.length > 0) {
      // Carregar detalhes dos primeiros 20 itens para não sobrecarregar
      currentItems.slice(0, 20).forEach((item) => {
        if (!itemsDetails[item.index]) {
          fetch(`${DND_API_BASE}${item.url}`)
            .then((res) => res.json())
            .then((detail) => {
              setItemsDetails((prev) => ({ ...prev, [item.index]: detail }));
            })
            .catch((error) => {
              console.error(`Error loading details for ${item.index}:`, error);
            });
        }
      });
    }
  }, [currentItems, itemsDetails]);

  const fetchItemDetails = async (url: string, itemIndex: string) => {
    try {
      if (itemsDetails[itemIndex]) {
        setSelectedItem(itemsDetails[itemIndex]);
        return;
      }

      const res = await fetch(`${DND_API_BASE}${url}`);
      if (res.ok) {
        const detail: EquipmentDetail = await res.json();
        setItemsDetails(prev => ({ ...prev, [itemIndex]: detail }));
        setSelectedItem(detail);
      }
    } catch (error) {
      console.error("Error fetching item details:", error);
    }
  };

  const formatCost = (cost?: { quantity: number; unit: string }) => {
    if (!cost) return t("common.na") || "N/A";
    const unitMap: Record<string, string> = {
      "cp": "pc",
      "sp": "pp",
      "ep": "pe",
      "gp": "po",
      "pp": "pp",
    };
    const translatedUnit = unitMap[cost.unit] || cost.unit;
    return `${cost.quantity} ${translatedUnit}`;
  };

  const convertToGold = (cost?: { quantity: number; unit: string }): number => {
    if (!cost) return 0;
    // Conversão correta:
    // 1 PL (pp) = 10 PO (gp)
    // 1 PO (gp) = 2 PE (ep)
    // 1 PE (ep) = 5 PP (sp)
    // 1 PP (sp) = 10 PC (cp)
    // Então: 1 PC = 0.01 PO, 1 PP = 0.1 PO, 1 PE = 0.5 PO, 1 PL = 10 PO
    const conversion: Record<string, number> = {
      "cp": 0.01, // 100 cp = 1 gp (1 PP = 10 PC, 1 PP = 0.1 PO)
      "sp": 0.1,  // 10 sp = 1 gp (1 PE = 5 PP, 1 PE = 0.5 PO, então 1 PP = 0.1 PO)
      "ep": 0.5,  // 2 ep = 1 gp (1 PO = 2 PE)
      "gp": 1,    // 1 gp = 1 gp
      "pp": 10,   // 1 pp = 10 gp (Platina)
    };
    return cost.quantity * (conversion[cost.unit] || 0);
  };

  const addToCart = (item: EquipmentDetail) => {
    if (!item.cost) return;
    
    const costInGold = Math.round(convertToGold(item.cost) * 100) / 100; // Arredondar para 2 casas
    const existingItem = cart.find(i => i.index === item.index);
    
    if (existingItem) {
      setCart(cart.map(i => 
        i.index === item.index 
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ));
    } else {
      setCart([...cart, { 
        index: item.index, 
        name: item.name, 
        cost: costInGold,
        quantity: 1 
      }]);
    }
  };

  const removeFromCart = (itemIndex: string) => {
    setCart(cart.filter(i => i.index !== itemIndex));
  };

  const updateCartQuantity = (itemIndex: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemIndex);
      return;
    }
    setCart(cart.map(i => 
      i.index === itemIndex ? { ...i, quantity } : i
    ));
  };

  const getTotalCost = (): number => {
    const total = cart.reduce((sum, item) => {
      const itemTotal = item.cost * item.quantity;
      return sum + itemTotal;
    }, 0);
    return Math.round(total * 100) / 100; // Arredondar para 2 casas decimais
  };

  const handlePurchase = () => {
    const total = getTotalCost();
    if (total > currentMoney) {
      alert("Você não tem dinheiro suficiente!");
      return;
    }
    onPurchase(cart);
    setCart([]);
    onOpenChange(false);
  };

  const searchFiltered = currentItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Loja
          </DialogTitle>
          <DialogDescription>
            Dinheiro disponível: <strong>{currentMoney} po</strong>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-4 flex-1 overflow-hidden">
          {/* Lista de Itens */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar itens..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSearchTerm(""); // Limpar busca ao trocar categoria
                }}
                className="h-10 px-3 rounded-md border border-input bg-background"
                disabled={loading}
              >
                <option value="all">Todas as categorias</option>
                {categories.length > 0 ? (
                  categories.map((cat) => {
                    const translatedName = translateDnd5e(cat.index) || translateDnd5e(cat.name) || cat.name;
                    return (
                      <option key={cat.index} value={cat.index}>
                        {translatedName}
                      </option>
                    );
                  })
                ) : (
                  !loading && <option disabled>Nenhuma categoria encontrada</option>
                )}
              </select>
            </div>

            {loadingItems ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Carregando itens...</p>
              </div>
            ) : searchFiltered.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">
                  {searchTerm ? "Nenhum item encontrado com essa busca." : "Nenhum item encontrado nesta categoria."}
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3">
                {searchFiltered.map((item) => {
                  const detail = itemsDetails[item.index];
                  const costInGold = detail?.cost ? convertToGold(detail.cost) : 0;
                  const isWeapon = detail?.damage !== undefined;
                  const isArmor = detail?.armor_class !== undefined;
                  
                  return (
                    <Card
                      key={item.index}
                      className="bg-card/60 border-white/10 hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => fetchItemDetails(item.url, item.index)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          {(() => {
                            const ItemIcon = getItemIcon(item.name, detail?.equipment_category?.index);
                            return <ItemIcon className="w-5 h-5 text-primary flex-shrink-0" />;
                          })()}
                          <CardTitle className="text-sm">{translateEquipment(item.name)}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-2">
                        {/* Dano da arma */}
                        {isWeapon && detail.damage && (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              Dano: {detail.damage.damage_dice || "N/A"}
                              {detail.damage.damage_type && ` ${translateDnd5e(detail.damage.damage_type.name) || detail.damage.damage_type.name}`}
                            </Badge>
                            {detail.range && (
                              <Badge variant="outline" className="text-xs">
                                Alcance: {detail.range.normal || 0}
                                {detail.range.long && `/${detail.range.long}`} ft
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        {/* CA da armadura */}
                        {isArmor && detail.armor_class && (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              CA: {detail.armor_class.base || 0}
                              {detail.armor_class.dex_bonus && " + DEX"}
                              {detail.armor_class.max_bonus && ` (max +${detail.armor_class.max_bonus})`}
                            </Badge>
                            {detail.stealth_disadvantage && (
                              <Badge variant="outline" className="text-xs bg-red-500/20">
                                Desvantagem em Furtividade
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        {detail?.cost && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {formatCost(detail.cost)} ({costInGold.toFixed(2)} po)
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (detail) addToCart(detail);
                              }}
                              disabled={costInGold > currentMoney}
                            >
                              <ShoppingCart className="h-3 w-3 mr-1" />
                              Adicionar
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Carrinho */}
          <div className="w-80 border-l border-border pl-4 flex flex-col">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Carrinho ({cart.length})
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
              {cart.length === 0 ? (
                <p className="text-sm text-muted-foreground">Carrinho vazio</p>
              ) : (
                cart.map((item) => {
                  const detail = itemsDetails[item.index];
                  const itemTotal = item.cost * item.quantity;
                  return (
                    <Card key={item.index} className="bg-card/40 p-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{translateEquipment(item.name)}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.cost.toFixed(2)} po cada × {item.quantity} = {itemTotal.toFixed(2)} po
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 w-6 p-0"
                              onClick={() => updateCartQuantity(item.index, item.quantity - 1)}
                            >
                              -
                            </Button>
                            <span className="text-sm">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 w-6 p-0"
                              onClick={() => updateCartQuantity(item.index, item.quantity + 1)}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => removeFromCart(item.index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
            <div className="border-t border-border pt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total:</span>
                <span className="font-bold text-primary">{getTotalCost().toFixed(2)} po</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Disponível:</span>
                <span>{currentMoney} po</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Restante:</span>
                <span className={currentMoney - getTotalCost() < 0 ? "text-red-400" : "text-green-400"}>
                  {(currentMoney - getTotalCost()).toFixed(2)} po
                </span>
              </div>
              <Button
                onClick={handlePurchase}
                disabled={cart.length === 0 || getTotalCost() > currentMoney}
                className="w-full mt-2"
              >
                <Coins className="h-4 w-4 mr-2" />
                Comprar ({getTotalCost().toFixed(2)} po)
              </Button>
            </div>
          </div>
        </div>

        {/* Dialog de Detalhes do Item */}
        {selectedItem && (
          <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{translateEquipment(selectedItem.name)}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {selectedItem.cost && (
                  <div>
                    <h3 className="font-semibold mb-2">Custo</h3>
                    <p>{formatCost(selectedItem.cost)} ({convertToGold(selectedItem.cost).toFixed(2)} po)</p>
                  </div>
                )}
                {selectedItem.weight !== undefined && (
                  <div>
                    <h3 className="font-semibold mb-2">Peso</h3>
                    <p>{((selectedItem.weight * 0.453592).toFixed(2))} kg ({selectedItem.weight} lb)</p>
                  </div>
                )}
                {/* Dano da arma */}
                {selectedItem.damage && (
                  <div>
                    <h3 className="font-semibold mb-2">Dano</h3>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <strong>Dado:</strong> {selectedItem.damage.damage_dice || "N/A"}
                      </p>
                      {selectedItem.damage.damage_type && (
                        <p className="text-sm">
                          <strong>Tipo:</strong> {translateDnd5e(selectedItem.damage.damage_type.name) || selectedItem.damage.damage_type.name}
                        </p>
                      )}
                      {selectedItem.range && (
                        <p className="text-sm">
                          <strong>Alcance:</strong> {selectedItem.range.normal || 0}
                          {selectedItem.range.long && `/${selectedItem.range.long}`} ft
                        </p>
                      )}
                      {selectedItem.weapon_range && (
                        <p className="text-sm">
                          <strong>Tipo:</strong> {translateDnd5e(selectedItem.weapon_range) || selectedItem.weapon_range}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {/* CA da armadura */}
                {selectedItem.armor_class && (
                  <div>
                    <h3 className="font-semibold mb-2">Classe de Armadura (CA)</h3>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <strong>Base:</strong> {selectedItem.armor_class.base || 0}
                      </p>
                      {selectedItem.armor_class.dex_bonus && (
                        <p className="text-sm">
                          <strong>Bônus de Destreza:</strong> {selectedItem.armor_class.dex_bonus ? "Sim" : "Não"}
                        </p>
                      )}
                      {selectedItem.armor_class.max_bonus && (
                        <p className="text-sm">
                          <strong>Bônus Máximo:</strong> +{selectedItem.armor_class.max_bonus}
                        </p>
                      )}
                      {selectedItem.stealth_disadvantage && (
                        <p className="text-sm text-red-400">
                          <strong>Desvantagem em Furtividade:</strong> Sim
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {selectedItem.desc && selectedItem.desc.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Descrição</h3>
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
                            Nota: As descrições são fornecidas pela API D&D 5e em inglês.
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
                <Button
                  onClick={() => {
                    addToCart(selectedItem);
                    setSelectedItem(null);
                  }}
                  disabled={!selectedItem.cost || convertToGold(selectedItem.cost) > currentMoney}
                  className="w-full"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Adicionar ao Carrinho
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}

