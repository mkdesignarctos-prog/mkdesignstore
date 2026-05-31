import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppItem, User, Review } from '../types';
import { auth, db, loginWithGoogle, logout as firebaseLogout, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, addDoc, getDoc, query, orderBy } from 'firebase/firestore';

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
          const userRef = doc(db, 'users', firebaseUser.uid);
          const unsubUser = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
              setCurrentUser({ id: docSnap.id, ...docSnap.data() } as User);
            }
          }, (err) => handleFirestoreError(err, OperationType.GET, 'users'));
          setAuthReady(true);
          return () => unsubUser();
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

  useEffect(() => {
    if (!authReady) return;
    const q = query(collection(db, 'apps'), orderBy('createdAt', 'desc'));
    const unsubApps = onSnapshot(q, (snapshot) => {
      const appsData: AppItem[] = [];
      snapshot.forEach((doc) => {
        appsData.push({ id: doc.id, ...doc.data() } as AppItem);
      });
      setApps(appsData);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'apps'));

    return () => unsubApps();
  }, [authReady]);

  // We should listen to reviews selectively per app, but for now we'll load them dynamically or when viewing.
  // We'll update the getReviewsForApp to subscribe if not subscribed.
  useEffect(() => {
    // Basic app reviews listeners
    const unsubscribes: (() => void)[] = [];
    apps.forEach(app => {
      if (!reviewsMap[app.id]) {
        const revRef = collection(db, 'apps', app.id, 'reviews');
        const q = query(revRef, orderBy('date', 'desc'));
        const u = onSnapshot(q, (snap) => {
          const revs = snap.docs.map(d => ({id: d.id, ...d.data() } as unknown as Review));
          setReviewsMap(prev => ({...prev, [app.id]: revs}));
        }, err => handleFirestoreError(err, OperationType.LIST, `apps/${app.id}/reviews`));
        unsubscribes.push(u);
      }
    });
    return () => unsubscribes.forEach(u => u());
  }, [apps.length]); // Hook when apps are added

  const login = async () => {
    await loginWithGoogle();
  };

  const logout = () => {
    firebaseLogout();
  };

  const becomeDeveloper = async () => {
    if (currentUser) {
      try {
        const userRef = doc(db, 'users', currentUser.id);
        await updateDoc(userRef, { isDeveloper: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, 'users');
      }
    }
  };

  const publishApp = async (newAppInfo: Omit<AppItem, 'id' | 'rating' | 'reviews' | 'downloads' | 'createdAt'>) => {
    if (!currentUser) return;
    try {
      const newAppRef = doc(collection(db, 'apps'));
      await setDoc(newAppRef, {
        ...newAppInfo,
        rating: 0,
        downloads: 0,
        createdAt: Date.now(),
        reviewCount: 0
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'apps');
    }
  };

  const addReview = async (appId: string, reviewInfo: Omit<Review, 'id' | 'date'>) => {
    try {
      const reviewRef = doc(collection(db, 'apps', appId, 'reviews'));
      await setDoc(reviewRef, {
        ...reviewInfo,
        date: new Date().toISOString()
      });
      // Updating rating and reviewCount for simple average
      const appRef = doc(db, 'apps', appId);
      const appSnap = await getDoc(appRef);
      if (appSnap.exists()) {
        const data = appSnap.data();
        const curCount = data.reviewCount || 0;
        const curRating = data.rating || 0;
        const newCount = curCount + 1;
        const newRating = ((curRating * curCount) + reviewInfo.rating) / newCount;
        await updateDoc(appRef, {
          rating: newRating,
          reviewCount: newCount
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `apps/${appId}/reviews`);
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
