import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Auth() {
  const [, setLocation] = useLocation();

  const handleLogin = () => {
    // Redirect to Replit auth endpoint
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-soft-white to-sky-blue/10 geodesic-pattern flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 border-2 border-earth-green/20 rounded-full"></div>
        <div className="absolute bottom-40 right-20 w-24 h-24 border-2 border-sky-blue/30 rounded-organic"></div>
        <div className="absolute top-1/3 right-10 w-16 h-16 bg-sandstone/20 rounded-wave"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-earth-green to-forest-green rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h1 className="font-quicksand font-bold text-2xl text-earth-green">Synergy Sphere</h1>
          </div>
          <p className="text-gray-600">
            Join the global movement for sustainable solutions
          </p>
        </div>

        <Card className="shadow-2xl border-earth-green/20">
          <CardHeader>
            <CardTitle className="font-quicksand text-2xl text-center text-earth-green">
              Welcome to Synergy Sphere
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-4">
              <p className="text-gray-600">
                Connect your account to start exploring global climate data, creating solutions, and collaborating with innovators worldwide.
              </p>
              
              <div className="flex flex-col space-y-3">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="w-6 h-6 bg-earth-green/10 rounded-full flex items-center justify-center">
                    <span className="text-earth-green">🌍</span>
                  </div>
                  <span>Explore interactive 3D climate data</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="w-6 h-6 bg-sky-blue/10 rounded-full flex items-center justify-center">
                    <span className="text-sky-blue">🚀</span>
                  </div>
                  <span>Create and share climate solutions</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="w-6 h-6 bg-sandstone/10 rounded-full flex items-center justify-center">
                    <span className="text-sandstone">🤝</span>
                  </div>
                  <span>Collaborate with global community</span>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleLogin}
              size="lg"
              className="w-full bg-earth-green text-white hover:bg-forest-green transition-all transform hover:scale-105 ripple-effect font-medium text-lg py-4 rounded-full"
            >
              Continue with Replit
            </Button>

            {/* Back to home */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setLocation("/")}
                className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
              >
                ← Back to home
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}