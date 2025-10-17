import axios, { AxiosResponse, AxiosError } from 'axios';

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Axios instance oluştur
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - token ekle
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - hata işleme
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token geçersiz, kullanıcıyı çıkış yap
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API response tipi
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string): Promise<ApiResponse> => {
    const response = await api.post('/auth/login', { email, sifre: password });
    return response.data;
  },

  register: async (userData: any): Promise<ApiResponse> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getMe: async (): Promise<ApiResponse> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse> => {
    const response = await api.put('/auth/change-password', {
      mevcutSifre: currentPassword,
      yeniSifre: newPassword
    });
    return response.data;
  },

  logout: async (): Promise<ApiResponse> => {
    const response = await api.post('/auth/logout');
    return response.data;
  }
};

// Stok API
export interface StokData {
  _id?: string;
  malzemeAdi: string;
  malzemeKodu: string;
  kategori: 'kumas' | 'sunger' | 'ahsap' | 'metal' | 'aksesuar' | 'diger';
  altKategori?: string;
  miktar: number;
  birim: 'metre' | 'adet' | 'kg' | 'litre' | 'paket' | 'top';
  minimumStok: number;
  birimFiyat: number;
  paraBirimi: 'TRY' | 'USD' | 'EUR';
  tedarikci?: {
    ad?: string;
    telefon?: string;
    email?: string;
  };
  renk?: string;
  kalite: 'dusuk' | 'orta' | 'yuksek' | 'premium';
  depoKonumu?: string;
  aciklama?: string;
  stokDurumu?: 'yeterli' | 'kritik' | 'tukenmis';
  aktif?: boolean;
  toplamDeger?: number;
  guncelleyenKullanici?: {
    _id: string;
    ad: string;
    soyad: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export const stokAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    kategori?: string;
    stokDurumu?: string;
    arama?: string;
    siralama?: string;
    yon?: string;
  }): Promise<ApiResponse<StokData[]>> => {
    const response = await api.get('/stoklar', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<StokData>> => {
    const response = await api.get(`/stoklar/${id}`);
    return response.data;
  },

  create: async (stokData: Omit<StokData, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<StokData>> => {
    const response = await api.post('/stoklar', stokData);
    return response.data;
  },

  update: async (id: string, stokData: Partial<StokData>): Promise<ApiResponse<StokData>> => {
    const response = await api.put(`/stoklar/${id}`, stokData);
    return response.data;
  },

  delete: async (id: string, hard?: boolean): Promise<ApiResponse> => {
    const response = await api.delete(`/stoklar/${id}${hard ? '?hard=true' : ''}`);
    return response.data;
  },

  addStock: async (id: string, miktar: number, aciklama?: string): Promise<ApiResponse<StokData>> => {
    const response = await api.post(`/stoklar/${id}/ekle`, { miktar, aciklama });
    return response.data;
  },

  removeStock: async (id: string, miktar: number, aciklama?: string): Promise<ApiResponse<StokData>> => {
    const response = await api.post(`/stoklar/${id}/cikar`, { miktar, aciklama });
    return response.data;
  },

  getCritical: async (): Promise<ApiResponse<StokData[]>> => {
    const response = await api.get('/stoklar/kritik');
    return response.data;
  },

  getStatistics: async (): Promise<ApiResponse> => {
    const response = await api.get('/stoklar/istatistikler');
    return response.data;
  }
};

// Movement API
export interface MovementData {
  _id?: string;
  stok: {
    _id: string;
    malzemeAdi: string;
    malzemeKodu: string;
  };
  user: {
    _id: string;
    ad: string;
    soyad: string;
  };
  miktar: number;
  aciklama: string;
  islemTipi: 'ekle' | 'cikar';
  createdAt?: string;
  updatedAt?: string;
}

export const movementAPI = {
  create: async (movementData: {
    stokId: string;
    miktar: number;
    aciklama: string;
    islemTipi: 'ekle' | 'cikar';
  }): Promise<ApiResponse<MovementData>> => {
    const response = await api.post('/movements', movementData);
    return response.data;
  },

  getAll: async (params?: {
    stokId?: string;
  }): Promise<MovementData[]> => {
    const response = await api.get('/movements', { params });
    return response.data; // Backend doğrudan dizi döndürüyor
  },

  deleteAll: async (): Promise<ApiResponse> => {
    const response = await api.delete('/movements');
    return response.data;
  }
};

// Kullanıcı tipi
export interface User {
  _id: string;
  ad: string;
  soyad: string;
  email: string;
  aktif: boolean;
  sonGiris: string;
  tamAd?: string;
  createdAt: string;
  updatedAt: string;
}

// Sipariş API
export interface OrderData {
  _id?: string;
  musteriAdi: string;
  musteriTel?: string;
  musteriEmail?: string;
  siparisTarihi?: string;
  teslimTarihi?: string;
  urunler: Array<{
    model: string;
    renk?: string;
    adet: number;
    ozelNot?: string;
  }>;
  durum?: 'beklemede' | 'uretimde' | 'hazir' | 'teslim';
  toplamTutar?: number;
  aciklama?: string;
  olusturan?: any;
  guncelleyen?: any;
  createdAt?: string;
  updatedAt?: string;
}

export const orderAPI = {
  getAll: async (): Promise<OrderData[]> => {
    const response = await api.get('/siparisler');
    return response.data.data;
  },
  getById: async (id: string): Promise<OrderData> => {
    const response = await api.get(`/siparisler/${id}`);
    return response.data.data;
  },
  create: async (order: Omit<OrderData, '_id' | 'createdAt' | 'updatedAt'>): Promise<OrderData> => {
    const response = await api.post('/siparisler', order);
    return response.data.data;
  },
  update: async (id: string, order: Partial<OrderData>): Promise<OrderData> => {
    const response = await api.put(`/siparisler/${id}`, order);
    return response.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/siparisler/${id}`);
  },
  getMonthlyCount: async (): Promise<number> => {
    const response = await api.get('/siparisler/aylik-sayi');
    return response.data.count;
  }
};

// Üretim API
export interface ProductionData {
  _id?: string;
  siparis: any;
  baslangicTarihi?: string;
  bitisTarihi?: string;
  durum?: 'beklemede' | 'kesim' | 'döşeme' | 'montaj' | 'hazir' | 'teslim';
  asamalar?: Array<{
    ad: string;
    baslangic?: string;
    bitis?: string;
    tamamlandi?: boolean;
    aciklama?: string;
  }>;
  aciklama?: string;
  olusturan?: any;
  guncelleyen?: any;
  createdAt?: string;
  updatedAt?: string;
}

export const productionAPI = {
  getAll: async (): Promise<ProductionData[]> => {
    const response = await api.get('/uretim');
    return response.data.data;
  },
  getById: async (id: string): Promise<ProductionData> => {
    const response = await api.get(`/uretim/${id}`);
    return response.data.data;
  },
  create: async (production: Omit<ProductionData, '_id' | 'createdAt' | 'updatedAt'>): Promise<ProductionData> => {
    const response = await api.post('/uretim', production);
    return response.data.data;
  },
  update: async (id: string, production: Partial<ProductionData>): Promise<ProductionData> => {
    const response = await api.put(`/uretim/${id}`, production);
    return response.data.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/uretim/${id}`);
  }
};

// İşçi (Calisan) API
export const getCalisanlar = async () => {
  const res = await api.get('/calisanlar');
  return res.data;
};

export const getCalisan = async (id: string) => {
  const res = await api.get(`/calisanlar/${id}`);
  return res.data;
};

export const addCalisan = async (data: any) => {
  const res = await api.post('/calisanlar', data);
  return res.data;
};

export const updateCalisan = async (id: string, data: any) => {
  const res = await api.put(`/calisanlar/${id}`, data);
  return res.data;
};

export const deleteCalisan = async (id: string, hard?: boolean) => {
  const res = await api.delete(`/calisanlar/${id}${hard ? '?hard=true' : ''}`);
  return res.data;
};

// Bildirim API
export interface NotificationData {
  _id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationAPI = {
  getAll: async (): Promise<NotificationData[]> => {
    const response = await api.get('/notifications');
    return response.data.data; // düzeltildi
  },
  markAsRead: async (id: string): Promise<void> => {
    await api.patch(`/notifications/${id}/read`);
  },
  markAllAsRead: async (): Promise<void> => {
    await api.patch('/notifications/all/read');
  },
};

export const raporlarAPI = {
  getBugunRaporu: async () => {
    const response = await api.get('/raporlar/bugun');
    return response.data;
  },
};

export default api; 