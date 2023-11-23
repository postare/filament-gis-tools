# Filament Gis Tools

[![Latest Version on Packagist](https://img.shields.io/packagist/v/postare/gis-tools.svg?style=flat-square)](https://packagist.org/packages/postare/gis-tools)
[![Total Downloads](https://img.shields.io/packagist/dt/postare/gis-tools.svg?style=flat-square)](https://packagist.org/packages/postare/gis-tools)

Gis Tools is a highly customizable plugin for FilamentPHP, designed to simplify map and GIS functionality management
within your web application. With Gis Tools, you can effortlessly integrate interactive maps, analyze geospatial data,
and enhance the user experience with advanced GIS features.

The system harnesses the power of [Leaflet](https://leafletjs.com/) to provide interactive maps.

## Installation

You can install the package via composer:

```bash
composer require postare/gis-tools
```

Make sure to publish the assets to ensure that the default icons can be displayed correctly:

```bash
php artisan vendor:publish --tag="gis-tools-assets"
```

Add it to a panel by instantiating the plugin class and passing it to the plugin() method of
the configuration:

```php
use Postare\GisTools\GisToolsPlugin;
 
public function panel(Panel $panel): Panel
{
    return $panel
        // ...
        ->plugin(new GisToolsPlugin::make());
}

// OR in case of multiple plugins

public function panel(Panel $panel): Panel
{
    return $panel
        // ...
        ->plugins([
            // ... other plugins
            GisToolsPlugin::make(),
        ]);
}
```

## Map Field

This plugin provides a map field for all forms, enriching your applications with advanced geospatial capabilities. Its
key features include:

- The ability to select a point on the map using a draggable marker, making map interaction an intuitive experience.
- The option to use one or more map tiles of your choice, ensuring flexibility in map visualization.
- Complete marker customization to seamlessly match your application's design.
- Easy input of geographic coordinates, simplifying location data management.

### Usage

Inside a form schema, you can use the Map input like this:

```php
use Postare\GisTools\Forms\Components\Map;

Map::make('location')
    ->height(500) // Map height in pixels   
    ->showCoordinates() // Show an overlay with the coordinates of the point
    ->locate() // Show the user's location on the map
    // To set the starting point
    ->default([
        'type' => 'Point',
        'coordinates' => [
            41.72, // latitude
            13.34, // longitude
        ],
    ])
    
    // To specify the tiles to use
    // If not specified, it will use OpenStreetMap; otherwise, you can choose one or more tiles.
    // Here's a list: https://leaflet-extras.github.io/leaflet-providers/preview/
    ->tiles([
        [
            'name' => 'OpenStreetMap',
            'url' => 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'options' => [
                'maxZoom' => 19,
                'attribution' => 'Map data: &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
            ],
        ],
        [
            'name' => 'OpenTopoMap',
            'url' => 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
            'options' => [
                'maxZoom' => 17,
                'attribution' => 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
            ],
        ],
        [
            'name' => 'Esri World Imagery',
            'url' => 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            'options' => [
                'attribution' => '&copy; ESRI',
            ],
        ]
    ])
    
    // To specify the marker icon, otherwise the default one will be used
    ->markerIcon([
        'iconUrl' => 'https://mapmarker.io/api/v3/font-awesome/v6/pin?icon=fa-solid%20fa-star&size=60&color=FFF&background=990099&hoffset=0&voffset=0',
        'iconSize' => [60, 60],
        'iconAnchor' => [30, 60],
    ])
    ->required(),

// If you are using two separate fields for latitude and longitude, you can proceed as follows:
Map::make('location')
//...
->afterStateUpdated(function (Set $set, array $state): void {
    $set('latitude', $state['coordinates'][0]);
    $set('longitude', $state['coordinates'][1]);
})

TextInput::make('latitude'), // Field to store the latitude
TextInput::make('longitude'), // Field to store the longitude
```

## How to draw on the map

```php
Map::make('location')
    ->draw(active: true, statePath: 'area') // true to enable drawing

    // Load the geojson from the database
    ->geoJson(fn (?Zone $record): ?string => $record?->area?->toJson()), 

Textarea::make('area'), // Field to store the geojson
```

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
