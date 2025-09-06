import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Progress } from "./ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { ArrowLeft, Settings, Zap, FileText, Upload, CheckCircle, Target, Users, Clock, DollarSign, Brain, BarChart3, TrendingUp, Play, Pause, Square, ChevronDown, ChevronUp } from "lucide-react";
import skeletonLogo from "figma:asset/da095a0d21754e713136cd74afea19dfc8b375eb.png";

interface TunePageProps {
  onBack: () => void;
}

type ConfigurationStep = "overview" | "data" | "model" | "config" | "preview" | "complete" | "status";

interface TrainingRun {
  id: string;
  name: string;
  type: "sft" | "dpo";
  baseModel: string;
  dataset: string;
  status: "completed" | "running" | "failed" | "queued";
  progress: number;
  accuracy: number | null;
  loss: number | null;
  cost: number;
  created: string;
  completed: string | null;
  duration: string | null;
}

interface BaseModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  costPerHour: number;
}

interface TrainingConfig {
  fineTuneName: string;
  baseModel: BaseModel | null;
  nEpochs: number;
  nCheckpoints: number;
  learningRate: number;
  batchSize: string;
  lora: boolean;
  trainOnInputs: string;
}

export function TunePage({ onBack }: TunePageProps) {
  const [selectedOption, setSelectedOption] = useState<string>("sft"); // Default to SFT
  const [configurationStep, setConfigurationStep] = useState<ConfigurationStep>("overview");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedRun, setSelectedRun] = useState<TrainingRun | null>(null);
  const [isRunDialogOpen, setIsRunDialogOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [trainingConfig, setTrainingConfig] = useState<TrainingConfig>({
    fineTuneName: "",
    baseModel: null,
    nEpochs: 3,
    nCheckpoints: 1,
    learningRate: 5e-5,
    batchSize: "max",
    lora: true,
    trainOnInputs: "auto"
  });
  const [jobProgress, setJobProgress] = useState(0);
  const [jobStatus, setJobStatus] = useState<string>("Finding GPUs...");

  // Handle progress simulation for training status
  useEffect(() => {
    if (configurationStep !== "status") return;

    const interval = setInterval(() => {
      setJobProgress(prev => {
        if (prev >= 100) {
          setConfigurationStep("complete");
          return 100;
        }
        const increment = Math.random() * 3;
        const newProgress = Math.min(prev + increment, 100);
        
        // Update status messages based on progress
        if (newProgress < 10) {
          setJobStatus("Finding GPUs...");
        } else if (newProgress < 25) {
          setJobStatus("Initializing training environment...");
        } else if (newProgress < 40) {
          setJobStatus("Loading base model...");
        } else if (newProgress < 60) {
          setJobStatus("Processing training data...");
        } else if (newProgress < 90) {
          setJobStatus("Training in progress...");
        } else {
          setJobStatus("Finalizing model...");
        }
        
        return newProgress;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [configurationStep]);

  const tuneOptions = [
    {
      id: "sft",
      title: "SFT",
      description: "Supervised Fine-Tuning: Teaching your model to behave like your data",
      icon: Settings
    },
    {
      id: "dpo",
      title: "DPO", 
      description: "Direct Preference Optimization: Making your model less awful at choices",
      icon: Zap
    },
    {
      id: "runs",
      title: "Runs",
      description: "See how your training attempts went (spoiler: probably not great at first)",
      icon: FileText
    }
  ];

  // Mock data for training runs
  const trainingRuns: TrainingRun[] = [
    {
      id: "1",
      name: "Customer Service Bot Fine-tune",
      type: "sft",
      baseModel: "Llama 3.1 8B",
      dataset: "customer_conversations.jsonl",
      status: "completed",
      progress: 100,
      accuracy: 87.3,
      loss: 0.23,
      cost: 12.50,
      created: "2024-08-25",
      completed: "2024-08-25",
      duration: "2h 34m"
    },
    {
      id: "2",
      name: "Code Assistant SFT",
      type: "sft", 
      baseModel: "CodeLlama 7B",
      dataset: "code_examples.jsonl",
      status: "completed",
      progress: 100,
      accuracy: 92.1,
      loss: 0.18,
      cost: 8.75,
      created: "2024-08-24",
      completed: "2024-08-24",
      duration: "1h 47m"
    },
    {
      id: "3",
      name: "Preference Optimization Run",
      type: "dpo",
      baseModel: "Llama 3.1 8B",
      dataset: "preference_pairs.jsonl",
      status: "running",
      progress: 67,
      accuracy: null,
      loss: 0.31,
      cost: 5.20,
      created: "2024-08-29",
      completed: null,
      duration: null
    },
    {
      id: "4",
      name: "Writing Assistant DPO",
      type: "dpo",
      baseModel: "Mistral 7B",
      dataset: "writing_preferences.jsonl", 
      status: "failed",
      progress: 23,
      accuracy: null,
      loss: null,
      cost: 2.10,
      created: "2024-08-28",
      completed: null,
      duration: null
    },
    {
      id: "5",
      name: "Q&A Bot Fine-tune",
      type: "sft",
      baseModel: "Llama 3.1 8B",
      dataset: "qa_dataset.jsonl",
      status: "queued",
      progress: 0,
      accuracy: null,
      loss: null,
      cost: 0.00,
      created: "2024-08-30",
      completed: null,
      duration: null
    }
  ];

  // Available base models
  const baseModels: BaseModel[] = [
    {
      id: "llama-3.1-8b",
      name: "Llama 3.1 8B",
      provider: "Meta",
      description: "Open-source model, great for general tasks",
      costPerHour: 1.20
    },
    {
      id: "llama-3.1-70b", 
      name: "Llama 3.1 70B",
      provider: "Meta",
      description: "Larger model with better performance",
      costPerHour: 4.50
    },
    {
      id: "gpt-4o-mini",
      name: "GPT-4o Mini",
      provider: "OpenAI", 
      description: "Fast and efficient for most tasks",
      costPerHour: 2.00
    },
    {
      id: "claude-3-haiku",
      name: "Claude 3 Haiku",
      provider: "Anthropic",
      description: "Fast and lightweight model",
      costPerHour: 1.80
    },
    {
      id: "codellama-7b",
      name: "CodeLlama 7B", 
      provider: "Meta",
      description: "Specialized for code generation",
      costPerHour: 1.00
    }
  ];

  const startConfiguration = (optionId: string) => {
    setSelectedOption(optionId);
    setConfigurationStep("data");
  };

  const resetConfiguration = () => {
    setConfigurationStep("overview");
    setUploadedFile(null);
    setTrainingConfig({
      fineTuneName: "",
      baseModel: null,
      nEpochs: 3,
      nCheckpoints: 1,
      learningRate: 5e-5,
      batchSize: "max",
      lora: true,
      trainOnInputs: "auto"
    });
    setJobProgress(0);
    setJobStatus("Finding GPUs...");
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "sft": return Settings;
      case "dpo": return Zap;
      default: return FileText;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "running": return "secondary";
      case "failed": return "destructive";
      case "queued": return "outline";
      default: return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return CheckCircle;
      case "running": return Play;
      case "failed": return Square;
      case "queued": return Pause;
      default: return Clock;
    }
  };

  const openRunDetails = (run: TrainingRun) => {
    setSelectedRun(run);
    setIsRunDialogOpen(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const renderContent = () => {
    if (configurationStep !== "overview") {
      // Show configuration flow
      const option = tuneOptions.find(opt => opt.id === selectedOption);
      if (!option) return null;

      // Data Upload Step
      if (configurationStep === "data") {
        return (
          <div>
            <div className="mb-8">
              <h1 className="mb-4">Step 1: Upload Training Data</h1>
              <p className="text-muted-foreground">
                Upload your training data so we can make your model less terrible
              </p>
            </div>
            
            <Card className="bg-card/80 backdrop-blur-sm mb-6">
              <CardHeader>
                <CardTitle>Upload {option.title} Dataset</CardTitle>
                <CardDescription>
                  {selectedOption === "sft" 
                    ? "Upload a JSONL file with input-output pairs for supervised fine-tuning"
                    : "Upload a JSONL file with preference pairs for direct preference optimization"
                  }
                </CardDescription>
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
                      accept=".jsonl"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <p className="text-muted-foreground">
                      Accepted formats: .jsonl
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
                    onClick={resetConfiguration}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => setConfigurationStep("model")}
                    disabled={!uploadedFile}
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
              <h1 className="mb-4">Step 2: Select Base Model & Name</h1>
              <p className="text-muted-foreground">
                Choose a base model to fine-tune and give your creation a name (be creative, or don't)
              </p>
            </div>
            
            <Card className="bg-card/80 backdrop-blur-sm mb-6">
              <CardHeader>
                <CardTitle>Fine-Tune Configuration</CardTitle>
                <CardDescription>
                  Select your base model and configure basic settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="finetune-name" className="text-base">Fine-Tune Name</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Give your fine-tuned model a memorable name
                  </p>
                  <Input
                    id="finetune-name"
                    placeholder="e.g., Customer Service Bot v2, Code Assistant Pro"
                    value={trainingConfig.fineTuneName}
                    onChange={(e) => setTrainingConfig(prev => ({ ...prev, fineTuneName: e.target.value }))}
                  />
                </div>

                <div>
                  <Label className="text-base">Base Model</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Choose the foundation model to fine-tune
                  </p>
                  <div className="space-y-3">
                    {baseModels.map((model) => (
                      <div
                        key={model.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          trainingConfig.baseModel?.id === model.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setTrainingConfig(prev => ({ ...prev, baseModel: model }))}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Brain className="h-5 w-5 text-primary" />
                            <div>
                              <h4 className="font-medium">{model.name}</h4>
                              <p className="text-sm text-muted-foreground">{model.provider} • ${model.costPerHour.toFixed(2)}/hour</p>
                            </div>
                          </div>
                          {trainingConfig.baseModel?.id === model.id && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 ml-8">{model.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setConfigurationStep("data")}
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={() => setConfigurationStep("config")}
                    disabled={!trainingConfig.fineTuneName || !trainingConfig.baseModel}
                  >
                    Next: Advanced Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      }

      // Configuration Step
      if (configurationStep === "config") {
        return (
          <div>
            <div className="mb-8">
              <h1 className="mb-4">Step 3: Training Configuration</h1>
              <p className="text-muted-foreground">
                Fine-tune the fine-tuning (meta, we know). Most defaults work well, but feel free to tweak.
              </p>
            </div>
            
            <Card className="bg-card/80 backdrop-blur-sm mb-6">
              <CardHeader>
                <CardTitle>Training Parameters</CardTitle>
                <CardDescription>
                  Configure how your model will be trained
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      Advanced Configuration
                      {isAdvancedOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="n-epochs">Number of Epochs</Label>
                        <p className="text-sm text-muted-foreground mb-2">
                          How many times the model sees the entire dataset
                        </p>
                        <Input
                          id="n-epochs"
                          type="number"
                          min="1"
                          max="20"
                          value={trainingConfig.nEpochs}
                          onChange={(e) => setTrainingConfig(prev => ({ ...prev, nEpochs: parseInt(e.target.value) || 3 }))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="n-checkpoints">Number of Checkpoints</Label>
                        <p className="text-sm text-muted-foreground mb-2">
                          Checkpoints saved during training (for resuming or rollback)
                        </p>
                        <Input
                          id="n-checkpoints"
                          type="number"
                          min="1"
                          max="10"
                          value={trainingConfig.nCheckpoints}
                          onChange={(e) => setTrainingConfig(prev => ({ ...prev, nCheckpoints: parseInt(e.target.value) || 1 }))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="learning-rate">Learning Rate</Label>
                        <p className="text-sm text-muted-foreground mb-2">
                          Controls how much model weights are updated
                        </p>
                        <Select
                          value={trainingConfig.learningRate.toString()}
                          onValueChange={(value) => setTrainingConfig(prev => ({ ...prev, learningRate: parseFloat(value) }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1e-6">1e-6 (Very Conservative)</SelectItem>
                            <SelectItem value="5e-6">5e-6 (Conservative)</SelectItem>
                            <SelectItem value="1e-5">1e-5 (Moderate)</SelectItem>
                            <SelectItem value="5e-5">5e-5 (Standard)</SelectItem>
                            <SelectItem value="1e-4">1e-4 (Aggressive)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="batch-size">Batch Size</Label>
                        <p className="text-sm text-muted-foreground mb-2">
                          Number of examples processed per iteration
                        </p>
                        <Select
                          value={trainingConfig.batchSize}
                          onValueChange={(value) => setTrainingConfig(prev => ({ ...prev, batchSize: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                            <SelectItem value="8">8</SelectItem>
                            <SelectItem value="16">16</SelectItem>
                            <SelectItem value="max">Max (Auto)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="lora">LoRA Fine-tuning</Label>
                            <p className="text-sm text-muted-foreground">
                              Use Low-Rank Adaptation (faster, cheaper)
                            </p>
                          </div>
                          <Switch
                            id="lora"
                            checked={trainingConfig.lora}
                            onCheckedChange={(checked) => setTrainingConfig(prev => ({ ...prev, lora: checked }))}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="train-on-inputs">Train on Inputs</Label>
                        <p className="text-sm text-muted-foreground mb-2">
                          Whether to include user messages in training loss
                        </p>
                        <Select
                          value={trainingConfig.trainOnInputs}
                          onValueChange={(value) => setTrainingConfig(prev => ({ ...prev, trainOnInputs: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto">Auto (Recommended)</SelectItem>
                            <SelectItem value="true">True</SelectItem>
                            <SelectItem value="false">False</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <div className="p-4 bg-secondary/30 rounded-lg">
                  <h4 className="mb-2">Quick Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><span className="font-medium">Base Model:</span> {trainingConfig.baseModel?.name}</p>
                      <p><span className="font-medium">Training Type:</span> {trainingConfig.lora ? "LoRA" : "Full Fine-tune"}</p>
                      <p><span className="font-medium">Epochs:</span> {trainingConfig.nEpochs}</p>
                    </div>
                    <div>
                      <p><span className="font-medium">Learning Rate:</span> {trainingConfig.learningRate}</p>
                      <p><span className="font-medium">Batch Size:</span> {trainingConfig.batchSize}</p>
                      <p><span className="font-medium">Checkpoints:</span> {trainingConfig.nCheckpoints}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setConfigurationStep("model")}
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={() => setConfigurationStep("preview")}
                  >
                    Next: Review & Launch
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      }

      // Preview Step
      if (configurationStep === "preview") {
        const estimatedDuration = trainingConfig.nEpochs * 45; // minutes
        const estimatedCost = trainingConfig.baseModel ? trainingConfig.baseModel.costPerHour * (estimatedDuration / 60) : 0;

        return (
          <div>
            <div className="mb-8">
              <h1 className="mb-4">Step 4: Review & Launch</h1>
              <p className="text-muted-foreground">
                Last chance to make sure we're not about to train your model into digital nonsense
              </p>
            </div>
            
            <div className="space-y-6">
              <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Training Summary</CardTitle>
                  <CardDescription>Review your configuration before starting training</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="mb-3">Dataset & Model</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Fine-tune Name:</span> {trainingConfig.fineTuneName}</p>
                        <p><span className="font-medium">Base Model:</span> {trainingConfig.baseModel?.name}</p>
                        <p><span className="font-medium">Provider:</span> {trainingConfig.baseModel?.provider}</p>
                        <p><span className="font-medium">Dataset:</span> {uploadedFile?.name}</p>
                        <p><span className="font-medium">File Size:</span> {uploadedFile ? `${(uploadedFile.size / 1024).toFixed(1)} KB` : 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="mb-3">Training Parameters</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Training Type:</span> {trainingConfig.lora ? "LoRA Fine-tuning" : "Full Fine-tuning"}</p>
                        <p><span className="font-medium">Epochs:</span> {trainingConfig.nEpochs}</p>
                        <p><span className="font-medium">Learning Rate:</span> {trainingConfig.learningRate}</p>
                        <p><span className="font-medium">Batch Size:</span> {trainingConfig.batchSize}</p>
                        <p><span className="font-medium">Checkpoints:</span> {trainingConfig.nCheckpoints}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t">
                    <div className="text-center">
                      <h4 className="mb-2">Estimated Duration</h4>
                      <p className="text-2xl font-semibold">{Math.round(estimatedDuration)} min</p>
                      <p className="text-sm text-muted-foreground">Typical completion time</p>
                    </div>
                    
                    <div className="text-center">
                      <h4 className="mb-2">Estimated Cost</h4>
                      <p className="text-2xl font-semibold">${estimatedCost.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">Based on {trainingConfig.baseModel?.costPerHour.toFixed(2)}/hour</p>
                    </div>

                    <div className="text-center">
                      <h4 className="mb-2">GPU Type</h4>
                      <p className="text-2xl font-semibold">A100</p>
                      <p className="text-sm text-muted-foreground">High-performance GPU</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setConfigurationStep("config")}
                >
                  Back
                </Button>
                <Button 
                  onClick={() => setConfigurationStep("status")}
                  className="flex-1"
                >
                  Start Training Job
                </Button>
              </div>
            </div>
          </div>
        );
      }

      // Status/Progress Step
      if (configurationStep === "status") {
        return (
          <div>
            <div className="mb-8 text-center">
              <Settings className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
              <h1 className="mb-4">Training in Progress</h1>
              <p className="text-muted-foreground">
                Your fine-tuning job is running. Time to grab some coffee (or several).
              </p>
            </div>
            
            <Card className="bg-card/80 backdrop-blur-sm mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Brain className="h-5 w-5 text-primary" />
                  {trainingConfig.fineTuneName}
                </CardTitle>
                <CardDescription>
                  Fine-tuning {trainingConfig.baseModel?.name} with your dataset
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">{Math.round(jobProgress)}%</span>
                  </div>
                  <Progress value={jobProgress} className="h-3" />
                  <p className="text-sm text-muted-foreground mt-2">{jobStatus}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-secondary/30 rounded-lg">
                    <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Elapsed Time</p>
                    <p className="text-lg font-semibold">12m 34s</p>
                  </div>
                  <div className="text-center p-4 bg-secondary/30 rounded-lg">
                    <Target className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Current Loss</p>
                    <p className="text-lg font-semibold">0.347</p>
                  </div>
                  <div className="text-center p-4 bg-secondary/30 rounded-lg">
                    <DollarSign className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Cost So Far</p>
                    <p className="text-lg font-semibold">$2.45</p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    💡 <strong>Pro tip:</strong> Training typically takes 30-90 minutes depending on your dataset size and model. 
                    We'll send you an email when it's complete, so feel free to do something else.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedOption("runs");
                  resetConfiguration();
                }}
                className="flex-1"
              >
                View Training Runs
              </Button>
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
              <h1 className="mb-4">Training Complete!</h1>
              <p className="text-muted-foreground">
                Your model is trained and ready to deploy. Hopefully it learned something useful.
              </p>
            </div>
            
            <Card className="bg-card/80 backdrop-blur-sm mb-6">
              <CardHeader>
                <CardTitle>Training Results</CardTitle>
                <CardDescription>
                  Summary of your completed fine-tuning job
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-semibold">89.3%</p>
                    <p className="text-muted-foreground text-sm">Final Accuracy</p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-semibold">0.234</p>
                    <p className="text-muted-foreground text-sm">Final Loss</p>
                  </div>
                  <div className="text-center">
                    <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-semibold">47m</p>
                    <p className="text-muted-foreground text-sm">Total Time</p>
                  </div>
                  <div className="text-center">
                    <DollarSign className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-semibold">$8.45</p>
                    <p className="text-muted-foreground text-sm">Total Cost</p>
                  </div>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="text-green-800 mb-2">What's Next?</h4>
                  <ul className="text-green-700 text-sm space-y-1">
                    <li>• Your model is now available for deployment in the Deploy section</li>
                    <li>• Test it first with our built-in evaluation tools</li>
                    <li>• Check the training metrics in the Runs section</li>
                    <li>• Deploy it to production when you're satisfied</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={resetConfiguration}
                className="flex-1"
              >
                Start Another Training
              </Button>
              <Button 
                onClick={() => {
                  setSelectedOption("runs");
                  resetConfiguration();
                }}
                className="flex-1"
              >
                View Training Details
              </Button>
            </div>
          </div>
        );
      }

      return null;
    }

    // Show informational content based on selected option
    if (selectedOption === "sft") {
      return (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-4">Supervised Fine-Tuning (SFT)</h1>
              <p className="text-muted-foreground">
                Teaching your model to behave like your data (finally, some discipline)
              </p>
            </div>
            <Button onClick={() => startConfiguration("sft")} size="lg">
              Get Started
            </Button>
          </div>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>What is SFT?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Supervised Fine-Tuning (SFT) is the process of taking a pre-trained language model and teaching it to 
                perform specific tasks by training it on your custom dataset of input-output examples. Think of it as 
                giving your model a masterclass in exactly how you want it to behave.
              </p>
              <p>
                Unlike prompt engineering (which is basically just asking nicely), SFT actually modifies the model's 
                parameters to learn your specific patterns, tone, and domain knowledge. It's the difference between 
                hiring a consultant who kinda knows what you want versus training an employee who actually gets it.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>When to Use SFT</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                SFT is your go-to solution when you need consistent, domain-specific behavior that prompting alone can't achieve. 
                Here's when it actually makes sense:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <h4 className="mb-2">Perfect For</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Consistent tone and style across responses</li>
                    <li>• Domain-specific knowledge and terminology</li>
                    <li>• Following complex, multi-step procedures</li>
                    <li>• Outputting structured data formats</li>
                    <li>• Brand-specific voice and personality</li>
                  </ul>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <h4 className="mb-2">Skip If</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• You just need better prompts</li>
                    <li>• Your task changes frequently</li>
                    <li>• You have less than 100 quality examples</li>
                    <li>• Simple RAG would solve your problem</li>
                    <li>• You're just trying to make GPT say "banana" more</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>What Data Do You Need?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                SFT requires high-quality input-output pairs that represent exactly how you want your model to behave. 
                Quality beats quantity every time—better to have 500 perfect examples than 5,000 mediocre ones.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <h4 className="mb-2">Data Format</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• JSONL file with "input" and "output" fields</li>
                    <li>• Each line = one training example</li>
                    <li>• Consistent formatting throughout</li>
                    <li>• UTF-8 encoding (obviously)</li>
                  </ul>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <h4 className="mb-2">Quality Guidelines</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• 100-10,000 examples (sweet spot: 500-2,000)</li>
                    <li>• Representative of actual use cases</li>
                    <li>• Diverse inputs covering edge cases</li>
                    <li>• Consistent, high-quality outputs</li>
                  </ul>
                </div>
              </div>
              
              <div className="p-4 bg-secondary/50 rounded-lg">
                <h4 className="mb-2">Example Format</h4>
                <pre className="text-sm text-muted-foreground bg-background p-2 rounded">
{`{"input": "How do I return a product?", "output": "I'd be happy to help you with your return! To process a return, please provide your order number and the reason for return. Returns are accepted within 30 days of purchase for most items."}
{"input": "What's your shipping policy?", "output": "We offer free standard shipping on orders over $50, which takes 3-5 business days. Express shipping is available for $9.99 and takes 1-2 business days."}`}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>What You'll Get</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                After SFT, you'll have a model that consistently produces responses in your desired style and format, 
                without the need for complex prompting or constant babysitting.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <h5>🎯 Consistent Performance</h5>
                  <p className="text-sm text-muted-foreground">Your model will follow your patterns reliably, not just when it feels like it</p>
                </div>
                <div className="space-y-2">
                  <h5>⚡ Improved Efficiency</h5>
                  <p className="text-sm text-muted-foreground">Shorter prompts, better responses, less prompt engineering headaches</p>
                </div>
                <div className="space-y-2">
                  <h5>🏢 Domain Expertise</h5>
                  <p className="text-sm text-muted-foreground">Deep understanding of your specific use case and terminology</p>
                </div>
                <div className="space-y-2">
                  <h5>💰 Cost Reduction</h5>
                  <p className="text-sm text-muted-foreground">Smaller models fine-tuned often outperform larger ones with prompting</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Common Pitfalls to Avoid</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h5>❌ Don't Do This</h5>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Use the same few examples over and over</li>
                    <li>• Mix completely different tasks in one dataset</li>
                    <li>• Include low-quality or inconsistent outputs</li>
                    <li>• Forget to validate your data format</li>
                    <li>• Expect miracles from 50 examples</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h5>✅ Do This Instead</h5>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Create diverse, representative examples</li>
                    <li>• Focus on one specific task or domain</li>
                    <li>• Review and clean your data thoroughly</li>
                    <li>• Test with a small batch first</li>
                    <li>• Start simple, then add complexity</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (selectedOption === "dpo") {
      return (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-4">Direct Preference Optimization (DPO)</h1>
              <p className="text-muted-foreground">
                Making your model less awful at choices (it's harder than it sounds)
              </p>
            </div>
            <Button onClick={() => startConfiguration("dpo")} size="lg">
              Get Started
            </Button>
          </div>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>What is DPO?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Direct Preference Optimization (DPO) is a method for training language models to align better with human 
                preferences. Instead of just learning from examples, DPO learns from comparisons—showing the model pairs 
                of responses and teaching it which one is better.
              </p>
              <p>
                Think of it as teaching your model good taste. While SFT teaches "how to respond," DPO teaches "which 
                response is better." It's particularly powerful for subjective tasks where there isn't one "correct" 
                answer, but there are definitely better and worse options.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>When to Use DPO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                DPO shines when you need to optimize for subjective preferences, quality, or alignment rather than 
                just task completion. Use it when "good enough" isn't good enough.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <h4 className="mb-2">Perfect For</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Improving response quality and helpfulness</li>
                    <li>• Reducing harmful or inappropriate outputs</li>
                    <li>• Fine-tuning tone and personality</li>
                    <li>• Optimizing for user satisfaction</li>
                    <li>• Creative tasks with subjective evaluation</li>
                  </ul>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <h4 className="mb-2">Skip If</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• You need factual accuracy over preferences</li>
                    <li>• Your task has clear right/wrong answers</li>
                    <li>• You don't have preference pair data</li>
                    <li>• Standard SFT already works well</li>
                    <li>• You can't define what "better" means</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>What Data Do You Need?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                DPO requires preference pairs: sets of responses to the same input where one is clearly better than 
                the other. This is more complex than SFT data but incredibly powerful when done right.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <h4 className="mb-2">Data Format</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• JSONL with "prompt", "chosen", "rejected" fields</li>
                    <li>• Each line = one preference comparison</li>
                    <li>• Clear quality difference between responses</li>
                    <li>• Consistent criteria for "better"</li>
                  </ul>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <h4 className="mb-2">Quality Guidelines</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• 500-5,000 high-quality pairs</li>
                    <li>• Diverse prompts covering your use cases</li>
                    <li>• Clear preference rationale</li>
                    <li>• Balanced dataset (not all obvious choices)</li>
                  </ul>
                </div>
              </div>
              
              <div className="p-4 bg-secondary/50 rounded-lg">
                <h4 className="mb-2">Example Format</h4>
                <pre className="text-sm text-muted-foreground bg-background p-2 rounded">
{`{"prompt": "Write a professional email declining a meeting.", "chosen": "Thank you for the meeting invitation. Unfortunately, I have a scheduling conflict and won't be able to attend. Could we reschedule for next week?", "rejected": "Can't make it. Busy."}
{"prompt": "Explain quantum computing simply.", "chosen": "Quantum computing uses quantum mechanics principles to process information differently than classical computers, potentially solving certain problems much faster.", "rejected": "Quantum computers are like regular computers but with quantum stuff that makes them faster somehow."}`}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>DPO vs SFT: When to Use What</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Both techniques have their place, and sometimes you'll use them together. Here's how to choose:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-3 border border-border rounded-lg">
                  <Settings className="h-5 w-5 text-primary mb-2" />
                  <h5 className="mb-1">Use SFT When</h5>
                  <p className="text-sm text-muted-foreground">You need to teach new tasks, formats, or domain knowledge. It's about capability.</p>
                </div>
                <div className="p-3 border border-border rounded-lg">
                  <Zap className="h-5 w-5 text-primary mb-2" />
                  <h5 className="mb-1">Use DPO When</h5>
                  <p className="text-sm text-muted-foreground">You need to improve quality, alignment, or subjective preferences. It's about refinement.</p>
                </div>
              </div>
              
              <div className="p-4 bg-secondary/30 rounded-lg">
                <h4 className="mb-2">Pro Tip: Sequential Training</h4>
                <p className="text-sm text-muted-foreground">
                  Often the best approach is SFT first (to teach the task), then DPO (to refine the quality). 
                  Think of SFT as teaching someone to write, and DPO as teaching them to write well.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Creating Good Preference Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The hardest part of DPO isn't the training—it's creating high-quality preference pairs. Here's how to do it right:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-3">
                  <h5>📝 Data Collection Strategies</h5>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Generate multiple responses, rank them manually</li>
                    <li>• Use human annotators to compare responses</li>
                    <li>• Collect user feedback on existing outputs</li>
                    <li>• Create synthetic examples with clear quality differences</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h5>✅ Quality Checks</h5>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Clear preference rationale for each pair</li>
                    <li>• Multiple annotators agree on rankings</li>
                    <li>• Diverse range of prompts and scenarios</li>
                    <li>• Mix of obvious and subtle preference differences</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (selectedOption === "runs") {
      return (
        <div className="space-y-8">
          <div>
            <h1 className="mb-4">Training Runs</h1>
            <p className="text-muted-foreground">
              Your training history: the good, the bad, and the "why did I think that would work?"
            </p>
          </div>
          
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Your Training History</CardTitle>
              <CardDescription>
                Click on any run to view detailed metrics and logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trainingRuns.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No training runs found</p>
                  <p className="text-muted-foreground">Start some training to see runs here</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Run</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Base Model</TableHead>
                      <TableHead>Dataset</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Accuracy</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trainingRuns.map((run) => {
                      const TypeIcon = getTypeIcon(run.type);
                      const StatusIcon = getStatusIcon(run.status);
                      return (
                        <TableRow 
                          key={run.id} 
                          className="cursor-pointer hover:bg-secondary/50"
                          onClick={() => openRunDetails(run)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <TypeIcon className="h-4 w-4 text-primary" />
                              <div>
                                <p className="font-medium">{run.name}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {run.type.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Brain className="h-3 w-3 text-primary" />
                              <span className="text-sm">{run.baseModel}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{run.dataset}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <StatusIcon className="h-4 w-4" />
                              <Badge variant={getStatusColor(run.status)} className="capitalize">
                                {run.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-secondary rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${run.progress}%` }}
                                />
                              </div>
                              <span className="text-sm">{run.progress}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {run.accuracy !== null ? (
                              <span className="text-sm">{run.accuracy}%</span>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">${run.cost.toFixed(2)}</TableCell>
                          <TableCell className="text-sm">{run.duration || "-"}</TableCell>
                          <TableCell className="text-sm">{run.created}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Run Details Dialog */}
          <Dialog open={isRunDialogOpen} onOpenChange={setIsRunDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              {selectedRun && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                      {(() => {
                        const TypeIcon = getTypeIcon(selectedRun.type);
                        return <TypeIcon className="h-5 w-5 text-primary" />;
                      })()}
                      {selectedRun.name}
                    </DialogTitle>
                    <DialogDescription>
                      Training run details and metrics
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    {/* Overview Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
                          <p className="text-2xl font-semibold">{selectedRun.accuracy || "N/A"}</p>
                          <p className="text-muted-foreground text-sm">Accuracy</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                          <p className="text-2xl font-semibold">{selectedRun.loss || "N/A"}</p>
                          <p className="text-muted-foreground text-sm">Final Loss</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                          <p className="text-2xl font-semibold">{selectedRun.duration || "Running"}</p>
                          <p className="text-muted-foreground text-sm">Duration</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <DollarSign className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                          <p className="text-2xl font-semibold">${selectedRun.cost.toFixed(2)}</p>
                          <p className="text-muted-foreground text-sm">Total Cost</p>
                        </CardContent>
                      </Card>
                    </div>

                    <p className="text-muted-foreground text-center">
                      Detailed training metrics and logs would be displayed here...
                    </p>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
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
            <h3 className="mb-6 text-sidebar-foreground">Tune</h3>
            <nav className="space-y-2">
              {tuneOptions.map((option) => {
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