import "leaflet/dist/leaflet.css";
import Leaflet from "leaflet";
import { LocationData } from "@advanced-react/shared/schema/experience";
import { MapPin } from "lucide-react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { useEffect } from "react";
const MarkerIcon = Leaflet.icon({
  iconUrl: "/map-marker.webp",
  iconSize: [41, 41],
  iconAnchor: [20, 41],
});
type LocationDisplayProps = {
  location: Omit<LocationData, "displayName"> & { displayName?: string };
  zoom?: number;
};

export function LocationDisplay({ location, zoom = 18 }: LocationDisplayProps) {
  return (
    <div className="space-y-4">
      {location.displayName && (
        <div className="flex flex-row items-center gap-2">
          <MapPin className="text-primary-500 h-6 w-6" />
          <span className="flex-1 text-neutral-600 dark:text-neutral-600">
            {location.displayName}
          </span>
        </div>
      )}
      <div className="h-[300px] w-full overflow-hidden rounded-md">
        <MapContainer
          center={[location.lat, location.lon]}
          zoom={zoom}
          className="h-full w-full"
          scrollWheelZoom={true}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker icon={MarkerIcon} position={[location.lat, location.lon]} />
          <MapUpdater location={location} zoom={zoom} />
        </MapContainer>
      </div>
    </div>
  );
}
type MapUpdaterProps = LocationDisplayProps;
function MapUpdater({ location, zoom }: MapUpdaterProps) {
  const map = useMap();
  useEffect(() => {
    map.setView([location.lat, location.lon], zoom);
  }, [location, map, zoom]);
  return null;
}
