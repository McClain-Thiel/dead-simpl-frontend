import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ArrowLeft, Rocket, Key, Copy, Trash2, Plus, Eye, EyeOff, Brain, Settings, Zap, CheckCircle, DollarSign, Clock, ExternalLink } from "lucide-react";
import { toast } from "sonner@2.0.3";
import skeletonLogo from "figma:asset/da095a0d21754e713136cd74afea19dfc8b375eb.png";

interface DeployPageProps {
  onBack: () => void;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string | null;
  status: "active" | "inactive";
}

interface TunedModel {
  id: string;
  name: string;
  type: "sft" | "dpo";
  baseModel: string;
  accuracy: number;
  created: string;
  costPerHour: number;
  costPerMonth: number;
}

interface Deployment {
  id: string;
  modelId: string;
  modelName: string;
  endpoint: string;
  status: "active" | "deploying" | "failed";
  created: string;
  region: string;
}

export function DeployPage({ onBack }: DeployPageProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: "1",
      name: "Production API",
      key: "sk-dsml_1234567890abcdef1234567890abcdef",
      created: "2024-01-15",
      lastUsed: "2024-01-20",
      status: "active"
    },
    {
      id: "2", 
      name: "Development API",
      key: "sk-dsml_abcdef1234567890abcdef1234567890",
      created: "2024-01-10",
      lastUsed: null,
      status: "inactive"
    }
  ]);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [isDeployDialogOpen, setIsDeployDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<TunedModel | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>("us-east-1");
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [viewingDeployment, setViewingDeployment] = useState<Deployment | null>(null);

  const deployOptions = [
    {
      id: "deployments",
      title: "Deployments",
      description: "Put your models where people can actually use them (shocking concept)",
      icon: Rocket
    },
    {
      id: "authorization",
      title: "Authorization", 
      description: "Keep track of who has access to your precious AI",
      icon: Key
    }
  ];

  // Mock data for available tuned models (completed training runs)
  const availableModels: TunedModel[] = [
    {
      id: "1",
      name: "Customer Service Bot Fine-tune",
      type: "sft",
      baseModel: "Llama 3.1 8B",
      accuracy: 87.3,
      created: "2024-08-25",
      costPerHour: 2.50,
      costPerMonth: 1800
    },
    {
      id: "2",
      name: "Code Assistant SFT",
      type: "sft",
      baseModel: "CodeLlama 7B",
      accuracy: 92.1,
      created: "2024-08-24",
      costPerHour: 2.00,
      costPerMonth: 1440
    }
  ];

  const regions = [
    { id: "us-east-1", name: "US East (Virginia)", latency: "~50ms" },
    { id: "us-west-2", name: "US West (Oregon)", latency: "~75ms" },
    { id: "eu-west-1", name: "Europe (Ireland)", latency: "~120ms" }
  ];

  const generateApiKey = () => {
    if (!newKeyName.trim()) return;

    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `sk-dsml_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      created: new Date().toISOString().split('T')[0],
      lastUsed: null,
      status: "active"
    };

    setApiKeys(prev => [newKey, ...prev]);
    setNewKeyName("");
    setIsGenerateDialogOpen(false);
    toast("API key generated successfully!");
  };

  const copyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast("API key copied to clipboard!");
  };

  const deleteApiKey = (id: string) => {
    setApiKeys(prev => prev.filter(k => k.id !== id));
    toast("API key deleted successfully!");
  };

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const maskApiKey = (key: string) => {
    return key.substring(0, 12) + "..." + key.substring(key.length - 4);
  };

  const deployModel = () => {
    if (!selectedModel) return;

    const endpoint = `https://api.deadsimpleml.com/v1/models/${selectedModel.id.toLowerCase().replace(/\s+/g, '-')}`;
    
    const newDeployment: Deployment = {
      id: Date.now().toString(),
      modelId: selectedModel.id,
      modelName: selectedModel.name,
      endpoint: endpoint,
      status: "active",
      created: new Date().toISOString().split('T')[0],
      region: selectedRegion
    };

    setDeployments(prev => [newDeployment, ...prev]);
    setViewingDeployment(newDeployment);
    setIsDeployDialogOpen(false);
    setSelectedModel(null);
    toast("Model deployed successfully!");
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "sft": return Settings;
      case "dpo": return Zap;
      default: return Brain;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast("Copied to clipboard!");
  };

  const generateCurlExample = (deployment: Deployment) => {
    return `curl -X POST "${deployment.endpoint}/chat/completions" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "${deployment.modelName.toLowerCase().replace(/\s+/g, '-')}",
    "messages": [
      {
        "role": "user",
        "content": "Hello, how can you help me?"
      }
    ],
    "max_tokens": 150,
    "temperature": 0.7
  }'`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/30">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
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

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Sidebar */}
        <div className="w-64 bg-sidebar border-r border-sidebar-border">
          <div className="p-6">
            <h3 className="mb-6 text-sidebar-foreground">Deploy</h3>
            <nav className="space-y-2">
              {deployOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => setSelectedOption(option.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-left ${
                      selectedOption === option.id
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{option.title}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {selectedOption === "authorization" ? (
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <h1 className="mb-4">API Authorization</h1>
                <p className="text-muted-foreground">
                  Manage your API keys so only the right people can use your models
                </p>
              </div>
              
              <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>API Keys</CardTitle>
                      <CardDescription>
                        Create and manage API keys for programmatic access
                      </CardDescription>
                    </div>
                    <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Generate API Key
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Generate New API Key</DialogTitle>
                          <DialogDescription>
                            Create a new API key for accessing your models and services
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="key-name">API Key Name</Label>
                            <Input
                              id="key-name"
                              placeholder="e.g., Production API, Development Key"
                              value={newKeyName}
                              onChange={(e) => setNewKeyName(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={generateApiKey}
                            disabled={!newKeyName.trim()}
                          >
                            Generate Key
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {apiKeys.length === 0 ? (
                    <div className="text-center py-8">
                      <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No API keys found</p>
                      <Button onClick={() => setIsGenerateDialogOpen(true)}>
                        Generate Your First API Key
                      </Button>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>API Key</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Last Used</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {apiKeys.map((apiKey) => (
                          <TableRow key={apiKey.id}>
                            <TableCell className="font-medium">{apiKey.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <code className="text-sm bg-secondary/50 px-2 py-1 rounded">
                                  {visibleKeys.has(apiKey.id) ? apiKey.key : maskApiKey(apiKey.key)}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleKeyVisibility(apiKey.id)}
                                >
                                  {visibleKeys.has(apiKey.id) ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={apiKey.status === "active" ? "default" : "secondary"}>
                                {apiKey.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{apiKey.created}</TableCell>
                            <TableCell>{apiKey.lastUsed || "Never"}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center gap-2 justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyApiKey(apiKey.key)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteApiKey(apiKey.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : selectedOption === "deployments" ? (
            <div className="max-w-6xl mx-auto">
              {viewingDeployment ? (
                // Show deployment details
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingDeployment(null)}
                        className="mb-4"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Deployments
                      </Button>
                      <h1 className="mb-4">Deployment Details</h1>
                      <p className="text-muted-foreground">
                        Your model is live and ready to serve requests (finally!)
                      </p>
                    </div>
                    <Badge variant="default" className="capitalize">
                      {viewingDeployment.status}
                    </Badge>
                  </div>

                  {/* Deployment Info */}
                  <Card className="bg-card/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Rocket className="h-5 w-5 text-primary" />
                        {viewingDeployment.modelName}
                      </CardTitle>
                      <CardDescription>
                        Deployed on {viewingDeployment.created} in {regions.find(r => r.id === viewingDeployment.region)?.name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* API Endpoint */}
                        <div>
                          <h4 className="mb-3">API Endpoint</h4>
                          <div className="flex items-center gap-2 p-3 bg-secondary/30 rounded-md">
                            <code className="flex-1 text-sm">{viewingDeployment.endpoint}</code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(viewingDeployment.endpoint)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Usage Stats */}
                        <div>
                          <h4 className="mb-3">Usage Statistics</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                              <CardContent className="p-4 text-center">
                                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                <p className="text-2xl font-semibold">156</p>
                                <p className="text-muted-foreground text-sm">Total Requests</p>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="p-4 text-center">
                                <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                                <p className="text-2xl font-semibold">95ms</p>
                                <p className="text-muted-foreground text-sm">Avg Response Time</p>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="p-4 text-center">
                                <DollarSign className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                                <p className="text-2xl font-semibold">$12.40</p>
                                <p className="text-muted-foreground text-sm">This Month</p>
                              </CardContent>
                            </Card>
                          </div>
                        </div>

                        {/* cURL Example */}
                        <div>
                          <h4 className="mb-3">Example Request</h4>
                          <div className="relative">
                            <pre className="bg-secondary/30 p-4 rounded-md text-sm overflow-x-auto">
                              <code>{generateCurlExample(viewingDeployment)}</code>
                            </pre>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => copyToClipboard(generateCurlExample(viewingDeployment))}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Additional Info */}
                        <div className="p-4 bg-secondary/20 rounded-lg">
                          <h4 className="mb-2">Important Notes</h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            <li>• Replace YOUR_API_KEY with your actual API key from the Authorization section</li>
                            <li>• Your model supports OpenAI-compatible chat completions format</li>
                            <li>• Rate limits: 60 requests per minute, 1000 requests per hour</li>
                            <li>• For support, check our docs or contact support@deadsimpleml.com</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                // Show deployments list or empty state
                <div>
                  <div className="mb-8">
                    <h1 className="mb-4">Deployments</h1>
                    <p className="text-muted-foreground">
                      Finally make your models useful to actual humans
                    </p>
                  </div>
                  
                  {deployments.length > 0 ? (
                    <Card className="bg-card/80 backdrop-blur-sm">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>Active Deployments</CardTitle>
                            <CardDescription>
                              Your deployed models and their endpoints
                            </CardDescription>
                          </div>
                          <Dialog open={isDeployDialogOpen} onOpenChange={setIsDeployDialogOpen}>
                            <DialogTrigger asChild>
                              <Button>
                                <Rocket className="h-4 w-4 mr-2" />
                                Deploy Model
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Deploy a Model</DialogTitle>
                                <DialogDescription>
                                  Select a trained model to deploy and make it accessible via API
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-6">
                                <div>
                                  <Label className="text-base">Select Model</Label>
                                  <p className="text-sm text-muted-foreground mb-3">
                                    Choose from your completed training runs
                                  </p>
                                  <div className="space-y-3">
                                    {availableModels.map((model) => {
                                      const TypeIcon = getTypeIcon(model.type);
                                      return (
                                        <div
                                          key={model.id}
                                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                            selectedModel?.id === model.id
                                              ? 'border-primary bg-primary/5'
                                              : 'border-border hover:border-primary/50'
                                          }`}
                                          onClick={() => setSelectedModel(model)}
                                        >
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                              <TypeIcon className="h-5 w-5 text-primary" />
                                              <div>
                                                <p className="font-medium">{model.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                  {model.baseModel} • {model.accuracy}% accuracy
                                                </p>
                                              </div>
                                            </div>
                                            <Badge variant="outline" className="capitalize">
                                              {model.type.toUpperCase()}
                                            </Badge>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {selectedModel && (
                                  <>
                                    <div>
                                      <Label className="text-base">Deployment Region</Label>
                                      <p className="text-sm text-muted-foreground mb-3">
                                        Choose the region closest to your users
                                      </p>
                                      <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {regions.map((region) => (
                                            <SelectItem key={region.id} value={region.id}>
                                              {region.name} ({region.latency})
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div className="p-4 bg-secondary/20 rounded-lg">
                                      <h4 className="mb-3">Pricing Information</h4>
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                          <p className="text-muted-foreground">Cost per hour:</p>
                                          <p className="font-semibold">${selectedModel.costPerHour.toFixed(2)}</p>
                                        </div>
                                        <div>
                                          <p className="text-muted-foreground">Cost per month:</p>
                                          <p className="font-semibold">${selectedModel.costPerMonth.toFixed(0)}</p>
                                        </div>
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-2">
                                        * Pricing based on 24/7 availability. You're only charged for actual usage.
                                      </p>
                                    </div>
                                  </>
                                )}
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDeployDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button
                                  onClick={deployModel}
                                  disabled={!selectedModel}
                                >
                                  Deploy Model
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Model</TableHead>
                              <TableHead>Endpoint</TableHead>
                              <TableHead>Region</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Created</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {deployments.map((deployment) => (
                              <TableRow key={deployment.id} className="cursor-pointer" onClick={() => setViewingDeployment(deployment)}>
                                <TableCell className="font-medium">{deployment.modelName}</TableCell>
                                <TableCell>
                                  <code className="text-sm">{deployment.endpoint}</code>
                                </TableCell>
                                <TableCell>{regions.find(r => r.id === deployment.region)?.name}</TableCell>
                                <TableCell>
                                  <Badge variant="default" className="capitalize">
                                    {deployment.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>{deployment.created}</TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="sm">
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="bg-card/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle>Model Deployments</CardTitle>
                        <CardDescription>
                          Deploy and manage your trained models
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-center py-8">
                        <Rocket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">No models deployed yet (they're just sitting there, looking pretty)</p>
                        <Dialog open={isDeployDialogOpen} onOpenChange={setIsDeployDialogOpen}>
                          <DialogTrigger asChild>
                            <Button>Deploy Your First Model</Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Deploy a Model</DialogTitle>
                              <DialogDescription>
                                Select a trained model to deploy and make it accessible via API
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                              <div>
                                <Label className="text-base">Select Model</Label>
                                <p className="text-sm text-muted-foreground mb-3">
                                  Choose from your completed training runs
                                </p>
                                {availableModels.length === 0 ? (
                                  <div className="text-center py-8">
                                    <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground mb-4">No trained models available</p>
                                    <p className="text-sm text-muted-foreground">
                                      Complete some training runs in the Tune section first
                                    </p>
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    {availableModels.map((model) => {
                                      const TypeIcon = getTypeIcon(model.type);
                                      return (
                                        <div
                                          key={model.id}
                                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                            selectedModel?.id === model.id
                                              ? 'border-primary bg-primary/5'
                                              : 'border-border hover:border-primary/50'
                                          }`}
                                          onClick={() => setSelectedModel(model)}
                                        >
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                              <TypeIcon className="h-5 w-5 text-primary" />
                                              <div>
                                                <p className="font-medium">{model.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                  {model.baseModel} • {model.accuracy}% accuracy
                                                </p>
                                              </div>
                                            </div>
                                            <Badge variant="outline" className="capitalize">
                                              {model.type.toUpperCase()}
                                            </Badge>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                              {selectedModel && availableModels.length > 0 && (
                                <>
                                  <div>
                                    <Label className="text-base">Deployment Region</Label>
                                    <p className="text-sm text-muted-foreground mb-3">
                                      Choose the region closest to your users
                                    </p>
                                    <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {regions.map((region) => (
                                          <SelectItem key={region.id} value={region.id}>
                                            {region.name} ({region.latency})
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div className="p-4 bg-secondary/20 rounded-lg">
                                    <h4 className="mb-3">Pricing Information</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <p className="text-muted-foreground">Cost per hour:</p>
                                        <p className="font-semibold">${selectedModel.costPerHour.toFixed(2)}</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">Cost per month:</p>
                                        <p className="font-semibold">${selectedModel.costPerMonth.toFixed(0)}</p>
                                      </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                      * Pricing based on 24/7 availability. You're only charged for actual usage.
                                    </p>
                                  </div>
                                </>
                              )}
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsDeployDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button
                                onClick={deployModel}
                                disabled={!selectedModel || availableModels.length === 0}
                              >
                                Deploy Model
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="mb-4">Deploy Your Models</h1>
                <p className="text-muted-foreground">
                  Turn your model into something people can actually use (wild idea, we know)
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {deployOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Card 
                      key={option.id}
                      className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-border bg-card/80 backdrop-blur-sm"
                      onClick={() => setSelectedOption(option.id)}
                    >
                      <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                          <Icon className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle>{option.title}</CardTitle>
                        <CardDescription>{option.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="text-center pb-6">
                        <Button variant="outline" className="w-full">
                          Manage
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}