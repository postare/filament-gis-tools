import L from 'leaflet';

import "@geoman-io/leaflet-geoman-free";

import "leaflet-gesture-handling";

import "leaflet.locatecontrol";

export default function mapComponent({
                                         location,
                                         statePath,
                                         zoom,
                                         tiles,
                                         customIcon,
                                         draw,
                                         locate,
                                         geoJson
                                     }) {
    var Lmap,
        geoJsonGroup;
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
        statePath,
        zoom: zoom || 10, // default zoom
        tiles: tiles || null,
        map: null,
        lat: defaultLat,
        lng: defaultLng,
        marker: null,
        customIcon,
        markerIcon: defaultIcon,
        geoJsonFeature: geoJson || null,
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
            Lmap.pm.setLang(draw.options.lang);
            Lmap.pm.addControls({
                position: draw.options.position,
                drawCircle: draw.options.drawCircle,
                drawCircleMarker: draw.options.drawCircleMarker,
                drawPolyline: draw.options.drawPolyline,
                drawRectangle: draw.options.drawRectangle,
                drawPolygon: draw.options.drawPolygon,
                drawMarker: draw.options.drawMarker,
                drawText: draw.options.drawText,
                cutPolygon: draw.options.cutPolygon,
                editMode: draw.options.editMode,
                removalMode: draw.options.removalMode,
            });

            // {{-- creazione --}}
            Lmap.on("pm:create", (e) => {
                geoJsonGroup.addLayer(e.layer);
                this.saveGeoJson();
            });

            Lmap.on("pm:cut", (e) => {
                geoJsonGroup.removeLayer(e.originalLayer);
                geoJsonGroup.addLayer(e.layer);
                this.saveGeoJson();
            });

            // {{-- edit --}}
            Lmap.on("pm:globaleditmodetoggled", (e) => {
                this.saveGeoJson();
            });

            Lmap.on("pm:globaldrawmodetoggled", (e) => {
                this.saveGeoJson();
            });

            // {{-- drag --}}
            Lmap.on("pm:globaldragmodetoggled", (e) => {
                this.saveGeoJson();
            });

            // {{-- Quando si rimuove un layer --}}
            Lmap.on("pm:remove", (e)=> {

                console.log(JSON.stringify(geoJsonGroup.toGeoJSON()));
                console.log(JSON.stringify(e.layer.toGeoJSON()));
                geoJsonGroup.removeLayer(e.layer);
                console.log(JSON.stringify(geoJsonGroup.toGeoJSON()));

                this.saveGeoJson();
            });

            Lmap.on("pm:globalremovalmodetoggled", (e) => {
                this.saveGeoJson();
            });

            Lmap.on("pm:globalcutmodetoggled", (e) => {
                this.saveGeoJson();
            });

            Lmap.on("pm:globalrotatemodetoggled", (e) => {
                this.saveGeoJson();
            });
        },

        // Leaflet.Locate Plugin - https://github.com/domoritz/leaflet-locatecontrol
        initLeafletLocate() {
            const locateOptions = {...this.locate.options};

            L.control.locate({
                position: locateOptions.position,
                flyTo: locateOptions.flyTo,
                locateOptions: {
                    enableHighAccuracy: locateOptions.enableHighAccuracy,
                    watch: locateOptions.watch,
                    timeout: locateOptions.timeout,
                    maximumAge: locateOptions.maximumAge,
                }
            }).addTo(Lmap);
        },

        saveGeoJson() {
            const geoJsonLayer = geoJsonGroup.toGeoJSON();
            this.$wire.set(this.geoJsonStatePath, JSON.stringify(geoJsonLayer));
        },

        loadGeoJson() {
            L.geoJSON(JSON.parse(this.geoJsonFeature)).addTo(geoJsonGroup);
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
            if (this.geoJsonFeature) {
                this.loadGeoJson();
            }
        }

    }
}
