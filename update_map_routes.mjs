import fs from 'fs';
let content = fs.readFileSync('src/components/AboutProject.tsx', 'utf-8');

// Add umyCoords and the route/boundary arrays
const mapDataCode = `
  const klampokCoords = { lng: 110.4067402502076, lat: -8.034789215438893 };
  const umyCoords = { lng: 110.320347, lat: -7.807904 };
  
  const routeCoords: [number, number][] = [
    [110.320347, -7.807904], // UMY
    [110.329800, -7.887900], // Bantul
    [110.334000, -7.950000], // South Bantul
    [110.322800, -8.016300], // Parangtritis area
    [110.380000, -8.025000], // Purwosari approach
    [110.406740, -8.034789]  // Klampok
  ];

  const boundaryCoords: [number, number][] = [
    [110.398, -8.025],
    [110.415, -8.022],
    [110.418, -8.045],
    [110.400, -8.048],
    [110.395, -8.035],
    [110.398, -8.025] // close loop
  ];
`;

content = content.replace(
  'const klampokCoords = { lng: 110.4067402502076, lat: -8.034789215438893 };',
  mapDataCode
);

// We need to change the map zoom and center so both UMY and Klampok are somewhat visible, 
// or maybe just zoom out a bit. 
// Currently:
// center={[klampokCoords.lng, klampokCoords.lat]} 
// zoom={15.0}
content = content.replace(
  'zoom={15.0}',
  'zoom={11.0}'
);
content = content.replace(
  'center={[klampokCoords.lng, klampokCoords.lat]}',
  'center={[(umyCoords.lng + klampokCoords.lng) / 2, (umyCoords.lat + klampokCoords.lat) / 2]}'
);

// Insert the MapRoutes and UMY MapMarker
const mapExtras = `
                        <MapControls showZoom={true} showLocate={true} showFullscreen={true} position="top-right" />
                        
                        {/* Route Line */}
                        <MapRoute coordinates={routeCoords} color="#06b6d4" width={4} opacity={0.8} dashArray={[2, 2]} />
                        {/* Village Boundary */}
                        <MapRoute coordinates={boundaryCoords} color="#10b981" width={2} opacity={0.6} dashArray={[4, 4]} />

                        {/* UMY Marker */}
                        <MapMarker longitude={umyCoords.lng} latitude={umyCoords.lat}>
                          <MarkerContent>
                            <div className="relative flex h-6 w-6 items-center justify-center">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-white border-2 border-slate-900 shadow-[0_0_10px_rgba(255,255,255,0.5)]"></span>
                            </div>
                            <MarkerLabel position="bottom" className="text-white bg-slate-900 py-0.5 px-1.5 rounded text-[8px] font-mono tracking-wider shadow-lg">
                              KAMPUS TERPADU UMY
                            </MarkerLabel>
                          </MarkerContent>
                        </MapMarker>
`;

content = content.replace(
  '<MapControls showZoom={true} showLocate={true} showFullscreen={true} position="top-right" />',
  mapExtras
);

fs.writeFileSync('src/components/AboutProject.tsx', content);
console.log("Updated map with route and boundary");
