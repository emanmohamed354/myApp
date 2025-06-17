// utils/constants.js
export const SERVICE_TYPES = [
  "Regular Maintenance",
  "Oil Change",
  "Brake Service",
  "Engine Diagnostics",
  "Tire Service",
  "AC Service",
  "Battery Service",
  "Other"
];

export const MAP_CONFIG = {
  DEFAULT_DELTA: {
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421
  },
  ZOOM_DELTA: {
    latitudeDelta: 0.01,
    longitudeDelta: 0.01
  },
  EDGE_PADDING: {
    top: 100,
    right: 50,
    bottom: 250,
    left: 50
  }
};

export const SEARCH_RADIUS = 10000; // 10km in meters