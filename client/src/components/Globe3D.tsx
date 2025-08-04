import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import * as THREE from "three";

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

// Enhanced function to map coordinates to countries (outside component)
function getMockCountryFromCoords(lat: number, lng: number): string | null {
  // North America
  if (lat > 49 && lat < 71 && lng > -168 && lng < -53) return 'CA'; // Canada
  if (lat > 24 && lat < 49 && lng > -125 && lng < -66) return 'US'; // USA
  if (lat > 14 && lat < 33 && lng > -118 && lng < -86) return 'MX'; // Mexico
  
  // South America  
  if (lat > -34 && lat < 12 && lng > -82 && lng < -34) return 'BR'; // Brazil
  if (lat > -56 && lat < -21 && lng > -74 && lng < -53) return 'AR'; // Argentina
  if (lat > -19 && lat < -0 && lng > -82 && lng < -68) return 'PE'; // Peru
  if (lat > -5 && lat < 13 && lng > -79 && lng < -66) return 'CO'; // Colombia
  if (lat > -56 && lat < -17 && lng > -76 && lng < -66) return 'CL'; // Chile
  
  // Europe
  if (lat > 47 && lat < 55 && lng > 5 && lng < 15) return 'DE'; // Germany
  if (lat > 41 && lat < 51 && lng > -5 && lng < 9) return 'FR'; // France
  if (lat > 49 && lat < 61 && lng > -11 && lng < 2) return 'GB'; // UK
  if (lat > 35 && lat < 44 && lng > -10 && lng < 4) return 'ES'; // Spain
  if (lat > 36 && lat < 47 && lng > 6 && lng < 19) return 'IT'; // Italy
  if (lat > 57 && lat < 71 && lng > 4 && lng < 31) return 'NO'; // Norway
  if (lat > 55 && lat < 69 && lng > 10 && lng < 24) return 'SE'; // Sweden
  if (lat > 59 && lat < 70 && lng > 19 && lng < 32) return 'FI'; // Finland
  if (lat > 48 && lat < 55 && lng > 14 && lng < 24) return 'PL'; // Poland
  
  // Asia
  if (lat > 18 && lat < 54 && lng > 73 && lng < 135) return 'CN'; // China
  if (lat > 7 && lat < 36 && lng > 68 && lng < 97) return 'IN'; // India
  if (lat > 30 && lat < 46 && lng > 129 && lng < 146) return 'JP'; // Japan
  if (lat > 33 && lat < 39 && lng > 124 && lng < 131) return 'KR'; // South Korea
  if (lat > -11 && lat < 6 && lng > 94 && lng < 141) return 'ID'; // Indonesia
  if (lat > 4 && lat < 21 && lng > 100 && lng < 107) return 'TH'; // Thailand
  if (lat > 0 && lat < 7 && lng > 100 && lng < 104) return 'SG'; // Singapore
  if (lat > 36 && lat < 42 && lng > 25 && lng < 45) return 'TR'; // Turkey
  if (lat > 24 && lat < 40 && lng > 44 && lng < 64) return 'IR'; // Iran
  if (lat > 12 && lat < 33 && lng > 34 && lng < 60) return 'SA'; // Saudi Arabia
  
  // Russia (spans Europe and Asia)
  if (lat > 41 && lat < 82 && lng > 19 && lng < 180) return 'RU';
  if (lat > 41 && lat < 82 && lng > -180 && lng < -168) return 'RU';
  
  // Africa
  if (lat > 21 && lat < 32 && lng > 24 && lng < 37) return 'EG'; // Egypt
  if (lat > -35 && lat < -22 && lng > 16 && lng < 33) return 'ZA'; // South Africa
  if (lat > 4 && lat < 14 && lng > 2 && lng < 15) return 'NG'; // Nigeria
  if (lat > -13 && lat < 5 && lng > 11 && lng < 31) return 'CD'; // DR Congo
  if (lat > -5 && lat < 13 && lng > 33 && lng < 42) return 'KE'; // Kenya
  if (lat > 3 && lat < 15 && lng > 33 && lng < 48) return 'ET'; // Ethiopia
  
  // Oceania
  if (lat > -48 && lat < -10 && lng > 112 && lng < 155) return 'AU'; // Australia
  if (lat > -48 && lat < -34 && lng > 165 && lng < 179) return 'NZ'; // New Zealand
  
  return null;
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
    if (!mountRef.current || isLoading || Object.keys(globeData).length === 0) return;

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

    // Orbit controls implementation
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotationSpeed = 0.005;
    let zoomSpeed = 0.1;
    let autoRotate = true;
    let autoRotateSpeed = 0.002;

    const controls = {
      update: () => {},
      reset: () => {
        camera.position.set(0, 0, 5);
        globe.rotation.set(0, 0, 0);
        autoRotate = true;
      },
      enableAutoRotate: (enable: boolean) => {
        autoRotate = enable;
      }
    };

    // Store references
    sceneRef.current = { scene, camera, renderer, globe, controls };
    rendererRef.current = renderer;

    // Animation loop
    function animate() {
      frameRef.current = requestAnimationFrame(animate);
      
      // Auto rotation when not dragging
      if (autoRotate && !isDragging) {
        globe.rotation.y += autoRotateSpeed;
      }
      
      renderer.render(scene, camera);
    }

    // Mouse interaction for both controls and country selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onMouseDown(event: MouseEvent) {
      isDragging = true;
      autoRotate = false;
      previousMousePosition = { x: event.clientX, y: event.clientY };
      renderer.domElement.style.cursor = 'grabbing';
    }

    function onMouseMove(event: MouseEvent) {
      if (isDragging) {
        const deltaX = event.clientX - previousMousePosition.x;
        const deltaY = event.clientY - previousMousePosition.y;
        
        globe.rotation.y += deltaX * rotationSpeed;
        globe.rotation.x += deltaY * rotationSpeed;
        
        // Limit vertical rotation
        globe.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, globe.rotation.x));
        
        previousMousePosition = { x: event.clientX, y: event.clientY };
      }
    }

    function onMouseUp() {
      isDragging = false;
      renderer.domElement.style.cursor = 'grab';
      // Resume auto-rotation after a delay
      setTimeout(() => {
        if (!isDragging) autoRotate = true;
      }, 2000);
    }

    function onMouseClick(event: MouseEvent) {
      // Only trigger country selection if we weren't dragging
      if (!isDragging) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(globe);

        if (intersects.length > 0) {
          const point = intersects[0].point.normalize();
          
          // Convert 3D point to lat/lng with correct mapping
          const lat = Math.asin(point.y) * (180 / Math.PI);
          const lng = Math.atan2(point.x, point.z) * (180 / Math.PI); // Fixed: x,z order for longitude
          
          // Mock country detection based on coordinates
          const mockCountry = getMockCountryFromCoords(lat, lng);
          if (mockCountry && globeData[mockCountry]) {
            console.log(`Detected country: ${mockCountry} at lat=${lat.toFixed(2)}, lng=${lng.toFixed(2)}`);
            setSelectedCountry({ code: mockCountry, data: globeData[mockCountry] });
            if (onCountryClick) {
              onCountryClick(mockCountry, globeData[mockCountry]);
            }
          } else {
            // Clear selection if no country found
            setSelectedCountry(null);
          }
        }
      }
    }

    function onWheel(event: WheelEvent) {
      event.preventDefault();
      const scale = event.deltaY > 0 ? 1 + zoomSpeed : 1 - zoomSpeed;
      camera.position.multiplyScalar(scale);
      
      // Limit zoom
      const distance = camera.position.length();
      if (distance < 3) camera.position.normalize().multiplyScalar(3);
      if (distance > 10) camera.position.normalize().multiplyScalar(10);
    }

    // Add event listeners
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('click', onMouseClick);
    renderer.domElement.addEventListener('wheel', onWheel);
    renderer.domElement.style.cursor = 'grab';

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
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('click', onMouseClick);
      renderer.domElement.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      
      // Dispose of Three.js objects
      geometry.dispose();
      material.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      renderer.dispose();
    };
  }, [isLoading]); // Only recreate when loading state changes

  const resetView = () => {
    if (sceneRef.current?.controls) {
      sceneRef.current.controls.reset();
    }
  };

  const toggleAutoRotate = () => {
    if (sceneRef.current?.controls) {
      const currentAutoRotate = sceneRef.current.controls.enableAutoRotate;
      sceneRef.current.controls.enableAutoRotate(!currentAutoRotate);
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
        <Button
          size="sm"
          variant="secondary"
          className="w-10 h-10 rounded-full shadow-md bg-white/90 hover:bg-white p-0"
          onClick={toggleAutoRotate}
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
      <div className="absolute bottom-4 right-4 text-sm text-gray-600 bg-white/90 px-3 py-2 rounded-lg shadow-sm">
        <div className="flex flex-col space-y-1">
          <span>🖱️ Drag to rotate</span>
          <span>🔍 Scroll to zoom</span>
          <span>🌍 Click countries for data</span>
        </div>
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
    GB: "United Kingdom",
    MX: "Mexico",
    AR: "Argentina",
    PE: "Peru",
    CO: "Colombia",
    CL: "Chile",
    VE: "Venezuela",
    FR: "France",
    ES: "Spain",
    IT: "Italy",
    NO: "Norway",
    SE: "Sweden",
    FI: "Finland",
    PL: "Poland",
    KR: "South Korea",
    ID: "Indonesia",
    TH: "Thailand",
    VN: "Vietnam",
    SG: "Singapore",
    TR: "Turkey",
    IR: "Iran",
    IQ: "Iraq",
    SA: "Saudi Arabia",
    EG: "Egypt",
    ZA: "South Africa",
    NG: "Nigeria",
    CD: "DR Congo",
    KE: "Kenya",
    ET: "Ethiopia",
    NZ: "New Zealand"
  };
  return countryNames[code] || code;
}