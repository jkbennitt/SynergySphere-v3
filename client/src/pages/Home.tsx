import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Navigation from "@/components/Navigation";
import Geoscope from "@/components/Geoscope";
import WorldGame from "@/components/WorldGame";
import Community from "@/components/Community";
import TutorialModal from "@/components/TutorialModal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const [activeSection, setActiveSection] = useState<'hero' | 'explore' | 'solve' | 'community'>('hero');
  const [showTutorial, setShowTutorial] = useState(false);
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Show tutorial for new users
    const hasSeenTutorial = localStorage.getItem('synergy-sphere-tutorial');
    if (!hasSeenTutorial) {
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const scrollToSection = (section: string) => {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(section as any);
    }
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    localStorage.setItem('synergy-sphere-tutorial', 'true');
    scrollToSection('explore');
  };

  const handleJoinNow = () => {
    if (user) {
      setLocation('/dashboard');
    } else {
      setLocation('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-soft-white">
      <Navigation activeSection={activeSection} onSectionChange={scrollToSection} />
      
      {/* Hero Section */}
      <section id="hero" className="pt-16 min-h-screen bg-gradient-to-br from-soft-white to-sky-blue/10 geodesic-pattern relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 border-2 border-earth-green/20 rounded-full"></div>
          <div className="absolute bottom-40 right-20 w-24 h-24 border-2 border-sky-blue/30 rounded-organic"></div>
          <div className="absolute top-1/3 right-10 w-16 h-16 bg-sandstone/20 rounded-wave"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="font-quicksand font-bold text-5xl lg:text-6xl text-earth-green leading-tight">
                  Explore Our World,<br/>
                  <span className="text-sky-blue">Shape Its Future</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Discover global patterns through interactive visualization and collaborate on solutions to humanity's greatest challenges. Inspired by Buckminster Fuller's vision of planetary thinking.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  className="bg-earth-green text-white px-8 py-4 hover:bg-forest-green transition-all transform hover:scale-105 ripple-effect font-medium text-lg rounded-full"
                  onClick={() => scrollToSection('explore')}
                >
                  Start Exploring
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-2 border-earth-green text-earth-green px-8 py-4 hover:bg-earth-green hover:text-white transition-all font-medium text-lg rounded-full"
                >
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-earth-green">15K+</div>
                  <div className="text-sm text-gray-600">Global Explorers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-sky-blue">500+</div>
                  <div className="text-sm text-gray-600">Solutions Shared</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-sandstone">25</div>
                  <div className="text-sm text-gray-600">Countries</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative w-96 h-96 mx-auto">
                <img 
                  src="https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=800" 
                  alt="Interactive 3D Earth globe with data visualization" 
                  className="w-full h-full object-cover rounded-full shadow-2xl" 
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-earth-green/20 to-transparent"></div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full text-sm font-medium text-earth-green">
                  CO₂ Layer Active
                </div>
              </div>
              
              <div className="absolute -top-4 -left-4 bg-white rounded-xl shadow-lg p-4 border border-sky-blue/20">
                <div className="text-sm font-medium text-gray-700">Global Temperature</div>
                <div className="text-2xl font-bold text-sky-blue">+1.2°C</div>
              </div>
              
              <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg p-4 border border-earth-green/20">
                <div className="text-sm font-medium text-gray-700">Renewable Energy</div>
                <div className="text-2xl font-bold text-earth-green">32%</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="wave-divider h-16 bg-gradient-to-r from-earth-green/5 to-sky-blue/5"></div>
      </section>

      {/* Geoscope Module */}
      <section id="explore">
        <Geoscope />
      </section>

      {/* World Game Module */}
      <section id="solve">
        <WorldGame />
      </section>

      {/* Community Section */}
      <section id="community">
        <Community />
      </section>

      {/* Footer */}
      <footer className="bg-earth-green text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <h3 className="font-quicksand font-bold text-2xl">Synergy Sphere</h3>
              </div>
              <p className="text-white/80 leading-relaxed max-w-md">
                Empowering global collaboration to address humanity's greatest challenges through interactive visualization and innovative problem-solving.
              </p>
            </div>

            <div>
              <h4 className="font-quicksand font-semibold text-lg mb-4">Platform</h4>
              <ul className="space-y-2 text-white/80">
                <li><button onClick={() => scrollToSection('explore')} className="hover:text-white transition-colors">Geoscope</button></li>
                <li><button onClick={() => scrollToSection('solve')} className="hover:text-white transition-colors">World Game</button></li>
                <li><button onClick={() => scrollToSection('community')} className="hover:text-white transition-colors">Community</button></li>
                <li><button className="hover:text-white transition-colors">API Access</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-quicksand font-semibold text-lg mb-4">Resources</h4>
              <ul className="space-y-2 text-white/80">
                <li><button className="hover:text-white transition-colors">Documentation</button></li>
                <li><button className="hover:text-white transition-colors">Tutorials</button></li>
                <li><button className="hover:text-white transition-colors">Research Papers</button></li>
                <li><button className="hover:text-white transition-colors">Data Sources</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/20 pt-8 mt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-white/60 text-sm">
              © 2024 Synergy Sphere. Inspired by Buckminster Fuller's vision. Open source under MIT License.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <button className="text-white/60 hover:text-white text-sm transition-colors">Privacy Policy</button>
              <button className="text-white/60 hover:text-white text-sm transition-colors">Terms of Service</button>
              <button className="text-white/60 hover:text-white text-sm transition-colors">Contact</button>
            </div>
          </div>
        </div>
      </footer>

      {/* Tutorial Modal */}
      {showTutorial && (
        <TutorialModal 
          onComplete={handleTutorialComplete}
          onSkip={() => {
            setShowTutorial(false);
            localStorage.setItem('synergy-sphere-tutorial', 'true');
          }}
        />
      )}
    </div>
  );
}
