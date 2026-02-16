import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { User, Bell, Shield, Wallet, LogOut, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SettingsPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and security.</p>
        </div>

        <div className="grid gap-6">
          {/* Profile Section */}
          <Card className="glass-panel border-white/5">
            <CardContent className="p-6 flex items-center gap-6">
              <Avatar className="w-20 h-20 border-2 border-primary/20">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">John Doe</h2>
                <p className="text-muted-foreground">john.doe@example.com</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20">Verified Level 2</span>
                  <span className="text-xs bg-white/5 text-muted-foreground px-2 py-1 rounded-full border border-white/10">Member since 2023</span>
                </div>
              </div>
              <Button variant="outline" className="border-white/10 hover:bg-white/5">Edit</Button>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="glass-panel border-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base text-white">Deposit Confirmations</Label>
                  <p className="text-sm text-muted-foreground">Receive alerts when your PIX deposits arrive.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base text-white">Yield Updates</Label>
                  <p className="text-sm text-muted-foreground">Daily summary of your earnings.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base text-white">New Opportunities</Label>
                  <p className="text-sm text-muted-foreground">Alerts for high-APY pools.</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="glass-panel border-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-accent" />
                Security & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base text-white">Biometric Login</Label>
                  <p className="text-sm text-muted-foreground">Use FaceID/TouchID to access the app.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base text-white">Privacy Mode</Label>
                  <p className="text-sm text-muted-foreground">Hide balances when opening the app.</p>
                </div>
                <Switch />
              </div>
              <div className="pt-4 border-t border-white/5">
                <Button variant="ghost" className="w-full justify-between hover:bg-white/5 h-12">
                  <span className="text-white">Change Password</span>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </Button>
                <Button variant="ghost" className="w-full justify-between hover:bg-white/5 h-12">
                  <span className="text-white">Two-Factor Authentication (2FA)</span>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Button variant="destructive" className="w-full h-12 mt-4">
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
        </div>
      </div>
    </Layout>
  );
}
