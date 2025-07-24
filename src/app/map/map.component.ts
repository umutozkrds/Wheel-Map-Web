import { AfterViewInit, Component, OnInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

@Component({
  selector: 'app-map',
  standalone: false,
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements AfterViewInit {
  map: Map | null = null;
  selectedPlace: { lat: number, lon: number } | null = null;
  placeData: any = null;
  isLoading: boolean = false;

  constructor() {

  }

  ngAfterViewInit(): void {
    console.log('Initializing map...');

    // Use setTimeout to ensure DOM is fully rendered
    setTimeout(() => {
      // Check if map container exists
      const mapElement = document.getElementById('map');
      if (!mapElement) {
        console.error('Map element with id="map" not found!');
        return;
      }

      console.log('Map element found:', mapElement);
      console.log('Map element dimensions:', mapElement.offsetWidth, 'x', mapElement.offsetHeight);

      try {
        this.map = new Map({
          target: 'map',
          layers: [
            new TileLayer({
              source: new OSM()
            })
          ],
          view: new View({
            center: [35.0, 39.0],
            zoom: 6, //
            projection: 'EPSG:4326'
          })
        });

        console.log('Map initialized successfully:', this.map);

        // Force map to render
        this.map.updateSize();

        // Add click event to show place information in sidebar
        this.map.on('click', (event) => {
          this.showPlaceInfo(event.coordinate);
        });
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }, 100);
  }

  private async showPlaceInfo(coordinate: number[]) {
    const [lon, lat] = coordinate;

    this.selectedPlace = { lat, lon };
    this.isLoading = true;
    this.placeData = null;

    try {
      // Use Nominatim reverse geocoding to get place information
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`
      );
      const data = await response.json();

      this.placeData = data;
      this.isLoading = false;

    } catch (error) {
      console.error('Error fetching place info:', error);
      this.isLoading = false;
      this.placeData = null;
    }
  }

  clearSelection() {
    this.selectedPlace = null;
    this.placeData = null;
    this.isLoading = false;
  }

  resetView() {
    if (this.map) {
      this.map.getView().animate({
        center: [35.0, 39.0],
        zoom: 6,
        duration: 1000
      });
    }
  }

  getPlaceType(): string | null {
    if (!this.placeData) return null;

    // Check multiple possible fields for place type
    if (this.placeData.type) return this.placeData.type;
    if (this.placeData.class) return this.placeData.class;
    if (this.placeData.category) return this.placeData.category;

    // Extract from addresstype if available
    if (this.placeData.addresstype) return this.placeData.addresstype;

    // Extract from OSM type if available
    if (this.placeData.osm_type) {
      switch (this.placeData.osm_type) {
        case 'way': return 'Area/Building';
        case 'node': return 'Point Location';
        case 'relation': return 'Complex Area';
        default: return this.placeData.osm_type;
      }
    }

    return null;
  }
}