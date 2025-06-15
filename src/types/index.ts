// Server and global information types
export interface ServerInfo {
  hostname: string;
  macAddress: string;
  customerId: string;
  communicationPort: string;
  isvPort: string;
}

export interface GlobalInfo {
  issueDate: Date | null;
  startDate: Date | null;
  endDate: Date | null;
  yearMonth: string;
  opportunityId: string;
}

// VM Token information
export interface VMToken {
  enabled: boolean;
  startDate: Date | null;
  endDate: Date | null;
  isPermanent: boolean;
  issueDate: Date | null;
  yearMonth: string;
}

// Product types
export enum ProductType {
  MAXON_ONE = 'Maxon One',
  CINEMA_4D = 'Cinema 4D',
  REDSHIFT = 'Redshift',
  RED_GIANT = 'Red Giant',
  ZBRUSH = 'ZBrush',
  MAXON_ONE_EDU = 'Maxon One EDU',
  COMMANDLINE = 'Commandline',
  RG_RENDER_ONLY = 'RG Render Only',
  REDSHIFT_CPU = 'Redshift CPU'
}

// Each product can have dependencies
export interface ProductDependency {
  product: ProductType;
  seatMultiplier?: number; // e.g., Commandline gets 2x the seats of Cinema 4D
}

// Products with fixed version (9999.9) instead of YYYY.MM
export const PRODUCTS_FIXED_VERSION = [
  ProductType.RED_GIANT,
  ProductType.RG_RENDER_ONLY,
  ProductType.COMMANDLINE
];

// Fixed version value
export const FIXED_VERSION = '9999.9';

// Product dependency mapping (which products automatically add other products)
export const PRODUCT_DEPENDENCIES: Record<ProductType, ProductDependency[]> = {
  [ProductType.CINEMA_4D]: [
    { product: ProductType.COMMANDLINE, seatMultiplier: 2 },
  ],
  [ProductType.RED_GIANT]: [
    { product: ProductType.RG_RENDER_ONLY, seatMultiplier: 2 }
  ],
  [ProductType.MAXON_ONE]: [
    { product: ProductType.COMMANDLINE, seatMultiplier: 2 },
    { product: ProductType.RG_RENDER_ONLY, seatMultiplier: 2 }
  ],
  [ProductType.MAXON_ONE_EDU]: [],
  [ProductType.REDSHIFT]: [],
  [ProductType.ZBRUSH]: [],
  [ProductType.COMMANDLINE]: [
    { product: ProductType.REDSHIFT_CPU, seatMultiplier: 1 }
  ],
  [ProductType.RG_RENDER_ONLY]: [],
  [ProductType.REDSHIFT_CPU]: []
}

// Product instance (a row in the product table)
export interface ProductInstance {
  id: string; // Unique ID for each product instance
  product: ProductType;
  seats: number;
  startDate: Date | null;
  endDate: Date | null;
  isPermanent: boolean;
  issueDate: Date | null;
  yearMonth: string;
  opportunityId: string;
  namedUser: boolean;
  notes: string;
  parentId?: string; // If this product was auto-added as a dependency
}

// The complete license data
export interface LicenseData {
  serverInfo: ServerInfo;
  globalInfo: GlobalInfo;
  vmToken: VMToken;
  products: ProductInstance[];
  globalNotes: string;
}