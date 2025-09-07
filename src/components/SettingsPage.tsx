import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAuth } from "../context/AuthContext";

interface SettingsPageProps {
  onBack: () => void;
}

type TabType = "profile" | "billing";

export function SettingsPage({ onBack }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const { user } = useAuth();

  const tabs = [
    { id: "profile" as TabType, label: "Profile" },
    { id: "billing" as TabType, label: "Billing" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/30">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="mr-4"
            >
              ← Back
            </Button>
            <h2>Settings</h2>
          </div>
          <div className="flex items-center gap-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.photoURL || undefined} alt="User" />
              <AvatarFallback>
                {user?.displayName?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
        <div className="max-w-4xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-8">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                onClick={() => setActiveTab(tab.id)}
                className="px-6"
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <Card className="border-border bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Manage your account details and preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={user?.photoURL || undefined} alt="User" />
                      <AvatarFallback className="text-xl">
                        {user?.displayName?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{user?.displayName || 'Anonymous User'}</h3>
                      <p className="text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button variant="outline">
                      Edit Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="space-y-6">
              <Card className="border-border bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Billing & Subscription</CardTitle>
                  <CardDescription>
                    Manage your subscription and payment methods.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      No billing information yet. We're still figuring out how much to charge for making ML actually simple.
                    </p>
                    <Button variant="outline" disabled>
                      Coming Soon
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}