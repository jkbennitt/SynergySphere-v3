import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface NavigationProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export default function Navigation({ activeSection, onSectionChange }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleSectionClick = (section: string) => {
    if (onSectionChange) {
      onSectionChange(section);
    }
    setIsMobileMenuOpen(false);
  };

  const handleJoinNow = () => {
    if (user) {
      setLocation('/dashboard');
    } else {
      setLocation('/auth');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-soft-white/90 backdrop-blur-sm border-b border-earth-green/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-earth-green to-forest-green rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h1 className="font-quicksand font-bold text-xl text-earth-green">Synergy Sphere</h1>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              className={`font-medium transition-colors ${
                activeSection === 'explore' 
                  ? 'text-earth-green' 
                  : 'text-gray-700 hover:text-earth-green'
              }`}
              onClick={() => handleSectionClick('explore')}
            >
              Explore
            </button>
            <button 
              className={`font-medium transition-colors ${
                activeSection === 'solve' 
                  ? 'text-earth-green' 
                  : 'text-gray-700 hover:text-earth-green'
              }`}
              onClick={() => handleSectionClick('solve')}
            >
              Solve
            </button>
            <button 
              className={`font-medium transition-colors ${
                activeSection === 'community' 
                  ? 'text-earth-green' 
                  : 'text-gray-700 hover:text-earth-green'
              }`}
              onClick={() => handleSectionClick('community')}
            >
              Community
            </button>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => setLocation('/dashboard')}
                  className="text-gray-700 hover:text-earth-green"
                >
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-earth-green"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Button 
                className="bg-earth-green text-white px-6 py-2 rounded-full hover:bg-forest-green transition-colors ripple-effect"
                onClick={handleJoinNow}
              >
                Join Now
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <button 
                className="text-left text-gray-700 hover:text-earth-green transition-colors font-medium"
                onClick={() => handleSectionClick('explore')}
              >
                Explore
              </button>
              <button 
                className="text-left text-gray-700 hover:text-earth-green transition-colors font-medium"
                onClick={() => handleSectionClick('solve')}
              >
                Solve
              </button>
              <button 
                className="text-left text-gray-700 hover:text-earth-green transition-colors font-medium"
                onClick={() => handleSectionClick('community')}
              >
                Community
              </button>
              
              {user ? (
                <div className="flex flex-col space-y-2 pt-2 border-t border-gray-200">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setLocation('/dashboard');
                      setIsMobileMenuOpen(false);
                    }}
                    className="justify-start text-gray-700 hover:text-earth-green"
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="justify-start text-gray-700 hover:text-earth-green"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Button 
                  className="bg-earth-green text-white rounded-full hover:bg-forest-green transition-colors mt-2"
                  onClick={() => {
                    handleJoinNow();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Join Now
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
