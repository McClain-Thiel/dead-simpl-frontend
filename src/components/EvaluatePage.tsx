import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { ArrowLeft, MessageCircle, Database, Bot, Upload, CheckCircle, Heart, Target, Shield, Users, Plus, Brain, HelpCircle, Clock, DollarSign, FileText, BarChart3, TrendingUp } from "lucide-react";
import skeletonLogo from "figma:asset/da095a0d21754e713136cd74afea19dfc8b375eb.png";

interface EvaluatePageProps {
  onBack: () => void;
}

type ConfigurationStep = "overview" | "data" | "criteria" | "model" | "preview" | "complete";

interface CriteriaItem {
  id: string;
  name: string;
  description: string;
  icon: any;
  selected: boolean;
}

interface ModelOption {
  id: string;
  name: string;
  provider: string;
  cost: string;
  description: string;
  selected: boolean;
}

interface CustomModel {
  name: string;
  url: string;
  authType: string;
  authValue: string;
}

interface EvaluationReport {
  id: string;
  name: string;
  type: "chatbot" | "rag" | "agent";
  modelName: string;
  modelProvider: string;
  dataset: string;
  criteria: string[];
  status: "completed" | "running" | "failed";
  score: number | null;
  cost: number;
  created: string;
  completed: string | null;
}

export function EvaluatePage({ onBack }: EvaluatePageProps) {
  const [selectedOption, setSelectedOption] = useState<string>("chatbot"); // Default to chatbot
  const [configurationStep, setConfigurationStep] = useState<ConfigurationStep>("overview");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedCriteria, setSelectedCriteria] = useState<CriteriaItem[]>([]);
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);
  const [customCriteriaName, setCustomCriteriaName] = useState("");
  const [customCriteriaDescription, setCustomCriteriaDescription] = useState("");
  const [availableModels, setAvailableModels] = useState<ModelOption[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelOption | null>(null);
  const [isCustomModelDialogOpen, setIsCustomModelDialogOpen] = useState(false);
  const [customModel, setCustomModel] = useState<CustomModel>({
    name: "",
    url: "",
    authType: "bearer",
    authValue: ""
  });
  const [isDataHelpOpen, setIsDataHelpOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<EvaluationReport | null>(null);
  const [viewingReport, setViewingReport] = useState(false);

  const evaluateOptions = [
    {
      id: "chatbot",
      title: "Chatbot",
      description: "Find out if your bot is actually helpful or just confidently wrong",
      icon: MessageCircle
    },
    {
      id: "rag",
      title: "RAG", 
      description: "Test if your retrieval system finds relevant info or just expensive nonsense",
      icon: Database
    },
    {
      id: "agent",
      title: "Agent",
      description: "See if your AI agent is autonomous or just autonomously confused",
      icon: Bot
    },
    {
      id: "reports",
      title: "Reports",
      description: "See how badly (or surprisingly well) your models performed",
      icon: FileText
    }
  ];

  // Mock data for reports
  const reports: EvaluationReport[] = [
    {
      id: "1",
      name: "Customer Service Bot Evaluation",
      type: "chatbot",
      modelName: "GPT-4o",
      modelProvider: "OpenAI",
      dataset: "customer_conversations.json",
      criteria: ["Correctness", "Politeness", "Relevance"],
      status: "completed",
      score: 87,
      cost: 7.50,
      created: "2024-08-25",
      completed: "2024-08-25"
    },
    {
      id: "2", 
      name: "Documentation RAG System",
      type: "rag",
      modelName: "Claude 3.5 Sonnet",
      modelProvider: "Anthropic",
      dataset: "qa_pairs.csv", 
      criteria: ["Correctness", "Faithfulness", "Relevance"],
      status: "completed",
      score: 92,
      cost: 9.00,
      created: "2024-08-24",
      completed: "2024-08-24"
    },
    {
      id: "3",
      name: "Task Planning Agent",
      type: "agent",
      modelName: "Llama 3.1 70B",
      modelProvider: "Meta",
      dataset: "task_executions.jsonl",
      criteria: ["Correctness", "Role Adherence"],
      status: "running",
      score: null,
      cost: 2.64,
      created: "2024-08-29",
      completed: null
    },
    {
      id: "4",
      name: "Sales Chatbot A/B Test", 
      type: "chatbot",
      modelName: "Gemini Pro",
      modelProvider: "Google",
      dataset: "sales_conversations.json",
      criteria: ["Correctness", "Politeness", "Persuasiveness"],
      status: "failed",
      score: null,
      cost: 1.50,
      created: "2024-08-23",
      completed: null
    },
    {
      id: "5",
      name: "Legal Document RAG",
      type: "rag", 
      modelName: "Claude 3 Haiku",
      modelProvider: "Anthropic",
      dataset: "legal_qa.json",
      criteria: ["Correctness", "Faithfulness"],
      status: "completed",
      score: 78,
      cost: 0.75,
      created: "2024-08-22",
      completed: "2024-08-22"
    }
  ];

  const defaultModels: ModelOption[] = [
    {
      id: "gpt-4o",
      name: "GPT-4o",
      provider: "OpenAI",
      cost: "$5.00 per 1M tokens",
      description: "Latest multimodal model from OpenAI",
      selected: false
    },
    {
      id: "claude-3-5-sonnet",
      name: "Claude 3.5 Sonnet",
      provider: "Anthropic",
      cost: "$3.00 per 1M tokens",
      description: "Anthropic's most intelligent model",
      selected: false
    },
    {
      id: "llama-3-1-70b",
      name: "Llama 3.1 70B",
      provider: "Meta",
      cost: "$0.88 per 1M tokens",
      description: "Open-source large language model",
      selected: false
    },
    {
      id: "gemini-pro",
      name: "Gemini Pro",
      provider: "Google",
      cost: "$0.50 per 1M tokens",
      description: "Google's most capable model",
      selected: false
    },
    {
      id: "claude-3-haiku",
      name: "Claude 3 Haiku",
      provider: "Anthropic",
      cost: "$0.25 per 1M tokens",
      description: "Fast and lightweight model",
      selected: false
    }
  ];

  const getDefaultCriteriaForType = (type: string): CriteriaItem[] => {
    const baseCriteria = [
      {
        id: "correctness",
        name: "Correctness",
        description: "Accuracy and factual correctness of responses",
        icon: CheckCircle,
        selected: false
      }
    ];

    if (type === "chatbot") {
      return [
        ...baseCriteria,
        {
          id: "politeness",
          name: "Politeness",
          description: "Respectful and courteous communication style",
          icon: Heart,
          selected: false
        },
        {
          id: "relevance",
          name: "Relevance",
          description: "How well responses address the user's query",
          icon: Target,
          selected: false
        },
        {
          id: "role_adherence",
          name: "Role Adherence",
          description: "Consistency with assigned role or persona",
          icon: Users,
          selected: false
        }
      ];
    } else if (type === "rag") {
      return [
        ...baseCriteria,
        {
          id: "faithfulness",
          name: "Faithfulness",
          description: "Adherence to provided context and source material",
          icon: Shield,
          selected: false
        },
        {
          id: "relevance",
          name: "Relevance",
          description: "How well responses address the user's query",
          icon: Target,
          selected: false
        }
      ];
    } else if (type === "agent") {
      return [
        ...baseCriteria,
        {
          id: "role_adherence",
          name: "Role Adherence",
          description: "Consistency with assigned role or persona",
          icon: Users,
          selected: false
        },
        {
          id: "efficiency",
          name: "Efficiency",
          description: "How well the agent completes tasks with minimal steps",
          icon: Target,
          selected: false
        }
      ];
    }

    return baseCriteria;
  };

  const getDataUploadInstructions = (optionId: string) => {
    switch (optionId) {
      case "chatbot":
        return {
          title: "Upload Conversation Data",
          description: "Upload a JSON or CSV file containing conversation logs with user messages and bot responses. Each row should include fields like 'user_message', 'bot_response', and optionally 'timestamp' or 'session_id'.",
          acceptedFormats: ".json, .csv, .jsonl"
        };
      case "rag":
        return {
          title: "Upload Query-Response Dataset",
          description: "Upload a file containing queries, retrieved contexts, and generated responses. Format should include 'query', 'context', 'response', and optionally 'ground_truth' fields for comprehensive RAG evaluation.",
          acceptedFormats: ".json, .csv, .jsonl"
        };
      case "agent":
        return {
          title: "Upload Task Execution Data",
          description: "Upload data containing agent tasks, actions taken, and outcomes. Should include 'task_description', 'agent_actions', 'final_result', and optionally 'success_criteria' for proper agent evaluation.",
          acceptedFormats: ".json, .csv, .jsonl"
        };
      default:
        return {
          title: "Upload Evaluation Data",
          description: "Upload your evaluation dataset",
          acceptedFormats: ".json, .csv, .jsonl"
        };
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const toggleCriteria = (criteriaId: string) => {
    setSelectedCriteria(prev => 
      prev.map(c => 
        c.id === criteriaId ? { ...c, selected: !c.selected } : c
      )
    );
  };

  const addCustomCriteria = () => {
    if (customCriteriaName && customCriteriaDescription) {
      const newCriteria: CriteriaItem = {
        id: `custom_${Date.now()}`,
        name: customCriteriaName,
        description: customCriteriaDescription,
        icon: Plus,
        selected: true
      };
      setSelectedCriteria(prev => [...prev, newCriteria]);
      setCustomCriteriaName("");
      setCustomCriteriaDescription("");
      setIsCustomDialogOpen(false);
    }
  };

  const startConfiguration = (optionId: string) => {
    setSelectedOption(optionId);
    setConfigurationStep("data");
    setSelectedCriteria(getDefaultCriteriaForType(optionId));
    setAvailableModels(defaultModels);
  };

  const addCustomModel = () => {
    if (customModel.name && customModel.url) {
      const newModel: ModelOption = {
        id: `custom_${Date.now()}`,
        name: customModel.name,
        provider: "Custom",
        cost: "Custom pricing",
        description: `Custom model: ${customModel.url}`,
        selected: true
      };
      setAvailableModels(prev => [...prev, newModel]);
      setSelectedModel(newModel);
      setCustomModel({ name: "", url: "", authType: "bearer", authValue: "" });
      setIsCustomModelDialogOpen(false);
    }
  };

  const selectModel = (model: ModelOption) => {
    setSelectedModel(model);
    setAvailableModels(prev => 
      prev.map(m => ({ ...m, selected: m.id === model.id }))
    );
  };

  const resetConfiguration = () => {
    setConfigurationStep("overview");
    setUploadedFile(null);
    setSelectedCriteria([]);
    setCustomCriteriaName("");
    setCustomCriteriaDescription("");
    setAvailableModels([]);
    setSelectedModel(null);
    setCustomModel({ name: "", url: "", authType: "bearer", authValue: "" });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "chatbot": return MessageCircle;
      case "rag": return Database;
      case "agent": return Bot;
      default: return FileText;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "running": return "secondary";
      case "failed": return "destructive";
      default: return "secondary";
    }
  };

  const openReportDetails = (report: EvaluationReport) => {
    setSelectedReport(report);
    setViewingReport(true);
  };
  
  const closeReportDetails = () => {
    setSelectedReport(null);
    setViewingReport(false);
  };

  const renderContent = () => {
    if (configurationStep !== "overview") {
      // Show configuration flow (existing logic)
      const option = evaluateOptions.find(opt => opt.id === selectedOption);
      if (!option) return null;

      // Data Upload Step
      if (configurationStep === "data") {
        const uploadInstructions = getDataUploadInstructions(selectedOption);
        
        return (
          <div>
            <div className="mb-8">
              <h1 className="mb-4">Step 1: Upload Data</h1>
              <p className="text-muted-foreground">
                Upload your data so we can tell you what you probably already suspect about your {option.title.toLowerCase()}
              </p>
            </div>
            
            <Card className="bg-card/80 backdrop-blur-sm mb-6">
              <CardHeader>
                <CardTitle>{uploadInstructions.title}</CardTitle>
                <CardDescription>{uploadInstructions.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <div className="space-y-2">
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <Button variant="outline" asChild>
                        <span>Choose File</span>
                      </Button>
                    </Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept={uploadInstructions.acceptedFormats}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <p className="text-muted-foreground">
                      Accepted formats: {uploadInstructions.acceptedFormats}
                    </p>
                    {uploadedFile && (
                      <div className="mt-4 p-3 bg-secondary rounded-md">
                        <p className="text-secondary-foreground">
                          Selected: {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      resetConfiguration();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => setConfigurationStep("criteria")}
                    disabled={!uploadedFile}
                  >
                    Next: Select Criteria
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* What data do I need tile - separate card */}
            <Dialog open={isDataHelpOpen} onOpenChange={setIsDataHelpOpen}>
              <DialogTrigger asChild>
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-md bg-yellow-50 border-yellow-200 hover:border-yellow-300">
                  <CardContent className="p-4 flex items-center gap-3">
                    <HelpCircle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-800">What data do I need?</p>
                      <p className="text-yellow-700">Get specific requirements for your evaluation type</p>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Data Requirements for {option.title} Evaluation</DialogTitle>
                  <DialogDescription>
                    Here's exactly what you need to provide for effective evaluation
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <h4 className="mb-2">Required Fields</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      {selectedOption === "chatbot" && (
                        <>
                          <li>• <code>user_message</code>: The input from the user</li>
                          <li>• <code>bot_response</code>: The model's response</li>
                          <li>• <code>session_id</code> (optional): For conversation grouping</li>
                          <li>• <code>timestamp</code> (optional): When the interaction occurred</li>
                        </>
                      )}
                      {selectedOption === "rag" && (
                        <>
                          <li>• <code>query</code>: The user's question or search query</li>
                          <li>• <code>context</code>: Retrieved/relevant context documents</li>
                          <li>• <code>response</code>: The generated answer</li>
                          <li>• <code>ground_truth</code> (optional): Expected correct answer</li>
                        </>
                      )}
                      {selectedOption === "agent" && (
                        <>
                          <li>• <code>task_description</code>: What the agent was asked to do</li>
                          <li>• <code>agent_actions</code>: Sequence of actions taken</li>
                          <li>• <code>final_result</code>: The outcome of the task</li>
                          <li>• <code>success_criteria</code> (optional): How to measure success</li>
                        </>
                      )}
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <h4 className="mb-2">Example Format (JSON)</h4>
                    <pre className="text-sm text-muted-foreground bg-background p-2 rounded">
{selectedOption === "chatbot" && `[
  {
    "user_message": "What's the weather like?",
    "bot_response": "I don't have access to real-time weather data...",
    "session_id": "sess_123",
    "timestamp": "2024-01-20T10:30:00Z"
  }
]`}
{selectedOption === "rag" && `[
  {
    "query": "How does photosynthesis work?",
    "context": "Photosynthesis is the process by which...",
    "response": "Photosynthesis converts light energy into chemical energy...",
    "ground_truth": "The process where plants convert sunlight..."
  }
]`}
{selectedOption === "agent" && `[
  {
    "task_description": "Book a flight from NYC to LA",
    "agent_actions": ["search_flights", "compare_prices", "book_ticket"],
    "final_result": "Flight booked successfully for $299",
    "success_criteria": "Flight booked within budget"
  }
]`}
                    </pre>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => setIsDataHelpOpen(false)}>Got it!</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        );
      }

      // Criteria Selection Step
      if (configurationStep === "criteria") {
        return (
          <div>
            <div className="mb-8">
              <h1 className="mb-4">Step 2: Select Evaluation Criteria</h1>
              <p className="text-muted-foreground">
                Choose how you want to judge your {option.title.toLowerCase()}'s performance (be honest with yourself)
              </p>
            </div>
            
            <Card className="bg-card/80 backdrop-blur-sm mb-6">
              <CardHeader>
                <CardTitle>Evaluation Criteria</CardTitle>
                <CardDescription>
                  Select the criteria most relevant to your {option.title.toLowerCase()} evaluation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedCriteria.map((criteria) => {
                    const Icon = criteria.icon;
                    return (
                      <div
                        key={criteria.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          criteria.selected
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => toggleCriteria(criteria.id)}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className="h-5 w-5 text-primary mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">{criteria.name}</h4>
                            <p className="text-sm text-muted-foreground">{criteria.description}</p>
                          </div>
                          {criteria.selected && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t pt-4">
                  <Dialog open={isCustomDialogOpen} onOpenChange={setIsCustomDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Custom Criteria
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Custom Evaluation Criteria</DialogTitle>
                        <DialogDescription>
                          Define your own criteria for evaluating {option.title.toLowerCase()} performance
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="criteria-name">Criteria Name</Label>
                          <Input
                            id="criteria-name"
                            placeholder="e.g., Tone, Creativity, Domain Expertise"
                            value={customCriteriaName}
                            onChange={(e) => setCustomCriteriaName(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="criteria-description">Description</Label>
                          <Textarea
                            id="criteria-description"
                            placeholder="Describe what this criteria evaluates..."
                            value={customCriteriaDescription}
                            onChange={(e) => setCustomCriteriaDescription(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCustomDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={addCustomCriteria}
                          disabled={!customCriteriaName || !customCriteriaDescription}
                        >
                          Add Criteria
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setConfigurationStep("data")}
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={() => setConfigurationStep("model")}
                    disabled={selectedCriteria.filter(c => c.selected).length === 0}
                  >
                    Next: Select Model
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      }

      // Model Selection Step
      if (configurationStep === "model") {
        return (
          <div>
            <div className="mb-8">
              <h1 className="mb-4">Step 3: Select Model</h1>
              <p className="text-muted-foreground">
                Choose which model will be judging your {option.title.toLowerCase()} (no pressure, but this is important)
              </p>
            </div>
            
            <Card className="bg-card/80 backdrop-blur-sm mb-6">
              <CardHeader>
                <CardTitle>Evaluation Model</CardTitle>
                <CardDescription>
                  Select the model that will evaluate your {option.title.toLowerCase()} responses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {availableModels.map((model) => (
                    <div
                      key={model.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedModel?.id === model.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => selectModel(model)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Brain className="h-5 w-5 text-primary" />
                          <div>
                            <h4 className="font-medium">{model.name}</h4>
                            <p className="text-sm text-muted-foreground">{model.provider} • {model.cost}</p>
                          </div>
                        </div>
                        {selectedModel?.id === model.id && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 ml-8">{model.description}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <Dialog open={isCustomModelDialogOpen} onOpenChange={setIsCustomModelDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Use Custom Model
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Custom Model</DialogTitle>
                        <DialogDescription>
                          Connect your own model endpoint for evaluation
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="model-name">Model Name</Label>
                          <Input
                            id="model-name"
                            placeholder="e.g., My Fine-tuned GPT"
                            value={customModel.name}
                            onChange={(e) => setCustomModel(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="model-url">API Endpoint</Label>
                          <Input
                            id="model-url"
                            placeholder="https://api.yourmodel.com/v1/chat/completions"
                            value={customModel.url}
                            onChange={(e) => setCustomModel(prev => ({ ...prev, url: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="auth-type">Authentication Type</Label>
                          <Select
                            value={customModel.authType}
                            onValueChange={(value) => setCustomModel(prev => ({ ...prev, authType: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bearer">Bearer Token</SelectItem>
                              <SelectItem value="api-key">API Key</SelectItem>
                              <SelectItem value="none">None</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {customModel.authType !== "none" && (
                          <div>
                            <Label htmlFor="auth-value">
                              {customModel.authType === "bearer" ? "Bearer Token" : "API Key"}
                            </Label>
                            <Input
                              id="auth-value"
                              type="password"
                              placeholder="Enter your authentication credential"
                              value={customModel.authValue}
                              onChange={(e) => setCustomModel(prev => ({ ...prev, authValue: e.target.value }))}
                            />
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCustomModelDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={addCustomModel}
                          disabled={!customModel.name || !customModel.url}
                        >
                          Add Model
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setConfigurationStep("criteria")}
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={() => setConfigurationStep("preview")}
                    disabled={!selectedModel}
                  >
                    Next: Review & Launch
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      }

      // Preview & Launch Step
      if (configurationStep === "preview") {
        const selectedCriteriaNames = selectedCriteria.filter(c => c.selected).map(c => c.name);
        const estimatedCost = selectedCriteriaNames.length * 0.5; // Mock calculation
        const estimatedTime = selectedCriteriaNames.length * 10; // Mock calculation

        return (
          <div>
            <div className="mb-8">
              <h1 className="mb-4">Step 4: Review & Launch</h1>
              <p className="text-muted-foreground">
                Double-check everything before we spend your money evaluating your {option.title.toLowerCase()}
              </p>
            </div>
            
            <div className="space-y-6">
              <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Evaluation Summary</CardTitle>
                  <CardDescription>Review your configuration before launching</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="mb-3">Dataset</h4>
                      <div className="p-3 bg-secondary/30 rounded-md">
                        <p className="font-medium">{uploadedFile?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {uploadedFile ? `${(uploadedFile.size / 1024).toFixed(1)} KB` : 'No file'}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="mb-3">Evaluation Model</h4>
                      <div className="p-3 bg-secondary/30 rounded-md">
                        <p className="font-medium">{selectedModel?.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedModel?.provider}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-3">Selected Criteria ({selectedCriteriaNames.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCriteriaNames.map((name, index) => (
                        <Badge key={index} variant="outline">{name}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                    <div>
                      <h4 className="mb-2">Estimated Cost</h4>
                      <p className="text-2xl font-semibold">${estimatedCost.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">Based on selected criteria and model</p>
                    </div>
                    
                    <div>
                      <h4 className="mb-2">Estimated Time</h4>
                      <p className="text-2xl font-semibold">{estimatedTime} min</p>
                      <p className="text-sm text-muted-foreground">Typical completion time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setConfigurationStep("model")}
                >
                  Back
                </Button>
                <Button 
                  onClick={() => setConfigurationStep("complete")}
                  className="flex-1"
                >
                  Launch Evaluation
                </Button>
              </div>
            </div>
          </div>
        );
      }

      // Complete Step
      if (configurationStep === "complete") {
        return (
          <div>
            <div className="mb-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h1 className="mb-4">Evaluation Started!</h1>
              <p className="text-muted-foreground">
                Your {option.title.toLowerCase()} evaluation is now running. We'll let you know when it's done.
              </p>
            </div>
            
            <Card className="bg-card/80 backdrop-blur-sm mb-6">
              <CardHeader>
                <CardTitle>What happens next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">1</div>
                    <div>
                      <p className="font-medium">Processing your data</p>
                      <p className="text-sm text-muted-foreground">We're analyzing your uploaded dataset and preparing it for evaluation</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-sm font-medium">2</div>
                    <div>
                      <p className="font-medium">Running evaluations</p>
                      <p className="text-sm text-muted-foreground">Your selected model will evaluate each example against your chosen criteria</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-sm font-medium">3</div>
                    <div>
                      <p className="font-medium">Generating report</p>
                      <p className="text-sm text-muted-foreground">We'll compile comprehensive results with scores, insights, and recommendations</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    💡 <strong>Pro tip:</strong> Check the Reports section in about 10-30 minutes to see your results. 
                    We'll also send you an email when it's ready.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={resetConfiguration}
                className="flex-1"
              >
                Start Another Evaluation
              </Button>
              <Button 
                onClick={() => {
                  setSelectedOption("reports");
                  resetConfiguration();
                }}
                className="flex-1"
              >
                View Reports
              </Button>
            </div>
          </div>
        );
      }

      return null;
    }

    // Show informational content based on selected option
    if (selectedOption === "chatbot") {
      return (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-4">Chatbot Evaluation</h1>
              <p className="text-muted-foreground">
                Find out if your bot is actually helpful or just confidently wrong
              </p>
            </div>
            <Button onClick={() => startConfiguration("chatbot")} size="lg">
              Get Started
            </Button>
          </div>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Introduction to Chatbot Evaluation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Chatbot evaluation is the process of assessing how well your conversational AI performs in real-world scenarios. 
                Unlike traditional metrics that only look at technical performance, chatbot evaluation focuses on user experience, 
                conversation quality, and task completion rates.
              </p>
              <p>
                The key challenge? Most chatbots sound great in demos but fall apart when real users start asking real questions. 
                Our evaluation framework tests your bot against criteria that actually matter: correctness, helpfulness, politeness, 
                and whether it can stay on topic for more than two exchanges.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Data Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                To evaluate your chatbot effectively, we need conversation logs that show real interactions between users and your bot. 
                The quality of your evaluation depends entirely on the quality of your data.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <h4 className="mb-2">Required Fields</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• <code>user_message</code>: What the user said</li>
                    <li>• <code>bot_response</code>: How your bot replied</li>
                    <li>• <code>session_id</code>: Groups related messages</li>
                    <li>• <code>timestamp</code>: When it happened</li>
                  </ul>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <h4 className="mb-2">Pro Tips</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Include failed conversations (they're the most valuable)</li>
                    <li>• Diverse conversation types give better insights</li>
                    <li>• 100+ conversations minimum for meaningful results</li>
                    <li>• Remove any personal information before upload</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Evaluation Criteria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We evaluate chatbots across multiple dimensions because "good" means different things in different contexts. 
                A customer service bot needs to be polite and helpful, while a technical support bot needs to be accurate and detailed.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                <div className="p-3 border border-border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-primary mb-2" />
                  <h5 className="mb-1">Correctness</h5>
                  <p className="text-sm text-muted-foreground">Are the answers factually accurate?</p>
                </div>
                <div className="p-3 border border-border rounded-lg">
                  <Heart className="h-5 w-5 text-primary mb-2" />
                  <h5 className="mb-1">Politeness</h5>
                  <p className="text-sm text-muted-foreground">Does it communicate respectfully?</p>
                </div>
                <div className="p-3 border border-border rounded-lg">
                  <Target className="h-5 w-5 text-primary mb-2" />
                  <h5 className="mb-1">Relevance</h5>
                  <p className="text-sm text-muted-foreground">Does it address what was asked?</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>What You'll Get</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Our evaluation gives you actionable insights, not just numbers. You'll understand where your chatbot excels, 
                where it struggles, and exactly what to fix.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <h5>📊 Performance Scores</h5>
                  <p className="text-sm text-muted-foreground">Overall and per-criteria scoring with benchmarks</p>
                </div>
                <div className="space-y-2">
                  <h5>🔍 Failure Analysis</h5>
                  <p className="text-sm text-muted-foreground">Specific examples of where your bot went wrong</p>
                </div>
                <div className="space-y-2">
                  <h5>💡 Improvement Recommendations</h5>
                  <p className="text-sm text-muted-foreground">Concrete steps to make your bot better</p>
                </div>
                <div className="space-y-2">
                  <h5>📈 Trending Analysis</h5>
                  <p className="text-sm text-muted-foreground">How performance varies by conversation length, topic, etc.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (selectedOption === "rag") {
      return (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-4">RAG System Evaluation</h1>
              <p className="text-muted-foreground">
                Test if your retrieval system finds relevant info or just expensive nonsense
              </p>
            </div>
            <Button onClick={() => startConfiguration("rag")} size="lg">
              Get Started
            </Button>
          </div>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Introduction to RAG Evaluation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Retrieval-Augmented Generation (RAG) systems combine the power of large language models with your specific knowledge base. 
                But here's the thing: just because your system can find documents doesn't mean it's finding the right documents, 
                and just because it generates an answer doesn't mean that answer is any good.
              </p>
              <p>
                RAG evaluation is notoriously tricky because you're evaluating two things at once: how well your system retrieves relevant 
                information, and how well it uses that information to generate helpful answers. Get either part wrong, and the whole thing falls apart.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Data Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                RAG evaluation requires you to provide the full pipeline: user queries, retrieved context, and generated responses. 
                This lets us evaluate both retrieval quality and answer generation quality.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <h4 className="mb-2">Required Fields</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• <code>query</code>: User's question</li>
                    <li>• <code>context</code>: Retrieved documents</li>
                    <li>• <code>response</code>: Generated answer</li>
                    <li>• <code>ground_truth</code>: Expected answer (optional)</li>
                  </ul>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <h4 className="mb-2">Quality Tips</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Include both simple and complex queries</li>
                    <li>• Mix queries that should find answers with those that shouldn't</li>
                    <li>• Include edge cases and ambiguous questions</li>
                    <li>• Ground truth answers dramatically improve evaluation quality</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>What We Evaluate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                RAG systems can fail in multiple ways. We evaluate both the retrieval and generation components to give you 
                a complete picture of system performance.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                <div className="p-3 border border-border rounded-lg">
                  <Target className="h-5 w-5 text-primary mb-2" />
                  <h5 className="mb-1">Relevance</h5>
                  <p className="text-sm text-muted-foreground">Does the retrieved context actually help answer the question?</p>
                </div>
                <div className="p-3 border border-border rounded-lg">
                  <Shield className="h-5 w-5 text-primary mb-2" />
                  <h5 className="mb-1">Faithfulness</h5>
                  <p className="text-sm text-muted-foreground">Does the answer stick to what's in the retrieved context?</p>
                </div>
                <div className="p-3 border border-border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-primary mb-2" />
                  <h5 className="mb-1">Correctness</h5>
                  <p className="text-sm text-muted-foreground">Is the final answer actually correct?</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Common RAG Problems We Catch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h5>🔍 Retrieval Issues</h5>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Retrieving irrelevant documents</li>
                    <li>• Missing relevant information</li>
                    <li>• Poor ranking of results</li>
                    <li>• Semantic search not working as expected</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h5>📝 Generation Issues</h5>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Hallucinating information not in context</li>
                    <li>• Ignoring relevant context</li>
                    <li>• Inconsistent answer quality</li>
                    <li>• Not admitting when information is missing</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (selectedOption === "agent") {
      return (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-4">Agent Evaluation</h1>
              <p className="text-muted-foreground">
                See if your AI agent is autonomous or just autonomously confused
              </p>
            </div>
            <Button onClick={() => startConfiguration("agent")} size="lg">
              Get Started
            </Button>
          </div>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Introduction to Agent Evaluation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                AI agents are supposed to be the next big thing: autonomous systems that can break down complex tasks, 
                use tools, and complete multi-step workflows without constant human supervision. The reality? Most agents 
                are about as autonomous as a toddler with a smartphone.
              </p>
              <p>
                Agent evaluation is complex because you're not just testing if the agent gets the right answer—you're testing 
                if it takes reasonable steps to get there, handles errors gracefully, knows when to ask for help, and doesn't 
                go completely off the rails when something unexpected happens.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Data Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Agent evaluation requires detailed logs of the agent's decision-making process: what it was asked to do, 
                what steps it took, what tools it used, and what the final outcome was.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <h4 className="mb-2">Required Fields</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• <code>task_description</code>: What the agent was asked to do</li>
                    <li>• <code>agent_actions</code>: Step-by-step actions taken</li>
                    <li>• <code>final_result</code>: The end outcome</li>
                    <li>• <code>success_criteria</code>: How to measure success</li>
                  </ul>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <h4 className="mb-2">Best Practices</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Include both successful and failed attempts</li>
                    <li>• Capture the full action sequence, not just endpoints</li>
                    <li>• Document edge cases and error conditions</li>
                    <li>• Include tasks of varying complexity</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>What We Evaluate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Agent evaluation goes beyond just "did it work?" We look at the quality of the agent's reasoning, 
                decision-making process, and ability to handle unexpected situations.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                <div className="p-3 border border-border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-primary mb-2" />
                  <h5 className="mb-1">Task Completion</h5>
                  <p className="text-sm text-muted-foreground">Did it actually accomplish what was asked?</p>
                </div>
                <div className="p-3 border border-border rounded-lg">
                  <Users className="h-5 w-5 text-primary mb-2" />
                  <h5 className="mb-1">Role Adherence</h5>
                  <p className="text-sm text-muted-foreground">Did it stay within its defined role and constraints?</p>
                </div>
                <div className="p-3 border border-border rounded-lg">
                  <Target className="h-5 w-5 text-primary mb-2" />
                  <h5 className="mb-1">Efficiency</h5>
                  <p className="text-sm text-muted-foreground">Did it take a reasonable path to the solution?</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Agent-Specific Challenges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Agents fail in unique and spectacular ways. Here's what we specifically look for in agent evaluation:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-3">
                  <h5>🤖 Reasoning Quality</h5>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Does it break down complex tasks logically?</li>
                    <li>• Can it adapt when initial approaches don't work?</li>
                    <li>• Does it use tools appropriately?</li>
                    <li>• Can it handle ambiguous or incomplete instructions?</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h5>🛡️ Safety & Constraints</h5>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Does it respect boundaries and limitations?</li>
                    <li>• Can it gracefully handle errors?</li>
                    <li>• Does it ask for clarification when needed?</li>
                    <li>• Does it avoid potentially harmful actions?</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (selectedOption === "reports") {
      if (viewingReport && selectedReport) {
        // Show detailed report view
        const getDetailedReport = (reportId: string) => {
          return {
            overview: {
              totalEvaluations: 250,
              totalTokens: 150000,
              averageScore: selectedReport.score || 0,
              duration: "2h 34m",
              completedAt: selectedReport.completed || selectedReport.created,
              topCriteria: "Correctness",
              recommendations: [
                "Consider fine-tuning for better politeness scores",
                "Add more context to improve relevance", 
                "Review training data for edge cases"
              ]
            },
            criteriaScores: selectedReport.criteria.map((criteria, index) => {
              const scores = [92, 85, 84, 89, 78];
              return {
                name: criteria,
                score: scores[index] || 80,
                description: getCriteriaDescription(criteria)
              };
            }),
            sampleEvaluations: [
              {
                input: selectedReport.type === "chatbot" ? "What's your return policy?" : 
                       selectedReport.type === "rag" ? "How does photosynthesis work?" :
                       "Book a flight from NYC to LA",
                output: selectedReport.type === "chatbot" 
                  ? "Our return policy allows for 30-day returns on most items. You can find the full details on our website."
                  : selectedReport.type === "rag"
                  ? "Photosynthesis converts light energy into chemical energy through chloroplasts in plant cells."
                  : "Flight booked successfully for $299 on Delta Airlines departing 8:30 AM.",
                score: 95,
                feedback: "Accurate and helpful response with clear direction for more information."
              },
              {
                input: selectedReport.type === "chatbot" ? "Can you help me with a refund?" :
                       selectedReport.type === "rag" ? "What is quantum computing?" :
                       "Cancel my hotel reservation",
                output: selectedReport.type === "chatbot"
                  ? "I'd be happy to help you with your refund! Can you please provide your order number?"
                  : selectedReport.type === "rag"
                  ? "Quantum computing uses quantum mechanics principles to process information differently than classical computers."
                  : "Hotel reservation cancelled successfully. Confirmation number: ABC123.",
                score: 88,
                feedback: "Polite and helpful, properly asks for necessary information."
              },
              {
                input: selectedReport.type === "chatbot" ? "Your service is terrible!" :
                       selectedReport.type === "rag" ? "Explain machine learning" :
                       "Find the cheapest restaurant nearby",
                output: selectedReport.type === "chatbot"
                  ? "I'm sorry to hear you've had a negative experience. Let me help make this right for you."
                  : selectedReport.type === "rag"
                  ? "Machine learning is a subset of AI that enables computers to learn and improve from experience."
                  : "Found 3 budget-friendly restaurants within 0.5 miles. Joe's Pizza is the most affordable at $8 average.",
                score: 91,
                feedback: "Professional response to negative feedback, shows empathy and willingness to help."
              }
            ]
          };
        };

        const getCriteriaDescription = (criteria: string) => {
          const descriptions: { [key: string]: string } = {
            "Correctness": "Accuracy and factual correctness of responses",
            "Politeness": "Respectful and courteous communication style", 
            "Relevance": "How well responses address the user's query",
            "Faithfulness": "Adherence to provided context and source material",
            "Role Adherence": "Consistency with assigned role or persona",
            "Persuasiveness": "Ability to influence and convince users effectively"
          };
          return descriptions[criteria] || "Custom evaluation criteria";
        };

        const reportData = getDetailedReport(selectedReport.id);
        const TypeIcon = getTypeIcon(selectedReport.type);

        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeReportDetails}
                  className="mb-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Reports
                </Button>
                <div className="flex items-center gap-3 mb-4">
                  <TypeIcon className="h-6 w-6 text-primary" />
                  <h1>{selectedReport.name}</h1>
                </div>
                <p className="text-muted-foreground">
                  Comprehensive evaluation results and performance insights
                </p>
              </div>
              <Badge variant={getStatusColor(selectedReport.status)} className="capitalize text-sm px-3 py-1">
                {selectedReport.status}
              </Badge>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <BarChart3 className="h-10 w-10 text-primary mx-auto mb-3" />
                  <p className="text-3xl font-semibold mb-1">{selectedReport.score || 0}</p>
                  <p className="text-muted-foreground">Overall Score</p>
                </CardContent>
              </Card>
              <Card className="bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <FileText className="h-10 w-10 text-blue-600 mx-auto mb-3" />
                  <p className="text-3xl font-semibold mb-1">{reportData.overview.totalEvaluations}</p>
                  <p className="text-muted-foreground">Total Evaluations</p>
                </CardContent>
              </Card>
              <Card className="bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <Brain className="h-10 w-10 text-green-600 mx-auto mb-3" />
                  <p className="text-3xl font-semibold mb-1">{(reportData.overview.totalTokens / 1000).toFixed(0)}K</p>
                  <p className="text-muted-foreground">Total Tokens</p>
                </CardContent>
              </Card>
              <Card className="bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <Clock className="h-10 w-10 text-orange-600 mx-auto mb-3" />
                  <p className="text-3xl font-semibold mb-1">{reportData.overview.duration}</p>
                  <p className="text-muted-foreground">Duration</p>
                </CardContent>
              </Card>
            </div>

            {/* Report Summary */}
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Evaluation Summary</CardTitle>
                <CardDescription>
                  Key details about this evaluation run
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <h4 className="mb-2">Model Information</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p><span className="font-medium">Model:</span> {selectedReport.modelName}</p>
                      <p><span className="font-medium">Provider:</span> {selectedReport.modelProvider}</p>
                      <p><span className="font-medium">Type:</span> {selectedReport.type.toUpperCase()}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-2">Dataset Information</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p><span className="font-medium">Dataset:</span> {selectedReport.dataset}</p>
                      <p><span className="font-medium">Evaluations:</span> {reportData.overview.totalEvaluations}</p>
                      <p><span className="font-medium">Tokens:</span> {reportData.overview.totalTokens.toLocaleString()}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-2">Execution Details</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p><span className="font-medium">Started:</span> {selectedReport.created}</p>
                      <p><span className="font-medium">Completed:</span> {reportData.overview.completedAt}</p>
                      <p><span className="font-medium">Total Cost:</span> ${selectedReport.cost.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Criteria Performance */}
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Criteria Performance</CardTitle>
                <CardDescription>
                  Detailed breakdown of scores across all evaluation criteria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {reportData.criteriaScores.map((criteria, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{criteria.name}</h4>
                          <p className="text-sm text-muted-foreground">{criteria.description}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-semibold">{criteria.score}</span>
                          <span className="text-muted-foreground">/100</span>
                        </div>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-3">
                        <div 
                          className="bg-primary h-3 rounded-full transition-all duration-500"
                          style={{ width: `${criteria.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sample Evaluations */}
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Sample Evaluations</CardTitle>
                <CardDescription>
                  Representative examples showing how your model performed on specific inputs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {reportData.sampleEvaluations.map((sample, index) => (
                    <div key={index} className="border border-border rounded-lg p-6">
                      <div className="space-y-4">
                        <div>
                          <p className="font-medium text-muted-foreground mb-2">Input:</p>
                          <p className="bg-secondary/30 p-3 rounded-md">{sample.input}</p>
                        </div>
                        <div>
                          <p className="font-medium text-muted-foreground mb-2">Output:</p>
                          <p className="bg-secondary/30 p-3 rounded-md">{sample.output}</p>
                        </div>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-muted-foreground mb-2">Evaluation Feedback:</p>
                            <p className="text-sm">{sample.feedback}</p>
                          </div>
                          <Badge variant="outline" className="ml-4 text-base px-3 py-1">
                            {sample.score}/100
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>AI-Generated Recommendations</CardTitle>
                <CardDescription>
                  Actionable suggestions to improve your model's performance based on evaluation results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.overview.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-secondary/20 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <p>{rec}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      }

      // Show reports list
      return (
        <div className="space-y-8">
          <div>
            <h1 className="mb-4">Evaluation Reports</h1>
            <p className="text-muted-foreground">
              All your evaluation reports in one place (finally, some organization in this chaos)
            </p>
          </div>
          
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Your Evaluation History</CardTitle>
              <CardDescription>
                Click on any report to view detailed results and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No reports found</p>
                  <p className="text-muted-foreground">Run some evaluations to see reports here</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Dataset</TableHead>
                      <TableHead>Criteria</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => {
                      const TypeIcon = getTypeIcon(report.type);
                      return (
                        <TableRow 
                          key={report.id} 
                          className="cursor-pointer hover:bg-secondary/50"
                          onClick={() => openReportDetails(report)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <TypeIcon className="h-4 w-4 text-primary" />
                              <div>
                                <p className="font-medium">{report.name}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {report.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Brain className="h-3 w-3 text-primary" />
                              <div>
                                <p className="font-medium text-sm">{report.modelName}</p>
                                <p className="text-muted-foreground text-xs">{report.modelProvider}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{report.dataset}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {report.criteria.slice(0, 2).join(", ")}
                              {report.criteria.length > 2 && ` +${report.criteria.length - 2} more`}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(report.status)} className="capitalize">
                              {report.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {report.score !== null ? (
                              <div className="flex items-center gap-1">
                                <span className="font-medium">{report.score}</span>
                                <span className="text-muted-foreground text-sm">/100</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">${report.cost.toFixed(2)}</TableCell>
                          <TableCell className="text-sm">{report.created}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return null;
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
            <h3 className="mb-6 text-sidebar-foreground">Evaluate</h3>
            <nav className="space-y-2">
              {evaluateOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      setSelectedOption(option.id);
                      setConfigurationStep("overview");
                    }}
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
        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-4xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}