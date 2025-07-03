import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Users, Settings, FileText, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

const FleetManagerView = () => {
  const [operators] = useState([
    {
      id: 1,
      name: "John Smith",
      score: 87,
      safetyViolations: 0,
      currentTask: "Load Aggregate - Site A",
      trainingStatus: "Up to date"
    },
    {
      id: 2,
      name: "Maria Garcia", 
      score: 92,
      safetyViolations: 1,
      currentTask: "Transport Materials",
      trainingStatus: "Module pending"
    },
    {
      id: 3,
      name: "David Johnson",
      score: 78,
      safetyViolations: 2,
      currentTask: "Equipment Maintenance",
      trainingStatus: "Overdue"
    }
  ]);

  const [availableTasks] = useState([
    {
      id: 1,
      title: "Excavation - North Pit",
      complexity: "High",
      priority: "urgent",
      suggestedOperator: "Maria Garcia",
      equipment: "CAT 390F Excavator"
    },
    {
      id: 2,
      title: "Material Transport - Route B", 
      complexity: "Medium",
      priority: "normal",
      suggestedOperator: "John Smith",
      equipment: "CAT 775G Truck"
    }
  ]);

  const [recentIncidents] = useState([
    {
      id: 1,
      operator: "David Johnson",
      type: "Speed Violation",
      date: "2024-01-15",
      severity: "Minor"
    },
    {
      id: 2,
      operator: "Maria Garcia",
      type: "Maintenance Alert",
      date: "2024-01-14", 
      severity: "Low"
    }
  ]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-secondary text-secondary-foreground p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">CAT</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Fleet Manager Dashboard</h1>
              <p className="text-sm opacity-80">Supervisor Control Center</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Settings className="w-5 h-5" />
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Fleet Manager</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="tasks">Task Assignment</TabsTrigger>
            <TabsTrigger value="operators">Operator Overview</TabsTrigger>
            <TabsTrigger value="incidents">Incident Logs</TabsTrigger>
            <TabsTrigger value="utilization">Utilization</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Task Assignment System */}
          <TabsContent value="tasks" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Available Tasks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {availableTasks.map((task) => (
                    <div key={task.id} className="border border-border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold">{task.title}</h3>
                        <Badge variant={task.priority === "urgent" ? "destructive" : "secondary"}>
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{task.equipment}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Complexity: {task.complexity}</span>
                        <Badge variant="outline">Score Match: 95%</Badge>
                      </div>
                      <div className="mt-3 p-3 bg-primary/10 rounded-lg border border-primary">
                        <p className="text-sm font-medium">Recommended: {task.suggestedOperator}</p>
                        <p className="text-xs text-muted-foreground">Based on performance score and availability</p>
                      </div>
                      <div className="flex space-x-2 mt-3">
                        <Button size="sm">Accept Suggestion</Button>
                        <Button size="sm" variant="outline">Override</Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Task Assignment Algorithm</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Operator Performance Score</span>
                      <span className="text-sm font-medium">40%</span>
                    </div>
                    <Progress value={40} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Equipment Availability</span>
                      <span className="text-sm font-medium">25%</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Task Complexity Match</span>
                      <span className="text-sm font-medium">20%</span>
                    </div>
                    <Progress value={20} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Safety History</span>
                      <span className="text-sm font-medium">15%</span>
                    </div>
                    <Progress value={15} className="h-2" />
                  </div>
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm">The system automatically calculates the best operator-task match using these weighted criteria.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Operator Overview */}
          <TabsContent value="operators" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Operator Performance Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Operator</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Safety Violations</TableHead>
                      <TableHead>Current Task</TableHead>
                      <TableHead>Training Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {operators.map((operator) => (
                      <TableRow key={operator.id}>
                        <TableCell className="font-medium">{operator.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span>{operator.score}/100</span>
                            <div className="w-16">
                              <Progress value={operator.score} className="h-2" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={operator.safetyViolations === 0 ? "outline" : operator.safetyViolations > 1 ? "destructive" : "secondary"}>
                            {operator.safetyViolations}
                          </Badge>
                        </TableCell>
                        <TableCell>{operator.currentTask}</TableCell>
                        <TableCell>
                          <Badge variant={operator.trainingStatus === "Up to date" ? "outline" : operator.trainingStatus === "Overdue" ? "destructive" : "secondary"}>
                            {operator.trainingStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">View Details</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Incident Logs */}
          <TabsContent value="incidents" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Incidents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentIncidents.map((incident) => (
                    <div key={incident.id} className="border border-border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm">{incident.type}</span>
                        <Badge variant={incident.severity === "Minor" || incident.severity === "Low" ? "secondary" : "destructive"}>
                          {incident.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{incident.operator}</p>
                      <p className="text-xs text-muted-foreground">{incident.date}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Safety Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-success">15</div>
                    <div className="text-sm text-muted-foreground">Days without incidents</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Safety Compliance</span>
                      <span>94%</span>
                    </div>
                    <Progress value={94} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" variant="outline">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Report Incident
                  </Button>
                  <Button className="w-full" variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Safety Briefing
                  </Button>
                  <Button className="w-full" variant="outline">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Equipment Check
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Utilization & Equipment */}
          <TabsContent value="utilization" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Equipment Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">CAT 972M Loader</span>
                    <Badge className="bg-success text-success-foreground">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">CAT 775G Truck</span>
                    <Badge className="bg-success text-success-foreground">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">CAT 390F Excavator</span>
                    <Badge variant="secondary">Maintenance</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fuel Efficiency</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">89%</div>
                    <div className="text-sm text-muted-foreground">Fleet Average</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>This Week</span>
                      <span>92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Machine Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">A+</div>
                    <div className="text-sm text-muted-foreground">Overall Grade</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>System Health</span>
                      <span>96%</span>
                    </div>
                    <Progress value={96} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Available Reports</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="border border-border rounded-lg p-3">
                    <h4 className="font-semibold">Weekly Safety Report</h4>
                    <p className="text-sm text-muted-foreground">Incident summary and compliance metrics</p>
                    <Button size="sm" className="mt-2">Download PDF</Button>
                  </div>
                  <div className="border border-border rounded-lg p-3">
                    <h4 className="font-semibold">Operator Progress Summary</h4>
                    <p className="text-sm text-muted-foreground">Individual performance and training status</p>
                    <Button size="sm" variant="outline" className="mt-2">Generate Report</Button>
                  </div>
                  <div className="border border-border rounded-lg p-3">
                    <h4 className="font-semibold">Equipment Utilization</h4>
                    <p className="text-sm text-muted-foreground">Usage statistics and maintenance schedules</p>
                    <Button size="sm" variant="outline" className="mt-2">View Analytics</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Retraining Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-warning/10 border border-warning rounded-lg">
                    <h4 className="font-semibold text-sm">David Johnson</h4>
                    <p className="text-xs text-muted-foreground">Safety refresher course recommended</p>
                    <p className="text-xs text-muted-foreground">Due to recent violations</p>
                  </div>
                  <div className="p-3 bg-primary/10 border border-primary rounded-lg">
                    <h4 className="font-semibold text-sm">Maria Garcia</h4>
                    <p className="text-xs text-muted-foreground">Advanced operations certification</p>
                    <p className="text-xs text-muted-foreground">High performance candidate</p>
                  </div>
                  <Button size="sm" className="w-full mt-3">Schedule Training Sessions</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FleetManagerView;