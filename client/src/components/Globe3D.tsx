import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

declare global {
  interface Window {
    THREE: any;
  }
}

interface GlobeData {
  [countryCode: string]: {
    emissions: number;
    population: number;
    emissionsPerCapita: number;
  };
}

interface Globe3DProps {
  onCountryClick?: (countryCode: string, data: any) => void;
  activeDataLayer?: string;
}

export default function Globe3D({ onCountryClick, activeDataLayer = "co2_emissions" }: Globe3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const frameRef = useRef<number>();
  const [globeData, setGlobeData] = useState<GlobeData>({});
  const [selectedCountry, setSelectedCountry] = useState<{code: string, data: any} | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch climate data
    fetch('/api/climate/co2-emissions')
      .then(res => res.json())
      .then(data => {
        setGlobeData(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch climate data:', err);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!mountRef.current || !window.THREE || isLoading) return;

    const { THREE } = window;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Globe geometry and material
    const geometry = new THREE.SphereGeometry(2, 64, 32);
    
    // Load Earth texture
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load(
      'https://unpkg.com/three-globe@2.30.0/example/img/earth-blue-marble.jpg',
      () => {
        // Texture loaded, start rendering
        animate();
      }
    );
    
    const material = new THREE.MeshPhongMaterial({
      map: earthTexture,
      shininess: 0.1
    });
    
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    // Add atmosphere glow
    const atmosphereGeometry = new THREE.SphereGeometry(2.1, 64, 32);
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
      color: 0x87CEEB,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // Camera position
    camera.position.z = 5;

    // Controls (if available)
    let controls: any = null;
    if (window.THREE && (window as any).THREE.OrbitControls) {
      controls = new (window as any).THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.enableZoom = true;
      controls.enablePan = false;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
    }

    // Store references
    sceneRef.current = { scene, camera, renderer, globe, controls };
    rendererRef.current = renderer;

    // Animation loop
    function animate() {
      frameRef.current = requestAnimationFrame(animate);
      
      if (controls) {
        controls.update();
      } else {
        // Manual rotation if no controls
        globe.rotation.y += 0.005;
      }
      
      renderer.render(scene, camera);
    }

    // Mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onMouseClick(event: MouseEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(globe);

      if (intersects.length > 0) {
        const point = intersects[0].point.normalize();
        
        // Convert 3D point to lat/lng (simplified)
        const lat = Math.asin(point.y) * (180 / Math.PI);
        const lng = Math.atan2(point.z, point.x) * (180 / Math.PI);
        
        // Mock country detection based on coordinates
        const mockCountry = getMockCountryFromCoords(lat, lng);
        if (mockCountry && globeData[mockCountry]) {
          setSelectedCountry({ code: mockCountry, data: globeData[mockCountry] });
          if (onCountryClick) {
            onCountryClick(mockCountry, globeData[mockCountry]);
          }
        }
      }
    }

    renderer.domElement.addEventListener('click', onMouseClick);

    // Handle resize
    function handleResize() {
      if (!mountRef.current) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.domElement.removeEventListener('click', onMouseClick);
      window.removeEventListener('resize', handleResize);
      
      // Dispose of Three.js objects
      geometry.dispose();
      material.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      renderer.dispose();
    };
  }, [isLoading, globeData, onCountryClick]);

  // Mock function to map coordinates to countries (simplified)
  function getMockCountryFromCoords(lat: number, lng: number): string | null {
    // This is a very simplified mapping for demo purposes
    // In a real app, you'd use proper geographic data
    if (lat > 30 && lat < 50 && lng > -130 && lng < -60) return 'US';
    if (lat > 20 && lat < 50 && lng > 70 && lng < 140) return 'CN';
    if (lat > 5 && lat < 35 && lng > 65 && lng < 95) return 'IN';
    if (lat > 50 && lat < 70 && lng > 30 && lng < 180) return 'RU';
    if (lat > 30 && lat < 46 && lng > 130 && lng < 146) return 'JP';
    if (lat > 47 && lat < 55 && lng > 5 && lng < 15) return 'DE';
    if (lat > -35 && lat < 5 && lng > -75 && lng < -35) return 'BR';
    if (lat > 45 && lat < 75 && lng > -140 && lng < -50) return 'CA';
    if (lat > -45 && lat < -10 && lng > 110 && lng < 155) return 'AU';
    if (lat > 50 && lat < 60 && lng > -8 && lng < 2) return 'GB';
    return null;
  }

  const resetView = () => {
    if (sceneRef.current?.controls) {
      sceneRef.current.controls.reset();
    }
  };

  if (isLoading) {
    return (
      <div className="relative w-full h-96 bg-gradient-to-br from-ocean-blue/10 to-earth-green/10 rounded-2xl overflow-hidden flex items-center justify-center">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-ocean-blue/10 to-earth-green/10 rounded-2xl overflow-hidden">
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Globe Controls */}
      <div className="absolute top-4 left-4 space-y-2">
        <Button
          size="sm"
          variant="secondary"
          className="w-10 h-10 rounded-full shadow-md bg-white/90 hover:bg-white p-0"
          onClick={resetView}
        >
          <svg className="w-5 h-5 text-earth-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </Button>
      </div>

      {/* Active Layer Indicator */}
      <div className="absolute top-4 right-4">
        <Badge className="bg-white/90 text-earth-green border-earth-green/20">
          CO₂ Layer Active
        </Badge>
      </div>

      {/* Country Data Tooltip */}
      {selectedCountry && (
        <Card className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm shadow-lg border-earth-green/20">
          <CardContent className="p-4">
            <div className="text-sm font-medium text-gray-700 mb-1">
              {getCountryName(selectedCountry.code)}
            </div>
            <div className="text-lg font-bold text-earth-green">
              CO₂: {selectedCountry.data.emissions.toLocaleString()} MtCO2e
            </div>
            <div className="text-sm text-gray-600">
              Population: {(selectedCountry.data.population / 1000000).toFixed(0)}M
            </div>
            <div className="text-sm text-gray-600">
              Per Capita: {selectedCountry.data.emissionsPerCapita} tCO2e
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 text-sm text-gray-600 bg-white/90 px-3 py-2 rounded-lg">
        Drag to rotate • Scroll to zoom • Click countries
      </div>
    </div>
  );
}

function getCountryName(code: string): string {
  const countryNames: Record<string, string> = {
    US: "United States",
    CN: "China",
    IN: "India",
    RU: "Russia",
    JP: "Japan",
    DE: "Germany",
    BR: "Brazil",
    CA: "Canada",
    AU: "Australia",
    GB: "United Kingdom"
  };
  return countryNames[code] || code;
}
