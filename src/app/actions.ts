
"use server";

import { db } from '@/lib/firebase';
import { 
  collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp, getDoc, orderBy, limit, writeBatch, Timestamp, deleteDoc, collectionGroup
} from 'firebase/firestore';
import { hashPassword, verifyPassword, generateVerificationToken } from '@/lib/authUtils';
import { sendVerificationEmail } from '@/lib/emailUtils';
import type { User, UserDocument, AdminConfig, SiteSettings, UserStory, Course, ChatMessage, UserProfile, Popup } from '@/types';

const getEnvVar = (varName: string, defaultValue?: string): string => {
  const value = process.env[varName];
  if (!value && defaultValue === undefined) {
    if (varName === 'ADMIN_EMAIL' && defaultValue) return defaultValue; 
    if (varName === 'ADMIN_EMAIL') return process.env.NEXT_PUBLIC_ADMIN_EMAIL_FOR_DEMO || 'admin@onlyfansly-default.com';
    throw new Error(`Missing environment variable: ${varName}`);
  }
  return value || defaultValue!;
};

const ADMIN_EMAIL = getEnvVar('ADMIN_EMAIL', process.env.NEXT_PUBLIC_ADMIN_EMAIL_FOR_DEMO || 'admin@onlyfansly-fallback.com');

export async function findAdminUserId(): Promise<string | null> {
  try {
    const adminEmail = ADMIN_EMAIL;
    if (!adminEmail) {
      console.error("ADMIN_EMAIL environment variable is not set.");
      return null;
    }
    
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", adminEmail.toLowerCase()), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn(`CRITICAL: Admin user with email ${adminEmail} not found in Firestore. Admin functionality will be blocked.`);
      return null;
    }
    
    const adminDoc = querySnapshot.docs[0];
    const adminId = adminDoc.id;
    // console.log(`Socket.IO Server: Found admin user ID: ${adminId}`); // Reduce noise
    return adminId;

  } catch (error) {
    console.error("Error finding admin user ID in Firestore:", error);
    return null;
  }
}

interface ActionResult {
  success: boolean;
  error?: string;
  user?: User; 
}

export async function registerUserAction(formData: Record<string, string>): Promise<ActionResult> {
  const { 
    name, lastName, dni, email, phone, address, 
    postalCode, city, country, password 
  } = formData;

  if (!email || !password || !name || !lastName || !dni || !phone || !address || !postalCode || !city || !country) {
    return { success: false, error: 'Todos los campos son obligatorios.' };
  }

  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email.toLowerCase()));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return { success: false, error: 'Este correo electrónico ya está registrado.' };
    }

    const { salt, hash } = await hashPassword(password);
    const verificationToken = await generateVerificationToken();
    
    const isAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

    const newUserDoc: Omit<UserDocument, 'createdAt' | 'id'> = { 
      name,
      lastName,
      dni,
      email: email.toLowerCase(),
      phone,
      address,
      postalCode,
      city,
      country,
      hashedPassword: hash,
      salt,
      isAdmin,
      isVerified: isAdmin, 
      isSuspended: false,
      verificationToken: isAdmin ? null : verificationToken,
      tokenExpiresAt: isAdmin ? null : Date.now() + 24 * 60 * 60 * 1000,
      groups: isAdmin ? ['admin', 'verified'] : ['verified'], 
    };

    const docRef = await addDoc(usersRef, {
      ...newUserDoc,
      createdAt: serverTimestamp(), 
    });

    if (!isAdmin) {
      const emailSent = await sendVerificationEmail({ to: email, name, token: verificationToken });
      if (!emailSent) {
        console.error("Failed to send verification email, but user was created:", docRef.id);
      }
    }
    return { success: true };
  } catch (error) {
    console.error("Registration Action Error:", error);
    return { success: false, error: (error as Error).message || 'Error durante el registro.' };
  }
}

export async function loginUserAction(credentials: { email?: string; password?: string }): Promise<ActionResult> {
  const { email, password } = credentials;

  if (!email || !password) {
    return { success: false, error: 'Email y contraseña son requeridos.' };
  }

  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email.toLowerCase()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, error: 'Usuario no encontrado.' };
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data() as UserDocument;

    if (!userData.hashedPassword || !userData.salt) {
        return { success: false, error: 'Error de configuración de cuenta. Contacte a soporte.' };
    }

    const passwordIsValid = await verifyPassword(password, userData.salt, userData.hashedPassword);

    if (!passwordIsValid) {
      return { success: false, error: 'Contraseña incorrecta.' };
    }

    if (userData.isSuspended) {
      return { success: false, error: 'Tu cuenta está suspendida. Contacta a soporte.' };
    }
    
    const userToReturn: User = {
      id: userDoc.id,
      name: userData.name,
      lastName: userData.lastName,
      dni: userData.dni,
      email: userData.email,
      phone: userData.phone,
      address: userData.address,
      postalCode: userData.postalCode,
      city: userData.city,
      country: userData.country,
      avatar: userData.avatar,
      groups: userData.groups,
      isAdmin: userData.isAdmin,
      isVerified: userData.isVerified,
      isSuspended: userData.isSuspended,
      createdAt: userData.createdAt instanceof Timestamp ? userData.createdAt.toDate().toISOString() : undefined,
    };

    return { success: true, user: userToReturn };

  } catch (error) {
    console.error("Login Action Error:", error);
    return { success: false, error: (error as Error).message || 'Error durante el inicio de sesión.' };
  }
}

export async function verifyTokenAction(email: string, token: string): Promise<ActionResult> {
  if (!email || !token) {
    return { success: false, error: 'Email y token son requeridos.' };
  }

  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email.toLowerCase()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, error: 'Usuario no encontrado.' };
    }

    const userDocRef = querySnapshot.docs[0].ref;
    const userData = querySnapshot.docs[0].data() as UserDocument;

    let userForReturn: User = {
        id: userDocRef.id, name: userData.name, lastName: userData.lastName, dni: userData.dni, email: userData.email, phone: userData.phone, address: userData.address, postalCode: userData.postalCode, city: userData.city, country: userData.country, avatar: userData.avatar, groups: userData.groups, isAdmin: userData.isAdmin, isVerified: userData.isVerified, isSuspended: userData.isSuspended,
        createdAt: userData.createdAt instanceof Timestamp ? userData.createdAt.toDate().toISOString() : undefined,
    };

    if (userData.isVerified) {
        return { success: true, user: userForReturn, error: 'La cuenta ya está verificada.' }; 
    }
    
    if (userData.verificationToken !== token) {
      return { success: false, error: 'Token inválido.' };
    }

    if (userData.tokenExpiresAt && Date.now() > userData.tokenExpiresAt) {
      return { success: false, error: 'El token ha expirado. Por favor, solicita uno nuevo.' };
    }

    await updateDoc(userDocRef, {
      isVerified: true,
      verificationToken: null, 
      tokenExpiresAt: null,
    });
    
    userForReturn.isVerified = true; 

    return { success: true, user: userForReturn };

  } catch (error) {
    console.error("Verify Token Action Error:", error);
    return { success: false, error: (error as Error).message || 'Error durante la verificación.' };
  }
}

export async function resendTokenAction(email: string): Promise<ActionResult> {
  if (!email) {
    return { success: false, error: 'Email es requerido.' };
  }
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email.toLowerCase()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, error: 'Usuario no encontrado.' };
    }

    const userDocRef = querySnapshot.docs[0].ref;
    const userData = querySnapshot.docs[0].data() as UserDocument;

    if (userData.isVerified) {
      return { success: false, error: 'Esta cuenta ya está verificada.' };
    }

    const newVerificationToken = await generateVerificationToken();
    const newExpiry = Date.now() + 24 * 60 * 60 * 1000; 

    await updateDoc(userDocRef, {
      verificationToken: newVerificationToken,
      tokenExpiresAt: newExpiry,
    });

    const emailSent = await sendVerificationEmail({ 
        to: userData.email, 
        name: userData.name, 
        token: newVerificationToken 
    });

    if (!emailSent) {
      return { success: false, error: 'No se pudo reenviar el correo de verificación. Inténtalo más tarde.' };
    }

    return { success: true };

  } catch (error) {
    console.error("Resend Token Action Error:", error);
    return { success: false, error: (error as Error).message || 'Error al reenviar el token.' };
  }
}

export async function updateUserProfileAction(userId: string, data: Partial<User>): Promise<ActionResult> {
    if (!userId) {
        return { success: false, error: 'ID de usuario no proporcionado.' };
    }
    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, data);

        const updatedDoc = await getDoc(userRef);
        const updatedData = updatedDoc.data() as UserDocument;

        const userToReturn: User = {
          id: updatedDoc.id,
          name: updatedData.name,
          lastName: updatedData.lastName,
          dni: updatedData.dni,
          email: updatedData.email,
          phone: updatedData.phone,
          address: updatedData.address,
          postalCode: updatedData.postalCode,
          city: updatedData.city,
          country: updatedData.country,
          avatar: updatedData.avatar,
          groups: updatedData.groups,
          isAdmin: updatedData.isAdmin,
          isVerified: updatedData.isVerified,
          isSuspended: updatedData.isSuspended,
          createdAt: updatedData.createdAt instanceof Timestamp ? updatedData.createdAt.toDate().toISOString() : undefined,
        };

        return { success: true, user: userToReturn };
    } catch (error) {
        console.error("Update Profile Action Error:", error);
        return { success: false, error: (error as Error).message || 'Error al actualizar el perfil.' };
    }
}

export async function changePasswordAction(userId: string, oldPassword: string, newPassword: string): Promise<ActionResult> {
    if (!userId) {
        return { success: false, error: 'ID de usuario no proporcionado.' };
    }
    try {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            return { success: false, error: 'Usuario no encontrado.' };
        }

        const userData = userDoc.data() as UserDocument;
        if (!userData.hashedPassword || !userData.salt) {
            return { success: false, error: 'Error de configuración de cuenta. Contacte a soporte.' };
        }
        
        const isOldPasswordValid = await verifyPassword(oldPassword, userData.salt, userData.hashedPassword);
        if (!isOldPasswordValid) {
            return { success: false, error: 'La contraseña antigua es incorrecta.' };
        }

        const { salt, hash } = await hashPassword(newPassword);
        await updateDoc(userRef, {
            hashedPassword: hash,
            salt: salt,
        });

        return { success: true };
    } catch (error) {
        console.error("Change Password Action Error:", error);
        return { success: false, error: (error as Error).message || 'Error al cambiar la contraseña.' };
    }
}


export async function getSiteSettingsLogic(): Promise<SiteSettings> {
  const adminId = await findAdminUserId();
  
  const defaultSettings: SiteSettings = {
    adminAppUserId: adminId || 'FALLBACK_NO_ADMIN_ID_FOUND',
    liveStreamAuthorizedUserId: null,
    liveStreamDefaultTitle: 'Live Stream',
    liveStreamForLoggedInUsersOnly: false,
    liveStreamOfflineMessage: 'The stream is currently offline. Check back soon!',
    persistentSubtitle: 'Admin Live Stream Control',
  };

  try {
    const configDocRef = doc(db, 'admin_settings', 'main_config');
    const docSnap = await getDoc(configDocRef);

    if (docSnap.exists()) {
      const adminConfig = docSnap.data() as AdminConfig;
      return {
        adminAppUserId: adminId || 'FALLBACK_NO_ADMIN_ID_FOUND',
        liveStreamAuthorizedUserId: adminConfig.liveStreamAuthorizedUserId || null,
        liveStreamDefaultTitle: adminConfig.heroConfig?.mainText || defaultSettings.liveStreamDefaultTitle,
        liveStreamForLoggedInUsersOnly: adminConfig.liveStreamAccess === 'loggedIn',
        liveStreamOfflineMessage: (adminConfig as any).liveStreamOfflineMessage || defaultSettings.liveStreamOfflineMessage,
        persistentSubtitle: (adminConfig as any).persistentSubtitle || defaultSettings.persistentSubtitle,
      };
    }
    return defaultSettings;
  } catch (error) {
    console.error('Socket.IO Server: Error fetching site settings from Firestore:', error, '. Returning default settings.');
    return defaultSettings;
  }
}

export async function getAllUsersAction(): Promise<User[]> {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name,
        lastName: data.lastName, 
        surname: data.lastName, 
        dni: data.dni,
        email: data.email,
        phone: data.phone,
        address: data.address,
        postalCode: data.postalCode,
        city: data.city,
        country: data.country,
        avatar: data.avatar,
        groups: data.groups,
        isAdmin: data.isAdmin,
        isVerified: data.isVerified,
        isSuspended: data.isSuspended || false,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : undefined,
      } as User;
    }).filter(user => user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase());
  } catch (error) {
    console.error("Error fetching all users:", error);
    return [];
  }
}

export async function getAllUserStoriesAction(): Promise<UserStory[]> {
  try {
    const storiesRef = collection(db, "user_stories");
    const q = query(storiesRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        userId: data.userId,
        userName: data.userName,
        userAvatar: data.userAvatar,
        videoPreviewUrl: data.videoPreviewUrl,
        title: data.title,
        storyText: data.storyText,
        approved: data.approved,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : undefined,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : undefined,
        dataAiHint: data.dataAiHint,
      } as UserStory;
    });
  } catch (error) {
    console.error("Error fetching all user stories:", error);
    return [];
  }
}

export async function getApprovedUserStoriesAction(): Promise<UserStory[]> {
  try {
    const storiesRef = collection(db, "user_stories");
    // Simplified query to avoid needing a composite index. Sorting is done in JS.
    const q = query(storiesRef, where("approved", "==", true));
    const querySnapshot = await getDocs(q);
    const stories = querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        userId: data.userId,
        userName: data.userName,
        userAvatar: data.userAvatar,
        videoPreviewUrl: data.videoPreviewUrl,
        title: data.title,
        storyText: data.storyText,
        approved: data.approved,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : new Date().toISOString(), // Fallback for sorting
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : undefined,
        dataAiHint: data.dataAiHint,
      } as UserStory;
    });
    // Sort by creation date descending
    return stories.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  } catch (error) {
    console.error("Error fetching approved user stories:", error);
    return [];
  }
}

export async function submitUserStoryAction(
  storyData: Pick<UserStory, 'title' | 'videoPreviewUrl' | 'storyText' | 'dataAiHint'>,
  user: User
): Promise<{ success: boolean; error?: string; storyId?: string }> {
  if (!user || !user.id) {
    return { success: false, error: "User not authenticated." };
  }
  try {
    const newStory: Omit<UserStory, 'id' | 'updatedAt' | 'createdAt'> = { 
      title: storyData.title,
      videoPreviewUrl: storyData.videoPreviewUrl,
      storyText: storyData.storyText,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar || '',
      approved: false,
      dataAiHint: storyData.dataAiHint || '',
    };
    const docRef = await addDoc(collection(db, "user_stories"), {
      ...newStory,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, storyId: docRef.id };
  } catch (error) {
    console.error("Error submitting user story:", error);
    return { success: false, error: (error as Error).message || "Failed to submit story." };
  }
}

export async function updateUserStoryApprovalAction(storyId: string, approved: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const storyRef = doc(db, "user_stories", storyId);
    await updateDoc(storyRef, { 
      approved,
      updatedAt: serverTimestamp() 
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating user story approval:", error);
    return { success: false, error: (error as Error).message || "Failed to update story approval." };
  }
}

export async function updateUserStoryAction(storyId: string, storyData: Partial<Pick<UserStory, 'title' | 'storyText' | 'videoPreviewUrl'>>): Promise<{ success: boolean; error?: string }> {
  try {
    const storyRef = doc(db, "user_stories", storyId);
    await updateDoc(storyRef, {
      ...storyData,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating user story:", error);
    return { success: false, error: (error as Error).message || "Failed to update story." };
  }
}

export async function deleteUserStoryAction(storyId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteDoc(doc(db, "user_stories", storyId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting user story:", error);
    return { success: false, error: (error as Error).message || "Failed to delete story." };
  }
}


export async function updateUserSuspensionAction(userId: string, isSuspended: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { 
      isSuspended: isSuspended,
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating user suspension:", error);
    return { success: false, error: (error as Error).message || "Failed to update user suspension." };
  }
}

export async function getUserProfileById(userId: string): Promise<UserProfile | null> {
  if (!userId) return null;
  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data() as UserDocument;
      return {
        id: userDocSnap.id,
        name: userData.name,
        surname: userData.lastName, 
        email: userData.email,
        avatar: userData.avatar,
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching user profile for ID ${userId}:`, error);
    return null;
  }
}

// --- Course Actions ---
export async function createCourseAction(courseData: Omit<Course, 'id' | 'createdAt'>): Promise<{ success: boolean; error?: string; courseId?: string }> {
  try {
    const docRef = await addDoc(collection(db, "courses"), {
      ...courseData,
      createdAt: serverTimestamp()
    });
    return { success: true, courseId: docRef.id };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateCourseAction(courseId: string, courseData: Partial<Course>): Promise<{ success: boolean; error?: string }> {
  try {
    const courseRef = doc(db, "courses", courseId);
    await updateDoc(courseRef, courseData);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteCourseAction(courseId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteDoc(doc(db, "courses", courseId));
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getAllCoursesAction(): Promise<Course[]> {
  try {
    const coursesRef = collection(db, "courses");
    const q = query(coursesRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : undefined,
      } as Course;
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
}

// --- Popup Actions ---
export async function createPopupAction(popupData: Omit<Popup, 'id' | 'createdAt'>): Promise<{ success: boolean; error?: string; popupId?: string }> {
  try {
    const docRef = await addDoc(collection(db, "popups"), {
      ...popupData,
      createdAt: serverTimestamp()
    });
    return { success: true, popupId: docRef.id };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updatePopupAction(popupId: string, popupData: Partial<Popup>): Promise<{ success: boolean; error?: string }> {
  try {
    const popupRef = doc(db, "popups", popupId);
    await updateDoc(popupRef, popupData);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deletePopupAction(popupId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteDoc(doc(db, "popups", popupId));
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getAllPopupsAction(): Promise<Popup[]> {
  try {
    const popupsRef = collection(db, "popups");
    const q = query(popupsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : undefined,
      } as Popup;
    });
  } catch (error) {
    console.error("Error fetching popups:", error);
    return [];
  }
}
