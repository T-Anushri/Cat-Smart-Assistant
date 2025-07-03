import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Bell, Clock, User, TrendingUp, BookOpen, CheckCircle } from "lucide-react";
import ChatbotDialog from "@/components/ChatbotDialog";

const OperatorView = () => {
  const [operatorName] = useState("John Smith");
  const [operatorScore] = useState(87);

  const todayTasks = [
    {
      id: 1,
      title: "Load Aggregate Material - Site A",
      timeEstimate: "2.5 hours",
      priority: "high",
      equipment: "CAT 972M Wheel Loader"
    },
    {
      id: 2,
      title: "Transport to Processing Plant",
      timeEstimate: "1.5 hours", 
      priority: "medium",
      equipment: "CAT 775G Truck"
    }
  ];

  const safetyAlerts = [
    { message: "Remember to fasten seatbelt before starting", type: "warning" },
    { message: "Weather alert: Rain expected at 3 PM", type: "info" }
  ];

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
              <h1 className="text-xl font-bold">Smart Assistant</h1>
              <p className="text-sm opacity-80">Operator Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Bell className="w-5 h-5" />
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>{operatorName}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="home" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="why-task">Why This Task?</TabsTrigger>
            <TabsTrigger value="score">Score Tracker</TabsTrigger>
            <TabsTrigger value="feedback">Post-Task</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
          </TabsList>

          {/* Home Dashboard */}
          <TabsContent value="home" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Today's Assigned Tasks</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {todayTasks.map((task) => (
                    <div key={task.id} className="border border-border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{task.title}</h3>
                        <Badge variant={task.priority === "high" ? "destructive" : "secondary"}>
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{task.equipment}</p>
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{task.timeEstimate}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="w-5 h-5" />
                    <span>Safety Alerts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {safetyAlerts.map((alert, index) => (
                    <div key={index} className={`p-3 rounded-lg ${alert.type === 'warning' ? 'bg-warning/10 border border-warning' : 'bg-muted'}`}>
                      <p className="text-sm">{alert.message}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Why This Task */}
          <TabsContent value="why-task" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Why You Got This Task</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-success/10 rounded-lg border border-success">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-success" />
                    <h3 className="font-semibold">Skill Match</h3>
                    <p className="text-sm text-muted-foreground">95% match for this equipment</p>
                  </div>
                  <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-semibold">Prior Performance</h3>
                    <p className="text-sm text-muted-foreground">Top 10% efficiency rate</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <User className="w-8 h-8 mx-auto mb-2" />
                    <h3 className="font-semibold">Equipment Proximity</h3>
                    <p className="text-sm text-muted-foreground">Closest available operator</p>
                  </div>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm">
                    <strong>Bottom line:</strong> You were chosen because you had the best efficiency on similar tasks 
                    and are near available equipment. Your safety record and fuel efficiency scores put you at the top 
                    of the recommendation list.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Score Tracker */}
          <TabsContent value="score" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Score: {operatorScore}/100</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Fuel Efficiency</span>
                      <span className="text-sm">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Load Cycles</span>
                      <span className="text-sm">88%</span>
                    </div>
                    <Progress value={88} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Safety Compliance</span>
                      <span className="text-sm">95%</span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Boost Your Score</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-primary/10 rounded-lg border border-primary">
                    <h4 className="font-semibold text-sm">Reduce Idling</h4>
                    <p className="text-xs text-muted-foreground">Turn off engine during breaks (+3 points)</p>
                  </div>
                  <div className="p-3 bg-success/10 rounded-lg border border-success">
                    <h4 className="font-semibold text-sm">Complete Safety Training</h4>
                    <p className="text-xs text-muted-foreground">New module available (+5 points)</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="font-semibold text-sm">Optimize Load Cycles</h4>
                    <p className="text-xs text-muted-foreground">Follow recommended patterns (+2 points)</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Post-Task Feedback */}
          <TabsContent value="feedback" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Latest Task Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-success/10 border border-success rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-success">Excellent Performance!</h3>
                  <p className="text-sm mt-2">
                    You completed your last task 10% faster than average, and fuel usage was within optimal range. 
                    Your safety compliance was perfect.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Suggestions for Next Time:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Consider using eco mode during transport phases</li>
                    <li>• Maintain current loading technique - very efficient</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Training Center */}
          <TabsContent value="training" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-5 h-5" />
                      <span>Recommended Training</span>
                    </div>
                    <ChatbotDialog />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="border border-border rounded-lg p-3">
                    <h4 className="font-semibold">Advanced Fuel Efficiency</h4>
                    <p className="text-sm text-muted-foreground">Based on your recent performance data</p>
                    <Button size="sm" className="mt-2">Start Module</Button>
                  </div>
                  <div className="border border-border rounded-lg p-3">
                    <h4 className="font-semibold">Load Cycle Optimization</h4>
                    <p className="text-sm text-muted-foreground">Improve your efficiency score</p>
                    <Button size="sm" variant="outline" className="mt-2">View Details</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Certifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Basic Safety</span>
                    <Badge variant="outline" className="bg-success text-success-foreground">Completed</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Equipment Maintenance</span>
                    <Badge variant="outline" className="bg-success text-success-foreground">Completed</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Advanced Operations</span>
                    <Badge variant="outline">In Progress</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OperatorView;