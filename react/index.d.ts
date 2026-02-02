import { ReactNode } from "react";
import type { DashClient } from "../index";

// ============================================================================
// Cart Types
// ============================================================================

export interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  product_image: string | null;
  size_id: string;
  size_label: string;
  quantity: number;
  unit_price: string;
  total_price: string;
  stock_available: number;
}

export interface CartContextType {
  items: CartItem[];
  cartId: string | null;
  itemCount: number;
  totalItemCount: number;
  subtotal: string;
  isLoading: boolean;
  addItem: (productId: string, sizeId: string, quantity?: number) => Promise<any>;
  updateItem: (sizeId: string, quantity: number) => Promise<void>;
  removeItem: (sizeId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  transferToUser: (authToken?: string) => Promise<void>;
}

export interface CartProviderProps {
  children: ReactNode;
  client: DashClient;
  storageKey?: string;
}

export function CartProvider(props: CartProviderProps): JSX.Element;
export function useCart(): CartContextType;

// ============================================================================
// Auth Types
// ============================================================================

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  emailVerified: boolean;
}

export interface AuthContextType {
  customer: Customer | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (email: string, password: string, additionalData?: Record<string, any>) => Promise<any>;
  requestOTP: (email: string) => Promise<any>;
  loginWithOTP: (email: string, code: string) => Promise<any>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Customer>) => Promise<any>;
  refreshProfile: () => Promise<void>;
}

export interface AuthProviderProps {
  children: ReactNode;
  client: DashClient;
  tokenKey?: string;
  customerKey?: string;
  onLogin?: (customer: Customer) => void;
  onLogout?: () => void;
}

export function AuthProvider(props: AuthProviderProps): JSX.Element;
export function useAuth(): AuthContextType;

// ============================================================================
// Combined Provider
// ============================================================================

export interface DashProviderProps {
  children: ReactNode;
  client: DashClient;
}

export function DashProvider(props: DashProviderProps): JSX.Element;
export function useDash(): { client: DashClient };
