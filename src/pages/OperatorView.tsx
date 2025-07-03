import { useState, useEffect, useRef } from "react";
import VideoPlayer from "../components/VideoPlayer";
import videoList from "../data/videoList";
import OperatorLoginModal from "@/components/OperatorLoginModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Bell, Clock, User, TrendingUp, BookOpen, CheckCircle } from "lucide-react";
import ChatbotDialog from "@/components/ChatbotDialog";
import { ResponsiveContainer, LineChart, Line as ReLine, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, PieChart, Pie, Cell, BarChart, Bar, Legend as ReLegend } from 'recharts';
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);


const OperatorView = () => {
  const [operator, setOperator] = useState<any>(null);
  const [token, setToken] = useState<string>("");
  const [loginOpen, setLoginOpen] = useState<boolean>(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState("");
  // Predicted durations for each task (by task._id)
  const [predictedDurations, setPredictedDurations] = useState<{ [taskId: string]: number }>({});

  // Popup alert state
  const [safetyAlerts, setSafetyAlerts] = useState([
    { message: "Remember to fasten seatbelt before starting", type: "warning" },
    { message: "Weather alert: Rain expected at 3 PM", type: "info" }
  ]);
  const [popupAlert, setPopupAlert] = useState<null | { message: string; type: string }>(null);
  const [lastAlertMessage, setLastAlertMessage] = useState<string | null>(null);
  const popupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const speechIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const speakRef = useRef<{ interval: NodeJS.Timeout | null }>({ interval: null });

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  // Telemetry/Chart state (simulate for now)
  const [fuelConsumption, setFuelConsumption] = useState(68);
  const [fuelAvailable, setFuelAvailable] = useState(32); // percent
  const [temperature, setTemperature] = useState(78); // °C
  const [hydraulicPressure, setHydraulicPressure] = useState(210); // bar

  // Chart data
  const fuelEfficiencyData = [
    { time: '08:00', efficiency: 85, target: 90 },
    { time: '09:00', efficiency: 88, target: 90 },
    { time: '10:00', efficiency: 82, target: 90 },
    { time: '11:00', efficiency: 90, target: 90 },
    { time: '12:00', efficiency: 87, target: 90 },
    { time: '13:00', efficiency: 85, target: 90 },
    { time: '14:00', efficiency: 92, target: 90 },
    { time: '15:00', efficiency: 89, target: 90 },
  ];
  const [fuelEfficiencyLabels] = useState<string[]>(fuelEfficiencyData.map(d => d.time));

  // Pie chart data
  const timeDistribution = [
    { name: 'Production', value: 65 },
    { name: 'Idle', value: 25 },
    { name: 'Maintenance', value: 10 },
  ];
  const pieColors = ['#facc15', '#e5e7eb', '#f87171'];
  // Bar chart data
  const taskTimeData = [
    { task: 'Dumping', Productive: 40, Idle: 10 },
    { task: 'Transport', Productive: 30, Idle: 15 },
    { task: 'Loading', Productive: 35, Idle: 12 },
  ];

  // Fetch tasks for operator
  useEffect(() => {
    if (token) {
      setTasksLoading(true);
      setTasksError("");
      fetch("http://localhost:4000/api/tasks/my-tasks", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(async (res) => {
          if (!res.ok) throw new Error("Failed to fetch tasks");
          const data = await res.json();
          setTasks(data.tasks || []);
        })
        .catch((err) => setTasksError(err.message))
        .finally(() => setTasksLoading(false));
    } else {
      setTasks([]);
    }
  }, [token]);

  // Fetch predicted durations for each task automatically
  useEffect(() => {
    // Allowed values from CSV
    const allowedWeather = ["Cloudy", "Rainy", "Sunny", "Foggy"];
    const allowedTaskTypes = ["Leveling", "Transporting", "Drilling", "Lifting", "Digging"];

    // Helper to map or fallback to valid value
    const getValidWeather = (w) => {
      if (typeof w === "string" && allowedWeather.includes(w)) return w;
      // Try case-insensitive match
      const found = allowedWeather.find(v => v.toLowerCase() === String(w).toLowerCase());
      return found || "Sunny";
    };
    const getValidTaskType = (t) => {
      if (typeof t === "string" && allowedTaskTypes.includes(t)) return t;
      // Try case-insensitive match or fallback to title
      const found = allowedTaskTypes.find(v => v.toLowerCase() === String(t).toLowerCase());
      return found || "Digging";
    };

    const fetchPredictions = async () => {
      if (!tasks || tasks.length === 0) {
        setPredictedDurations({});
        return;
      }
      const newPredictions: { [taskId: string]: number } = {};
      for (const task of tasks) {
        // Validate and map to allowed values
        const weather = getValidWeather(task.weather);
        // Try type, then title, then fallback
        let taskType = getValidTaskType(task.type);
        if (!allowedTaskTypes.includes(taskType) && task.title) {
          taskType = getValidTaskType(task.title);
        }
        try {
          const res = await fetch("http://localhost:4000/api/predict-task-duration", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ weather, taskType })
          });
          const data = await res.json();
          if (data.predictedTime) {
            newPredictions[task._id] = data.predictedTime;
          }
        } catch (e) {
          // Optionally handle error
        }
      }
      setPredictedDurations(newPredictions);
    };
    fetchPredictions();
  }, [tasks]);

  // Fetch live alert from backend (mock or real)
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("http://localhost:4000/api/alert")
        .then((res) => res.json())
        .then((data) => {
          if (
            data.message &&
            data.message.trim() !== "" &&
            data.message !== lastAlertMessage
          ) {
            setPopupAlert({ message: data.message, type: "warning" });
            setLastAlertMessage(data.message);
            // Start repeating speech when popup appears
            if (speechIntervalRef.current) clearInterval(speechIntervalRef.current);
            speak(data.message);
            speechIntervalRef.current = setInterval(() => speak(data.message), 2000);
            if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
            popupTimeoutRef.current = setTimeout(() => {
              setPopupAlert(null);
              setSafetyAlerts((prev) => {
                const alreadyPresent = prev.some(alert => alert.message === data.message);
                if (!alreadyPresent) {
                  return [
                    ...prev.slice(-4),
                    { message: data.message, type: "warning" }
                  ];
                }
                return prev;
              });
            }, 5000);
          }
        })
        .catch(err => console.error("Failed to fetch alert:", err));
    }, 5000);

    return () => {
      clearInterval(interval);
      if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
      if (speechIntervalRef.current) clearInterval(speechIntervalRef.current);
      window.speechSynthesis.cancel();
    };
  }, [lastAlertMessage]);

  // Stop speech when popup closes (OK or auto-close)
  useEffect(() => {
    if (!popupAlert) {
      if (speechIntervalRef.current) clearInterval(speechIntervalRef.current);
      window.speechSynthesis.cancel();
    }
  }, [popupAlert]);

  useEffect(() => {
    if (popupAlert) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();
      // Speak immediately
      const speakNow = () => {
        window.speechSynthesis.cancel();
        const utterance = new window.SpeechSynthesisUtterance(popupAlert.message);
        utterance.lang = "en-US";
        window.speechSynthesis.speak(utterance);
      };
      speakNow();
      // Repeat every 2.5s
      speakRef.current.interval = setInterval(speakNow, 2500);
    } else {
      // Stop speech and clear interval
      window.speechSynthesis.cancel();
      if (speakRef.current.interval) {
        clearInterval(speakRef.current.interval);
        speakRef.current.interval = null;
      }
    }
    return () => {
      window.speechSynthesis.cancel();
      if (speakRef.current.interval) {
        clearInterval(speakRef.current.interval);
        speakRef.current.interval = null;
      }
    };
  }, [popupAlert]);

  // Simulate real-time updates for telemetry
  useEffect(() => {
    const interval = setInterval(() => {
      setFuelConsumption(prev => {
        let next = prev + (Math.random() * 2 - 1);
        next = Math.max(50, Math.min(100, next));
        return Math.round(next * 10) / 10;
      });
      setFuelAvailable(prev => {
        let next = 100 - fuelConsumption + (Math.random() * 2 - 1);
        next = Math.max(0, Math.min(100, next));
        return Math.round(next * 10) / 10;
      });
      setTemperature(prev => {
        let next = prev + (Math.random() * 2 - 1);
        next = Math.max(60, Math.min(110, next));
        return Math.round(next * 10) / 10;
      });
      setHydraulicPressure(prev => {
        let next = prev + (Math.random() * 4 - 2);
        next = Math.max(180, Math.min(240, next));
        return Math.round(next * 10) / 10;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [fuelConsumption]);

  return (
    <div className="min-h-screen bg-background">
      {/* Popup Alert */}
      {popupAlert && (
        <div className="fixed top-1/2 left-1/2 z-50 transform -translate-x-1/2 -translate-y-1/2 bg-black border-4 border-yellow-400 text-yellow-300 px-10 py-7 rounded-2xl shadow-2xl flex flex-col items-center space-y-4 animate-fade-in-out"
          style={{ minWidth: 350, maxWidth: 500 }}
        >
          <div className="flex items-center space-x-4">
            <Bell className="w-8 h-8 text-yellow-400 animate-bounce" />
            <div className="flex flex-col items-start">
              <span className="font-bold text-xl mb-1 tracking-wide">Safety Alert</span>
              <span className="font-medium text-lg leading-snug">{popupAlert.message}</span>
            </div>
          </div>
          <button
            className="mt-2 px-6 py-2 rounded-lg bg-yellow-400 text-black font-bold shadow hover:bg-yellow-300 transition"
            onClick={() => {
              setPopupAlert(null);
              setSafetyAlerts((prev) => {
                const alreadyPresent = prev.some(alert => alert.message === popupAlert.message);
                if (!alreadyPresent) {
                  return [
                    ...prev.slice(-4),
                    { message: popupAlert.message, type: popupAlert.type }
                  ];
                }
                return prev;
              });
              setLastAlertMessage(popupAlert.message);
              // Stop speech and clear interval
              window.speechSynthesis.cancel();
              if (speakRef.current.interval) {
                clearInterval(speakRef.current.interval);
                speakRef.current.interval = null;
              }
            }}
          >
            OK
          </button>
        </div>
      )}
      <OperatorLoginModal
        open={loginOpen || !operator}
        onClose={() => setLoginOpen(false)}
        onLoginSuccess={(tok, op) => {
          setToken(tok);
          setOperator(op);
        }}
      />
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
              <span>{operator ? operator.name : "Not logged in"}</span>
            </div>
            {operator && (
              <>
                <span className="text-sm flex items-center gap-1"><TrendingUp className="w-4 h-4" /> Score: {operator.score ?? "-"}</span>
                <Button
                  className="ml-4"
                  variant="destructive"
                  onClick={() => {
                    setOperator(null);
                    setToken("");
                    setTasks([]);
                  }}
                >
                  Logout
                </Button>
              </>
            )}
            {!operator && (
              <Button className="ml-4" variant="default" onClick={() => setLoginOpen(true)}>
                Login
              </Button>
            )}
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
                  {tasksLoading && <div>Loading tasks...</div>}
                  {tasksError && <div className="text-red-500 text-sm">{tasksError}</div>}
                  {!tasksLoading && !tasksError && tasks.length === 0 && (
                    <div>No tasks assigned.</div>
                  )}
                  {tasks.map((task) => (
                    <div key={task._id} className="border border-border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{task.title}</h3>
                        {task.priority && (
                          <Badge variant={task.priority === "high" ? "destructive" : "secondary"}>
                            {task.priority}
                          </Badge>
                        )}
                      </div>
                      {task.equipment && <p className="text-sm text-muted-foreground mb-2">{task.equipment}</p>}
                      {task.timeEstimate && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Clock className="w-4 h-4" />
                          <span>{task.timeEstimate}</span>
                        </div>
                      )}
                      {predictedDurations[task._id] !== undefined && (
                        <div className="text-sm text-blue-600 mt-1">
                          Predicted Duration: {predictedDurations[task._id].toFixed(2)} min
                        </div>
                      )}
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
                    <div key={index} className={`relative p-3 rounded-lg ${alert.type === 'warning' ? 'bg-warning/10 border border-warning' : 'bg-muted'}`}>
                      <button
                        className="absolute top-2 right-2 text-xs text-muted-foreground hover:text-foreground focus:outline-none"
                        aria-label="Dismiss alert"
                        onClick={() => setSafetyAlerts((prev) => prev.filter((_, i) => i !== index))}
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                      >
                        ×
                      </button>
                      <p className="text-sm">{alert.message}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Telemetry / Machine Status as tiles below tasks/alerts */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Fuel Consumption (in liters) */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base text-muted-foreground">Fuel Consumption</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-6">
                  <span className="text-4xl font-extrabold text-yellow-400">{(fuelConsumption * 2).toFixed(1)} L</span>
                </CardContent>
              </Card>
              {/* Fuel Available (in percent, yellow, warning if low) */}
              <Card>
                <CardHeader className="flex flex-col items-center justify-center">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base text-muted-foreground">Fuel Available</CardTitle>
                    {fuelAvailable < 20 && (
                      <span title="Low Fuel" className="ml-1 animate-pulse">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className={`flex flex-col items-center justify-center py-6 ${(fuelAvailable < 20) ? 'bg-red-100 border-2 border-red-400 rounded-lg' : ''}`}>
                  <span className="text-4xl font-extrabold text-yellow-400">{fuelAvailable.toFixed(1)}%</span>
                </CardContent>
              </Card>
              {/* Engine Temperature (yellow numbers, warning if high) */}
              <Card>
                <CardHeader className="flex flex-col items-center justify-center">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base text-muted-foreground">Engine Temperature</CardTitle>
                    {temperature > 90 && (
                      <span title="High Temperature" className="ml-1 animate-pulse">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12c0 4.97 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className={`flex flex-col items-center justify-center py-6 ${(temperature > 90) ? 'bg-red-100 border-2 border-red-400 rounded-lg' : ''}`}>
                  <span className="text-4xl font-extrabold text-yellow-400">{temperature}&deg;C</span>
                </CardContent>
              </Card>
              {/* Hydraulic Pressure (yellow numbers) */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base text-muted-foreground">Hydraulic Pressure</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-6">
                  <span className="text-4xl font-extrabold text-yellow-400">{hydraulicPressure} bar</span>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Fuel Efficiency Chart */}
              <Card className="col-span-1 md:col-span-2 lg:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Fuel Efficiency Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ width: '100%', height: 340 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={fuelEfficiencyData} margin={{ left: 24, right: 24, top: 16, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.4} />
                        <XAxis dataKey="time" tick={{ fill: '#a3a3a3', fontWeight: 500 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[70, 100]} tick={{ fill: '#a3a3a3', fontWeight: 500 }} axisLine={false} tickLine={false} />
                        <ReTooltip contentStyle={{ background: '#222', border: 'none', color: '#fff' }} />
                        <ReLine 
                          type="monotone" 
                          dataKey="efficiency" 
                          stroke="#F59E0B" 
                          strokeWidth={3}
                          dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                          name="Current Efficiency (%)"
                        />
                        <ReLine 
                          type="monotone" 
                          dataKey="target" 
                          stroke="#60A5FA" 
                          strokeDasharray="6 4"
                          strokeWidth={2}
                          dot={false}
                          name="Target Efficiency (%)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Pie and Bar Charts side by side */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pie Chart for Time Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-yellow-400" />
                      Time Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div style={{ width: '100%', height: 340 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={timeDistribution}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {timeDistribution.map((entry, idx) => (
                              <Cell key={`cell-${idx}`} fill={pieColors[idx % pieColors.length]} />
                            ))}
                          </Pie>
                          <ReLegend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                {/* Bar Chart for Idle vs Productive Time in Tasks */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-yellow-400" />
                      Idle vs Productive Time by Task
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div style={{ width: '100%', height: 340 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={taskTimeData} margin={{ left: 16, right: 16, top: 16, bottom: 8 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                          <XAxis dataKey="task" tick={{ fill: '#a3a3a3', fontWeight: 500 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: '#a3a3a3', fontWeight: 500 }} axisLine={false} tickLine={false} />
                          <ReTooltip contentStyle={{ background: '#222', border: 'none', color: '#fff' }} />
                          <Bar dataKey="Productive" fill="#facc15" name="Productive Time" barSize={48} />
                          <Bar dataKey="Idle" fill="#e7e9eb" name="Idle Time" barSize={48} />
                          <ReLegend />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
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
                  <CardTitle>Performance Score: {operator ? operator.score : "-"}/100</CardTitle>
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
              {/* Recommended Training Modules */}
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

              {/* Certifications */}
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

            {/* Video Training Portal - full width below */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5" />
                  <span>Video Training Portal</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {videoList.map((video) => (
                    <VideoPlayer
                      key={video.id}
                      videoId={video.id}
                      title={video.title}
                      description={video.description}
                      transcript={video.transcript}
                    />
                  ))}
                </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</div>
  );
};

export default OperatorView;