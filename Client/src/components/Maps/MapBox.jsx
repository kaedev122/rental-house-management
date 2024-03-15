import React, { useState, useRef, useEffect, useCallback, Fragment } from 'react'
import Map, {Marker, ScaleControl, NavigationControl, FullscreenControl,GeolocateControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './mapbox.scss';

const MapBox = (props) => {
    const markerRef = useRef();  
    const mapRef = useRef();
    const geoControlRef = useRef();
    const { _location, _setLocation } = props

    const [viewState, setViewState] = useState(_location)
    const [marker, setMarker] = useState();

    const defaultViewport = {
        latitude: 21.036359444162812,
        longitude: 105.83426157416055,
    }

    useEffect(() => {
        setViewState(_location)
        setMarker(_location)
    }, [_location])

    useEffect(() => {
        if (viewState) {
            mapRef.current?.flyTo({ center: [viewState?.longitude || defaultViewport.longitude, viewState?.latitude || defaultViewport.latitude] })
            setMarker({
                longitude: viewState?.longitude,
                latitude: viewState?.latitude
            })
        }
    }, [viewState])

    
    useEffect(() => {
        geoControlRef.current?.trigger();
    }, [geoControlRef.current]);

    const onMarkerDrag = useCallback((event) => {
        setMarker({
            longitude: event.lngLat.lng,
            latitude: event.lngLat.lat
        });
        setViewState({
            longitude: event.lngLat.lng,
            latitude: event.lngLat.lat
        })
        _setLocation({
            longitude: event.lngLat.lng,
            latitude: event.lngLat.lat
        })
    }, []);

    return (
        <Fragment>
            <Map
                ref={mapRef}
                mapLib={import('mapbox-gl')}
                initialViewState={{
                    ...defaultViewport,
                    ...viewState,
                    zoom: viewState ? 15 : 5,
                    minZoom: 5,
                }}
                width="100%"
                height="100%"
                mapStyle="mapbox://styles/mapbox/streets-v9"
                mapboxAccessToken={process.env.MAP_TOKEN}
            >
                <GeolocateControl ref={geoControlRef}/>
                <FullscreenControl position="bottom-right" />
                <NavigationControl position="bottom-right" />
                <ScaleControl />
                {marker && <Marker 
                    draggable
                    onDragEnd={onMarkerDrag}
                    longitude={marker?.longitude}
                    latitude={marker?.latitude}
                    color="red"
                    ref={markerRef}
                />}
            </Map>
        </Fragment>
    );
}

export default MapBox;
