import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppItem, User, Review } from '../types';
import { supabase } from '../lib/supabase';
import { fallbackApps } from '../data/fallbackApps';

interface StoreContextType {
  currentUser: User | null;
  apps: AppItem[];
  loginWithPassword: (username: string, password: string) => Promise<void>;
  signUpWithPassword: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  becomeDeveloper: () => Promise<void>;
  publishApp: (app: Omit<AppItem, 'id' | 'rating' | 'reviews' | 'downloads' | 'createdAt'>) => Promise<void>;
  addReview: (appId: string, review: Omit<Review, 'id' | 'date'>) => Promise<void>;
  getAppById: (id: string) => AppItem | undefined;
  getReviewsForApp: (appId: string) => Review[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [apps, setApps] = useState<AppItem[]>([]);
  const [reviewsMap, setReviewsMap] = useState<Record<string, Review[]>>({});
  const [authReady, setAuthReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Check local session first
    const savedLocalUser = localStorage.getItem('local_logged_in_user_v1');
    if (savedLocalUser) {
      try {
        setCurrentUser(JSON.parse(savedLocalUser));
      } catch (err) {
        console.error('Error parsing local user:', err);
      }
      setAuthReady(true);
      return;
    }

    // Check initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await fetchAndSetUser(session.user);
      } else {
        setAuthReady(true);
      }
    }).catch(() => {
      setAuthReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchAndSetUser(session.user);
      } else {
        const locallyLogged = localStorage.getItem('local_logged_in_user_v1');
        if (!locallyLogged) {
          setCurrentUser(null);
        }
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
      
      const dbAppsList = (!error && data) ? (data as AppItem[]) : [];
      
      const localSaved = localStorage.getItem('local_published_apps_v1');
      const localAppsList: AppItem[] = localSaved ? JSON.parse(localSaved) : [];
      
      const mergedMap = new Map<string, AppItem>();
      
      fallbackApps.forEach(item => mergedMap.set(item.id, item));
      localAppsList.forEach(item => mergedMap.set(item.id, item));
      dbAppsList.forEach(item => mergedMap.set(item.id, item));
      
      const sortedApps = Array.from(mergedMap.values())
        .filter(app => !app.id.startsWith('premium-app-') && !app.id.startsWith('mock-'))
        .sort((a, b) => {
        const timeA = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt).getTime();
        const timeB = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt).getTime();
        return (timeB || 0) - (timeA || 0);
      });
      
      setApps(sortedApps);
    } catch (err) {
      console.error(err);
      const localSaved = localStorage.getItem('local_published_apps_v1');
      const localAppsList: AppItem[] = localSaved ? JSON.parse(localSaved) : [];
      const mergedMap = new Map<string, AppItem>();
      fallbackApps.forEach(item => mergedMap.set(item.id, item));
      localAppsList.forEach(item => mergedMap.set(item.id, item));
      
      const filtered = Array.from(mergedMap.values())
        .filter(app => !app.id.startsWith('premium-app-') && !app.id.startsWith('mock-'));
      setApps(filtered);
    }
  };

  useEffect(() => {
    if (!authReady) return;
    fetchApps();
    
    const interval = setInterval(fetchApps, 15000);
    return () => clearInterval(interval);
  }, [authReady]);

  const fetchReviews = async (appId: string) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('appId', appId)
        .order('date', { ascending: false });
      
      const dbReviewsList = (!error && data) ? (data as Review[]) : [];
      
      const fbApp = fallbackApps.find(a => a.id === appId);
      const fbReviews = fbApp ? fbApp.reviews : [];
      
      const localRevSaved = localStorage.getItem('local_reviews_map_v1');
      const localMap = localRevSaved ? JSON.parse(localRevSaved) : {};
      const localReviewsList = localMap[appId] || [];
      
      const mergedReviewsMap = new Map<string, Review>();
      fbReviews.forEach(r => mergedReviewsMap.set(r.id, r));
      localReviewsList.forEach((r: Review) => mergedReviewsMap.set(r.id, r));
      dbReviewsList.forEach(r => mergedReviewsMap.set(r.id, r));
      
      const sortedReviews = Array.from(mergedReviewsMap.values()).sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      
      setReviewsMap(prev => ({...prev, [appId]: sortedReviews}));
    } catch (err) {
      console.error(err);
      const fbApp = fallbackApps.find(a => a.id === appId);
      const fbReviews = fbApp ? fbApp.reviews : [];
      const localRevSaved = localStorage.getItem('local_reviews_map_v1');
      const localMap = localRevSaved ? JSON.parse(localRevSaved) : {};
      const localReviewsList = localMap[appId] || [];
      
      const mergedReviewsMap = new Map<string, Review>();
      fbReviews.forEach(r => mergedReviewsMap.set(r.id, r));
      localReviewsList.forEach((r: Review) => mergedReviewsMap.set(r.id, r));
      
      setReviewsMap(prev => ({...prev, [appId]: Array.from(mergedReviewsMap.values())}));
    }
  };

  useEffect(() => {
    apps.forEach(app => {
      if (!reviewsMap[app.id]) {
        fetchReviews(app.id);
      }
    });
  }, [apps]);

  const getEmail = (username: string) => {
    const clean = username.trim().toLowerCase();
    return clean.includes('@') ? clean : `${clean}@marketplace.local`;
  };

  const loginWithPassword = async (username: string, password: string) => {
    const email = getEmail(username);
    const isPlaceholder = !(import.meta as any).env.VITE_SUPABASE_URL || (import.meta as any).env.VITE_SUPABASE_URL.includes('placeholder.supabase.co');
    
    if (isPlaceholder) {
      // Direct local login
      const localUsersSaved = localStorage.getItem('local_users_db_v1');
      const localUsers: Record<string, { username: string; passwordHash: string; id: string; isDeveloper: boolean }> = localUsersSaved 
        ? JSON.parse(localUsersSaved) 
        : {};
      
      const key = username.trim().toLowerCase();
      const userRecord = localUsers[key];
      
      if (!userRecord || userRecord.passwordHash !== password) {
        throw new Error('Usuário ou senha incorretos.');
      }
      
      const loggedUser: User = {
        id: userRecord.id,
        name: userRecord.username,
        isDeveloper: userRecord.isDeveloper || false
      };
      
      localStorage.setItem('local_logged_in_user_v1', JSON.stringify(loggedUser));
      setCurrentUser(loggedUser);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        throw error;
      }
    } catch (err: any) {
      // Local login fallback
      const localUsersSaved = localStorage.getItem('local_users_db_v1');
      const localUsers: Record<string, { username: string; passwordHash: string; id: string; isDeveloper: boolean }> = localUsersSaved 
        ? JSON.parse(localUsersSaved) 
        : {};
      
      const key = username.trim().toLowerCase();
      const userRecord = localUsers[key];
      
      if (userRecord && userRecord.passwordHash === password) {
        const loggedUser: User = {
          id: userRecord.id,
          name: userRecord.username,
          isDeveloper: userRecord.isDeveloper || false
        };
        localStorage.setItem('local_logged_in_user_v1', JSON.stringify(loggedUser));
        setCurrentUser(loggedUser);
        return;
      }
      throw err;
    }
  };

  const signUpWithPassword = async (username: string, password: string) => {
    const email = getEmail(username);
    const isPlaceholder = !(import.meta as any).env.VITE_SUPABASE_URL || (import.meta as any).env.VITE_SUPABASE_URL.includes('placeholder.supabase.co');

    if (isPlaceholder) {
      const localUsersSaved = localStorage.getItem('local_users_db_v1');
      const localUsers: Record<string, { username: string; passwordHash: string; id: string; isDeveloper: boolean }> = localUsersSaved 
        ? JSON.parse(localUsersSaved) 
        : {};
      
      const key = username.trim().toLowerCase();
      if (localUsers[key]) {
        throw new Error('Este nome de usuário já está sendo utilizado.');
      }
      
      const userId = 'local-user-' + crypto.randomUUID();
      const newUserRecord = {
        username: username.trim(),
        passwordHash: password,
        id: userId,
        isDeveloper: false
      };
      
      localUsers[key] = newUserRecord;
      localStorage.setItem('local_users_db_v1', JSON.stringify(localUsers));
      
      const loggedUser: User = {
        id: userId,
        name: username.trim(),
        isDeveloper: false
      };
      localStorage.setItem('local_logged_in_user_v1', JSON.stringify(loggedUser));
      setCurrentUser(loggedUser);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: username.trim()
          }
        }
      });
      if (error) {
        throw error;
      }
    } catch (err: any) {
      // Local fallback registration
      const localUsersSaved = localStorage.getItem('local_users_db_v1');
      const localUsers: Record<string, { username: string; passwordHash: string; id: string; isDeveloper: boolean }> = localUsersSaved 
        ? JSON.parse(localUsersSaved) 
        : {};
      
      const key = username.trim().toLowerCase();
      if (localUsers[key]) {
        throw new Error('Este nome de usuário já está sendo utilizado.');
      }
      
      const userId = 'local-user-' + crypto.randomUUID();
      const newUserRecord = {
        username: username.trim(),
        passwordHash: password,
        id: userId,
        isDeveloper: false
      };
      
      localUsers[key] = newUserRecord;
      localStorage.setItem('local_users_db_v1', JSON.stringify(localUsers));
      
      const loggedUser: User = {
        id: userId,
        name: username.trim(),
        isDeveloper: false
      };
      localStorage.setItem('local_logged_in_user_v1', JSON.stringify(loggedUser));
      setCurrentUser(loggedUser);
    }
  };

  const logout = async () => {
    localStorage.removeItem('local_logged_in_user_v1');
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase logout skipped or failed:', e);
    }
    setCurrentUser(null);
  };

  const becomeDeveloper = async () => {
    if (currentUser) {
      if (currentUser.id.startsWith('local-user-')) {
        const localUsersSaved = localStorage.getItem('local_users_db_v1');
        if (localUsersSaved) {
          try {
            const localUsers = JSON.parse(localUsersSaved);
            const key = currentUser.name.toLowerCase();
            if (localUsers[key]) {
              localUsers[key].isDeveloper = true;
              localStorage.setItem('local_users_db_v1', JSON.stringify(localUsers));
            }
          } catch (e) {
            console.error(e);
          }
        }
        const updatedUser = { ...currentUser, isDeveloper: true };
        localStorage.setItem('local_logged_in_user_v1', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
        return;
      }

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
    const newApp: AppItem = {
      ...newAppInfo,
      id: crypto.randomUUID(),
      rating: 0,
      reviews: [],
      downloads: 0,
      createdAt: new Date().toISOString()
    };
    
    try {
      const localSaved = localStorage.getItem('local_published_apps_v1');
      const localAppsList = localSaved ? JSON.parse(localSaved) : [];
      localAppsList.push(newApp);
      localStorage.setItem('local_published_apps_v1', JSON.stringify(localAppsList));
    } catch (e) {
      console.error('Failed saving to localStorage backup:', e);
    }

    try {
      await supabase
        .from('apps')
        .insert([{
          ...newApp,
          reviewCount: 0
        }]);
    } catch (err) {
      console.warn('Supabase publish failed, relying on localStorage:', err);
    }
    
    await fetchApps();
  };

  const addReview = async (appId: string, reviewInfo: Omit<Review, 'id' | 'date'>) => {
    const newReview: Review = {
      ...reviewInfo,
      id: crypto.randomUUID(),
      date: new Date().toISOString()
    };

    try {
      const localRevSaved = localStorage.getItem('local_reviews_map_v1');
      const localMap = localRevSaved ? JSON.parse(localRevSaved) : {};
      if (!localMap[appId]) localMap[appId] = [];
      localMap[appId].push(newReview);
      localStorage.setItem('local_reviews_map_v1', JSON.stringify(localMap));
    } catch (e) {
      console.error('Failed saving review to localStorage:', e);
    }

    try {
      await supabase.from('reviews').insert([{
        ...newReview,
        appId
      }]);
      
      const app = getAppById(appId);
      if (app) {
        const curCount = (app as any).reviewCount || 0;
        const curRating = app.rating || 0;
        const newCount = curCount + 1;
        const newRating = ((curRating * curCount) + reviewInfo.rating) / newCount;
        
        await supabase
          .from('apps')
          .update({ rating: newRating, reviewCount: newCount })
          .eq('id', appId);
      }
    } catch (err) {
      console.warn('Supabase review failed, relying on localStorage:', err);
    }

    await fetchApps();
    await fetchReviews(appId);
  };

  const getAppById = (id: string) => apps.find(a => a.id === id);
  const getReviewsForApp = (id: string) => reviewsMap[id] || [];

  return (
    <StoreContext.Provider value={{
      currentUser,
      apps,
      loginWithPassword,
      signUpWithPassword,
      logout,
      becomeDeveloper,
      publishApp,
      addReview,
      getAppById,
      getReviewsForApp,
      searchQuery,
      setSearchQuery
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
