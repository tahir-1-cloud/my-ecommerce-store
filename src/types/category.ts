export type Category = {
  title: string;
  id: number;
  img: string;
};

export interface CategoryRequest {
  name: string;
  description?: string | null;
  imageUrl?: string | null;     // purani saved image (agar rakhni ho)
  imageFile?: File | null;      // nayi select ki hui image
  removeImage?: boolean;        // edit mein image hatani ho
}