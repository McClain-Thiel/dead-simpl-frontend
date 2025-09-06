import { useState } from "react";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { TunePage } from "./components/TunePage";
import { EvaluatePage } from "./components/EvaluatePage";
import { DeployPage } from "./components/DeployPage";
import skeletonLogo from "figma:asset/da095a0d21754e713136cd74afea19dfc8b375eb.png";

type PageType = "home" | "tune" | "evaluate" | "deploy";

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>("home");

  const options = [
    {
      title: "Evaluate", 
      description: "Actually see if your model works (revolutionary concept, we know)",
      action: () => setCurrentPage("evaluate")
    },
    {
      title: "Tune",
      description: "Make your model less terrible without a PhD in hyperparameters",
      action: () => setCurrentPage("tune")
    },
    {
      title: "Deploy",
      description: "Put your model somewhere people can actually use it",
      action: () => setCurrentPage("deploy")
    }
  ];

  if (currentPage === "tune") {
    return <TunePage onBack={() => setCurrentPage("home")} />;
  }

  if (currentPage === "evaluate") {
    return <EvaluatePage onBack={() => setCurrentPage("home")} />;
  }

  if (currentPage === "deploy") {
    return <DeployPage onBack={() => setCurrentPage("home")} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/30">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <img src={skeletonLogo} alt="DeadSimpleML" className="h-8 w-8 mr-3" />
            <h2 className="mr-8">DeadSimpleML</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://github.com/shadcn.png" alt="User" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8 min-h-screen flex flex-col justify-center">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <img src={skeletonLogo} alt="DeadSimpleML" className="h-16 w-16" />
            </div>
            <h1 className="mb-4">Welcome to DeadSimpleML</h1>
            <p className="text-muted-foreground mb-4">
              Remember when ML was just "train model, use model"? Yeah, us too.
            </p>
            <p className="text-muted-foreground">
              While everyone else is adding more layers of complexity, we're here to remind you that 
              machine learning doesn't need to feel like rocket surgery. Three steps: Evaluate your models, 
              tune what's broken, deploy what works. That's it. No PhD required.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {options.map((option, index) => (
              <Card 
                key={index} 
                className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-border bg-card/80 backdrop-blur-sm"
                onClick={option.action}
              >
                <CardHeader className="text-center">
                  <CardTitle className="capitalize">{option.title}</CardTitle>
                  <CardDescription>{option.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center pb-6">
                  <Button variant="outline" className="w-full">
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/80 backdrop-blur-sm mt-32">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img src={skeletonLogo} alt="DeadSimpleML" className="h-6 w-6 mr-2" />
                <span className="font-medium">DeadSimpleML</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Making ML simple again, one skeleton at a time.
              </p>
            </div>
            
            <div>
              <h4 className="mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Evaluate</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Tune</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Deploy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Examples</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border/50 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              © 2024 DeadSimpleML. All rights reserved.
            </p>
            <p className="text-muted-foreground text-sm mt-2 sm:mt-0">
              Built by humans who remember when ML was actually simple.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}