import { useEffect, useRef } from "react";
import leaflet from "leaflet";
import 'leaflet/dist/leaflet.css';
import RoadData from "../api/fetchRoadData";
import fetchRoadData from "../api/fetchRoadData";
import colorPicker from "../utils/roadColor";

export default function Map() {

    const mapRef = useRef();
    const lastRoadTypeRef = useRef(null);

    useEffect(()=> {
        mapRef.current = leaflet.map('map').setView([64.5, 26.0], 5);

        
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

            
            if (lastRoadTypeRef.current !== roadType) {
                
                mapRef.current.eachLayer((layer) => {
                    if (!(layer instanceof leaflet.TileLayer)) {
                        mapRef.current.removeLayer(layer);
                    }
                });
            }    
            let from = 0;
            let hasMore = true;
            let pageSize = 500;

            
            const data = await fetchRoadData(from, pageSize, hasMore, roadType);
            data.forEach((row, idx) => {
                console.log("Row", idx, row); // inspect all fields
                });
            data.forEach(row => {
                let allCoords = JSON.parse(row.coords_json)
                let polyLineCoords = [];
                
                
                
                allCoords.forEach(i => {
                    let singleCoord = i[1];
                    
                    singleCoord.pop();
                    [singleCoord[0], singleCoord[1]] = [singleCoord[1], singleCoord[0]];
                    console.log(singleCoord);
                    polyLineCoords.push(singleCoord)
                    console.log(row.overall_road_condition)
                    console.log(row.precipitation_condition)
                    leaflet.polyline(polyLineCoords, { color: colorPicker(row.overall_road_condition, row.precipitation_condition), weight: 2 }).addTo(mapRef.current);
                    
                        
                })
                
                

                
                
                
            });
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