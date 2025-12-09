"use client";

import { FantasyLayout } from "@/components/layout/FantasyLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/lib/i18n/context";
import { Settings, Globe } from "lucide-react";

export default function SettingsPage() {
  const { locale, setLocale, t } = useTranslation();

  return (
    <FantasyLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold font-cinzel text-primary flex items-center gap-2">
            <Settings className="h-8 w-8" />
            {t("settings.title")}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t("settings.configurePreferences") || "Configure suas preferências de idioma e outras opções"}
          </p>
        </div>

        {/* Language Settings */}
        <Card className="bg-card/60 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t("settings.language")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="language">{t("settings.selectLanguage")}</Label>
              <Select value={locale} onValueChange={(value) => setLocale(value as "pt-BR" | "en" | "es")}>
                <SelectTrigger id="language" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">{t("settings.portuguese")}</SelectItem>
                  <SelectItem value="en">{t("settings.english")}</SelectItem>
                  <SelectItem value="es">{t("settings.spanish")}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                {t("settings.languageChanges") || "As mudanças de idioma serão aplicadas imediatamente em toda a aplicação."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings - Placeholder for future implementation */}
        <Card className="bg-card/60 border-white/10">
          <CardHeader>
            <CardTitle>{t("settings.theme")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t("settings.themeComingSoon") || "Configurações de tema serão adicionadas em breve."}
            </p>
          </CardContent>
        </Card>
      </div>
    </FantasyLayout>
  );
}

