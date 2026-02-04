export interface SpecItem {
  label: string;
  value: string;
}

export interface ProductContentBlock {
  description: {
    html: string;
  } | null;

  highlights: string[];
  specs: SpecItem[];
}