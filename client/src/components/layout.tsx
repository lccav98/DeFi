import { PieChart, ArrowLeftRight, Settings, Bell, Menu, X, Home, LogOut, Wallet } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/" },
    { icon: PieChart, label: "Investments", href: "/investments" },
    { icon: ArrowLeftRight, label: "Transactions", href: "/transactions" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  const initials = user?.displayName
    ? user.displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.username?.slice(0, 2).toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 z-50 border-r border-white/5 bg-card/30 backdrop-blur-xl">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">DeFi Direct</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div className={cn("flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer", location === item.href ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "text-muted-foreground hover:bg-white/5 hover:text-foreground")} data-testid={`nav-${item.label.toLowerCase()}`}>
                <item.icon className={cn("w-5 h-5 transition-colors", location === item.href ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
            <Avatar className="w-10 h-10 border border-white/10">
              <AvatarFallback className="bg-primary/20 text-primary font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.displayName || user?.username}</p>
              <p className="text-xs text-muted-foreground truncate">@{user?.username}</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-white/5 cursor-pointer" data-testid="button-logout">
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      <header className="md:hidden fixed top-0 inset-x-0 z-50 h-16 border-b border-white/5 bg-background/80 backdrop-blur-xl flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-lg">DeFi Direct</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Bell className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-xl pt-20 px-4">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div className={cn("flex items-center gap-3 px-4 py-4 rounded-xl transition-all", location === item.href ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:bg-white/5 hover:text-foreground")} onClick={() => setIsMobileMenuOpen(false)}>
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium text-lg">{item.label}</span>
                </div>
              </Link>
            ))}
            <div className="pt-4 border-t border-white/5">
              <button onClick={logout} className="flex items-center gap-3 px-4 py-4 text-destructive hover:bg-white/5 rounded-xl w-full cursor-pointer">
                <LogOut className="w-5 h-5" />
                <span className="font-medium text-lg">Log Out</span>
              </button>
            </div>
          </nav>
        </div>
      )}

      <main className="md:pl-64 min-h-screen relative z-10 pt-20 md:pt-8 px-4 md:px-8 pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-card/80 backdrop-blur-xl border-t border-white/5 pb-safe">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div className={cn("flex flex-col items-center gap-1 p-2 rounded-lg transition-colors", location === item.href ? "text-primary" : "text-muted-foreground")}>
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
