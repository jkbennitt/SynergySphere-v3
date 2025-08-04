import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { type Solution } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export default function SharedSolution() {
  const { link } = useParams();
  const [, setLocation] = useLocation();

  const { data: solution, isLoading, error } = useQuery<Solution>({
    queryKey: ['/api/solutions/link', link],
    queryFn: async () => {
      const response = await fetch(`/api/solutions/link/${link}`);
      if (!response.ok) {
        throw new Error('Solution not found');
      }
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-soft-white flex items-center justify-center">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    );
  }

  if (error || !solution) {
    return (
      <div className="min-h-screen bg-soft-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Solution Not Found</h1>
          <p className="text-gray-600 mb-6">The shared solution you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => setLocation('/')} className="bg-earth-green text-white hover:bg-forest-green">
            Explore Synergy Sphere
          </Button>
        </div>
      </div>
    );
  }

  const parameters = solution.parameters as any;
  const outcomes = solution.outcomes as any;

  return (
    <div className="min-h-screen bg-soft-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-earth-green to-forest-green text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-quicksand font-bold text-4xl mb-4">{solution.title}</h1>
            <p className="text-white/80 text-lg mb-6">{solution.description}</p>
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold">{Math.round(solution.synergyScore)}%</div>
                <div className="text-white/70 text-sm">Synergy Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{formatDistanceToNow(new Date(solution.createdAt))}</div>
                <div className="text-white/70 text-sm">ago</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{solution.likesCount || 0}</div>
                <div className="text-white/70 text-sm">likes</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Simulation Parameters */}
          <Card className="shadow-lg border-earth-green/10">
            <CardHeader>
              <CardTitle className="font-quicksand text-xl text-earth-green">Simulation Parameters</CardTitle>
              <Badge variant="secondary" className="w-fit">
                {solution.challenge.replace('_', ' ')}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Solar Energy Adoption</span>
                  <span className="text-sm font-bold text-sky-blue">{parameters.solarEnergyAdoption}%</span>
                </div>
                <Progress value={parameters.solarEnergyAdoption} className="h-3" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Wind Energy Adoption</span>
                  <span className="text-sm font-bold text-sky-blue">{parameters.windEnergyAdoption}%</span>
                </div>
                <Progress value={parameters.windEnergyAdoption} className="h-3" />
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Policy Strength</div>
                <Badge 
                  className={`${
                    parameters.policyStrength === 'maximum' ? 'bg-earth-green text-white' :
                    parameters.policyStrength === 'high' ? 'bg-sky-blue text-white' :
                    parameters.policyStrength === 'moderate' ? 'bg-sandstone text-white' :
                    'bg-gray-300 text-gray-700'
                  }`}
                >
                  {parameters.policyStrength.charAt(0).toUpperCase() + parameters.policyStrength.slice(1)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Synergy Score Breakdown */}
          <Card className="shadow-lg border-earth-green/10">
            <CardHeader>
              <CardTitle className="font-quicksand text-xl text-earth-green">Synergy Score Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-32 h-32">
                  <div 
                    className="w-full h-full rounded-full synergy-score-arc"
                    style={{ '--score-percentage': `${solution.synergyScore}%` } as React.CSSProperties}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-earth-green">{Math.round(solution.synergyScore)}%</div>
                      <div className="text-xs text-gray-600">Overall</div>
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
            </CardContent>
          </Card>
        </div>

        {/* Projected Outcomes */}
        <Card className="shadow-lg border-earth-green/10 mt-8">
          <CardHeader>
            <CardTitle className="font-quicksand text-xl text-earth-green">Projected Outcomes</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center justify-between p-4 bg-sky-blue/10 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-sky-blue/20 rounded-full flex items-center justify-center">
                  🌡️
                </div>
                <div>
                  <div className="font-medium text-gray-800">Temperature</div>
                  <div className="text-sm text-gray-600">By 2050</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-sky-blue">+{outcomes.temperatureChange?.toFixed(1)}°C</div>
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
                  <div className="font-medium text-gray-800">Investment</div>
                  <div className="text-sm text-gray-600">Required</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-sandstone">${(outcomes.economicImpact / 1000).toFixed(1)}T</div>
                <div className="text-sm text-green-600">ROI: {Math.round(outcomes.roi)}%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center mt-12 p-8 bg-gradient-to-r from-earth-green/5 to-sky-blue/5 rounded-2xl">
          <h2 className="font-quicksand font-bold text-2xl text-earth-green mb-4">
            Inspired by this solution?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join Synergy Sphere to create your own climate solutions, explore global data, and collaborate with a community of changemakers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-earth-green text-white px-8 py-4 hover:bg-forest-green transition-all transform hover:scale-105 ripple-effect font-medium text-lg rounded-full"
              onClick={() => setLocation('/')}
            >
              Explore Platform
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="border-2 border-earth-green text-earth-green px-8 py-4 hover:bg-earth-green hover:text-white transition-all font-medium text-lg rounded-full"
              onClick={() => setLocation('/auth')}
            >
              Join Community
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}