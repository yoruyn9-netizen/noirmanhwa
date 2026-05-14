
export interface Border {
  id: string;
  name: string;
  tier: 'default' | 'bronze' | 'silver' | 'gold' | 'legend' | 'special';
  cssClass: string;
  requirement: string;
  color: string;
}
