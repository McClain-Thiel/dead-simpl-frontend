import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { ArrowLeft, FileText, MessageCircle, Database, Bot, Brain, CheckCircle, Target, Users, TrendingUp, BarChart3 } from "lucide-react";
import skeletonLogo from "figma:asset/da095a0d21754e713136cd74afea19dfc8b375eb.png";

interface ReportsPageProps {
  onBack: () => void;
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

interface DetailedReportData {
  overview: {
    totalEvaluations: number;
    averageScore: number;
    topCriteria: string;
    recommendations: string[];
  };
  criteriaScores: Array<{
    name: string;
    score: number;
    description: string;
  }>;
  sampleEvaluations: Array<{
    input: string;
    output: string;
    score: number;
    feedback: string;
  }>;
}

export function ReportsPage({ onBack }: ReportsPageProps) {
  const [selectedReport, setSelectedReport] = useState<EvaluationReport | null>(null);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

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

  // Mock detailed report data
  const getDetailedReport = (reportId: string): DetailedReportData => {
    return {
      overview: {
        totalEvaluations: 250,
        averageScore: 87,
        topCriteria: "Correctness",
        recommendations: [
          "Consider fine-tuning for better politeness scores",
          "Add more context to improve relevance",
          "Review training data for edge cases"
        ]
      },
      criteriaScores: [
        { name: "Correctness", score: 92, description: "Accuracy and factual correctness of responses" },
        { name: "Politeness", score: 85, description: "Respectful and courteous communication style" },
        { name: "Relevance", score: 84, description: "How well responses address the user's query" }
      ],
      sampleEvaluations: [
        {
          input: "What's your return policy?",
          output: "Our return policy allows for 30-day returns on most items. You can find the full details on our website.",
          score: 95,
          feedback: "Accurate and helpful response with clear direction for more information."
        },
        {
          input: "Can you help me with a refund?",
          output: "I'd be happy to help you with your refund! Can you please provide your order number?",
          score: 88,
          feedback: "Polite and helpful, properly asks for necessary information."
        },
        {
          input: "Your service is terrible!",
          output: "I'm sorry to hear you've had a negative experience. Let me help make this right for you.",
          score: 91,
          feedback: "Professional response to negative feedback, shows empathy and willingness to help."
        }
      ]
    };
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
    setIsReportDialogOpen(true);
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

      {/* Main Content */}
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
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
      </div>

      {/* Report Details Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {(() => {
                    const TypeIcon = getTypeIcon(selectedReport.type);
                    return <TypeIcon className="h-5 w-5 text-primary" />;
                  })()}
                  {selectedReport.name}
                </DialogTitle>
                <DialogDescription>
                  Detailed evaluation results and insights
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Overview Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="text-2xl font-semibold">{selectedReport.score || 0}</p>
                      <p className="text-muted-foreground text-sm">Overall Score</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-semibold">250</p>
                      <p className="text-muted-foreground text-sm">Evaluations</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-semibold">92%</p>
                      <p className="text-muted-foreground text-sm">Top Criteria</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <p className="text-2xl font-semibold">${selectedReport.cost.toFixed(2)}</p>
                      <p className="text-muted-foreground text-sm">Total Cost</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Criteria Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Criteria Performance</CardTitle>
                    <CardDescription>
                      Breakdown of scores across evaluation criteria
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {getDetailedReport(selectedReport.id).criteriaScores.map((criteria, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium">{criteria.name}</p>
                              <span className="text-sm font-medium">{criteria.score}/100</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                style={{ width: `${criteria.score}%` }}
                              />
                            </div>
                            <p className="text-muted-foreground text-sm mt-1">{criteria.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Sample Evaluations */}
                <Card>
                  <CardHeader>
                    <CardTitle>Sample Evaluations</CardTitle>
                    <CardDescription>
                      Examples of how your model performed on specific inputs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {getDetailedReport(selectedReport.id).sampleEvaluations.map((sample, index) => (
                        <div key={index} className="border border-border rounded-lg p-4">
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-1">Input:</p>
                              <p className="text-sm bg-secondary/30 p-2 rounded">{sample.input}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-1">Output:</p>
                              <p className="text-sm bg-secondary/30 p-2 rounded">{sample.output}</p>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Feedback:</p>
                                <p className="text-sm">{sample.feedback}</p>
                              </div>
                              <Badge variant="outline" className="ml-4">
                                Score: {sample.score}/100
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                    <CardDescription>
                      AI-generated suggestions to improve your model's performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {getDetailedReport(selectedReport.id).overview.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <p className="text-sm">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}