import {
  Sword,
  Shield,
  FlaskConical,
  Gem,
  Scroll,
  Wand2,
  Sparkles,
  Hammer,
  Axe,
  Crosshair,
  ShieldCheck,
  BookOpen,
  Zap,
  Flame,
  Snowflake,
  Droplet,
  Wind,
  Sun,
  Moon,
  Heart,
  Skull,
  Eye,
  Hand,
  Footprints,
  Target,
  ArrowRight,
  Key,
  Map,
  Package,
  Backpack,
  Coins,
  Lightbulb,
  Brain,
  HeartPulse,
  Leaf,
  TreePine,
  Mountain,
  Waves,
  Cloud,
  SunDim,
  MoonStar,
  type LucideIcon,
} from "lucide-react";

/**
 * Mapeia o nome de um item para um ícone baseado em palavras-chave
 */
export function getItemIcon(itemName: string, itemType?: string): LucideIcon {
  const name = itemName.toLowerCase();

  // Armaduras e proteções
  if (name.includes("armor") || name.includes("armadura") || name.includes("plate") || 
      name.includes("chain") || name.includes("leather") || name.includes("mail") ||
      name.includes("breastplate") || name.includes("splint") || name.includes("scale") ||
      name.includes("hide") || name.includes("padded") || name.includes("studded") ||
      itemType === "Armor") {
    return Shield;
  }

  // Escudos
  if (name.includes("shield") || name.includes("escudo")) {
    return ShieldCheck;
  }

  // Armas corpo a corpo
  if (name.includes("sword") || name.includes("espada") || name.includes("blade") ||
      name.includes("rapier") || name.includes("scimitar") || name.includes("saber") ||
      name.includes("dagger") || name.includes("adaga") || name.includes("knife") ||
      name.includes("shortsword") || name.includes("longsword") || name.includes("greatsword")) {
    return Sword;
  }

  // Machados
  if (name.includes("axe") || name.includes("machado") || name.includes("handaxe") ||
      name.includes("battleaxe") || name.includes("greataxe")) {
    return Axe;
  }

  // Armas de alcance
  if (name.includes("bow") || name.includes("arco") || name.includes("crossbow") ||
      name.includes("ballista") || name.includes("arrow") || name.includes("flecha") ||
      name.includes("bolt") || name.includes("dart") || name.includes("sling")) {
    return Crosshair;
  }

  // Martelos e maças
  if (name.includes("hammer") || name.includes("martelo") || name.includes("mace") ||
      name.includes("maça") || name.includes("club") || name.includes("clava") ||
      name.includes("warhammer") || name.includes("flail")) {
    return Hammer;
  }

  // Poções e consumíveis
  if (name.includes("potion") || name.includes("poção") || name.includes("elixir") ||
      name.includes("phial") || name.includes("vial") || name.includes("flask") ||
      name.includes("healing") || name.includes("cura") || itemType === "Consumable") {
    return FlaskConical;
  }

  // Gemas e joias
  if (name.includes("gem") || name.includes("gema") || name.includes("jewel") ||
      name.includes("jóia") || name.includes("diamond") || name.includes("ruby") ||
      name.includes("emerald") || name.includes("sapphire") || name.includes("pearl") ||
      name.includes("amber") || name.includes("topaz") || name.includes("quartz") ||
      itemType === "Gem" || itemType === "Material") {
    return Gem;
  }

  // Anéis
  if (name.includes("ring") || name.includes("anel")) {
    return Sparkles;
  }

  // Amuletos
  if (name.includes("amulet") || name.includes("amuleto") || name.includes("pendant") ||
      name.includes("medalhão")) {
    return Sparkles;
  }

  // Coroas
  if (name.includes("crown") || name.includes("coroa") || name.includes("tiara")) {
    return Shield;
  }

  // Botas e calçados
  if (name.includes("boot") || name.includes("bota") || name.includes("shoe") ||
      name.includes("sapato") || name.includes("sandal") || name.includes("sandália")) {
    return Footprints;
  }

  // Chaves
  if (name.includes("key") || name.includes("chave")) {
    return Key;
  }

  // Mapas
  if (name.includes("map") || name.includes("mapa") || name.includes("chart") ||
      name.includes("carta")) {
    return Map;
  }

  // Pergaminhos
  if (name.includes("scroll") || name.includes("pergaminho") || name.includes("scroll")) {
    return Scroll;
  }

  // Livros
  if (name.includes("book") || name.includes("livro") || name.includes("tome") ||
      name.includes("grimoire") || name.includes("grimório")) {
    return BookOpen;
  }

  // Moedas
  if (name.includes("coin") || name.includes("moeda") || name.includes("gold") ||
      name.includes("ouro") || name.includes("silver") || name.includes("prata") ||
      name.includes("copper") || name.includes("cobre") || name.includes("platinum") ||
      name.includes("platina")) {
    return Coins;
  }

  // Bolsas e mochilas
  if (name.includes("bag") || name.includes("bolsa") || name.includes("pouch") ||
      name.includes("bolsinha") || name.includes("backpack") || name.includes("mochila") ||
      name.includes("sack") || name.includes("saco")) {
    return Backpack;
  }

  // Caixas e pacotes
  if (name.includes("box") || name.includes("caixa") || name.includes("chest") ||
      name.includes("baú") || name.includes("package") || name.includes("pacote")) {
    return Package;
  }

  // Padrão para armas
  if (itemType === "Weapon") {
    return Sword;
  }

  // Padrão
  return Gem;
}

/**
 * Mapeia o nome de uma magia para um ícone baseado em palavras-chave
 */
export function getSpellIcon(spellName: string, spellSchool?: string): LucideIcon {
  const name = spellName.toLowerCase();

  // Fogo
  if (name.includes("fire") || name.includes("fogo") || name.includes("flame") ||
      name.includes("chama") || name.includes("burn") || name.includes("queimar") ||
      name.includes("inferno") || name.includes("hellfire") || name.includes("meteor") ||
      name.includes("meteoro") || name.includes("scorching") || name.includes("incinerar")) {
    return Flame;
  }

  // Raio/Eletricidade
  if (name.includes("lightning") || name.includes("raio") || name.includes("bolt") ||
      name.includes("relâmpago") || name.includes("thunder") || name.includes("trovão") ||
      name.includes("shock") || name.includes("choque") || name.includes("electric") ||
      name.includes("elétrico") || name.includes("storm") || name.includes("tempestade")) {
    return Zap;
  }

  // Gelo/Frio
  if (name.includes("ice") || name.includes("gelo") || name.includes("cold") ||
      name.includes("frio") || name.includes("freeze") || name.includes("congelar") ||
      name.includes("frost") || name.includes("geada") || name.includes("winter") ||
      name.includes("inverno") || name.includes("snow") || name.includes("neve") ||
      name.includes("blizzard") || name.includes("nevasca")) {
    return Snowflake;
  }

  // Água
  if (name.includes("water") || name.includes("água") || name.includes("aqua") ||
      name.includes("tidal") || name.includes("maré") || name.includes("wave") ||
      name.includes("onda") || name.includes("tsunami") || name.includes("flood") ||
      name.includes("inundação") || name.includes("ocean") || name.includes("oceano")) {
    return Droplet;
  }

  // Vento/Ar
  if (name.includes("wind") || name.includes("vento") || name.includes("air") ||
      name.includes("ar") || name.includes("gust") || name.includes("rajada") ||
      name.includes("breeze") || name.includes("brisa") || name.includes("tornado") ||
      name.includes("whirlwind") || name.includes("turbilhão")) {
    return Wind;
  }

  // Terra/Pedra
  if (name.includes("earth") || name.includes("terra") || name.includes("stone") ||
      name.includes("pedra") || name.includes("rock") || name.includes("rocha") ||
      name.includes("mountain") || name.includes("montanha") || name.includes("wall") ||
      name.includes("parede") || name.includes("earthquake") || name.includes("terremoto")) {
    return Mountain;
  }

  // Luz
  if (name.includes("light") || name.includes("luz") || name.includes("bright") ||
      name.includes("brilhante") || name.includes("radiant") || name.includes("radiante") ||
      name.includes("sun") || name.includes("sol") || name.includes("daylight") ||
      name.includes("luz do dia") || name.includes("sunbeam") || name.includes("raio de sol")) {
    return Sun;
  }

  // Escuridão/Sombra
  if (name.includes("dark") || name.includes("escuro") || name.includes("shadow") ||
      name.includes("sombra") || name.includes("darkness") || name.includes("escuridão") ||
      name.includes("night") || name.includes("noite") || name.includes("moon") ||
      name.includes("lua") || name.includes("umbra") || name.includes("umbra")) {
    return Moon;
  }

  // Morte/Necromancia
  if (name.includes("death") || name.includes("morte") || name.includes("undead") ||
      name.includes("morto-vivo") || name.includes("zombie") || name.includes("zumbi") ||
      name.includes("skeleton") || name.includes("esqueleto") || name.includes("necromancy") ||
      name.includes("necromancia") || name.includes("soul") || name.includes("alma") ||
      name.includes("spirit") || name.includes("espírito") || name.includes("ghost") ||
      name.includes("fantasma") || name.includes("animate") || name.includes("animar")) {
    return Skull;
  }

  // Cura/Vida
  if (name.includes("heal") || name.includes("cura") || name.includes("cure") ||
      name.includes("curar") || name.includes("healing") || name.includes("restore") ||
      name.includes("restaurar") || name.includes("regenerate") || name.includes("regenerar") ||
      name.includes("life") || name.includes("vida") || name.includes("revive") ||
      name.includes("reviver") || name.includes("resurrect") || name.includes("ressuscitar")) {
    return Heart;
  }

  // Natureza/Plantas
  if (name.includes("nature") || name.includes("natureza") || name.includes("plant") ||
      name.includes("planta") || name.includes("tree") || name.includes("árvore") ||
      name.includes("grove") || name.includes("bosque") || name.includes("forest") ||
      name.includes("floresta") || name.includes("vine") || name.includes("vinha") ||
      name.includes("thorn") || name.includes("espinho") || name.includes("entangle") ||
      name.includes("enredar") || name.includes("druid") || name.includes("druida")) {
    return Leaf;
  }

  // Mental/Psíquico
  if (name.includes("mind") || name.includes("mente") || name.includes("mental") ||
      name.includes("psychic") || name.includes("psíquico") || name.includes("telepathy") ||
      name.includes("telepatia") || name.includes("charm") || name.includes("encantar") ||
      name.includes("suggestion") || name.includes("sugestão") || name.includes("dominate") ||
      name.includes("dominar") || name.includes("confusion") || name.includes("confusão")) {
    return Brain;
  }

  // Visão/Percepção
  if (name.includes("see") || name.includes("ver") || name.includes("vision") ||
      name.includes("visão") || name.includes("sight") || name.includes("vista") ||
      name.includes("detect") || name.includes("detectar") || name.includes("see") ||
      name.includes("invisible") || name.includes("invisível") || name.includes("true sight") ||
      name.includes("visão verdadeira") || name.includes("scry") || name.includes("adivinhar")) {
    return Eye;
  }

  // Proteção/Escudo
  if (name.includes("shield") || name.includes("escudo") || name.includes("protect") ||
      name.includes("proteger") || name.includes("protection") || name.includes("proteção") ||
      name.includes("ward") || name.includes("guarda") || name.includes("barrier") ||
      name.includes("barreira") || name.includes("guardian") || name.includes("guardião") ||
      name.includes("sanctuary") || name.includes("santuário")) {
    return Shield;
  }

  // Teleporte/Movimento
  if (name.includes("teleport") || name.includes("teletransporte") || name.includes("transport") ||
      name.includes("transportar") || name.includes("dimension") || name.includes("dimensão") ||
      name.includes("plane") || name.includes("plano") || name.includes("gate") ||
      name.includes("portal") || name.includes("misty step") || name.includes("passo nebuloso") ||
      name.includes("blink") || name.includes("piscar")) {
    return Footprints;
  }

  // Alvo/Precisão
  if (name.includes("target") || name.includes("alvo") || name.includes("aim") ||
      name.includes("mirar") || name.includes("mark") || name.includes("marcar") ||
      name.includes("hunter") || name.includes("caçador") || name.includes("ranger") ||
      name.includes("patrulheiro") || name.includes("guided") || name.includes("guiado")) {
    return Target;
  }

  // Mísseis/Projéteis
  if (name.includes("missile") || name.includes("míssil") || name.includes("arrow") ||
      name.includes("flecha") || name.includes("bolt") || name.includes("dardo") ||
      name.includes("magic") && (name.includes("missile") || name.includes("míssil"))) {
    return ArrowRight;
  }

  // Feitiços gerais de magia
  if (name.includes("magic") || name.includes("mágica") || name.includes("spell") ||
      name.includes("feitiço") || name.includes("arcane") || name.includes("arcano") ||
      name.includes("enchant") || name.includes("encantar") || spellSchool === "evocation" ||
      spellSchool === "abjuration" || spellSchool === "conjuration" || spellSchool === "enchantment") {
    return Sparkles;
  }

  // Ilusão
  if (name.includes("illusion") || name.includes("ilusão") || name.includes("mirror") ||
      name.includes("espelho") || name.includes("image") || name.includes("imagem") ||
      name.includes("disguise") || name.includes("disfarce") || spellSchool === "illusion") {
    return Eye;
  }

  // Padrão baseado na escola
  if (spellSchool) {
    const school = spellSchool.toLowerCase();
    if (school.includes("evocation")) return Zap;
    if (school.includes("abjuration")) return Shield;
    if (school.includes("conjuration")) return Sparkles;
    if (school.includes("enchantment")) return Brain;
    if (school.includes("illusion")) return Eye;
    if (school.includes("necromancy")) return Skull;
    if (school.includes("transmutation")) return Wand2;
    if (school.includes("divination")) return Eye;
  }

  // Padrão geral
  return Sparkles;
}

