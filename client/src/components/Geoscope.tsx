import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Globe3D from "./Globe3D";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Geoscope() {
  const [activeDataLayers, setActiveDataLayers] = useState({
    co2_emissions: true,
    population_density: false,
    forest_coverage: false
  });
  const [regionsExplored, setRegionsExplored] = useState(12);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const recordInteractionMutation = useMutation({
    mutationFn: async (interaction: { countryCode: string; dataLayer: string }) => {
      if (!user) return;
      await apiRequest('POST', '/api/globe/interactions', interaction);
    },
    onSuccess: () => {
      // Update user progress cache
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    }
  });

  const handleCountryClick = (countryCode: string, data: any) => {
    console.log(`Clicked on ${countryCode}:`, data);
    
    // Record the interaction
    if (user) {
      recordInteractionMutation.mutate({
        countryCode,
        dataLayer: getActiveDataLayer()
      });
    }
  };

  const handleLayerToggle = (layer: keyof typeof activeDataLayers) => {
    setActiveDataLayers(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }));
  };

  const getActiveDataLayer = () => {
    return Object.entries(activeDataLayers).find(([_, active]) => active)?.[0] || 'co2_emissions';
  };

  const resetView = () => {
    // Reset globe view - this would be implemented in Globe3D
    console.log('Resetting globe view');
  };

  return (
    <div className="py-20 bg-gradient-to-br from-sky-blue/5 to-soft-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-quicksand font-bold text-4xl text-earth-green mb-4">Geoscope Module</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our planet through interactive 3D visualization. Discover patterns, relationships, and insights across global datasets.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Globe Interface */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-earth-green/10">
              <CardHeader>
                <CardTitle className="font-quicksand text-2xl text-earth-green">Interactive Earth</CardTitle>
                <p className="text-gray-600">Rotate, zoom, and explore global data layers</p>
              </CardHeader>
              <CardContent>
                <Globe3D 
                  onCountryClick={handleCountryClick}
                  activeDataLayer={getActiveDataLayer()}
                />
                
                {/* Globe Navigation */}
                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center space-x-4">
                    <Button 
                      className="bg-earth-green text-white hover:bg-forest-green"
                      size="sm"
                    >
                      Rotate
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-earth-green text-earth-green hover:bg-earth-green hover:text-white"
                      size="sm"
                      onClick={resetView}
                    >
                      Reset View
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    Drag to rotate • Scroll to zoom
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Layers Panel */}
          <div className="space-y-6">
            <Card className="shadow-lg border-earth-green/10">
              <CardHeader>
                <CardTitle className="font-quicksand text-xl text-earth-green">Data Layers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* CO2 Emissions Layer */}
                <div className={`flex items-center justify-between p-3 rounded-xl border ${
                  activeDataLayers.co2_emissions 
                    ? 'bg-earth-green/5 border-earth-green/20' 
                    : 'border-gray-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-orange-500 rounded"></div>
                    <span className={`font-medium ${
                      activeDataLayers.co2_emissions ? 'text-earth-green' : 'text-gray-600'
                    }`}>
                      CO₂ Emissions
                    </span>
                  </div>
                  <Switch
                    checked={activeDataLayers.co2_emissions}
                    onCheckedChange={() => handleLayerToggle('co2_emissions')}
                  />
                </div>

                {/* Population Density Layer */}
                <div className={`flex items-center justify-between p-3 rounded-xl border ${
                  activeDataLayers.population_density 
                    ? 'bg-earth-green/5 border-earth-green/20' 
                    : 'border-gray-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded"></div>
                    <span className={`font-medium ${
                      activeDataLayers.population_density ? 'text-earth-green' : 'text-gray-600'
                    }`}>
                      Population Density
                    </span>
                  </div>
                  <Switch
                    checked={activeDataLayers.population_density}
                    onCheckedChange={() => handleLayerToggle('population_density')}
                  />
                </div>

                {/* Forest Coverage Layer */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 opacity-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded"></div>
                    <span className="font-medium text-gray-600">Forest Coverage</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                </div>

                {/* Learn More Section */}
                <div className="mt-6 p-4 bg-sky-blue/10 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-sky-blue mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                    </svg>
                    <div>
                      <div className="font-medium text-sky-blue text-sm">Learn More</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Discover why CO₂ emissions matter for our climate future.
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Discovery Progress */}
            <Card className="shadow-lg border-earth-green/10">
              <CardHeader>
                <CardTitle className="font-quicksand text-xl text-earth-green">Discovery Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Regions Explored</span>
                  <span className="text-sm font-medium text-earth-green">{regionsExplored}/195</span>
                </div>
                <Progress value={(regionsExplored / 195) * 100} className="h-2" />

                <div className="mt-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-earth-green rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-earth-green">Discovery Badge Earned!</span>
                  </div>
                  <p className="text-xs text-gray-600">You've explored your first data layer</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
