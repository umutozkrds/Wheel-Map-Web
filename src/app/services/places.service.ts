import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Place } from '../models/place.model';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
    constructor(private http: HttpClient) { }
    places: Place[] = [];

    postPlace(place: any) {
        return this.http.post('http://localhost:3000/api/places', place);
    }

    getPlaces() {
        return this.http.get<Place[]>('http://localhost:3000/api/places')
    }

    getPlacesByCategory(category: string) {
        return this.http.get<Place[]>(`http://localhost:3000/api/places/${category}`);
    }

    getCategories() {
        return this.http.get<any[]>('http://localhost:3000/api/categories');
    }
}