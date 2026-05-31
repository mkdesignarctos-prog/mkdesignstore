import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppItem, User, Review } from '../types';
import { fallbackApps } from '../data/fallbackApps';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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
  // Installation & Pinning APIs
  installedAppIds: string[];
  pinnedAppIds: string[];
  installApp: (appId: string) => void;
  uninstallApp: (appId: string) => void;
  pinApp: (appId: string) => void;
  unpinApp: (appId: string) => void;
  incrementDownloads: (appId: string) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [apps, setApps] = useState<AppItem[]>([]);
  const [reviewsMap, setReviewsMap] = useState<Record<string, Review[]>>({});
  const [authReady, setAuthReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Real installations state
  const [installedAppIds, setInstalledAppIds] = useState<string[]>([]);
  const [pinnedAppIds, setPinnedAppIds] = useState<string[]>([]);

  useEffect(() => {
    const savedInstalls = localStorage.getItem('installed_apps_v2');
    if (savedInstalls) {
      try {
        setInstalledAppIds(JSON.parse(savedInstalls));
      } catch (e) {
        console.error(e);
      }
    }
    const savedPins = localStorage.getItem('pinned_apps_v2');
    if (savedPins) {
      try {
        setPinnedAppIds(JSON.parse(savedPins));
      } catch (e) {
        console.error(e);
      }
    }
    
    // Auth initialization
    const savedLocalUser = localStorage.getItem('local_logged_in_user_v1');
    if (savedLocalUser) {
      try {
        setCurrentUser(JSON.parse(savedLocalUser));
      } catch (err) {
        console.error('Error parsing local user:', err);
      }
    }

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          let isDeveloper = false;
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('is_developer')
              .eq('id', session.user.id)
              .single();
            if (!error && data) {
              isDeveloper = !!data.is_developer;
            }
          } catch (e) {
            console.warn('Error fetching developer status from profiles:', e);
          }
          const loggedUser: User = {
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            isDeveloper
          };
          setCurrentUser(loggedUser);
        } else {
          setCurrentUser(null);
        }
        setAuthReady(true);
      });
      return () => {
        subscription.unsubscribe();
      };
    } else {
      setAuthReady(true);
    }
  }, []);

  const installApp = (appId: string) => {
    setInstalledAppIds(prev => {
      if (prev.includes(appId)) return prev;
      const updated = [...prev, appId];
      localStorage.setItem('installed_apps_v2', JSON.stringify(updated));
      return updated;
    });
  };

  const uninstallApp = (appId: string) => {
    setInstalledAppIds(prev => {
      const updated = prev.filter(id => id !== appId);
      localStorage.setItem('installed_apps_v2', JSON.stringify(updated));
      return updated;
    });
    setPinnedAppIds(prev => {
      const updated = prev.filter(id => id !== appId);
      localStorage.setItem('pinned_apps_v2', JSON.stringify(updated));
      return updated;
    });
  };

  const pinApp = (appId: string) => {
    setPinnedAppIds(prev => {
      if (prev.includes(appId)) return prev;
      const updated = [...prev, appId];
      localStorage.setItem('pinned_apps_v2', JSON.stringify(updated));
      return updated;
    });
  };

  const unpinApp = (appId: string) => {
    setPinnedAppIds(prev => {
      const updated = prev.filter(id => id !== appId);
      localStorage.setItem('pinned_apps_v2', JSON.stringify(updated));
      return updated;
    });
  };

  const fetchApps = async () => {
    let dbAppsList: AppItem[] = [];
    let fetchedFromSupabase = false;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('apps')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          dbAppsList = data.map((d: any) => ({
            id: d.id,
            name: d.name,
            developerId: d.developer_id || d.developerId,
            developerName: d.developer_name || d.developerName,
            description: d.description,
            category: d.category,
            iconDataUrl: d.icon_data_url || d.iconDataUrl,
            fileObjectUrl: d.file_object_url || d.fileObjectUrl,
            fileName: d.file_name || d.fileName,
            rating: Number(d.rating) || 0,
            reviews: [],
            downloads: Number(d.downloads) || 0,
            size: d.size || '0 MB',
            version: d.version || '1.0.0',
            createdAt: d.created_at || d.createdAt || Date.now()
          }));
          fetchedFromSupabase = true;
        } else if (error) {
          console.warn('Supabase apps load error:', error.message);
        }
      } catch (err) {
        console.warn('Supabase fetchApps error, falling back:', err);
      }
    }

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
  };

  useEffect(() => {
    if (!authReady) return;
    fetchApps();
  }, [authReady]);

  const fetchReviews = async (appId: string) => {
    let dbReviewsList: Review[] = [];
    let fetchedFromSupabase = false;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('app_id', appId);

        if (!error && data) {
          dbReviewsList = data.map((r: any) => ({
            id: r.id,
            userName: r.user_name || r.userName,
            rating: Number(r.rating) || 5,
            text: r.text || '',
            date: r.created_at || r.date || new Date().toISOString()
          }));
          fetchedFromSupabase = true;
        }
      } catch (err) {
        console.warn(`Supabase fetchReviews error for ${appId}:`, err);
      }
    }

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
    
    setReviewsMap(prev => ({ ...prev, [appId]: sortedReviews }));
  };

  useEffect(() => {
    apps.forEach(app => {
      if (!reviewsMap[app.id]) {
        fetchReviews(app.id);
      }
    });
  }, [apps]);

  const loginWithPassword = async (username: string, password: string) => {
    if (isSupabaseConfigured) {
      const email = username.includes('@') ? username : `${username.trim()}@placeholder.com`;
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;

      if (data.user) {
        let isDeveloper = false;
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_developer')
            .eq('id', data.user.id)
            .single();
          if (profile) {
            isDeveloper = !!profile.is_developer;
          }
        } catch (e) {
          console.warn('Could not read user profile metadata from Supabase:', e);
        }

        const loggedUser: User = {
          id: data.user.id,
          name: data.user.user_metadata?.name || username.trim(),
          isDeveloper
        };
        setCurrentUser(loggedUser);
        localStorage.setItem('local_logged_in_user_v1', JSON.stringify(loggedUser));
      }
      return;
    }

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
  };

  const signUpWithPassword = async (username: string, password: string) => {
    if (isSupabaseConfigured) {
      const email = username.includes('@') ? username : `${username.trim()}@placeholder.com`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: username.trim(),
            isDeveloper: false
          }
        }
      });
      if (error) throw error;

      if (data.user) {
        const loggedUser: User = {
          id: data.user.id,
          name: username.trim(),
          isDeveloper: false
        };
        
        try {
          await supabase.from('profiles').insert([{
            id: data.user.id,
            name: username.trim(),
            is_developer: false,
            created_at: new Date().toISOString()
          }]);
        } catch (e) {
          console.warn('Failed to insert initial Supabase profile:', e);
        }

        setCurrentUser(loggedUser);
        localStorage.setItem('local_logged_in_user_v1', JSON.stringify(loggedUser));
      }
      return;
    }

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
  };

  const logout = async () => {
    localStorage.removeItem('local_logged_in_user_v1');
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase logout failed:', e);
      }
    }
    setCurrentUser(null);
  };

  const becomeDeveloper = async () => {
    if (currentUser) {
      if (isSupabaseConfigured) {
        try {
          await supabase
            .from('profiles')
            .update({ is_developer: true })
            .eq('id', currentUser.id);
        } catch (err) {
          console.warn('Failed to update developer status in Supabase profiles:', err);
        }
        const updatedUser = { ...currentUser, isDeveloper: true };
        localStorage.setItem('local_logged_in_user_v1', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
        return;
      }

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
    }
  };

  const publishApp = async (newAppInfo: Omit<AppItem, 'id' | 'rating' | 'reviews' | 'downloads' | 'createdAt'>) => {
    const appUid = crypto.randomUUID();
    const newApp: AppItem = {
      ...newAppInfo,
      id: appUid,
      rating: 0,
      reviews: [],
      downloads: 0,
      createdAt: Date.now()
    };
    
    try {
      const localSaved = localStorage.getItem('local_published_apps_v1');
      const localAppsList = localSaved ? JSON.parse(localSaved) : [];
      localAppsList.push(newApp);
      localStorage.setItem('local_published_apps_v1', JSON.stringify(localAppsList));
    } catch (e) {
      console.error('Failed saving to localStorage backup:', e);
    }

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('apps')
          .insert([{
            id: appUid,
            name: newApp.name,
            developer_id: newApp.developerId,
            developer_name: newApp.developerName,
            description: newApp.description,
            category: newApp.category,
            icon_data_url: newApp.iconDataUrl,
            file_object_url: newApp.fileObjectUrl || '',
            file_name: newApp.fileName || '',
            rating: 0,
            downloads: 0,
            size: newApp.size,
            version: newApp.version,
            created_at: new Date().toISOString()
          }]);
      } catch (e) {
        console.warn('Failed publishing app with Supabase:', e);
      }
    }
    
    fetchApps();
  };

  const addReview = async (appId: string, reviewInfo: Omit<Review, 'id' | 'date'>) => {
    const rId = crypto.randomUUID();
    const newReview: Review = {
      ...reviewInfo,
      id: rId,
      date: new Date().toISOString()
    };

    try {
      const localRevSaved = localStorage.getItem('local_reviews_map_v1');
      const localMap = localRevSaved ? JSON.parse(localRevSaved) : {};
      if (!localMap[appId]) localMap[appId] = [];
      localMap[appId].push(newReview);
      localStorage.setItem('local_reviews_map_v1', JSON.stringify(localMap));
      
      // Update app rating locally
      const localAppsSaved = localStorage.getItem('local_published_apps_v1');
      if (localAppsSaved) {
        const localApps = JSON.parse(localAppsSaved);
        const appIndex = localApps.findIndex((a: any) => a.id === appId);
        if (appIndex !== -1) {
          const appReviews = localMap[appId];
          const avgRating = appReviews.reduce((acc: number, curr: any) => acc + curr.rating, 0) / appReviews.length;
          localApps[appIndex].rating = avgRating;
          localStorage.setItem('local_published_apps_v1', JSON.stringify(localApps));
        }
      }
    } catch (e) {
      console.error('Failed saving review to localStorage:', e);
    }

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('reviews')
          .insert([{
            id: rId,
            app_id: appId,
            user_id: currentUser?.id || 'anonymous',
            user_name: reviewInfo.userName,
            rating: reviewInfo.rating,
            text: reviewInfo.text,
            created_at: newReview.date
          }]);
        
        if (!error) {
          const app = getAppById(appId);
          if (app) {
            const reviews = reviewsMap[appId] || [];
            const rList = [...reviews, newReview];
            const avgRating = rList.reduce((acc, curr) => acc + curr.rating, 0) / rList.length;
            
            try {
              await supabase
                .from('apps')
                .update({ rating: avgRating })
                .eq('id', appId);
            } catch (errUp) {
              console.warn('Could not update avg rating in Supabase:', errUp);
            }
          }
        }
      } catch (e) {
        console.warn('Failed inserting review with Supabase:', e);
      }
    }

    fetchApps();
    fetchReviews(appId);
  };

  const incrementDownloads = async (appId: string) => {
    setApps(prev => prev.map(app => {
      if (app.id === appId) {
        const updated = { ...app, downloads: (app.downloads || 0) + 1 };
        
        // Also update in local database if it exists there
        const localAppsSaved = localStorage.getItem('local_published_apps_v1');
        if (localAppsSaved) {
          try {
            const localApps = JSON.parse(localAppsSaved);
            const idx = localApps.findIndex((a: any) => a.id === appId);
            if (idx !== -1) {
              localApps[idx].downloads = updated.downloads;
              localStorage.setItem('local_published_apps_v1', JSON.stringify(localApps));
            }
          } catch (e) {
            console.error(e);
          }
        }
        
        return updated;
      }
      return app;
    }));

    if (isSupabaseConfigured) {
      try {
        const app = getAppById(appId);
        if (app) {
          await supabase
            .from('apps')
            .update({ downloads: (app.downloads || 0) + 1 })
            .eq('id', appId);
        }
      } catch (e) {
        console.warn('Supabase downloads sync failed:', e);
      }
    }
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
      setSearchQuery,
      installedAppIds,
      pinnedAppIds,
      installApp,
      uninstallApp,
      pinApp,
      unpinApp,
      incrementDownloads
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
