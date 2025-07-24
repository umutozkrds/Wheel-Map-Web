import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
    constructor(private http: HttpClient) { }
    

    postPlace(place: any) {
        return this.http.post('http://localhost:3000/api/places', place);
    }
}