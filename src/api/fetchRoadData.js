import React, {useEffect, useState} from 'react';
import { supabase } from '../utils/supabase';

export default async function fetchRoadData(from, pageSize, hasMore, roadtype) {
    const cacheKey = `roadData_${roadtype}`;
    //const cached = localStorage.getItem(cacheKey);

    //if (cached) {
    //    return JSON.parse(cached)
    //}
    let WholeData = [];
    while (hasMore) {
        let query = supabase.from("road_sections").select("*").eq("forecast_type", "FORECAST", "road_type", roadtype).eq("road_type", roadtype).range(from, from + pageSize -1);

        
        //if (roadtype) {
          //  query = query.eq("road_type", roadtype);
        //}

        const {data, error} = await query;

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        if (data && data.length > 0) {
            WholeData = [...WholeData, ...data];
            from += pageSize;
            
            if (data.length < pageSize) {
                hasMore = false;
            }
            
            console.log(`Total ${roadtype} records so far: ${WholeData.length}`);
        } else {
            hasMore = false;
    
    
        }
    
    }
    //localStorage.setItem(cacheKey, JSON.stringify(WholeData))
    return WholeData;
};