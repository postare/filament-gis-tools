import L from 'leaflet';

import "@geoman-io/leaflet-geoman-free";

import "leaflet-gesture-handling";

import "leaflet.locatecontrol";

export default function mapComponent({
                                         location,
                                         statePath,
                                         disableMarker,
                                         zoom,
                                         tiles,
                                         customIcon,
                                         draw,
                                         locate,
                                         geoJson
                                     }) {
    var Lmap,
        geoJsonGroup,
        geoJsonFeature = geoJson || null;
    const defaultLat = 41.8902;
    const defaultLng = 12.4923;

    const defaultIcon = L.icon({
        iconUrl: '/vendor/gis-tools/images/marker-icon.png',
        shadowUrl: '/vendor/gis-tools/images/marker-shadow.png',
        iconSize: [25, 41], // size of the icon
        shadowSize: [41, 41], // size of the shadow
        iconAnchor: [12, 41], // point of the icon which will correspond to marker's location
        shadowAnchor: [12, 41],  // the same for the shadow
        popupAnchor: [-3, -41] // point from which the popup should open relative to the iconAnchor
    });

    return {
        location,
        disableMarker,
        statePath,
        zoom: zoom || 10, // default zoom
        tiles: tiles || null,
        map: null,
        lat: defaultLat,
        lng: defaultLng,
        marker: null,
        customIcon,
        markerIcon: defaultIcon,
        // geoJsonFeature: geoJson || null,
        locate: locate || false,
        draw: draw || false,
        // Gruppo che contiene i layer di geojson
        // geoJsonGroup: null,
        geoJsonStatePath: 'data.geojson',

        addMarker() {
            if (this.marker) {
                Lmap.removeLayer(this.marker);
            }

            // custom icon
            if (this.customIcon.iconUrl !== undefined) {
                this.markerIcon = L.icon(this.customIcon);
            }

            this.marker = L.marker(Lmap.getCenter(), {
                icon: this.markerIcon,
                draggable: true,
                pmIgnore: true // ignore marker for geoman
            }).addTo(Lmap);

            this.updateStateWithCoordinates(Lmap.getCenter());

            this.marker.on('dragend', e => this.updateStateWithCoordinates(e.target.getLatLng()));

        },

        removeMarker() {
            if (this.marker) {
                Lmap.removeLayer(this.marker);
                this.marker = null;

                this.updateStateWithCoordinates({lat: null, lng: null});
            }
        },

        updateStateWithCoordinates({lat, lng}) {
            this.lat = lat;
            this.lng = lng;

            const state = JSON.stringify({
                type: 'Point',
                coordinates: [this.lat, this.lng]
            });

            this.$wire.set(this.statePath, state);
        },

        initializeWatchers() {
            this.$watch('lat', value => this.updateMarkerAndMap(value, this.lng));
            this.$watch('lng', value => this.updateMarkerAndMap(this.lat, value));

            Lmap.on('zoomend', () => {
                this.zoom = Lmap.getZoom();
            });
        },

        updateMarkerAndMap(lat, lng) {
            const newLatLng = [lat, lng];
            this.marker.setLatLng(newLatLng);

            // Center the map to the new position
            // Lmap.panTo(newLatLng);
        },

        // Prepara i layer di tiles in base alla configurazione data.
        prepareTileLayers() {
            let tileLayers = {};

            if (Array.isArray(this.tiles)) {
                this.tiles.forEach(tile => {
                    tileLayers[tile.name] = L.tileLayer(tile.url, tile.options);
                });
            } else if (this.tiles && this.tiles.url) {
                tileLayers[this.tiles.name || 'Default Tile'] = L.tileLayer(this.tiles.url, this.tiles.options);
            } else {
                tileLayers['OpenStreetMap'] = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                });
            }
            return tileLayers;
        },

        initMap() {

            // Preparazione e selezione del layer di tiles.
            const tileLayers = this.prepareTileLayers();
            const layersArray = Object.values(tileLayers);
            const defaultLayer = layersArray.length > 0 ? layersArray[0] : null;

            // Inizializzazione della mappa con il layer di default
            const map = L.map(this.$refs.map, {
                center: [this.lat, this.lng],
                zoom: this.zoom,
                layers: [defaultLayer] // Imposta solo il primo layer come default
            });

            // Aggiunge un controllo per la selezione del layer se ci sono più layer disponibili.
            if (Object.keys(tileLayers).length > 1) {
                L.control.layers(tileLayers).addTo(map);
            }

            // Gruppo che contiene i layer di geojson
            geoJsonGroup = L.featureGroup().addTo(map);

            Lmap = map;
        },

        // Geoman Plugin - https://geoman.io/leaflet-geoman
        initGeoman() {

            const pmOptions = draw.options;

            // Set the language for Leaflet Geoman
            Lmap.pm.setLang(pmOptions.lang);

            // Add drawing controls based on provided options
            Lmap.pm.addControls({...pmOptions });

            // Event handlers

            // Event handler for feature creation
            Lmap.on("pm:create", (e) => {
                // Add the created layer to the GeoJSON group
                geoJsonGroup.addLayer(e.layer);
                this.saveGeoJson();
            });

            // Event handler for cutting a polygon
            Lmap.on("pm:cut", (e) => {
                // Remove the original layer and add the new one after cutting
                geoJsonGroup.removeLayer(e.originalLayer);
                geoJsonGroup.addLayer(e.layer);
                this.saveGeoJson();
            });

            // Event handlers for edit modes

            // Global edit mode
            Lmap.on("pm:globaleditmodetoggled", (e) => {
                this.saveGeoJson();
            });

            // Global draw mode
            Lmap.on("pm:globaldrawmodetoggled", (e) => {
                this.saveGeoJson();
            });

            // Global drag mode
            Lmap.on("pm:globaldragmodetoggled", (e) => {
                this.saveGeoJson();
            });

            // Event handler for removing a feature
            Lmap.on("pm:remove", (e) => {
                // Remove the layer from the GeoJSON group
                geoJsonGroup.removeLayer(e.layer);
                this.saveGeoJson();
            });

            // Global removal mode
            Lmap.on("pm:globalremovalmodetoggled", (e) => {
                this.saveGeoJson();
            });

            // Global cut mode
            Lmap.on("pm:globalcutmodetoggled", (e) => {
                this.saveGeoJson();
            });

            // Global rotate mode
            Lmap.on("pm:globalrotatemodetoggled", (e) => {
                this.saveGeoJson();
            });
        },

        // Leaflet.Locate Plugin - https://github.com/domoritz/leaflet-locatecontrol
        initLeafletLocate() {
            const options = {...this.locate.options};

            L.control.locate({
                position: options.position,
                flyTo: options.flyTo,
                locateOptions: {
                    enableHighAccuracy: options.enableHighAccuracy,
                    watch: options.watch,
                    timeout: options.timeout,
                    maximumAge: options.maximumAge,
                }
            }).addTo(Lmap);
        },

        saveGeoJson() {
            const geoJsonLayer = geoJsonGroup.toGeoJSON();

            // Convert GeoJSON object to string
            const geoJsonString = geoJsonLayer.features.length === 0
                ? null
                : JSON.stringify(geoJsonLayer);

            this.$wire.set(this.geoJsonStatePath, geoJsonString);
        },

        loadGeoJson() {

            const featureObject = JSON.parse(geoJsonFeature);

            geoJsonGroup.clearLayers();

            // Aggiungiamo ogni feature al gruppo
            L.geoJSON(featureObject,{
                onEachFeature: function (feature, layer) {
                    geoJsonGroup.addLayer(layer);
                }
            });
        },

        init: function () {

            // Imposta le coordinate se presenti nello stato.
            if (this.location && this.location.coordinates) {
                this.lat = this.location.coordinates[0];
                this.lng = this.location.coordinates[1];
            }

            // Inizializza la mappa
            this.initMap();

            // Inizializza i watcher
            this.initializeWatchers();

            // Aggiunge il marker se ci sono le coordinate.
            if (this.location && this.location.coordinates) {
                this.addMarker();
            }

            // Enable gesture handling on the map
            Lmap.gestureHandling.enable();

            // Enable locate control
            if (this.locate.active !== undefined && this.locate.active) {
                this.initLeafletLocate();
            }

            // Enable draw controls
            if (this.draw.active !== undefined && this.draw.active) {

                this.geoJsonStatePath = 'data.' + this.draw.statePath;

                // Enable geoman
                this.initGeoman();
            }

            // Load geojson feature
            if (geoJsonFeature) {
                this.loadGeoJson();
            }
        }

    }
}
