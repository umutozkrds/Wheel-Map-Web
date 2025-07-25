import { AfterViewInit, Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import { Point } from 'ol/geom';
import Feature, { FeatureLike } from 'ol/Feature';
import { Style, Circle, Fill, Stroke, Icon } from 'ol/style';
import Overlay from 'ol/Overlay';
import { NgForm } from '@angular/forms';
import { PlacesService } from '../services/places.service';
import { Place } from '../models/place.model';
import { zoomByDelta } from 'ol/interaction/Interaction';
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
  filteredPlaces: Place[] = [];
  categories: any[] = [];
  place: Place | null = null;
  places: Place[] = [];
  vectorSource: VectorSource = new VectorSource();
  vectorLayer: VectorLayer<VectorSource> = new VectorLayer({
    source: this.vectorSource,
    style: new Style({
      image: new Circle({
        radius: 8,
        fill: new Fill({ color: '#3399CC' }),
        stroke: new Stroke({ color: '#fff', width: 2 })
      })
    })
  });
  popup: Overlay | null = null;
  showPopup: boolean = false;
  popupData: any = null;
  isSubmitting: boolean = false;
  minZoomForIcons: number = 10; // Minimum zoom level to show icons  
  currentZoom: number = 12;
  showZoomMessage: boolean = false;


  constructor(
    private placesService: PlacesService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {

  }

  ngAfterViewInit(): void {
    // Only run map initialization in browser
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    setTimeout(() => {
      const mapElement = document.getElementById('map');
      if (!mapElement) {
        console.error('Map element with id="map" not found!');
        return;
      }

      try {
        this.map = new Map({
          target: 'map',
          layers: [
            new TileLayer({
              source: new OSM()
            }),
            this.vectorLayer
          ],
          view: new View({
            center: [28.978388, 41.009401],
            zoom: 12, // Start at lower zoom to demonstrate icon visibility feature
            projection: 'EPSG:4326'
          })
        });

        console.log('Map initialized successfully:', this.map);

        this.initializePopup();

        this.map.updateSize();

        // Initialize current zoom level
        this.currentZoom = this.map.getView().getZoom() || 12;

        // Add zoom change listener
        this.map.getView().on('change:resolution', () => {
          const newZoom = this.map!.getView().getZoom() || 0;
          this.currentZoom = newZoom;
          this.updateIconVisibility();
        });

        this.map.on('click', (event) => {
          const feature = this.map!.forEachFeatureAtPixel(event.pixel, (feature) => {
            return feature;
          });

          if (feature && feature.get('name')) {
            this.showStoredPlaceInfo(feature);
          } else {
            this.closePopup();
            this.showPlaceInfo(event.coordinate);
          }
        });
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }, 100);

    this.placesService.getPlaces().subscribe((res) => {
      this.places = res;
      this.addPlacesToMap();
    });

    this.placesService.getCategories().subscribe((res) => {
      this.categories = res;
    });
  }

  getPlacesByCategory(event: any) {
    const selectedCategory = event.target.value;

    if (selectedCategory === 'all') {
      // Show all places
      this.placesService.getPlaces().subscribe((res) => {
        this.places = res;
        this.addPlacesToMap();
      });
    } else if (selectedCategory !== '') {
      this.placesService.getPlacesByCategory(selectedCategory).subscribe((res) => {
        this.places = res;
        this.addPlacesToMap();
      });
    } else {
      this.places = [];
      this.addPlacesToMap();
    }
  }

  private initializePopup() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const popupElement = document.getElementById('popup');
    if (popupElement) {
      this.popup = new Overlay({
        element: popupElement,
        autoPan: {
          animation: {
            duration: 250,
          },
        },
      });

      this.map!.addOverlay(this.popup);
    }
  }

  closePopup(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.showPopup = false;
    this.popupData = null;
    if (this.popup) {
      this.popup.setPosition(undefined);
    }
  }

  private showStoredPlaceInfo(feature: FeatureLike) {
    const coordinates = (feature as any).getGeometry().getCoordinates();

    this.popupData = {
      name: (feature as any).get('name') || 'Unnamed Place',
      description: (feature as any).get('description') || 'No description available',
      wheelchair: (feature as any).get('wheelchair') || 'unknown',
      category: (feature as any).get('category') || 'general',
      lat: coordinates[1].toFixed(6),
      lon: coordinates[0].toFixed(6)
    };

    this.showPopup = true;

    if (this.popup) {
      this.popup.setPosition(coordinates);
    }

  }

  private async showPlaceInfo(coordinate: number[]) {
    const [lon, lat] = coordinate;

    this.selectedPlace = { lat, lon };
    this.isLoading = true;
    this.placeData = null;

    try {
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

  private getIconForCategory(category: string): string | null {
    switch (category?.toLowerCase()) {
      case 'museum':
        return 'images/museum.png';
      case 'gift':
        return 'images/gift.png';
      case 'library':
        return 'images/library.png';
      default:
        return null; // Will use default circle style
    }
  }

  private getCategoryColor(category: string): string {
    switch (category?.toLowerCase()) {
      case 'restaurant': return '#e74c3c';
      case 'shop': return '#f39c12';
      case 'park': return '#27ae60';
      case 'hospital': return '#e67e22';
      case 'school': return '#9b59b6';
      default: return '#3399CC';
    }
  }

  updateIconVisibility() {
    if (!isPlatformBrowser(this.platformId) || !this.map) {
      return;
    }

    const shouldShowIcons = this.currentZoom >= this.minZoomForIcons;
    if (shouldShowIcons) {
      this.vectorLayer.setVisible(true);
      this.showZoomMessage = false;
    } else {
      this.vectorLayer.setVisible(false);
      this.showZoomMessage = true;
    }
  }

  addPlacesToMap() {
    this.vectorSource.clear();
    this.places.forEach(place => {
      if (place.lat && place.lon) {
        const point = new Point([place.lon, place.lat]);

        const feature = new Feature({
          geometry: point,
          id: place.id,
          name: place.ad,
          description: place.aciklama,
          wheelchair: place.wheelchair,
          category: place.category
        });
        const iconUrl = this.getIconForCategory(place.category);
        if (iconUrl) {
          const iconStyle = new Style({
            image: new Icon({
              anchor: [0.5, 1],
              src: iconUrl,
              scale: 0.07, // Good visible size
              anchorXUnits: 'fraction',
              anchorYUnits: 'fraction'
            })
          });
          feature.setStyle(iconStyle);

          if (typeof Image !== 'undefined') {
            const iconImage = new Image();
            iconImage.onload = () => {
            };
            iconImage.onerror = () => {
              feature.setStyle(new Style({
                image: new Circle({
                  radius: 12,
                  fill: new Fill({ color: '#ff6b6b' }),
                  stroke: new Stroke({ color: '#fff', width: 2 })
                })
              }));
            };
            iconImage.src = iconUrl;
          }
        } else {
          feature.setStyle(new Style({
            image: new Circle({
              radius: 10,
              fill: new Fill({
                color: this.getCategoryColor(place.category)
              }),
              stroke: new Stroke({ color: '#fff', width: 2 })
            })
          }));
        }

        this.vectorSource.addFeature(feature);
      }
    });


    // Ensure vector layer is visible after adding filtered places
    this.vectorLayer.setVisible(true);

    // Apply initial visibility based on current zoom
    this.updateIconVisibility();
  }

  clearSelection() {
    this.selectedPlace = null;
    this.placeData = null;
    this.isLoading = false;
    this.closePopup();
  }

  resetView() {
    if (!isPlatformBrowser(this.platformId) || !this.map) {
      return;
    }

    this.map.getView().animate({
      center: [35.0, 39.0],
      zoom: 6,
      duration: 1000
    });
  }

  getPlaceType(): string | null {
    if (!this.placeData) return null;

    if (this.placeData.type) return this.placeData.type;
    if (this.placeData.class) return this.placeData.class;
    if (this.placeData.category) return this.placeData.category;

    if (this.placeData.addresstype) return this.placeData.addresstype;

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


  addPlace(form: NgForm) {
    if (!this.selectedPlace || !this.placeData) {
      alert('Please select a place on the map first');
      return;
    }

    if (this.isSubmitting) {
      return; // Prevent double submission
    }

    this.isSubmitting = true;

    const category = this.placeData.type || this.placeData.class || this.placeData.category || form.value.category || 'unknown';

    this.place = {
      ad: form.value.ad || this.placeData.name || 'Unnamed Place',
      aciklama: form.value.aciklama || '',
      wheelchair: form.value.wheelchair || 'unknown',
      lat: this.selectedPlace.lat,
      lon: this.selectedPlace.lon,
      category: category
    }

    this.placesService.postPlace(this.place).subscribe({
      next: (res) => {
        alert('Place added successfully! 🎉\nThank you for your contribution to making locations more accessible.');
        this.placesService.getPlaces().subscribe((updatedPlaces) => {
          this.places = updatedPlaces;
          this.addPlacesToMap();
          this.isSubmitting = false;
        });
        this.clearSelection();
        form.resetForm();
      },
      error: (error) => {
        alert('Error adding place: ' + (error.error?.error || error.message || 'Unknown error'));
        this.isSubmitting = false;
      }
    });
  }

  getCurrentLocation() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const locationFeature = new Feature({
          geometry: new Point([position.coords.longitude, position.coords.latitude]),
        });
        this.vectorSource.addFeature(locationFeature);
        this.map!.getView().animate({
          center: [position.coords.longitude, position.coords.latitude],
          zoom: 18,
          duration: 1000
        });
      });
    }
  }


}