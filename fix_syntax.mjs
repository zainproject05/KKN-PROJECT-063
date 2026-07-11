import fs from 'fs';
let content = fs.readFileSync('src/components/AboutProject.tsx', 'utf-8');

// Fix the import
content = content.replace(
  'import { Map, MapMarker, MarkerContent, MarkerLabel, MarkerPopup, MapControls, MapRoute } from',
  'import { Map, MapMarker, MarkerContent, MarkerLabel, MarkerPopup, MapControls, MapRoute } from'
);
// It was actually:
// import { Map, MapMarker, MarkerContent, MarkerLabel, MarkerPopup, MapControls, MapRoute } from "./ui/mapcn-marker-popup";

// The error is at `<MapControls, MapRoute showZoom=`
content = content.replace(
  '<MapControls, MapRoute showZoom={true}',
  '<MapControls showZoom={true}'
);

fs.writeFileSync('src/components/AboutProject.tsx', content);
