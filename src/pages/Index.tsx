import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Users, Settings, TrendingUp } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-secondary text-secondary-foreground p-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-2xl">CAT</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Smart Assistant</h1>
              <p className="text-lg opacity-90">Machine Operator Intelligence Platform</p>
            </div>
          </div>
          <p className="text-sm opacity-80 max-w-2xl mx-auto">
            Improving task allocation, safety, performance tracking, and career development for CAT machine operators and fleet managers
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-4">Choose Your Role</h2>
          <p className="text-muted-foreground">Select your access level to get started with the smart assistant</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Operator Card */}
          <Card className="border-2 hover:border-primary transition-colors cursor-pointer group">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <User className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Machine Operator</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Access your personal dashboard with task assignments, performance tracking, and safety alerts.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span>Performance Score Tracking</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Settings className="w-4 h-4 text-primary" />
                  <span>Smart Task Assignment</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <User className="w-4 h-4 text-secondary" />
                  <span>Personalized Training</span>
                </div>
              </div>
              <Link to="/operator" className="block">
                <Button className="w-full">Enter Operator View</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Fleet Manager Card */}
          <Card className="border-2 hover:border-primary transition-colors cursor-pointer group">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/20 transition-colors">
                <Users className="w-8 h-8 text-secondary" />
              </div>
              <CardTitle className="text-xl">Fleet Manager</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Manage your fleet with operator oversight, task optimization, and comprehensive reporting.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-center space-x-2">
                  <Users className="w-4 h-4 text-secondary" />
                  <span>Operator Management</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span>Fleet Analytics</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Settings className="w-4 h-4 text-primary" />
                  <span>Safety Monitoring</span>
                </div>
              </div>
              <Link to="/fleet-manager" className="block">
                <Button variant="secondary" className="w-full">Enter Fleet Manager View</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Features Overview */}
        <div className="mt-16 text-center">
          <h3 className="text-xl font-bold mb-8">System Intelligence Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Score-Based Matching</h4>
              <p className="text-sm text-muted-foreground">
                Advanced algorithm pairs operators with tasks based on performance, safety, and equipment proximity.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Real-Time Safety</h4>
              <p className="text-sm text-muted-foreground">
                Continuous monitoring with instant alerts for safety violations and preventive measures.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Gamified Performance</h4>
              <p className="text-sm text-muted-foreground">
                Transparent scoring system with improvement tips and career progression tracking.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
