import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell, Shield, LogOut, ChevronRight, Globe } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";
import { useTranslation, LANG_LABELS, type Language } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useTranslation();

  const initials = user?.displayName
    ? user.displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.username?.slice(0, 2).toUpperCase() || "U";

  const langFlags: Record<Language, string> = { en: "EN", es: "ES", pt: "BR" };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">{t("settings.title")}</h1>
          <p className="text-muted-foreground">{t("settings.subtitle")}</p>
        </div>

        <div className="grid gap-6">
          <Card className="glass-panel border-white/5">
            <CardContent className="p-6 flex items-center gap-6">
              <Avatar className="w-20 h-20 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/20 text-primary font-bold text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">{user?.displayName || user?.username}</h2>
                <p className="text-muted-foreground">@{user?.username}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20">{t("settings.noKyc")}</span>
                  <span className="text-xs bg-white/5 text-muted-foreground px-2 py-1 rounded-full border border-white/10">{t("settings.privacyFirst")}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-white/5">
            <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5 text-primary" />{t("settings.language")}</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{t("settings.languageDesc")}</p>
              <div className="grid grid-cols-3 gap-3">
                {(["en", "es", "pt"] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all cursor-pointer",
                      language === lang
                        ? "bg-primary/10 border-primary/30 text-primary shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                        : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:border-white/20"
                    )}
                    data-testid={`button-settings-lang-${lang}`}
                  >
                    <span className="text-lg font-bold">{langFlags[lang]}</span>
                    <span className="text-sm font-medium">{LANG_LABELS[lang]}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-white/5">
            <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5 text-primary" />{t("settings.notifications")}</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base text-white">{t("settings.depositConfirmations")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.depositConfirmationsDesc")}</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base text-white">{t("settings.yieldUpdates")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.yieldUpdatesDesc")}</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base text-white">{t("settings.newOpportunities")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.newOpportunitiesDesc")}</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-white/5">
            <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-accent" />{t("settings.securityPrivacy")}</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base text-white">{t("settings.biometricLogin")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.biometricLoginDesc")}</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base text-white">{t("settings.privacyMode")}</Label>
                  <p className="text-sm text-muted-foreground">{t("settings.privacyModeDesc")}</p>
                </div>
                <Switch />
              </div>
              <div className="pt-4 border-t border-white/5">
                <Button variant="ghost" className="w-full justify-between hover:bg-white/5 h-12 cursor-pointer">
                  <span className="text-white">{t("settings.changePassword")}</span>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </Button>
                <Button variant="ghost" className="w-full justify-between hover:bg-white/5 h-12 cursor-pointer">
                  <span className="text-white">{t("settings.twoFactor")}</span>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Button variant="destructive" className="w-full h-12 mt-4 cursor-pointer" onClick={logout} data-testid="button-logout-settings">
            <LogOut className="w-4 h-4 mr-2" />
            {t("nav.logOut")}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
