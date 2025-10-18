export interface Photosphere {
    id: string;
    name: string;
    url: string;
    uploadDate: Date | string;
    size: number;
    thumbnailUrl?: string;
    metadata?: {
        map: string;
        weather: string;
        coord: {
            x: number;
            y: number;
            z: number;
        };
        time: string;
        uploadedAt?: string;
    };
    variants?: {
        panorama_thumbnail?: string;
        light?: string;
        medium?: string;
        heavy?: string;
        original?: string;
    };
}

export type TabType = 'photosphere-upload' | 'photosphere-library' | 'maps';