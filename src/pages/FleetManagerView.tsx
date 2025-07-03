import calculateScore from "../utils/calculateScore.js";
import { useState, useEffect } from "react";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Users, Settings, FileText, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

const FleetManagerView = () => {
  const [operators, setOperators] = useState([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newOperator, setNewOperator] = useState({
    operatorId: "",
    name: "",
    fuelEfficiency: 80,
    estimatedTime: 8,
    actualTime: 8,
    safetyViolations: 0,
    tasksCompleted: 0,
    trainingCompleted: false
  });
  const [adding, setAdding] = useState(false);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [recentIncidents, setRecentIncidents] = useState([]);

  // Add Task Dialog state
  const [addTaskDialogOpen, setAddTaskDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    complexityScore: 1,
    priority: "normal",
    status: "pending",
    estimatedTime: 8,
    actualTime: null
  });
  const [addingTask, setAddingTask] = useState(false);

  const handleAddTask = async (e) => {
    e.preventDefault();
    setAddingTask(true);
    try {
      await axios.post("http://localhost:4000/api/tasks", newTask);
      setAddTaskDialogOpen(false);
      setNewTask({
        title: "",
        complexityScore: 1,
        priority: "normal",
        status: "pending",
        estimatedTime: 8,
        actualTime: null
      });
      // Refresh tasks
      const res = await axios.get("http://localhost:4000/api/tasks");
      setAvailableTasks(res.data);
    } catch {
      // handle error
    } finally {
      setAddingTask(false);
    }
  };

  // Auto-assign handler
  const handleAutoAssignTasks = async () => {
    // Filter unassigned tasks
    const unassigned = availableTasks.filter(t => !t.assignedTo);
    if (!unassigned.length) return;
    try {
      await axios.post("http://localhost:4000/api/tasks/assign-tasks", { tasks: unassigned });
      // Refresh tasks after assignment
      const res = await axios.get("http://localhost:4000/api/tasks");
      setAvailableTasks(res.data);
    } catch (err) {
      alert("Auto-assign failed: " + (err?.response?.data?.error || err.message));
    }
  };

  const fetchOperators = () => {
    axios.get("http://localhost:4000/api/operators")
      .then(res => setOperators(res.data))
      .catch(() => setOperators([]));
  };
  useEffect(() => {
    fetchOperators();
    axios.get("http://localhost:4000/api/tasks")
      .then(res => setAvailableTasks(res.data))
      .catch(() => setAvailableTasks([]));
    axios.get("http://localhost:4000/api/incidents")
      .then(res => setRecentIncidents(res.data))
      .catch(() => setRecentIncidents([]));
  }, []);

  const handleAddOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      const score = calculateScore({
        fuelEfficiency: newOperator.fuelEfficiency,
        estimatedTime: newOperator.estimatedTime,
        actualTime: newOperator.actualTime,
        safetyViolations: newOperator.safetyViolations
      });
      const operatorToSend = {
        operatorId: newOperator.operatorId,
        name: newOperator.name,
        score,
        fuelEfficiency: newOperator.fuelEfficiency,
        safetyViolations: newOperator.safetyViolations,
        tasksCompleted: newOperator.tasksCompleted,
        trainingCompleted: newOperator.trainingCompleted
      };
      await axios.post("http://localhost:4000/api/operators", operatorToSend);
      setAddDialogOpen(false);
      setNewOperator({
        operatorId: "",
        name: "",
        fuelEfficiency: 80,
        estimatedTime: 8,
        actualTime: 8,
        safetyViolations: 0,
        tasksCompleted: 0,
        trainingCompleted: false
      });
      fetchOperators();
    } catch {
      // handle error
    } finally {
      setAdding(false);
    }
  };

  // ...existing code...

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
                <CardHeader className="flex flex-col gap-2">
                  <div className="flex items-center justify-between w-full">
                    <CardTitle>Available Tasks</CardTitle>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={handleAutoAssignTasks} disabled={availableTasks.filter(t => !t.assignedTo).length === 0}>
                        Auto-Assign All Tasks
                      </Button>
                      <Dialog open={addTaskDialogOpen} onOpenChange={setAddTaskDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" onClick={() => setAddTaskDialogOpen(true)}>Add Task</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add New Task</DialogTitle>
                            <DialogDescription>Enter details for the new task.</DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleAddTask} className="space-y-3">
                            <label className="block text-sm font-medium">Title
                              <Input required value={newTask.title} onChange={e => setNewTask(t => ({ ...t, title: e.target.value }))} />
                            </label>
                            <label className="block text-sm font-medium">Complexity
                              <Input required type="number" min={1} max={4} value={newTask.complexityScore} onChange={e => setNewTask(t => ({ ...t, complexityScore: Number(e.target.value) }))} />
                            </label>
                            <label className="block text-sm font-medium">Priority
                              <select className="w-full border rounded p-2" value={newTask.priority} onChange={e => setNewTask(t => ({ ...t, priority: e.target.value }))}>
                                <option value="normal">Normal</option>
                                <option value="urgent">Urgent</option>
                              </select>
                            </label>
                            <label className="block text-sm font-medium">Estimated Time (hours)
                              <Input required type="number" value={newTask.estimatedTime} onChange={e => setNewTask(t => ({ ...t, estimatedTime: Number(e.target.value) }))} />
                            </label>
                            <DialogFooter>
                              <Button type="submit" disabled={addingTask}>{addingTask ? "Adding..." : "Add Task"}</Button>
                              <DialogClose asChild>
                                <Button type="button" variant="outline">Cancel</Button>
                              </DialogClose>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {availableTasks.filter(task => !task.assignedTo).length === 0 ? (
                      <div className="text-muted-foreground text-sm">No unassigned tasks.</div>
                    ) : (
                      availableTasks.filter(task => !task.assignedTo).map((task) => (
                        <div key={task._id} className="border border-border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-semibold">{task.title}</h3>
                            <Badge variant={task.priority === "urgent" ? "destructive" : "secondary"}>
                              {task.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">Complexity: {task.complexityScore}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Assigned To: Unassigned</span>
                            <Badge variant="outline">Task ID: {task._id?.slice(-4)}</Badge>
                          </div>
                          <div className="mt-3 p-3 bg-primary/10 rounded-lg border border-primary">
                            <p className="text-sm font-medium">Priority: {task.priority}</p>
                            <p className="text-xs text-muted-foreground">Estimated Time: {task.estimatedTime}h</p>
                          </div>
                          <div className="flex space-x-2 mt-3">
                            <Button size="sm">Accept Suggestion</Button>
                            <Button size="sm" variant="outline">Override</Button>
                          </div>
                        </div>
                      ))
                    )}
                </CardContent>
              </Card>

              {/* All Tasks Card */}
              <Card>
                <CardHeader>
                  <CardTitle>All Tasks & Assignments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {availableTasks.length === 0 ? (
                    <div className="text-muted-foreground text-sm">No tasks found.</div>
                  ) : (
                    availableTasks.map((task) => (
                      <div key={task._id} className="border border-border rounded-lg p-4 bg-muted/50">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{task.title}</h3>
                          <Badge variant={task.priority === "urgent" ? "destructive" : "secondary"}>
                            {task.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Assigned To: {task.assignedTo?.name || "Unassigned"}</span>
                          <Badge variant="outline">Task ID: {task._id?.slice(-4)}</Badge>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground mb-1">
                          <span>Complexity: {task.complexityScore}</span>
                          <span className="ml-4">Estimated Time: {task.estimatedTime}h</span>
                        </div>
                        {task.assignedTo && (
                          <div className="flex justify-end mt-2">
                            <Button size="sm" variant="outline" onClick={async () => {
                              await axios.patch(`http://localhost:4000/api/tasks/${task._id}/unassign`);
                              // Refresh tasks
                              const res = await axios.get("http://localhost:4000/api/tasks");
                              setAvailableTasks(res.data);
                            }}>
                              Unassign
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
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
            <div className="flex justify-end mb-4">
              <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setAddDialogOpen(true)}>
                    Add Operator
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Operator</DialogTitle>
                    <DialogDescription>Fill in the details below to add a new operator.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddOperator} className="space-y-3">
                    <label className="block text-sm font-medium">Operator ID (e.g. OP1004)
                      <Input required value={newOperator.operatorId} onChange={e => setNewOperator(o => ({ ...o, operatorId: e.target.value }))} />
                    </label>
                    <label className="block text-sm font-medium">Name
                      <Input required value={newOperator.name} onChange={e => setNewOperator(o => ({ ...o, name: e.target.value }))} />
                    </label>
                    {/* Score is auto-calculated */}
                    <label className="block text-sm font-medium">Estimated Time (hours)
                      <Input required type="number" value={newOperator.estimatedTime} onChange={e => setNewOperator(o => ({ ...o, estimatedTime: Number(e.target.value) }))} />
                    </label>
                    <label className="block text-sm font-medium">Actual Time (hours)
                      <Input required type="number" value={newOperator.actualTime} onChange={e => setNewOperator(o => ({ ...o, actualTime: Number(e.target.value) }))} />
                    </label>
                    <label className="block text-sm font-medium">Fuel Efficiency
                      <Input required type="number" value={newOperator.fuelEfficiency} onChange={e => setNewOperator(o => ({ ...o, fuelEfficiency: Number(e.target.value) }))} />
                    </label>
                    <label className="block text-sm font-medium">Safety Violations
                      <Input required type="number" value={newOperator.safetyViolations} onChange={e => setNewOperator(o => ({ ...o, safetyViolations: Number(e.target.value) }))} />
                    </label>
                    <label className="block text-sm font-medium">Tasks Completed
                      <Input required type="number" value={newOperator.tasksCompleted} onChange={e => setNewOperator(o => ({ ...o, tasksCompleted: Number(e.target.value) }))} />
                    </label>
                    <div className="flex items-center space-x-2">
                      <input id="trainingCompleted" type="checkbox" checked={newOperator.trainingCompleted} onChange={e => setNewOperator(o => ({ ...o, trainingCompleted: e.target.checked }))} />
                      <label htmlFor="trainingCompleted">Training Completed</label>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={adding}>{adding ? "Adding..." : "Add Operator"}</Button>
                      <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                      </DialogClose>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
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
                      <TableRow key={operator._id}>
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
                        <TableCell>{operator.currentTask || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={operator.trainingCompleted ? "outline" : "destructive"}>
                            {operator.trainingCompleted ? "Up to date" : "Pending"}
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
                    <div key={incident._id} className="border border-border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm">{incident.type}</span>
                        <Badge variant="secondary">{incident._id?.slice(-4)}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Operator: {incident.operatorId}</p>
                      <p className="text-xs text-muted-foreground">{new Date(incident.timestamp).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">{incident.description}</p>
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