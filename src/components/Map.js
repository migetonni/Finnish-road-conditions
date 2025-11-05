import { useEffect, useRef } from "react";
import leaflet from "leaflet";
import 'leaflet/dist/leaflet.css';
import L from "leaflet";
import RoadData from "../api/fetchRoadData";
import fetchRoadData from "../api/fetchRoadData";
import colorPicker from "../utils/roadColor";

export default function Map() {

    const mapRef = useRef();
    
    const geoJsonLayerRef = useRef({});

    useEffect(()=> {
        mapRef.current = leaflet.map('map', { preferCanvas: true }).setView([64.5, 26.0], 5);

        
        leaflet.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
            maxZoom: 19,
            subdomains: ['a', 'b', 'c', 'd'],
            attribution:  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        }).addTo(mapRef.current);
           
        const controlDiv = L.control({ position: "bottomleft" });
        controlDiv.onAdd = () => {
        const div = L.DomUtil.create("div", "leaflet-control-layers leaflet-bar");
        div.innerHTML = `
            <label style="display:block;margin:4px;">
                <input type="checkbox" id="mainRoad" checked> Main Roads
            </label>
            <label style="display:block;margin:4px;">
                <input type="checkbox" id="secondaryRoad"> Secondary Roads
            </label>
            <label style="display:block;margin:4px;">
                <input type="checkbox" id="minorRoad"> Minor Roads
            </label>
        `;
      return div;
    };
    controlDiv.addTo(mapRef.current);

      

    
        
        
        

        let isFetching = false;
        const loadData = async (type) => {
            if (isFetching) {
                return;
            }
            isFetching = true;
            
            
            let roadType = "";

            if (type == "mainRoad") roadType = "mainRoad";
            else if (type == "secondaryRoad") roadType = "secondaryRoad";
            else roadType = "minorRoad";

            

            
            
             
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
        
        const layer = L.geoJSON(
          { type: "FeatureCollection", features },
          {
            style: (feature) => ({
              color: colorPicker(
                feature.properties.condition,
                feature.properties.precipitation
              ),
              weight: 2,
              opacity: 2,
            }),
          }
        )

        geoJsonLayerRef.current[type] = layer;
        layer.addTo(mapRef.current);
        isFetching = false
            
    }
        const buttonListener= async (box, type) => {
            if (box.checked) {
                
                await loadData(type);
            } else {
                
                if (geoJsonLayerRef.current[type]) {
                    mapRef.current.removeLayer(geoJsonLayerRef.current[type]);
                    delete geoJsonLayerRef.current[type];
                    }
            }
        }


    

        
        setTimeout(() => {
            const mainBox = document.getElementById("mainRoad");
            const secondaryBox = document.getElementById("secondaryRoad");
            const minorBox = document.getElementById("minorRoad");

            [mainBox, secondaryBox, minorBox].forEach((box) => {
                box.addEventListener("change", () => buttonListener(box, box.id));
            });

            buttonListener(mainBox, "mainRoad");
            }, 100);


        
        
        


        
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);


    return(<div id="map"></div>);
}