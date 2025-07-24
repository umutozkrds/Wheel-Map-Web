export interface Place {
    id?: number;
    ad: string;
    aciklama: string;
    wheelchair: string;
    lat: number;
    lon: number;
    category: string;
    geometry_text?: string;
}