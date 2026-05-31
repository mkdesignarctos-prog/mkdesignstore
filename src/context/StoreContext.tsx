import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppItem, User, Review } from '../types';
import { auth, loginWithGoogle, logout as firebaseLogout } from '../lib/firebase';
import { supabase } from '../lib/supabase';

interface StoreContextType {
  currentUser: User | null;
  apps: AppItem[];
  login: () => Promise<void>;
  logout: () => void;
  becomeDeveloper: () => Promise<void>;
  publishApp: (app: Omit<AppItem, 'id' | 'rating' | 'reviews' | 'downloads' | 'createdAt'>) => Promise<void>;
  addReview: (appId: string, review: Omit<Review, 'id' | 'date'>) => Promise<void>;
  getAppById: (id: string) => AppItem | undefined;
  getReviewsForApp: (appId: string) => Review[];
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [apps, setApps] = useState<AppItem[]>([]);
  const [reviewsMap, setReviewsMap] = useState<Record<string, Review[]>>({});
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', firebaseUser.uid)
            .single();
          
          if (data) setCurrentUser(data as User);
          setAuthReady(true);
        } catch (err) {
          console.error(err);
          setAuthReady(true);
        }
      } else {
        setCurrentUser(null);
        setAuthReady(true);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchApps = async () => {
    try {
      const { data, error } = await supabase
        .from('apps')
        .select('*')
        .order('createdAt', { ascending: false });
      
      if (!error && data) {
        setApps(data as AppItem[]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!authReady) return;
    fetchApps();
    
    // Auto-refresh periodically as a fallback instead of complex realtime config
    const interval = setInterval(fetchApps, 10000);
    return () => clearInterval(interval);
  }, [authReady]);

  const fetchReviews = async (appId: string) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('appId', appId)
        .order('date', { ascending: false });
      
      if (!error && data) {
        setReviewsMap(prev => ({...prev, [appId]: data as Review[]}));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    apps.forEach(app => {
      if (!reviewsMap[app.id]) {
        fetchReviews(app.id);
      }
    });
  }, [apps]);

  const login = async () => {
    await loginWithGoogle();
  };

  const logout = () => {
    firebaseLogout();
  };

  const becomeDeveloper = async () => {
    if (currentUser) {
      try {
        await supabase
          .from('users')
          .update({ isDeveloper: true })
          .eq('id', currentUser.id);
        
        setCurrentUser({ ...currentUser, isDeveloper: true });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const publishApp = async (newAppInfo: Omit<AppItem, 'id' | 'rating' | 'reviews' | 'downloads' | 'createdAt'>) => {
    if (!currentUser) return;
    try {
      const newApp = {
        ...newAppInfo,
        id: crypto.randomUUID(),
        rating: 0,
        downloads: 0,
        createdAt: Date.now(),
        reviewCount: 0
      };
      
      await supabase
        .from('apps')
        .insert([newApp]);
      
      await fetchApps();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const addReview = async (appId: string, reviewInfo: Omit<Review, 'id' | 'date'>) => {
    try {
      const newReview = {
        ...reviewInfo,
        id: crypto.randomUUID(),
        appId,
        date: new Date().toISOString()
      };

      await supabase.from('reviews').insert([newReview]);
      
      // Calculate simple average
      const app = getAppById(appId);
      if (app) {
        const curCount = app.reviewCount || 0;
        const curRating = app.rating || 0;
        const newCount = curCount + 1;
        const newRating = ((curRating * curCount) + reviewInfo.rating) / newCount;
        
        await supabase
          .from('apps')
          .update({ rating: newRating, reviewCount: newCount })
          .eq('id', appId);
        
        await fetchApps();
      }
      
      await fetchReviews(appId);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const getAppById = (id: string) => apps.find(a => a.id === id);
  const getReviewsForApp = (id: string) => reviewsMap[id] || [];

  return (
    <StoreContext.Provider value={{
      currentUser,
      apps,
      login,
      logout,
      becomeDeveloper,
      publishApp,
      addReview,
      getAppById,
      getReviewsForApp
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
