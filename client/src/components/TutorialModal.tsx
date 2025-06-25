import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface TutorialModalProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface TutorialStep {
  icon: string;
  title: string;
  description: string;
  color: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    icon: "🌍",
    title: "Explore Mode",
    description: "Interact with the 3D globe and discover global data patterns. Rotate, zoom, and click on countries to see detailed climate information.",
    color: "earth-green"
  },
  {
    icon: "🚀",
    title: "Solve Mode",
    description: "Design solutions to climate challenges and see their impact. Adjust parameters like renewable energy adoption and policy strength.",
    color: "sky-blue"
  },
  {
    icon: "🤝",
    title: "Community",
    description: "Share your solutions and collaborate with global thinkers. Like, comment, and get inspired by others' innovative approaches.",
    color: "sandstone"
  }
];

export default function TutorialModal({ onComplete, onSkip }: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentTutorialStep = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full shadow-2xl border-earth-green/20">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-earth-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">{currentTutorialStep.icon}</span>
            </div>
            <h3 className="font-quicksand font-bold text-2xl text-earth-green mb-2">
              {currentStep === 0 ? "Welcome to Synergy Sphere!" : currentTutorialStep.title}
            </h3>
            <p className="text-gray-600">
              {currentStep === 0 
                ? "Let's take a quick tour of how you can explore our world and shape its future."
                : currentTutorialStep.description
              }
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{currentStep + 1} of {tutorialSteps.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Tutorial Steps Overview (only on first step) */}
          {currentStep === 0 && (
            <div className="space-y-4 mb-8">
              {tutorialSteps.map((step, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-8 h-8 bg-${step.color} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className={`font-medium text-${step.color}`}>{step.title}</div>
                    <div className="text-sm text-gray-600">{step.description}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Individual Step Content */}
          {currentStep > 0 && (
            <div className="mb-8">
              <div className="bg-gradient-to-r from-earth-green/5 to-sky-blue/5 rounded-xl p-6 mb-4">
                <h4 className="font-semibold text-earth-green mb-2">💡 Key Features:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  {currentStep === 1 && (
                    <>
                      <li>• Interactive 3D globe with real climate data</li>
                      <li>• Toggle between different data layers</li>
                      <li>• Click countries for detailed information</li>
                      <li>• Earn badges for exploring regions</li>
                    </>
                  )}
                  {currentStep === 2 && (
                    <>
                      <li>• Adjust renewable energy parameters</li>
                      <li>• Run simulations to see climate impact</li>
                      <li>• Get a Synergy Score for your solution</li>
                      <li>• Save and share your best ideas</li>
                    </>
                  )}
                  {currentStep === 3 && (
                    <>
                      <li>• Browse solutions from global contributors</li>
                      <li>• Like and comment on innovative ideas</li>
                      <li>• Share your own solutions with the world</li>
                      <li>• Collaborate on sustainable futures</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Interactive Elements Preview */}
              <div className="bg-soft-white rounded-xl p-4 border border-gray-200">
                <div className="text-xs text-gray-500 mb-2">Preview:</div>
                {currentStep === 1 && (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-orange-500 rounded"></div>
                    <span className="text-sm">CO₂ Emissions Layer</span>
                    <div className="flex-1"></div>
                    <div className="w-8 h-4 bg-earth-green rounded-full"></div>
                  </div>
                )}
                {currentStep === 2 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Solar Energy</span>
                      <span className="text-sky-blue font-bold">65%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-sky-blue h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                )}
                {currentStep === 3 && (
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-earth-green rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">👤</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Climate Solution</div>
                      <div className="text-xs text-gray-500">92% Synergy Score</div>
                    </div>
                    <div className="flex space-x-1">
                      <span className="text-xs">❤️ 47</span>
                      <span className="text-xs">💬 23</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={onSkip}
                className="border-gray-300 text-gray-600 hover:border-earth-green"
              >
                Skip Tour
              </Button>
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="border-earth-green text-earth-green hover:bg-earth-green hover:text-white"
                >
                  Previous
                </Button>
              )}
            </div>
            <Button
              onClick={handleNext}
              className="bg-earth-green text-white hover:bg-forest-green transition-all transform hover:scale-105 ripple-effect"
            >
              {currentStep === tutorialSteps.length - 1 ? "Start Exploring!" : "Next"}
            </Button>
          </div>

          {/* Skip Option */}
          {currentStep === 0 && (
            <div className="text-center mt-4">
              <button
                onClick={onSkip}
                className="text-gray-400 hover:text-gray-600 text-sm transition-colors"
              >
                I'm familiar with the platform
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
