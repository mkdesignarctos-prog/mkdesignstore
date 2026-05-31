import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppItem, User, Review } from '../types';
import { supabase } from '../lib/supabase';

interface StoreContextType {
  currentUser: User | null;
  apps: AppItem[];
  login: () => Promise<void>;
  logout: () => Promise<void>;
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
    // Check initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await fetchAndSetUser(session.user);
      } else {
        setAuthReady(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchAndSetUser(session.user);
      } else {
        setCurrentUser(null);
        setAuthReady(true);
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const fetchAndSetUser = async (authUser: any) => {
    try {
      // Check if user exists in our users table
      const { data: userSnap, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();
        
      if (fetchError && fetchError.code === 'PGRST116') {
        // Create new user profile if it doesn't exist
        const newUser = {
          id: authUser.id,
          name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
          isDeveloper: false,
          createdAt: Date.now()
        };
        await supabase.from('users').insert(newUser);
        setCurrentUser(newUser as User);
      } else if (userSnap) {
        setCurrentUser(userSnap as User);
      }
    } catch (err) {
      console.error('Error fetching/setting user:', err);
    } finally {
      setAuthReady(true);
    }
  };

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
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) {
      console.error('Error logging in:', error);
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
    } else {
      setCurrentUser(null);
    }
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
