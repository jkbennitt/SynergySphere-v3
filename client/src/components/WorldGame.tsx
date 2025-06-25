import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { runSimulation } from "@/lib/simulation-engine";
import { type SimulationParameters, type SimulationOutcomes } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function WorldGame() {
  const [selectedChallenge, setSelectedChallenge] = useState("reduce_emissions");
  const [parameters, setParameters] = useState<SimulationParameters>({
    solarEnergyAdoption: 65,
    windEnergyAdoption: 45,
    policyStrength: "moderate"
  });
  const [outcomes, setOutcomes] = useState<SimulationOutcomes | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [solutionTitle, setSolutionTitle] = useState("");
  const [solutionDescription, setSolutionDescription] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveSolutionMutation = useMutation({
    mutationFn: async (solutionData: any) => {
      const response = await apiRequest('POST', '/api/solutions', solutionData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Solution Saved!",
        description: "Your solution has been saved and shared with the community.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/solutions'] });
      setSolutionTitle("");
      setSolutionDescription("");
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: "Failed to save your solution. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleRunSimulation = async () => {
    setIsRunning(true);
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const results = runSimulation(selectedChallenge, parameters);
      setOutcomes(results);
    } catch (error) {
      console.error('Simulation failed:', error);
      toast({
        title: "Simulation Failed",
        description: "Unable to run simulation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSaveSolution = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to save your solution.",
        variant: "destructive",
      });
      return;
    }

    if (!outcomes || !solutionTitle.trim()) {
      toast({
        title: "Missing Information",
        description: "Please run a simulation and provide a title for your solution.",
        variant: "destructive",
      });
      return;
    }

    const synergyScore = calculateSynergyScore(outcomes);
    
    await saveSolutionMutation.mutateAsync({
      title: solutionTitle,
      description: solutionDescription || `A ${selectedChallenge.replace('_', ' ')} solution using ${parameters.solarEnergyAdoption}% solar and ${parameters.windEnergyAdoption}% wind energy with ${parameters.policyStrength} policy strength.`,
      challenge: selectedChallenge,
      parameters,
      outcomes,
      synergyScore,
    });
  };

  const calculateSynergyScore = (outcomes: SimulationOutcomes): number => {
    // Calculate weighted average of different scores
    const efficiency = Math.max(0, 100 - Math.abs(outcomes.temperatureChange) * 20);
    const sustainability = outcomes.sustainabilityScore;
    const feasibility = outcomes.feasibilityScore;
    const globalImpact = outcomes.globalImpactScore;
    
    return Math.round((efficiency * 0.3 + sustainability * 0.3 + feasibility * 0.2 + globalImpact * 0.2));
  };

  const synergyScore = outcomes ? calculateSynergyScore(outcomes) : 0;

  return (
    <div className="py-20 bg-gradient-to-br from-earth-green/5 to-sandstone/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-quicksand font-bold text-4xl text-earth-green mb-4">World Game Module</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Design solutions to global challenges. Adjust parameters, run simulations, and see the impact of your ideas on our planet.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Simulation Controls */}
          <div className="space-y-6">
            <Card className="shadow-lg border-earth-green/10">
              <CardHeader>
                <CardTitle className="font-quicksand text-2xl text-earth-green">Climate Action Simulation</CardTitle>
                <p className="text-gray-600">Adjust renewable energy parameters and see global impact</p>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Challenge Selection */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">Select Challenge</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant={selectedChallenge === "reduce_emissions" ? "default" : "outline"}
                      className={selectedChallenge === "reduce_emissions" 
                        ? "bg-earth-green text-white border-earth-green" 
                        : "border-gray-300 text-gray-600 hover:border-earth-green"
                      }
                      onClick={() => setSelectedChallenge("reduce_emissions")}
                    >
                      🌍 Reduce Emissions
                    </Button>
                    <Button
                      variant={selectedChallenge === "reforestation" ? "default" : "outline"}
                      className={selectedChallenge === "reforestation" 
                        ? "bg-earth-green text-white border-earth-green" 
                        : "border-gray-300 text-gray-600 hover:border-earth-green"
                      }
                      onClick={() => setSelectedChallenge("reforestation")}
                    >
                      🌱 Reforestation
                    </Button>
                  </div>
                </div>

                {/* Parameter Controls */}
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium text-gray-700">Solar Energy Adoption</Label>
                      <span className="text-sm font-bold text-sky-blue">{parameters.solarEnergyAdoption}%</span>
                    </div>
                    <Slider
                      value={[parameters.solarEnergyAdoption]}
                      onValueChange={(value) => setParameters(prev => ({ ...prev, solarEnergyAdoption: value[0] }))}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium text-gray-700">Wind Energy Adoption</Label>
                      <span className="text-sm font-bold text-sky-blue">{parameters.windEnergyAdoption}%</span>
                    </div>
                    <Slider
                      value={[parameters.windEnergyAdoption]}
                      onValueChange={(value) => setParameters(prev => ({ ...prev, windEnergyAdoption: value[0] }))}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">Policy Strength</Label>
                    <Select 
                      value={parameters.policyStrength} 
                      onValueChange={(value: any) => setParameters(prev => ({ ...prev, policyStrength: value }))}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-earth-green">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Impact</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="high">High Impact</SelectItem>
                        <SelectItem value="maximum">Maximum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Run Simulation Button */}
                <Button 
                  className="w-full bg-earth-green text-white py-4 hover:bg-forest-green transition-all transform hover:scale-105 ripple-effect font-medium text-lg rounded-2xl"
                  onClick={handleRunSimulation}
                  disabled={isRunning}
                >
                  {isRunning ? (
                    <>
                      <div className="loading-spinner w-5 h-5 mr-2"></div>
                      Running Simulation...
                    </>
                  ) : (
                    "🚀 Run Simulation"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            {/* Synergy Score */}
            {outcomes && (
              <>
                <Card className="shadow-lg border-earth-green/10">
                  <CardHeader>
                    <CardTitle className="font-quicksand text-xl text-earth-green">Synergy Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center mb-6">
                      <div className="relative w-32 h-32">
                        <div 
                          className="w-full h-full rounded-full synergy-score-arc"
                          style={{ '--score-percentage': `${synergyScore}%` } as React.CSSProperties}
                        ></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-earth-green">{synergyScore}%</div>
                            <div className="text-xs text-gray-600">Efficiency</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-earth-green">{Math.round(outcomes.sustainabilityScore)}%</div>
                        <div className="text-xs text-gray-600">Sustainability</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-sky-blue">{Math.round(outcomes.feasibilityScore)}%</div>
                        <div className="text-xs text-gray-600">Feasibility</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-sandstone">{Math.round(outcomes.globalImpactScore)}%</div>
                        <div className="text-xs text-gray-600">Global Impact</div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-earth-green/10 rounded-xl">
                      <div className="text-sm font-medium text-earth-green mb-1">💡 Optimization Tip</div>
                      <div className="text-sm text-gray-600">
                        {synergyScore < 60 
                          ? "Try balancing renewable energy sources for better sustainability!"
                          : synergyScore < 80
                          ? "Great progress! Consider stronger policy measures to maximize impact."
                          : "Excellent solution! Your approach shows strong synergy across all metrics."
                        }
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Outcome Visualization */}
                <Card className="shadow-lg border-earth-green/10">
                  <CardHeader>
                    <CardTitle className="font-quicksand text-xl text-earth-green">Projected Outcomes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-sky-blue/10 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-sky-blue/20 rounded-full flex items-center justify-center">
                          🌡️
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">Temperature Change</div>
                          <div className="text-sm text-gray-600">By 2050</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-sky-blue">+{outcomes.temperatureChange.toFixed(1)}°C</div>
                        <div className="text-sm text-green-600">
                          {outcomes.temperatureChange < 2 ? "Below 2°C target" : "Above 2°C target"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-earth-green/10 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-earth-green/20 rounded-full flex items-center justify-center">
                          🏭
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">CO₂ Reduction</div>
                          <div className="text-sm text-gray-600">Annual</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-earth-green">-{Math.round(outcomes.co2Reduction)}%</div>
                        <div className="text-sm text-green-600">{(outcomes.co2Reduction * 0.45).toFixed(1)} GtCO₂e saved</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-sandstone/10 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-sandstone/20 rounded-full flex items-center justify-center">
                          💰
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">Economic Impact</div>
                          <div className="text-sm text-gray-600">Investment needed</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-sandstone">${(outcomes.economicImpact / 1000).toFixed(1)}T</div>
                        <div className="text-sm text-green-600">ROI: {Math.round(outcomes.roi)}%</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Save & Share */}
                <Card className="shadow-lg border-earth-green/10">
                  <CardHeader>
                    <CardTitle className="font-quicksand text-lg text-earth-green">Share Your Solution</CardTitle>
                    <p className="text-sm text-gray-600">Let the community see your approach</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="solution-title">Solution Title</Label>
                      <Input
                        id="solution-title"
                        placeholder="Give your solution a catchy title..."
                        value={solutionTitle}
                        onChange={(e) => setSolutionTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="solution-description">Description (Optional)</Label>
                      <Textarea
                        id="solution-description"
                        placeholder="Describe your approach and key insights..."
                        value={solutionDescription}
                        onChange={(e) => setSolutionDescription(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        className="flex-1 border-earth-green text-earth-green hover:bg-earth-green hover:text-white"
                      >
                        Save Draft
                      </Button>
                      <Button
                        className="flex-1 bg-earth-green text-white hover:bg-forest-green"
                        onClick={handleSaveSolution}
                        disabled={saveSolutionMutation.isPending || !solutionTitle.trim()}
                      >
                        {saveSolutionMutation.isPending ? "Saving..." : "Share Solution"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {!outcomes && (
              <Card className="shadow-lg border-earth-green/10">
                <CardContent className="py-16 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Run Your First Simulation</h3>
                  <p className="text-gray-500">Adjust the parameters and click "Run Simulation" to see the projected outcomes of your climate solution.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
