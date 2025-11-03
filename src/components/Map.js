import { useEffect, useRef } from "react";
import leaflet from "leaflet";
import 'leaflet/dist/leaflet.css';
import L from "leaflet";
import RoadData from "../api/fetchRoadData";
import fetchRoadData from "../api/fetchRoadData";
import colorPicker from "../utils/roadColor";

export default function Map() {

    const mapRef = useRef();
    const lastRoadTypeRef = useRef(null);
    const geoJsonLayerRef = useRef(null);

    useEffect(()=> {
        mapRef.current = leaflet.map('map', { preferCanvas: true }).setView([64.5, 26.0], 5);

        
        leaflet.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
            maxZoom: 19,
            subdomains: ['a', 'b', 'c', 'd'],
            attribution:  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        }).addTo(mapRef.current);

        const getZoomLev=()=> {
            let zoomlev = mapRef.current.getZoom()
            return zoomlev
        }

        let isFetching = false;
        const loadData = async () => {
            if (isFetching) {
                return;
            }
            isFetching = true;
            
            const zoomLev = getZoomLev();
            let roadType = "";

            if (zoomLev <= 7) roadType = "mainRoad";
            else if (zoomLev <= 10) roadType = "secondaryRoad";
            else roadType = "minorRoad";
             if (geoJsonLayerRef.current && mapRef.current.hasLayer(geoJsonLayerRef.current)) {
                mapRef.current.removeLayer(geoJsonLayerRef.current);
                geoJsonLayerRef.current = null;
                };

            
            if (lastRoadTypeRef.current !== roadType) {
                
            
                if (geoJsonLayerRef.current) {
                    mapRef.current.removeLayer(geoJsonLayerRef.current);
                    }
            }    
            let from = 0;
            let hasMore = true;
            let pageSize = 500;

            
            const data = await fetchRoadData(from, pageSize, hasMore, roadType);
            const features = data.map((row) => {
            const coords = JSON.parse(row.coords_json);

            
            const lines = coords.map((segment) =>
                segment.map(([lon, lat]) => [lon, lat])
            );

            return {
                type: "Feature",
                geometry: { type: "MultiLineString", coordinates: lines },
                properties: {
                condition: row.overall_road_condition,
                precipitation: row.precipitation_condition,
                },
            };
            });
        
        geoJsonLayerRef.current = L.geoJSON(
          { type: "FeatureCollection", features },
          {
            style: (feature) => ({
              color: colorPicker(
                feature.properties.condition,
                feature.properties.precipitation
              ),
              weight: 2,
              opacity: 0.8,
            }),
          }
        ).addTo(mapRef.current);

        lastRoadTypeRef.current = roadType;
        isFetching = false
            
    }
        loadData()

        mapRef.current.on("zoomend", () =>{
            loadData();
        })

        
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);


    return(<div id="map"></div>);
}