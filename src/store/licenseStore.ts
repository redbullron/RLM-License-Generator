import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { 
  ServerInfo, 
  GlobalInfo, 
  VMToken, 
  ProductInstance, 
  ProductType,
  PRODUCT_DEPENDENCIES,
  LicenseData,
  PRODUCTS_FIXED_VERSION,
  FIXED_VERSION
} from '../types';
import { formatDateForLicense, getCurrentYearMonth } from '../utils/muiUtils';

// Utility function for moving items in an array immutably
function arrayMove<T>(array: T[], from: number, to: number): T[] {
  const newArray = array.slice();
  const [movedItem] = newArray.splice(from, 1);
  newArray.splice(to, 0, movedItem);
  return newArray;
}

interface LicenseStoreState {
  // State
  serverInfo: ServerInfo;
  globalInfo: GlobalInfo;
  vmToken: VMToken;
  products: ProductInstance[];
  globalNotes: string;
  // Theme State
  themeMode: 'light' | 'dark';
  // Additional state
  searchFolderPath: string | null;
  destinationFolderPath: string | null;
  appZoomFactor: number;
  previewFontSize: number;
  // Product selection state for batch editing
  selectedProductIds: Set<string>;
}
  
interface LicenseStoreActions {
  // Actions
  setServerInfo: (serverInfo: Partial<ServerInfo>) => void;
  setGlobalInfo: (globalInfo: Partial<GlobalInfo>) => void;
  setVMToken: (vmToken: Partial<VMToken>) => void;
  applyGlobalValues: () => void;
  setGlobalNotes: (notes: string) => void;
  addProduct: (productType: ProductType) => void;
  removeProduct: (productId: string) => void;
  updateProduct: (productId: string, product: Partial<ProductInstance>) => void;
  updateProductNotes: (productId: string, notes: string) => void;
  reorderProducts: (activeId: string, overId: string | null) => void;
  arrangeProducts: () => void;
  generateLicenseFile: () => string;
  clearAll: () => void;
  loadLicenseData: (data: LicenseData) => void;
  parseLicenseContent: (content: string) => void;
  // Theme Action
  toggleThemeMode: () => void;
  // Additional actions
  setSearchFolderPath: (path: string | null) => void;
  setDestinationFolderPath: (path: string | null) => void;
  setAppZoomFactor: (factor: number) => void;
  setPreviewFontSize: (size: number) => void;
  // Product selection actions
  toggleProductSelection: (productId: string) => void;
  selectAllProducts: () => void;
  clearProductSelection: () => void;
  applyGlobalValuesToSelected: () => void;
}

// Combine State and Actions
interface LicenseStore extends LicenseStoreState, LicenseStoreActions {}

// Default values
const defaultServerInfo: ServerInfo = {
  hostname: '',
  macAddress: '',
  customerId: '',
  communicationPort: '5053',
  isvPort: '50053',
};

const defaultGlobalInfo: GlobalInfo = {
  issueDate: null,
  startDate: null,
  endDate: null,
  yearMonth: '',
  opportunityId: '',
};

const defaultVMToken: VMToken = {
  enabled: false,
  startDate: null,
  endDate: null,
  isPermanent: false,
  issueDate: null,
  yearMonth: '',
};

// Helper function for parsing license dates
const convertDateFormat = (licenseDate: string): Date | null => {
  if (!licenseDate || licenseDate === 'permanent') return null;
  
  try {
    const match = licenseDate.match(/^(\d{2})-([a-z]{3})-(\d{4})$/i);
    if (match) {
      const [_, day, monthStr, year] = match;
      const months: Record<string, number> = {
        'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
        'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
      };
      const month = months[monthStr.toLowerCase()];
      if (month === undefined) return null;
      return new Date(parseInt(year), month, parseInt(day));
    }
    const date = new Date(licenseDate);
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    console.error('Date conversion error:', error);
    return null;
  }
};

export const useLicenseStore = create<LicenseStore>()(
  persist(
    (set, get) => ({
      // Initial state
      serverInfo: defaultServerInfo,
      globalInfo: defaultGlobalInfo,
      vmToken: defaultVMToken,
      products: [],
      globalNotes: '',
      themeMode: 'light',
      searchFolderPath: null,
      destinationFolderPath: null,
      appZoomFactor: 1,
      previewFontSize: 0.8,
      selectedProductIds: new Set<string>(),
  
      // Server info actions
      setServerInfo: (info) => set((state) => ({
        serverInfo: { ...state.serverInfo, ...info }
      })),
  
      // Global info actions
      setGlobalInfo: (info) => set((state) => ({
        globalInfo: { ...state.globalInfo, ...info }
      })),
  
      // VM Token actions
      setVMToken: (token) => set((state) => ({
        vmToken: { ...state.vmToken, ...token }
      })),
  
      // Apply global values to all products
      applyGlobalValues: () => set((state) => {
        const { issueDate, startDate, endDate, yearMonth, opportunityId } = state.globalInfo;
        const updatedProducts = state.products.map(product => {
          const updates: Partial<ProductInstance> = {};
          
          if (issueDate !== null) {
            updates.issueDate = issueDate;
          }
          
          if (startDate !== null) {
            updates.startDate = startDate;
          }
          
          if (endDate !== null) {
            updates.endDate = endDate;
            updates.isPermanent = false;
          }
          
          if (yearMonth && yearMonth.trim() !== '' && !PRODUCTS_FIXED_VERSION.includes(product.product)) {
            updates.yearMonth = yearMonth;
          }
          
          if (opportunityId && opportunityId.trim() !== '') {
            updates.opportunityId = opportunityId;
          }
          
          return { ...product, ...updates };
        });
        
        return { products: updatedProducts };
      }),
  
      // Product management
      addProduct: (productType) => set((state) => {
        const isFixedVersion = PRODUCTS_FIXED_VERSION.includes(productType);
        const initialYearMonth = isFixedVersion ? FIXED_VERSION : '';
        const parentId = uuidv4();

        const newProduct: ProductInstance = {
          id: parentId,
          product: productType,
          seats: 1,
          startDate: state.globalInfo.startDate,
          endDate: null,
          isPermanent: false,
          issueDate: state.globalInfo.issueDate,
          yearMonth: initialYearMonth,
          opportunityId: state.globalInfo.opportunityId,
          namedUser: false,
          notes: '',
        };
        
        // Calculate dependencies
        const dependencies = PRODUCT_DEPENDENCIES[productType] || [];
        const dependencyProducts = dependencies.map(dep => {
          const seatMultiplier = dep.seatMultiplier || 1;
          const depIsFixedVersion = PRODUCTS_FIXED_VERSION.includes(dep.product);
          const depInitialYearMonth = depIsFixedVersion
            ? FIXED_VERSION
            : (dep.product === ProductType.REDSHIFT_CPU ? getCurrentYearMonth() : '');

          return {
            id: uuidv4(),
            product: dep.product,
            seats: newProduct.seats * seatMultiplier,
            startDate: newProduct.startDate,
            endDate: newProduct.endDate,
            isPermanent: newProduct.isPermanent,
            issueDate: newProduct.issueDate,
            yearMonth: depInitialYearMonth,
            opportunityId: newProduct.opportunityId,
            namedUser: newProduct.namedUser,
            notes: '',
            parentId: parentId,
          };
        });
        
        return { products: [...state.products, newProduct, ...dependencyProducts] };
      }),
  
      removeProduct: (productId) => set((state) => {
        const idsToRemove = [productId];
        state.products.forEach(p => {
          if (p.parentId === productId) {
            idsToRemove.push(p.id);
          }
        });
        
        return {
          products: state.products.filter(p => !idsToRemove.includes(p.id))
        };
      }),
  
      updateProduct: (productId, updates) => set((state) => {
        const updatedProducts = state.products.map(product => {
          if (product.id === productId) {
            return { ...product, ...updates };
          }
          
          if (product.parentId === productId) {
            const parentProduct = { ...state.products.find(p => p.id === productId)!, ...updates };
            const dependencies = PRODUCT_DEPENDENCIES[parentProduct.product] || [];
            const dependency = dependencies.find(dep => dep.product === product.product);
            
            if (dependency) {
              const seatMultiplier = dependency.seatMultiplier || 1;
              return {
                ...product,
                seats: parentProduct.seats * seatMultiplier,
                startDate: updates.startDate !== undefined ? updates.startDate : product.startDate,
                endDate: updates.endDate !== undefined ? updates.endDate : product.endDate,
                isPermanent: updates.isPermanent !== undefined ? updates.isPermanent : product.isPermanent,
                issueDate: updates.issueDate !== undefined ? updates.issueDate : product.issueDate,
                yearMonth: updates.yearMonth !== undefined ? updates.yearMonth : product.yearMonth,
                opportunityId: updates.opportunityId !== undefined ? updates.opportunityId : product.opportunityId,
                namedUser: updates.namedUser !== undefined ? updates.namedUser : product.namedUser,
              };
            }
          }
          
          return product;
        });
        
        return { products: updatedProducts };
      }),
  
      updateProductNotes: (productId, notes) => set((state) => ({
        products: state.products.map(product => 
          product.id === productId ? { ...product, notes } : product
        )
      })),
  
      reorderProducts: (activeId, overId) => set((state) => {
        const { products } = state;
        const activeProductIndex = products.findIndex(p => p.id === activeId && !p.parentId);
        const overProduct = overId ? products.find(p => p.id === overId) : null;
        const overParentId = overProduct?.parentId || overProduct?.id;
        const overProductIndex = overParentId ? products.findIndex(p => p.id === overParentId && !p.parentId) : -1;

        if (activeProductIndex === -1 || (overId && overProductIndex === -1) || activeId === overParentId) {
          return state;
        }

        const parentProducts = products.filter(p => !p.parentId);
        const oldParentIndex = parentProducts.findIndex(p => p.id === activeId);
        const newParentIndex = overId ? parentProducts.findIndex(p => p.id === overParentId) : parentProducts.length;

        if (oldParentIndex === -1 || (overId && newParentIndex === -1)) {
          return state;
        }

        const reorderedParentProducts = arrayMove(parentProducts, oldParentIndex, newParentIndex);
        const reorderedProducts: ProductInstance[] = [];
        const originalChildrenMap = new Map<string, ProductInstance[]>();
        
        products.forEach(p => {
          if (p.parentId) {
            if (!originalChildrenMap.has(p.parentId)) {
              originalChildrenMap.set(p.parentId, []);
            }
            originalChildrenMap.get(p.parentId)!.push(p);
          }
        });

        reorderedParentProducts.forEach(parent => {
          reorderedProducts.push(parent);
          const children = originalChildrenMap.get(parent.id) || [];
          reorderedProducts.push(...children);
        });

        return { products: reorderedProducts };
      }),
  
      arrangeProducts: () => set((state) => {
        // Simple arrangement logic - can be expanded
        const parentProducts = state.products.filter(p => !p.parentId);
        const childrenMap = new Map<string, ProductInstance[]>();
        
        state.products.forEach(p => {
          if (p.parentId) {
            if (!childrenMap.has(p.parentId)) {
              childrenMap.set(p.parentId, []);
            }
            childrenMap.get(p.parentId)!.push(p);
          }
        });

        const arrangedProducts: ProductInstance[] = [];
        parentProducts.forEach(parent => {
          arrangedProducts.push(parent);
          const children = childrenMap.get(parent.id) || [];
          arrangedProducts.push(...children);
        });

        return { products: arrangedProducts };
      }),
  
      generateLicenseFile: () => {
        const state = get();
        const lines: string[] = [];
        
        // Add server info
        lines.push(`SERVER ${state.serverInfo.hostname} ${state.serverInfo.macAddress} ${state.serverInfo.communicationPort}`);
        lines.push(`ISV maxon port=${state.serverInfo.isvPort}`);
        
        // Add products
        state.products.forEach(product => {
          const startDateStr = formatDateForLicense(product.startDate);
          const endDateStr = product.isPermanent ? 'permanent' : formatDateForLicense(product.endDate);
          const namedUserStr = product.namedUser ? ' named_user_license' : '';
          
          lines.push(`FEATURE ${product.product} maxon ${product.yearMonth} ${endDateStr} ${product.seats} ${startDateStr}${namedUserStr}`);
        });
        
        return lines.join('\n');
      },
  
      clearAll: () => set(() => ({
        serverInfo: defaultServerInfo,
        globalInfo: defaultGlobalInfo,
        vmToken: defaultVMToken,
        products: [],
        globalNotes: '',
        selectedProductIds: new Set<string>(),
      })),
  
      loadLicenseData: (data) => set(() => ({
        serverInfo: data.serverInfo,
        globalInfo: data.globalInfo,
        vmToken: data.vmToken,
        products: data.products,
        globalNotes: data.globalNotes,
      })),
  
      parseLicenseContent: (content) => {
        // Basic parsing logic - can be expanded
        const lines = content.split('\n').filter(line => line.trim());
        const newProducts: ProductInstance[] = [];
        
        lines.forEach(line => {
          if (line.startsWith('FEATURE')) {
            const parts = line.split(' ');
            if (parts.length >= 6) {
              const productName = parts[1];
              const yearMonth = parts[3];
              const endDate = parts[4];
              const seats = parseInt(parts[5]) || 1;
              
              // Map product name to ProductType
              const productType = Object.values(ProductType).find(type => 
                type.toLowerCase().replace(/\s+/g, '-') === productName.toLowerCase()
              ) || ProductType.CINEMA_4D;
              
              newProducts.push({
                id: uuidv4(),
                product: productType,
                seats,
                startDate: null,
                endDate: endDate === 'permanent' ? null : convertDateFormat(endDate),
                isPermanent: endDate === 'permanent',
                issueDate: null,
                yearMonth,
                opportunityId: '',
                namedUser: line.includes('named_user_license'),
                notes: '',
              });
            }
          }
        });
        
        set((state) => ({ ...state, products: newProducts }));
      },
  
      // Theme actions
      toggleThemeMode: () => set((state) => ({
        themeMode: state.themeMode === 'light' ? 'dark' : 'light'
      })),
  
      // Additional actions
      setSearchFolderPath: (path) => set(() => ({ searchFolderPath: path })),
      setDestinationFolderPath: (path) => set(() => ({ destinationFolderPath: path })),
      setAppZoomFactor: (factor) => set(() => ({ appZoomFactor: factor })),
      setPreviewFontSize: (size) => set(() => ({ previewFontSize: size })),
  
      // Product selection actions
      toggleProductSelection: (productId) => set((state) => {
        const newSelection = new Set(state.selectedProductIds);
        if (newSelection.has(productId)) {
          newSelection.delete(productId);
        } else {
          newSelection.add(productId);
        }
        return { selectedProductIds: newSelection };
      }),
  
      selectAllProducts: () => set((state) => ({
        selectedProductIds: new Set(state.products.map(p => p.id))
      })),
  
      clearProductSelection: () => set(() => ({
        selectedProductIds: new Set<string>()
      })),
  
      applyGlobalValuesToSelected: () => set((state) => {
        const { issueDate, startDate, endDate, yearMonth, opportunityId } = state.globalInfo;
        const updatedProducts = state.products.map(product => {
          if (state.selectedProductIds.has(product.id)) {
            const updates: Partial<ProductInstance> = {};
            
            if (issueDate !== null) updates.issueDate = issueDate;
            if (startDate !== null) updates.startDate = startDate;
            if (endDate !== null) {
              updates.endDate = endDate;
              updates.isPermanent = false;
            }
            if (yearMonth && !PRODUCTS_FIXED_VERSION.includes(product.product)) {
              updates.yearMonth = yearMonth;
            }
            if (opportunityId) updates.opportunityId = opportunityId;
            
            return { ...product, ...updates };
          }
          return product;
        });
        
        return { products: updatedProducts };
      }),
    }),
    {
      name: 'license-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        serverInfo: state.serverInfo,
        globalInfo: state.globalInfo,
        vmToken: state.vmToken,
        products: state.products,
        globalNotes: state.globalNotes,
        themeMode: state.themeMode,
        searchFolderPath: state.searchFolderPath,
        destinationFolderPath: state.destinationFolderPath,
        appZoomFactor: state.appZoomFactor,
        previewFontSize: state.previewFontSize,
      }),
    }
  )
);