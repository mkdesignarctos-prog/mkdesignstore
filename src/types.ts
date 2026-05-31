export interface User {
  id: string;
  name: string;
  isDeveloper: boolean;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  text: string;
  date: string;
}

export interface AppItem {
  id: string;
  name: string;
  developerId: string;
  developerName: string;
  description: string;
  category: string;
  iconDataUrl: string;
  fileObjectUrl?: string;
  fileName?: string;
  rating: number;
  reviews: Review[];
  downloads: number;
  size: string;
  version: string;
  createdAt: string;
}
