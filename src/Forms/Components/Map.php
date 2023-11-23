<?php

namespace Postare\GisTools\Forms\Components;

use Filament\Forms\Components\Field;

class Map extends Field
{
    protected string $view = 'gis-tools::filament.forms.components.map';

    private \Closure|bool $disableMarker = false;

    private \Closure|int|null $height = null;

    private \Closure|int|null $zoom = 10;

    private \Closure|bool $show_coordinates = false;

    private \Closure|array $tiles = [];

    private \Closure|array $marker_icon = [];

    private \Closure|array $draw = [];

    private \Closure|array $locate = [];

    private \Closure|string|null $geoJson = null;


    /**
     * @param  array  $marker The marker to use for the map.
     */
    public function disableMarker(bool|\Closure $disableMarker = true): static
    {
        $this->disableMarker = $disableMarker;

        return $this;
    }

    /**
     * @param  int|\Closure|null  $zoom The initial zoom at which to display the map.
     */
    public function zoom(int|\Closure|null $zoom): static
    {
        $this->zoom = $zoom;

        return $this;
    }

    /**
     * @param  int|\Closure|null  $height The height of the map in pixels.
     */
    public function height(int|\Closure|null $height): static
    {
        $this->height = $height;

        return $this;
    }

    /**
     * @param  bool|\Closure  $show_coordinates Whether to show the coordinates of the marker.
     */
    public function showCoordinates(bool|\Closure $show_coordinates = true): static
    {
        $this->show_coordinates = $show_coordinates;

        return $this;
    }

    /**
     * @param  array  $tiles The tiles to use for the map.
     */
    public function tiles(array|\Closure $tiles): static
    {
        $this->tiles = $tiles;

        return $this;
    }

    /**
     * @param  array  $marker_icon The icon to use for the marker.
     */
    public function markerIcon(array|\Closure $marker_icon): static
    {
        $this->marker_icon = $marker_icon;

        return $this;
    }

    /**
     * @param  array  $draw The draw options to use for the map.
     */
    /**
     * @param  bool  $active Whether to activate the draw options.
     * @param  string  $statePath The path to the state.
     * @param  array  $options The draw options to use for the map.
     *
     * Possible options:
     * - lang:              string  The language to use for the draw toolbar. Possible values are 'en', 'de', 'es', 'fr', 'it', 'ja', 'nl', 'ru', 'zh' or 'pt-br'
     * - position:          string  The position of the draw toolbar. Possible values are 'topleft', 'topright', 'bottomleft' or 'bottomright'
     * - drawCircle:        boolean Whether to draw circles.
     * - drawCircleMarker:  bool    Whether to draw circle markers.
     * - drawPolyline:      bool    Whether to draw polylines.
     * - drawRectangle:     bool    Whether to draw rectangles.
     * - drawPolygon:       bool    Whether to draw polygons.
     * - drawMarker:        bool    Whether to draw markers.
     * - drawText:          bool    Whether to draw text.
     * - cutPolygon:        bool    Whether to cut polygons.
     * - editMode:          bool    Whether to activate edit mode.
     * - removalMode:       bool    Whether to activate removal mode.
     *
     */
    public function draw(
        bool $active = true,
        string $statePath = 'geojson',
        array $options = []): static
    {

        $default_options = [
            "lang" =>  'en',
            "position" =>  'topleft',
            "drawCircle" =>  false,
            "drawCircleMarker" =>  false,
            "drawPolyline" =>  true,
            "drawRectangle" =>  false,
            "drawPolygon" =>  true,
            "drawMarker" =>  false,
            "drawText" =>  false,
            "cutPolygon" =>  true,
            "editMode" =>  true,
            "removalMode" =>  true
        ];

        $this->draw = [
            "active" => $active,
            "statePath" => $statePath,
            "options" => array_merge($default_options, $options)
        ];

        return $this;
    }

    /**
     * @param  bool  $active Whether to show the locate button.
     * @param  array  $options The locate options to use for the map.
     *
     * Possible options:
     * - position:              string  The position of the locate button. Possible values are 'topleft', 'topright', 'bottomleft' or 'bottomright'
     * - flyTo:                 boolean Whether to fly to the location on click.
     * - enableHighAccuracy:    boolean Whether to enable high accuracy mode.
     * - watch:                 boolean Whether to watch the location.
     * - timeout:               int     The timeout to use for the location.
     * - maximumAge:            int     The maximum age to use for the location.
     */
    public function locate(bool $active = true, array $options = []): static
    {
        $default_options = [
            // https://github.com/domoritz/leaflet-locatecontrol
            "position" => 'topright',
            "flyTo" => true,
            // https://leafletjs.com/reference.html#locate-options
            "enableHighAccuracy" => true,
            "watch" => true,
            "timeout" => 10000, // ms
            "maximumAge" => 0, // ms
        ];

        $this->locate = [
            "active" => $active,
            "options" => array_merge($default_options, $options)
        ];

        return $this;
    }

    public function geoJson(string|\Closure|null $geoJson): static
    {
        $this->geoJson = $geoJson;

        return $this;
    }

    public function getDisableMarker(): bool
    {
        return $this->evaluate($this->disableMarker);
    }

    public function getZoom(): ?int
    {
        return $this->evaluate($this->zoom);
    }

    public function getHeight(): ?int
    {
        return $this->evaluate($this->height);
    }

    public function getShowCoordinates(): bool
    {
        return $this->evaluate($this->show_coordinates);
    }

    public function getTiles(): array
    {
        return $this->evaluate($this->tiles);
    }

    public function getMarkerIcon(): array
    {
        return $this->evaluate($this->marker_icon);
    }

    public function getDraw(): array
    {
        return $this->evaluate($this->draw);
    }

    public function getLocate(): array
    {
        return $this->evaluate($this->locate);
    }

    public function getGeoJson(): ?string
    {
        return $this->evaluate($this->geoJson);
    }

    public function getState(): mixed
    {
        $state = parent::getState();

        if(is_array($state)) {
            return $state;
        }

        return json_decode($state, true);
    }
}
