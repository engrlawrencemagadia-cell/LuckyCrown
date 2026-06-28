/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  specifications: string; // Dynamic spec list separated by lines or simple text
  price: number;
  availability: string; // e.g. 'In Stock' | 'Order on Demand'
  created_at?: string;
  images?: string[]; // Array of base64 strings or URLs
}

export interface Service {
  id: number;
  name: string;
  description: string;
  pricing: string; // e.g., 'Php 15,000 onwards' or 'Contact for Estimate'
  availability: string; // 'Active' or 'Contact for Quote'
  created_at?: string;
  images?: string[]; // Array of base64 strings or URLs
}

export interface Project {
  id: number;
  name: string;
  client: string;
  location: string;
  date: string; // e.g. '2023-08-15'
  description: string;
  created_at?: string;
  images?: string[]; // Array of base64 strings or URLs
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  created_at?: string;
}

export interface Inquiry {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: string; // 'Pending' | 'Responded' | 'Archived'
  created_at?: string;
}

export interface Admin {
  id: number;
  username: string;
  created_at?: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalServices: number;
  totalProjects: number;
  totalFAQs: number;
  totalInquiries: number;
  recentProducts: Product[];
  recentServices: Service[];
  recentProjects: Project[];
}
