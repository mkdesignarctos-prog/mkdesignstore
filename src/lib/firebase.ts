import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { supabase } from './supabase';

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    
    // Check if user exists in Supabase
    const { data: userSnap, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', result.user.uid)
      .single();
      
    if (fetchError && fetchError.code === 'PGRST116') {
      // Create new user profile if it doesn't exist
      await supabase
        .from('users')
        .insert({
          id: result.user.uid,
          name: result.user.displayName || 'User',
          isDeveloper: false,
          createdAt: Date.now()
        });
    } else if (fetchError) {
      console.error('Error fetching user from Supabase:', fetchError);
    }
    
    return result.user;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const logout = () => signOut(auth);

