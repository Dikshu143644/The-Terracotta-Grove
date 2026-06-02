import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Compass, Star, Route, AlertTriangle, Play, RefreshCw, Radio } from 'lucide-react';

declare const L: any;

const RESORT_COORDS: [number, number] = [18.7356, 73.4354]; // Sahyadris near Lonavala, MH

// Haversine formula to compute distance in km
const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const ResortMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const resortMarkerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);

  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'prompting' | 'granted' | 'denied' | 'simulated'>('prompting');
  const [simulatedSource, setSimulatedSource] = useState<'pune' | 'mumbai' | null>(null);
  const [isDriveSimulating, setIsDriveSimulating] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);

  const simulationIntervalRef = useRef<any>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current) return;

    // Check if Leaflet is loaded
    if (typeof L === 'undefined') {
      console.error('Leaflet is not loaded yet');
      return;
    }

    // Standard map initialized
    const map = L.map(mapRef.current, {
      zoomControl: false,
    }).setView(RESORT_COORDS, 11);

    mapInstanceRef.current = map;

    // Add beautiful minimalist dark-mode style tiles (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    // Zoom buttons in a better position
    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);

    // Beautiful custom icon for Terracotta resort
    const terracottaIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute h-10 w-10 bg-orange-500/20 rounded-full animate-ping"></div>
          <div class="h-8 w-8 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full flex items-center justify-center border-2 border-stone-100 shadow-lg shadow-orange-500/50">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-stone-100"><path d="m12 3-1.912 5.886a1 1 0 0 1-.95.686H2.937l4.9 3.56a1 1 0 0 1 .364 1.118L6.29 20.138l4.9-3.56a1 1 0 0 1 1.191 0l4.9 3.56-1.912-5.886a1 1 0 0 1 .364-1.118l4.9-3.56h-6.202a1 1 0 0 1-.95-.686z"/></svg>
          </div>
        </div>
      `,
      className: '',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    const resortMarker = L.marker(RESORT_COORDS, { icon: terracottaIcon })
      .addTo(map)
      .bindPopup(`
        <div class="text-stone-900 font-sans p-1">
          <h4 class="font-bold text-base text-amber-800">The Terracotta Grove</h4>
          <p class="text-xs text-stone-600 mt-1">Earthy Escapade in Sahyadri Range</p>
          <div class="text-[10px] bg-stone-100 px-2 py-1 rounded inline-block mt-2 text-stone-500 font-semibold">18.7356° N, 73.4354° E</div>
        </div>
      `);

    resortMarkerRef.current = resortMarker;

    // Detect browser geolocation on mount
    requestLiveLocation();

    return () => {
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Request browser geolocation
  const requestLiveLocation = () => {
    if (!navigator.geolocation) {
      setPermissionStatus('denied');
      return;
    }

    setPermissionStatus('prompting');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setGpsAccuracy(Math.round(accuracy));
        setPermissionStatus('granted');
        updateUserLocation([latitude, longitude]);
      },
      (error) => {
        console.warn("Geolocation permission error: ", error.message);
        setPermissionStatus('denied');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Update user location on map
  const updateUserLocation = (coords: [number, number]) => {
    setUserCoords(coords);
    const dist = getDistanceKm(coords[0], coords[1], RESORT_COORDS[0], RESORT_COORDS[1]);
    setDistance(dist);

    const map = mapInstanceRef.current;
    if (!map) return;

    // Create custom pulsing icon for Traveler
    const travelerIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute h-8 w-8 bg-blue-500/30 rounded-full animate-ping"></div>
          <div class="h-5 w-5 bg-blue-500 rounded-full border-2 border-stone-100 shadow-xl shadow-blue-500/40 flex items-center justify-center">
            <div class="h-1.5 w-1.5 bg-white rounded-full"></div>
          </div>
        </div>
      `,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng(coords);
    } else {
      userMarkerRef.current = L.marker(coords, { icon: travelerIcon })
        .addTo(map)
        .bindPopup(`
          <div class="text-stone-900 font-sans p-1">
            <h4 class="font-bold text-xs text-blue-800">Your Current Location</h4>
            <p class="text-[10px] text-stone-500">Watching live feed...</p>
          </div>
        `);
    }

    // Refresh Path Line
    if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
    }

    routeLineRef.current = L.polyline([coords, RESORT_COORDS], {
      color: '#E07A5F', // rustic-clay
      weight: 3,
      opacity: 0.8,
      dashArray: '10, 8',
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // Auto fit map boundary to show both markers beautifully
    const bounds = L.latLngBounds([coords, RESORT_COORDS]);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
  };

  // Simulate user traveling from either Pune or Mumbai
  const startSimulation = (source: 'pune' | 'mumbai') => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
    }

    setIsDriveSimulating(true);
    setPermissionStatus('simulated');
    setSimulatedSource(source);

    // Starting Coordinates
    const startCoords: [number, number] = source === 'pune' 
      ? [18.5204, 73.8567] // Pune
      : [19.0760, 72.8777]; // Mumbai

    let steps = 0;
    const totalSteps = 40; // 40 steps to reach resort
    updateUserLocation(startCoords);

    simulationIntervalRef.current = setInterval(() => {
      steps++;
      if (steps > totalSteps) {
        clearInterval(simulationIntervalRef.current);
        setIsDriveSimulating(false);
        updateUserLocation(RESORT_COORDS);
        return;
      }

      // Linear interpolation to make the pin creep closer
      const ratio = steps / totalSteps;
      const currentLat = startCoords[0] + (RESORT_COORDS[0] - startCoords[0]) * ratio;
      const currentLng = startCoords[1] + (RESORT_COORDS[1] - startCoords[1]) * ratio;

      updateUserLocation([currentLat, currentLng]);
    }, 450); // Updates very smoothly every 450ms
  };

  const centerOnResort = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(RESORT_COORDS, 14, { animate: true });
      if (resortMarkerRef.current) {
        resortMarkerRef.current.openPopup();
      }
    }
  };

  return (
    <div className="flex flex-col h-full w-full rounded-xl overflow-hidden border border-stone-800 bg-stone-900/40 backdrop-blur-md">
      {/* Map HUD Control header */}
      <div className="bg-stone-900/90 border-b border-stone-800 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <h3 className="font-serif text-lg text-stone-100 flex items-center gap-1.5 font-bold">
              <Compass className="text-rustic-clay" size={18} /> GPS Live Tracker Map
            </h3>
          </div>
          <p className="text-stone-400 text-xs mt-1">
            Real-time coordinates joining your location to <span className="text-rustic-gold font-semibold">The Terracotta Grove</span>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={centerOnResort}
            className="px-3 py-1.5 bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-800 rounded font-bold flex items-center gap-1 transition-colors"
          >
            <MapPin size={12} className="text-orange-500" /> Center Resort
          </button>

          <button
            onClick={() => startSimulation('pune')}
            className={`px-3 py-1.5 rounded font-bold flex items-center gap-1 transition-colors border ${
              simulatedSource === 'pune' && isDriveSimulating
                ? 'bg-amber-600 border-amber-500 text-stone-900'
                : 'bg-stone-950 hover:bg-stone-800 text-stone-400 border-stone-800'
            }`}
          >
            <Route size={12} /> Drive from Pune
          </button>

          <button
            onClick={() => startSimulation('mumbai')}
            className={`px-3 py-1.5 rounded font-bold flex items-center gap-1 transition-colors border ${
              simulatedSource === 'mumbai' && isDriveSimulating
                ? 'bg-amber-600 border-amber-500 text-stone-900'
                : 'bg-stone-950 hover:bg-stone-800 text-stone-400 border-stone-800'
            }`}
          >
            <Route size={12} /> Drive from Mumbai
          </button>

          {permissionStatus === 'denied' && (
            <button
              onClick={requestLiveLocation}
              className="px-3 py-1.5 bg-rustic-clay hover:bg-orange-600 text-stone-950 rounded font-bold flex items-center gap-1 transition-all"
            >
              <RefreshCw size={12} /> Retry GPS Access
            </button>
          )}
        </div>
      </div>

      {/* Main Map Body content and Sidebar stats */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-[380px] h-full relative">
        {/* Leaflet map Container */}
        <div ref={mapRef} id="leaflet-resort-map" className="flex-1 h-full min-h-[280px] z-10 bg-stone-950" />

        {/* Real-time stats Panel info box overlay */}
        <div className="w-full lg:w-72 bg-gradient-to-b from-stone-900 to-stone-950 border-t lg:border-t-0 lg:border-l border-stone-800 p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <h4 className="text-xs uppercase font-semibold text-stone-500 tracking-widest flex items-center gap-1">
              <Radio size={12} className="text-rustic-clay shrink-0" /> Live Telemetry
            </h4>

            {distance !== null ? (
              <div className="space-y-3">
                <div className="bg-stone-950 p-3.5 rounded border border-stone-800">
                  <div className="text-xs text-stone-400">Total Distance Remaining</div>
                  <div className="text-3xl font-bold font-serif text-rustic-clay mt-1">
                    {distance.toFixed(1)} <span className="text-sm font-sans font-medium text-stone-400">km</span>
                  </div>
                  <div className="text-[10px] text-stone-500 mt-1.5 flex items-center gap-1">
                    <Navigation size={10} className="text-emerald-500 rotate-45" /> 
                    {distance < 0.2 ? 'You have arrived at our gateway!' : 'Pathway calculated via NH-48'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-stone-950 p-2.5 rounded border border-stone-800">
                    <div className="text-stone-500 text-[10px]">Travel Status</div>
                    <div className="text-stone-300 font-bold mt-0.5 capitalize">
                      {isDriveSimulating ? 'Simulating Cruise' : distance < 0.2 ? 'Checked In' : 'En Route'}
                    </div>
                  </div>
                  <div className="bg-stone-950 p-2.5 rounded border border-stone-800">
                    <div className="text-stone-500 text-[10px]">Avg Speed</div>
                    <div className="text-stone-300 font-bold mt-0.5">
                      {isDriveSimulating ? '75 km/h' : '65 km/h'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 py-4 text-center">
                <AlertTriangle className="mx-auto text-amber-500/70" size={32} />
                <p className="text-xs text-stone-400 leading-relaxed max-w-[200px] mx-auto">
                  {permissionStatus === 'prompting' 
                    ? 'Requesting browser location access pin...' 
                    : 'Awaiting your GPS permission or route simulation selected above to activate live feed.'}
                </p>
              </div>
            )}

            {/* Quick destination attractions card */}
            <div className="bg-stone-950/70 p-3 rounded border border-stone-800/80 space-y-2 text-xs">
              <span className="font-semibold text-rustic-gold flex items-center gap-1">
                <Star size={12} fill="currentColor" /> Sahyadri Landmarks Passed
              </span>
              <ul className="space-y-1.5 text-stone-400 text-[11px]">
                <li className="flex justify-between"><span>• Pune Expressway toll</span> <span className="text-stone-600 font-mono">Exit km 55</span></li>
                <li className="flex justify-between"><span>• Tiger Point valley</span> <span className="text-stone-600 font-mono">Passed</span></li>
                <li className="flex justify-between"><span>• Karla Buddha Caves</span> <span className="text-stone-600 font-mono">Nearby</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-2 text-[10px] text-stone-500 border-t border-stone-800 flex items-center justify-between">
            <span>Accuracy: {gpsAccuracy ? `±${gpsAccuracy}m` : 'Simulated Radar'}</span>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/40"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResortMap;
