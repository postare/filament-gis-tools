{{-- <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" --}}
{{--      integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/> --}}
{{-- <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" --}}
{{--        integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script> --}}

<x-dynamic-component :component="$getFieldWrapperView()" :field="$field">

    @php
        $height = $getHeight() ?? 250;
        $zoom = $getZoom() ?? 13;
        $tiles = $getTiles() ? json_encode($getTiles()) : '{}';
        $markerIcon = $getMarkerIcon() ? json_encode($getMarkerIcon()) : '{}';
    @endphp

    <div ax-load
         ax-load-src="{{ \Filament\Support\Facades\FilamentAsset::getAlpineComponentSrc('map-component', package: 'postare/gis-tools') }}"
         x-data="mapComponent({
            state: $wire.entangle('{{ $getStatePath() }}'),
            zoom: @js($zoom),
            tiles: {{ $tiles }},
            customIcon: {{ $markerIcon }},
         })"
         x-load-css="[@js(\Filament\Support\Facades\FilamentAsset::getStyleHref('gis-tools-styles', package: 'postare/gis-tools'))]"
         x-ignore
         class="relative">
        <div x-ref="map" class="relative inset-0 z-10 w-full" style="height: @js($height)px" wire:ignore></div>
        @if ($getShowCoordinates())
            <div class="absolute bottom-0 z-50 mb-2 w-full">
                <div class="mx-auto grid max-w-sm gap-2 rounded-lg bg-white p-2 text-sm opacity-50 transition hover:opacity-100 md:grid-cols-2">
                    <label class="w-full">
                        @lang('gis-tools::gis-tools.latitude')
                        <input class="w-full border-gray-300 p-1 text-sm" type="text" x-model="lat" />
                    </label>
                    <label class="w-full">
                        @lang('gis-tools::gis-tools.longitude')
                        <input class="w-full border-gray-300 p-1 text-sm" type="text" x-model="lng" />
                    </label>
                </div>
            </div>
        @endif

        <button x-show="!marker"
                class="absolute bottom-0 left-0 z-50 m-4 flex h-12 w-12 items-center justify-center rounded-full border-green-700 bg-green-500 px-2 py-1 hover:bg-green-800" type="button"
                @click="addMarker()"
            title="@lang('gis-tools::gis-tools.add_marker')">
            @svg('heroicon-s-map-pin', 'h-6 w-6 text-white')
            @svg('heroicon-s-plus', 'h-4 w-4 text-white')
        </button>
        <button x-show="marker" class="absolute bottom-0 left-0 z-50 m-4 flex h-8 w-8 items-center justify-center rounded-full border-red-800 bg-red-500 px-2 py-1 opacity-70 hover:opacity-100" type="button"
                @click="removeMarker()"
            title="@lang('gis-tools::gis-tools.remove_marker')">
            @svg('heroicon-s-trash', 'h-6 w-6 text-white')
        </button>

    </div>
</x-dynamic-component>
