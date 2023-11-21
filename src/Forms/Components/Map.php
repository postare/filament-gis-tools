<?php

namespace Postare\GisTools\Forms\Components;

use Filament\Forms\Components\Field;

class Map extends Field
{
    protected string $view = 'gis-tools::filament.forms.components.map';

    private \Closure|int|null $height = null;

    private \Closure|int|null $zoom = 10;

    private \Closure|bool $show_coordinates = false;

    private \Closure|array $tiles = [];

    private \Closure|array $marker_icon = [];

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
}
