import React, {useEffect, useState} from 'react';

export default function colorPicker(cond, dryness) {

    if (cond === "POOR_CONDITION" && dryness === "NO_RAIN_DRY_WEATHER") {
        return "red";
    }
    else if (cond === "POOR_CONDITION" && dryness !== "NO_RAIN_DRY_WEATHER") {
        return "violet"
    }
    else if (cond !== "POOR_CONDITION" && dryness === "NO_RAIN_DRY_WEATHER") {
        return "green"
    }
    else if (cond !== "POOR_CONDITION" && dryness !== "NO_RAIN_DRY_WEATHER") {
        return "blue"
    }
    else {
        return "gray"
    }
}