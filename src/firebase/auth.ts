import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  User,
  UserCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from './config';
import { isSellerEmail } from './sellerSetup';

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  role: 'user' | 'shop' | 'admin';
  phone?: string;
  address?: string;
  profileImage?: string;
  adminEmails?: string[]; // Array of admin emails
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isEmailVerified: boolean;
}

// Sign up with email and password
export const signUp = async (
  email: string, 
  password: string, 
  displayName: string,
  role: 'user' | 'shop' | 'admin' = 'user'
): Promise<UserCredential> => {
  try {
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update user profile
    await updateProfile(user, {
      displayName: displayName
    });

    // Create user document in Firestore
    const userData: UserData = {
      uid: user.uid,
      email: user.email!,
      displayName: displayName,
      role: role,
      phone: '',
      address: '',
      profileImage: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date(),
      isEmailVerified: user.emailVerified
    };

    await setDoc(doc(db, 'users', user.uid), userData);

    return userCredential;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<UserCredential> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update last login time in Firestore
    await updateUserData(user.uid, {
      lastLoginAt: new Date(),
      updatedAt: new Date()
    });
    
    return userCredential;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

// Sign out
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Reset password
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

// Get user data from Firestore
export const getUserData = async (uid: string, userEmail?: string): Promise<UserData | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const userData = userDoc.data() as UserData;
      
      // Check if user is an admin by checking if their email is in the adminEmails array
      const emailToCheck = userEmail || userData.email;
      console.log('Checking admin for email:', emailToCheck);
      console.log('User adminEmails:', userData.adminEmails);
      
      if (emailToCheck && userData.adminEmails && userData.adminEmails.includes(emailToCheck)) {
        // Update user role to admin
        userData.role = 'admin';
        await updateUserData(uid, { role: 'admin' });
        console.log('Admin role assigned to:', emailToCheck);
      } else {
        console.log('User is not an admin. Email:', emailToCheck, 'Admin emails:', userData.adminEmails);
      }

      // Check if user is a seller by checking if their email is in the sellers collection
      if (emailToCheck && userData.role !== 'admin') {
        const isSeller = await isSellerEmail(emailToCheck);
        if (isSeller) {
          // Update user role to shop (seller)
          userData.role = 'shop';
          await updateUserData(uid, { role: 'shop' });
          console.log('Seller role assigned to:', emailToCheck);
        } else {
          console.log('User is not a seller. Email:', emailToCheck);
        }
      }
      
      return userData;
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
};

// Update user data
export const updateUserData = async (uid: string, data: Partial<UserData>): Promise<void> => {
  try {
    await setDoc(doc(db, 'users', uid), {
      ...data,
      updatedAt: new Date()
    }, { merge: true });
  } catch (error) {
    console.error('Error updating user data:', error);
    throw error;
  }
};

// Update user profile (for profile page)
export const updateUserProfile = async (uid: string, profileData: {
  displayName?: string;
  phone?: string;
  address?: string;
  profileImage?: string;
}): Promise<void> => {
  try {
    // Update Firebase Auth profile
    if (profileData.displayName) {
      await updateProfile(auth.currentUser!, {
        displayName: profileData.displayName
      });
    }

    // Update Firestore document
    await updateUserData(uid, {
      ...profileData,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};
