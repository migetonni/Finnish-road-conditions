import { useEffect, useRef, useState } from "react";
import 'leaflet/dist/leaflet.css';
import L from "leaflet";
import RoadData from "../api/fetchRoadData";
import fetchRoadData from "../api/fetchRoadData";
import colorPicker from "../utils/roadColor";
import { BarLoader, BeatLoader, ClipLoader, PacmanLoader, RingLoader } from "react-spinners";
import "leaflet-boundary-canvas";
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import { Link } from "react-router-dom";




export default function Map() {

    const mapRef = useRef();
    const isFetchingRef = useRef({});
    
    const geoJsonLayerRef = useRef({});
    const [loading, setLoading] = useState(false);

    useEffect(()=> {
        
        
        
        const fetchGeoJSON = async () => {
        const finlandBounds = [
            [59.5, 19.0],  // Southwest corner
            [70.5, 31.5]   // Northeast corner
        ];
        const provider = new OpenStreetMapProvider();

        const searchControl = new GeoSearchControl({
        provider: provider,
        style:'button',
        showMarker: false,
        searchLabel: 'Tien nimi',
        autoClose: false,
        
        });
            
        const response = await fetch(
            "https://raw.githubusercontent.com/johan/world.geo.json/master/countries/FIN.geo.json"
            );
        const geoJSON = await response.json();
        mapRef.current = L.map('map', { preferCanvas: true,maxBounds: finlandBounds, trackResize: true, maxBoundsViscosity: 5, minZoom: 5 }).setView([64.5, 26.0], 5);
        

        const finlandLayer = L.geoJSON(geoJSON);
        mapRef.current.fitBounds(finlandLayer.getBounds());

        
        L.TileLayer.boundaryCanvas('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
            maxZoom: 19,
            subdomains: ['a', 'b', 'c', 'd'],
            boundary: geoJSON,
            attribution:  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        }).addTo(mapRef.current);
        mapRef.current.addControl(searchControl);
        
            
        
        
        
        
           
        const controlDiv = L.control({ position: "topleft" });
        controlDiv.onAdd = () => {
        const div = L.DomUtil.create("div", "leaflet-control-layers leaflet-bar");
        div.innerHTML = `
            <label style="display:block;margin:2px;">
                <input type="checkbox" id="mainRoad" checked> Main Roads
            </label>
            <label style="display:block;margin:2px;">
                <input type="checkbox" id="secondaryRoad"> Secondary Roads
            </label>
            <label style="display:block;margin:2px;">
                <input type="checkbox" id="minorRoad"> Minor Roads
            </label>
        `;
      return div;
    };
    controlDiv.addTo(mapRef.current);

    const legend = L.control({ position: 'topright' });
    legend.onAdd = function () {
    const div = L.DomUtil.create('div', 'info legend');
    const categories = [
        { label: 'Kunnossa', condition: 'good', precipitation: 'dry', color: "#009933" },
        { label: 'Märkä', condition: 'good', precipitation: 'wet', color: "#0000ff" },
        { label: 'Huonossa kunnossa', condition: 'bad', precipitation: 'dry', color: "#ff3300" },
        { label: 'Huonossa kunnossa ja märkä', condition: 'bad', precipitation: 'wet', color: "#ff66ff" }
    ];

    let html = '<strong>Tien kunto</strong><br>';
    




    categories.forEach(cat => {
        const color = cat.color;
        html += `
        <i style="
            background:${color};
            width:18px;
            height:18px;
            display:inline-block;
            margin-right:6px;
            border:1px solid #999;
        "></i>${cat.label}<br>`;
    });

    div.innerHTML = html;
    return div;
    };
    legend.addTo(mapRef.current);


   

    }

        
        const loadData = async (type) => {
            if (isFetchingRef.current[type]) {
                return;
            }
            setLoading(true);
            isFetchingRef.current[type] = true;
            
            
            let roadType = "";

            if (type == "mainRoad") roadType = "mainRoad";
            else if (type == "secondaryRoad") roadType = "secondaryRoad";
            else roadType = "minorRoad";

            

            
    

            
            const data = await fetchRoadData(roadType);
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
        function highlightFeature(e) {
            var layer = e.target;

            layer.setStyle({
                weight: 20,
                color: '#666',
                dashArray: '',
                fillOpacity: 5
            });

            layer.bringToFront();
        }
        function resetHighlight(e) {
            geoJsonLayerRef.current[type].resetStyle(e.target);
        }
        function onEachFeature(feature, layer) {
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
                
            });
        }
        
        const layer = L.geoJSON(
          { type: "FeatureCollection", features },
          {
            style: (feature) => ({
              color: colorPicker(
                feature.properties.condition,
                feature.properties.precipitation
              ),
              weight: 1.5,
              opacity: 2,
            }),
            onEachFeature: onEachFeature
          }
        )

        geoJsonLayerRef.current[type] = layer;
        layer.addTo(mapRef.current);
        isFetchingRef.current[type] = false;
        setLoading(false);
            
    }
        const buttonListener= async (box, type) => {
            if (box.checked) {
                if (isFetchingRef.current[type] || geoJsonLayerRef.current[type]){
                    return;
                }
                
                await loadData(type);
            } else {
                
                if (geoJsonLayerRef.current[type]|| mapRef.current[type]) {
                    mapRef.current.removeLayer(geoJsonLayerRef.current[type]);
                    delete geoJsonLayerRef.current[type];
                    }
            }
        }


    

        
        const boxTimeOut= () => {
            const mainBox = document.getElementById("mainRoad");
            const secondaryBox = document.getElementById("secondaryRoad");
            const minorBox = document.getElementById("minorRoad");
            
            if (!mainBox || !secondaryBox || !minorBox) {
                setTimeout(boxTimeOut, 100);
                return;
            }
            [mainBox, secondaryBox, minorBox].forEach((box) => {
                box.addEventListener("change", (event) => buttonListener(event.target, box.id));
            });

            buttonListener(mainBox, "mainRoad");
            
        }


        
        
        
        
        fetchGeoJSON().then(()=>{
            boxTimeOut()

        })

        
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);




    return(<div id="map">
                {loading &&(
                <div className="spinner-container"
                 style = {{
                    position:"absolute",
                    padding: "15px",
                    top: "5%",
                    left: "50%",
                    transform: "translate(-50%, -50%)"
                }}>
                    <BeatLoader color="#007bff" size={40} aria-label="Loading Spinner" data-testid="loader" />
                </div>)}
                <div
  style={{
  position: "absolute",
  bottom: "20px",
  right: "20px",
  zIndex: 10000,
  pointerEvents: "auto",

  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-end",
  alignItems: "flex-end",
}}
>
  
  <Link to="/Dashboard">Go to Dashboard</Link>
</div>

            </div>
            

            
        
    );
}