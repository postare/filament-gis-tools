import L from 'leaflet';

export default function mapComponent({
                                         state,
                                         zoom,
                                         tiles,
                                         customIcon
                                     }) {
    const defaultLat = 41.8902;
    const defaultLng = 12.4923;

    const defaultIcon = L.icon({
        iconUrl: '/vendor/gis-tools/images/marker-icon.png',
        shadowUrl: '/vendor/gis-tools/images/marker-shadow.png',
        iconSize:     [25, 41], // size of the icon
        shadowSize:   [41, 41], // size of the shadow
        iconAnchor:   [12, 41], // point of the icon which will correspond to marker's location
        shadowAnchor: [4, 41],  // the same for the shadow
        popupAnchor:  [-3, -41] // point from which the popup should open relative to the iconAnchor
    });

    return {
        state,
        zoom: zoom || 10, // default zoom
        tiles: tiles || null,
        map: null,
        lat: defaultLat,
        lng: defaultLng,
        marker: null,
        customIcon,
        markerIcon: defaultIcon,

        addMarker() {
            if (this.marker) {
                this.map.removeLayer(this.marker);
            }

            // custom icon
            if(this.customIcon.iconUrl !== undefined) {
                this.markerIcon = L.icon(this.customIcon);
            }

            this.marker = L.marker(this.map.getCenter(), {
                icon: this.markerIcon,
                draggable: true
            }).addTo(this.map);

            this.updateStateWithCoordinates(this.map.getCenter());
            this.marker.on('dragend', e => this.updateStateWithCoordinates(e.target.getLatLng()));
        },

        removeMarker() {
            if (this.marker) {
                this.map.removeLayer(this.marker);
                this.marker = null;
            }
        },

        updateStateWithCoordinates({ lat, lng }) {
            this.lat = lat;
            this.lng = lng;
            this.state = { type: 'Point', coordinates: [lat, lng] };
        },

        initializeWatchers() {
            this.$watch('lat', value => this.updateMarkerAndMap(value, this.lng));
            this.$watch('lng', value => this.updateMarkerAndMap(this.lat, value));

            this.map.on('zoomend', () => {
                this.zoom = this.map.getZoom();
            });
        },

        updateMarkerAndMap(lat, lng) {
            const newLatLng = [lat, lng];
            this.marker.setLatLng(newLatLng);

            // Center the map to the new position
            // this.map.panTo(newLatLng);
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

            this.map = map;
        },

        init: function () {

            // Imposta le coordinate se presenti nello stato.
            if (this.state && this.state.coordinates) {
                this.lat = this.state.coordinates[0];
                this.lng = this.state.coordinates[1];
            }

            this.initMap();

            this.initializeWatchers();

            // Aggiunge il marker se ci sono le coordinate.
            if (this.state && this.state.coordinates) {
                this.addMarker();
            }
        }

    }
}
