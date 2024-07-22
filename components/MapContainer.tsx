import React, { useEffect, useState, useRef } from 'react';
import MapView, { Circle, Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

interface LocationType {
    latitude: number;
    longitude: number;
}

const GOOGLE_API_KEY = "AIzaSyBqeTB4Vbev342dA6b4PWZf-H3S1QTZyrM";

export default function Map() {
    const [location, setLocation] = useState<LocationType | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [search, setSearch] = useState<LocationType | null>(null);
    const [searchActive, setSearchActive] = useState(false);
    const [routeCoordinates, setRouteCoordinates] = useState<LocationType[]>([]);
    const mapRef = useRef<MapView>(null);

    useEffect(() => {
        let locationSubscription: Location.LocationSubscription | undefined;

        const requestPermission = async () => {
            locationSubscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 60000, // Update every 1 minute
                    distanceInterval: 10, // Update every 10 meters
                },
                (newLocation) => {
                    const newLoc = {
                        latitude: newLocation.coords.latitude,
                        longitude: newLocation.coords.longitude,
                    };
                    setLocation(newLoc);

                    // Only update the map region if no search has been performed
                    if (!searchActive && mapRef.current) {
                        mapRef.current.animateToRegion({
                            ...newLoc,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        }, 1000);
                    }
                }
            );
        };

        requestPermission();

        // Cleanup the location subscription when the component unmounts
        return () => {
            if (locationSubscription) {
                locationSubscription.remove();
            }
        };
    }, [searchActive]);

    const handleSearch = async (data: any, details: any) => {
        if (details) {
            const { lat, lng } = details.geometry.location;
            const newSearchLocation = { latitude: lat, longitude: lng };
            setSearch(newSearchLocation);
            setSearchActive(true);

            // Animate the map to the new search location
            if (mapRef.current) {
                mapRef.current.animateToRegion({
                    ...newSearchLocation,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }, 1000);
            }

            if (location) {
                const directions = await getDirections(location, newSearchLocation);
                setRouteCoordinates(directions);
            }
        }
    };

    const getDirections = async (startLoc: LocationType, destinationLoc: LocationType) => {
        try {
            const response = await axios.get(`https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc.latitude},${startLoc.longitude}&destination=${destinationLoc.latitude},${destinationLoc.longitude}&key=${GOOGLE_API_KEY}`);
            const points = decodePolyline(response.data.routes[0].overview_polyline.points);
            return points;
        } catch (error) {
            console.error(error);
            return [];
        }
    };

    const decodePolyline = (t: string) => {
        let points = [];
        for (let step of polyline.decode(t)) {
            points.push({
                latitude: step[0],
                longitude: step[1]
            });
        }
        return points;
    };

    const handleLocate = () => {
        if (location && mapRef.current) {
            mapRef.current.animateToRegion({
                ...location,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 1000);
            setSearchActive(false); // Reset the search flag
            setRouteCoordinates([]); // Clear the route
        }
    };

    return (
        <View style={{ flex: 1, width: "100%" }}>
            <GooglePlacesAutocomplete
                placeholder='Search...'
                fetchDetails={true}
                onPress={handleSearch}
                query={{
                    key: GOOGLE_API_KEY,
                    language: "en",
                }}
                styles={{
                    container: { flex: 0, width: "85%", zIndex: 1, position: "absolute", alignSelf: "center", top: 17 },
                    listView: { backgroundColor: "white" },
                }}
            />
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={{ flex: 1, width: "100%", height: "100%", bottom: 70 }}
                region={{
                    latitude: location?.latitude || 0,
                    longitude: location?.longitude || 0,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
            >
                {location && (
                    <Circle
                        center={{
                            latitude: location.latitude,
                            longitude: location.longitude,
                        }}
                        radius={40}
                        strokeColor="rgba(0, 150, 255, 1)"
                        fillColor="rgba(0, 150, 255, 0.6)"
                    />
                )}
                {search && (
                    <Marker
                        coordinate={{
                            latitude: search.latitude,
                            longitude: search.longitude,
                        }}
                    />
                )}
                {routeCoordinates.length > 0 && (
                    <Polyline
                        coordinates={routeCoordinates}
                        strokeWidth={4}
                        strokeColor="rgba(0, 150, 255, 0.8)"
                    />
                )}
            </MapView>
            <TouchableOpacity style={styles.locateButton} onPress={handleLocate}>
                <Ionicons name="locate" size={24} color="white" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    locateButton: {
        position: 'absolute',
        bottom: "50%",
        right: 20,
        backgroundColor: 'rgba(0, 150, 255, 1)',
        borderRadius: 50,
        padding: 10,
        elevation: 5,
        zIndex: 10,
    },
});
