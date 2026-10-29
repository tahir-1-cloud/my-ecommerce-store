
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
}

export interface CategoryRequest {
  name: string;
  description: string | null;
  image: File | null;
  isActive: boolean;
}
