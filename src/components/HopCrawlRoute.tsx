import React, { useState, useMemo } from 'react';
import { Bar } from '../types';
import { Language, t } from '../lib/i18n';
import { getDistanceInKm } from '../App';
import { getBarGoogleMapsUrl } from '../maps_utils';
import { getBarOpenStatus } from '../lib/openingHours';
import { SpotFeatureBadges } from './SpotFeatureBadges';
import { PixelIcon } from './PixelIcons';
import MapInteractive from './MapInteractive';
import { motion } from 'motion/react';
import { MapPin, Navigation, Footprints, Clock, ExternalLink, RefreshCw, Compass } from 'lucide-react';

interface HopCrawlRouteProps {
  bars: Bar[];
  userLocation: { latitude: number; longitude: number };
  lang: Language;
  darkMode: boolean;
  onSelectBar: (bar: Bar) => void;
  selectedBar?: Bar | null;
  proximitySort?: boolean;
  onNavigateToMap?: () => void;
}

export function HopCrawlRoute({
  bars,
  userLocation,
  lang,
  darkMode,
  onSelectBar,
  selectedBar = null,
  proximitySort = false,
  onNavigateToMap
}: HopCrawlRouteProps) {
  const [maxRadius, setMaxRadius] = useState<number>(5.0); // 3km, 4km or 5km radius

  // Calculate distance from user to all bars
  const barsWithDist = useMemo(() => {
    return bars
      .map(bar => ({
        ...bar,
        distance: getDistanceInKm(
          userLocation.latitude,
          userLocation.longitude,
          bar.latitude,
          bar.longitude
        )
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [bars, userLocation]);

  // Filter bars within the walking radius (up to maxRadius km)
  const nearbySpots = useMemo(() => {
    return barsWithDist.filter(bar => bar.distance <= maxRadius);
  }, [barsWithDist, maxRadius]);

  // Select 3 to 4 bars for the walking route
  const routeBars = useMemo(() => {
    if (nearbySpots.length === 0) return [];
    // Take 3 to 4 closest bars
    return nearbySpots.slice(0, 4);
  }, [nearbySpots]);

  // Calculate total route walking distance & time
  const routeStats = useMemo(() => {
    if (routeBars.length === 0) {
      return { totalKm: 0, totalMins: 0, openCount: 0 };
    }

    let totalKm = 0;
    // User to first bar
    totalKm += routeBars[0].distance;

    // Leg between consecutive bars
    for (let i = 0; i < routeBars.length - 1; i++) {
      const distBetween = getDistanceInKm(
        routeBars[i].latitude,
        routeBars[i].longitude,
        routeBars[i + 1].latitude,
        routeBars[i + 1].longitude
      );
      totalKm += distBetween;
    }

    // Approx 12 min per km walking speed
    const totalMins = Math.round(totalKm * 12);
    const openCount = routeBars.filter(b => getBarOpenStatus(b, lang).isOpen).length;

    return { totalKm: parseFloat(totalKm.toFixed(1)), totalMins, openCount };
  }, [routeBars, lang]);

  // Generate Google Maps multi-destination direction URL
  const googleMapsRouteUrl = useMemo(() => {
    if (routeBars.length === 0) return '#';
    const origin = `${userLocation.latitude},${userLocation.longitude}`;
    const destination = `${routeBars[routeBars.length - 1].latitude},${routeBars[routeBars.length - 1].longitude}`;
    
    if (routeBars.length === 1) {
      return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`;
    }

    const waypoints = routeBars
      .slice(0, routeBars.length - 1)
      .map(b => `${b.latitude},${b.longitude}`)
      .join('|');

    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=walking`;
  }, [routeBars, userLocation]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-5 pb-20 select-none font-sans"
    >
      {/* Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl border-2 border-[#1B2036] bg-[#EFE6CC] shadow-[3px_3px_0px_#1B2036] text-[#1B2036]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-[#F2A93B] border border-[#1B2036] shadow-[1.5px_1.5px_0px_#1B2036]">
                <PixelIcon name="route" size={20} overrideColor="#1B2036" />
              </span>
              <h2 className="text-sm sm:text-base font-bold font-press tracking-tight uppercase text-[#1B2036]">
                {lang === 'PT' ? 'Rotas Cervejeiras' : 'Hop Route'}
              </h2>
            </div>
            <p className="text-xs text-[#1B2036]/80 font-body">
              {lang === 'PT' 
                ? 'Itinerário pedestre agrupando 3 a 4 spots próximos para uma caminhada perfeita.'
                : 'Walking itinerary grouping 3 to 4 nearby spots for a great craft beer route.'}
            </p>
          </div>

          {/* Radius Selector Pills */}
          <div className="flex items-center gap-1.5 self-start sm:self-center bg-[#F6EFDC] p-1 rounded-xl border-2 border-[#1B2036] shadow-[2px_2px_0px_#1B2036]">
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 text-[#1B2036] font-label">
              {lang === 'PT' ? 'Raio:' : 'Radius:'}
            </span>
            {[3, 4, 5].map(r => (
              <button
                key={r}
                onClick={() => setMaxRadius(r)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer font-data border-2 border-[#1B2036] ${
                  maxRadius === r
                    ? 'bg-[#12908C] text-white shadow-[1.5px_1.5px_0px_#1B2036]'
                    : 'bg-[#EFE6CC] text-[#1B2036] hover:bg-[#F2A93B]'
                }`}
              >
                {r} km
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content: If no spots in radius -> Show Exact Message */}
      {routeBars.length === 0 ? (
        <div className="p-8 rounded-2xl border-2 border-[#1B2036] bg-[#EFE6CC] text-center space-y-4 my-6 shadow-[3px_3px_0px_#1B2036] text-[#1B2036]">
          <div className="w-16 h-16 rounded-2xl bg-[#E85B41]/20 border-2 border-[#1B2036] flex items-center justify-center text-[#E85B41] mx-auto shadow-[2px_2px_0px_#1B2036]">
            <Compass className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className="text-sm font-bold text-[#E85B41] font-press">
              {lang === 'PT' ? 'Não existem spots à sua volta' : 'No spots around you'}
            </h3>
            <p className="text-xs text-[#1B2036]/80 font-body">
              {lang === 'PT'
                ? `Não foram encontrados locais de cerveja artesanal num raio de ${maxRadius} km da tua localização atual.`
                : `No craft beer spots found within a ${maxRadius} km radius of your current location.`}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
            <button
              onClick={() => setMaxRadius(10)}
              className="px-4 py-2 bg-[#12908C] hover:bg-[#0B6C69] text-white font-bold text-xs rounded-xl transition font-label uppercase border-2 border-[#1B2036] shadow-[2px_2px_0px_#1B2036] cursor-pointer"
            >
              {lang === 'PT' ? 'Expandir Raio de Pesquisa' : 'Expand Search Radius'}
            </button>
            <button
              onClick={() => {
                if (onNavigateToMap) {
                  onNavigateToMap();
                } else {
                  document.getElementById('hop-route-map-section')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="px-4 py-2 font-bold text-xs rounded-xl border-2 border-[#1B2036] bg-[#F6EFDC] text-[#1B2036] hover:bg-[#F2A93B] shadow-[2px_2px_0px_#1B2036] transition cursor-pointer font-label uppercase"
            >
              {lang === 'PT' ? 'Ver Todos no Mapa' : 'View All on Map'}
            </button>
          </div>
        </div>
      ) : (
        /* Route Found: Stats summary + Stop Cards */
        <div className="space-y-4">
          {/* Summary Card */}
          <div className="p-4 rounded-2xl border-2 border-[#1B2036] bg-[#EFE6CC] text-[#1B2036] shadow-[3px_3px_0px_#1B2036] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-xs font-semibold flex-wrap">
              <div className="flex items-center gap-1.5 text-[#E85B41] font-data font-bold">
                <Footprints className="w-4 h-4 shrink-0" />
                <span>{routeStats.totalKm} km {lang === 'PT' ? 'a pé' : 'walking'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#1B2036] font-data">
                <Clock className="w-4 h-4 shrink-0 text-[#12908C]" />
                <span>~{routeStats.totalMins} min</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#12908C] font-data font-bold">
                <span className="w-2 h-2 rounded-full bg-[#12908C] animate-ping" />
                <span>{routeStats.openCount} / {routeBars.length} {lang === 'PT' ? 'abertos agora' : 'open now'}</span>
              </div>
            </div>

            <a
              href={googleMapsRouteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-[#12908C] hover:bg-[#0B6C69] text-white font-bold text-xs rounded-xl transition shadow-[2px_2px_0px_#1B2036] border-2 border-[#1B2036] font-label uppercase flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span>{lang === 'PT' ? 'Abrir Rota no Google Maps' : 'Open Route in Google Maps'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Timeline of 3-4 Stops */}
          <div className="relative space-y-4 before:absolute before:left-5 before:top-6 before:bottom-6 before:w-0.5 before:bg-[#1B2036]/30">
            {routeBars.map((bar, index) => {
              const openStatus = getBarOpenStatus(bar, lang);
              const legDist = index === 0 
                ? bar.distance 
                : getDistanceInKm(
                    routeBars[index - 1].latitude,
                    routeBars[index - 1].longitude,
                    bar.latitude,
                    bar.longitude
                  );

              return (
                <div key={bar.id} className="relative pl-12">
                  {/* Timeline Badge Number */}
                  <div className="absolute left-2 top-3 -translate-x-1/2 w-7 h-7 rounded-full bg-[#F2A93B] text-[#1B2036] font-bold text-xs font-data flex items-center justify-center border-2 border-[#1B2036] shadow-[2px_2px_0px_#1B2036] z-10">
                    {index + 1}
                  </div>

                  {/* Spot Card */}
                  <div className="p-4 rounded-2xl border-2 border-[#1B2036] bg-[#F6EFDC] text-[#1B2036] shadow-[3px_3px_0px_#1B2036] transition-all hover:bg-white">
                    <div className="flex flex-col sm:flex-row gap-3">
                      {/* Cover Image */}
                      {bar.coverPhoto && (
                        <img 
                          src={bar.coverPhoto} 
                          alt={bar.name} 
                          className="w-full sm:w-28 h-24 object-cover rounded-xl shrink-0 border-2 border-[#1B2036]"
                        />
                      )}

                      <div className="flex-1 space-y-1.5 min-w-0">
                        {/* Title & Open Status */}
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <h4 
                              onClick={() => onSelectBar(bar)}
                              className="font-bold text-xs sm:text-sm tracking-tight font-press text-[#1B2036] hover:text-[#12908C] transition-colors cursor-pointer"
                            >
                              {bar.name}
                            </h4>
                            <p className="text-[11px] text-[#1B2036]/70 line-clamp-1 font-body mt-0.5">{bar.address}</p>
                          </div>

                          <span className={`px-2 py-0.5 rounded-md text-[8.5px] font-bold border-2 border-[#1B2036] shrink-0 font-label uppercase shadow-[1px_1px_0px_#1B2036] ${openStatus.isOpen ? 'bg-[#12908C] text-white' : 'bg-[#E85B41] text-white'}`}>
                            {openStatus.statusText}
                          </span>
                        </div>

                        {/* Spot Badges */}
                        <SpotFeatureBadges bar={bar} lang={lang} compact={true} />

                        {/* Walking distance indicator */}
                        <div className="pt-1 flex items-center justify-between text-[10px] font-semibold text-[#1B2036]/80 border-t border-[#1B2036]/20 mt-2 font-data">
                          <span className="flex items-center gap-1 text-[#E85B41] font-bold">
                            <Footprints className="w-3 h-3" />
                            {index === 0 
                              ? (lang === 'PT' ? `${legDist.toFixed(1)} km da tua posição` : `${legDist.toFixed(1)} km from your location`)
                              : (lang === 'PT' ? `${legDist.toFixed(1)} km da paragem ${index}` : `${legDist.toFixed(1)} km from stop ${index}`)
                            }
                          </span>

                          <button
                            onClick={() => onSelectBar(bar)}
                            className="text-[#12908C] font-bold hover:underline cursor-pointer font-label uppercase text-[9px]"
                          >
                            {lang === 'PT' ? 'Ver Detalhes →' : 'View Details →'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive Map Section immediately following the proposed beer spots */}
      <div className="space-y-2 pt-3" id="hop-route-map-section">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-xs sm:text-sm tracking-tight uppercase flex items-center space-x-1.5 text-[#1B2036] font-press">
            <MapPin className="w-4 h-4 text-[#E85B41]" />
            <span>{lang === 'PT' ? 'Mapa de Spots' : 'Spots Map'}</span>
          </h3>
          <span className="text-[10px] text-[#1B2036]/70 font-data">Google My Maps</span>
        </div>
        <div className="w-full h-[450px] sm:h-[520px] rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-[#1B2036] shadow-[3px_3px_0px_#1B2036]">
          <MapInteractive 
            bars={bars} 
            selectedBar={selectedBar} 
            onSelectBar={onSelectBar} 
            darkMode={false} 
            activeRoute={routeBars.map(b => b.id)} 
            userLocation={userLocation}
            proximityMode={proximitySort}
          />
        </div>
      </div>
    </motion.div>
  );
}
