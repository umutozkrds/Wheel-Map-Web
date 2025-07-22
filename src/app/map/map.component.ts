import { AfterViewInit, Component, OnInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import TileWMS from 'ol/source/TileWMS';

@Component({
  selector: 'app-map',
  standalone: false,
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements AfterViewInit {
  map: Map | null = null;

  constructor() {

  }


  ngAfterViewInit(): void {
    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new TileWMS({
            url: 'http://localhost:8085/geoserver/wheelmap/wms',
            params: {
              'LAYERS': 'wheelmap:gis_osm_buildings_a_free_1',
              'TILED': true,
            }
          })
        })
      ],
      view: new View({
        center: [28.9784, 41.0082], // İstanbul (lon, lat)
        zoom: 12,
        projection: 'EPSG:4326' // Lat-Lon ile çalışmak için
      })
    });

    this.map.on('click', (event) => {
      const layer = this.map!.getLayers().item(0) as TileLayer<TileWMS>;
      const url = layer.getSource()!.getFeatureInfoUrl(event.coordinate, this.map!.getView().getResolution()!, 'EPSG:4326', { 'INFO_FORMAT': 'application/json' });
      if (url) {
        fetch(url).then(response => response.json()).then(data => {
          console.log(data);
        });
      }
    });


  }


}
