import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";

interface LocationData {
  city: string;
  country: string;
  region: string;
  lat: number;
  lng: number;
}

interface ClimateInsight {
  type: 'temperature' | 'precipitation' | 'co2' | 'renewable';
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  description: string;
  urgency: 'low' | 'medium' | 'high';
}

export default function PersonalizedInsights() {
  const { user } = useAuth();
  const [location, setLocation] = useState<LocationData | null>(null);
  const [insights, setInsights] = useState<ClimateInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  useEffect(() => {
    loadClimateInsights();
  }, [user]);

  const loadClimateInsights = async () => {
    setIsLoading(true);
    
    // Check if user has location in profile
    if (user?.location) {
      await getInsightsForLocation(user.location);
    } else {
      // Try to get browser location
      await requestLocationPermission();
    }
    
    setIsLoading(false);
  };

  const requestLocationPermission = async () => {
    if (!navigator.geolocation) {
      generateDefaultInsights();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setLocationPermission('granted');
        const { latitude, longitude } = position.coords;
        
        try {
          // Mock reverse geocoding - in production, use a real service
          const mockLocation = getMockLocationFromCoords(latitude, longitude);
          setLocation(mockLocation);
          await getInsightsForLocation(`${mockLocation.city}, ${mockLocation.country}`);
        } catch (error) {
          console.error('Failed to get location data:', error);
          generateDefaultInsights();
        }
      },
      (error) => {
        setLocationPermission('denied');
        console.error('Geolocation error:', error);
        generateDefaultInsights();
      }
    );
  };

  const getMockLocationFromCoords = (lat: number, lng: number): LocationData => {
    // Simplified location detection - in production, use a real geocoding service
    if (lat > 40 && lat < 45 && lng > -75 && lng > -125) {
      return { city: 'New York', country: 'United States', region: 'North America', lat, lng };
    }
    if (lat > 51 && lat < 52 && lng > -1 && lng < 1) {
      return { city: 'London', country: 'United Kingdom', region: 'Europe', lat, lng };
    }
    if (lat > 35 && lat < 36 && lng > 139 && lng < 140) {
      return { city: 'Tokyo', country: 'Japan', region: 'Asia', lat, lng };
    }
    return { city: 'Unknown', country: 'Global', region: 'World', lat, lng };
  };

  const getInsightsForLocation = async (locationString: string) => {
    // Mock climate insights based on location
    // In production, this would call real climate APIs
    const mockInsights: ClimateInsight[] = [
      {
        type: 'temperature',
        title: 'Local Temperature Trend',
        value: '+1.8°C',
        change: '+0.3°C from last decade',
        trend: 'up',
        description: `Temperature in ${locationString} has risen significantly. This affects local ecosystems and energy consumption.`,
        urgency: 'high'
      },
      {
        type: 'precipitation',
        title: 'Precipitation Changes',
        value: '-12%',
        change: 'Decreased rainfall',
        trend: 'down',
        description: 'Changing precipitation patterns affect agriculture and water resources in your region.',
        urgency: 'medium'
      },
      {
        type: 'co2',
        title: 'Regional CO₂ Emissions',
        value: '8.2 tCO₂e',
        change: 'Per capita annually',
        trend: 'stable',
        description: 'Your region contributes this amount per person. Consider renewable energy adoption.',
        urgency: 'medium'
      },
      {
        type: 'renewable',
        title: 'Renewable Energy Potential',
        value: '68%',
        change: 'Solar & wind viable',
        trend: 'up',
        description: 'Your area has excellent potential for renewable energy development.',
        urgency: 'low'
      }
    ];

    setInsights(mockInsights);
    
    // Set location based on user input or detected location
    setLocation({
      city: locationString.split(',')[0].trim(),
      country: locationString.split(',')[1]?.trim() || 'Unknown',
      region: 'Local Area',
      lat: 0,
      lng: 0
    });
  };

  const generateDefaultInsights = () => {
    const globalInsights: ClimateInsight[] = [
      {
        type: 'temperature',
        title: 'Global Temperature Trend',
        value: '+1.2°C',
        change: 'Since pre-industrial',
        trend: 'up',
        description: 'Global average temperature continues to rise, affecting ecosystems worldwide.',
        urgency: 'high'
      },
      {
        type: 'co2',
        title: 'Global CO₂ Levels',
        value: '421 ppm',
        change: 'Highest in 3M years',
        trend: 'up',
        description: 'Atmospheric CO₂ concentrations are at record levels, driving climate change.',
        urgency: 'high'
      },
      {
        type: 'renewable',
        title: 'Renewable Energy Growth',
        value: '32%',
        change: 'Of global electricity',
        trend: 'up',
        description: 'Renewable energy adoption is accelerating but needs to grow faster.',
        urgency: 'medium'
      }
    ];

    setInsights(globalInsights);
    setLocation({ city: 'Global', country: 'Worldwide', region: 'Earth', lat: 0, lng: 0 });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '📊';
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg border-earth-green/10">
        <CardContent className="py-8 text-center">
          <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading personalized climate insights...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Location Header */}
      <Card className="shadow-lg border-earth-green/10">
        <CardHeader>
          <CardTitle className="font-quicksand text-xl text-earth-green flex items-center">
            📍 Climate Insights for {location?.city || 'Your Area'}
          </CardTitle>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Personalized climate data for {location?.country || 'your region'}
            </p>
            {locationPermission === 'denied' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={requestLocationPermission}
                className="border-earth-green text-earth-green hover:bg-earth-green hover:text-white"
              >
                📍 Enable Location
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Climate Insights Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {insights.map((insight, index) => (
          <Card key={index} className="shadow-lg border-earth-green/10 hover:border-earth-green/30 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-quicksand text-lg text-earth-green flex items-center">
                  {getTrendIcon(insight.trend)} {insight.title}
                </CardTitle>
                <Badge className={getUrgencyColor(insight.urgency)}>
                  {insight.urgency} priority
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-earth-green">{insight.value}</div>
                <div className="text-sm text-gray-600">{insight.change}</div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{insight.description}</p>
              
              {insight.type === 'renewable' && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Potential Progress</span>
                    <span className="text-sm text-earth-green">{insight.value}</span>
                  </div>
                  <Progress value={parseFloat(insight.value)} className="h-2" />
                </div>
              )}
              
              <div className="pt-4 border-t border-gray-100">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-earth-green hover:text-forest-green w-full"
                >
                  Learn More About {insight.title} →
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Recommendations */}
      <Card className="shadow-lg border-earth-green/10 bg-gradient-to-r from-earth-green/5 to-sky-blue/5">
        <CardHeader>
          <CardTitle className="font-quicksand text-xl text-earth-green">
            💡 Recommended Actions for Your Area
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-xl border border-earth-green/10">
              <div className="text-lg font-medium text-earth-green mb-2">🏠 Home Energy</div>
              <p className="text-sm text-gray-600">Consider solar panels or energy-efficient appliances for your local climate.</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-earth-green/10">
              <div className="text-lg font-medium text-earth-green mb-2">🚗 Transportation</div>
              <p className="text-sm text-gray-600">Explore electric vehicle options and public transit in your area.</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-earth-green/10">
              <div className="text-lg font-medium text-earth-green mb-2">🌱 Local Action</div>
              <p className="text-sm text-gray-600">Join community climate initiatives and support local environmental projects.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}