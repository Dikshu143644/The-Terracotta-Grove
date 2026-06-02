
export interface MenuItem {
  id: string;
  name: string;
  price: string;
  description: string;
  category: 'cafe' | 'main';
  isVeg: boolean;
  isSpicy?: boolean;
}

export interface Room {
  id: string;
  name: string;
  price: string;
  features: string[];
  image: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface SearchResult {
  title: string;
  uri: string;
}
