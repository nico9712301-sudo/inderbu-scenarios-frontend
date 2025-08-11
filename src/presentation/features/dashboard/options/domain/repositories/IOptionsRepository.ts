export interface OptionItem {
  id: string;
  title: string;
  description: string;
  href: string;
}

export interface OptionCategory {
  id: string;
  title: string;
  description: string;
  // icon: any; // Lucide icon component
  icon: string; // Lucide icon component
  options: OptionItem[];
}

export interface IOptionsRepository {
  getAllCategories(): Promise<OptionCategory[]>;
}
