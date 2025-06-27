
"use server";

import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import { hashPassword, verifyPassword, generateVerificationToken } from '@/lib/authUtils';
import { sendVerificationEmail } from '@/lib/emailUtils';
import type { User, UserDocument, AdminConfig, SiteSettings } from '@/types';

const getEnvVar = (varName: string, defaultValue?: string): string => {
  const value = process.env[varName];
  if (!value && defaultValue === undefined) {
    throw new Error(`Missing environment variable: ${varName}`);
  }
  return value || defaultValue!;
};

const ADMIN_EMAIL = getEnvVar('ADMIN_EMAIL');

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

    const newUserDoc: UserDocument = {
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
      isVerified: false,
      verificationToken,
      groups: isAdmin ? ['admin', 'verified'] : ['verified'], 
    };

    const docRef = await addDoc(usersRef, {
      ...newUserDoc,
      createdAt: serverTimestamp(),
      tokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, 
    });

    const emailSent = await sendVerificationEmail({ to: email, name, token: verificationToken });
    if (!emailSent) {
      console.error("Failed to send verification email, but user was created:", docRef.id);
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

    if (userData.isVerified) {
        const verifiedUser: User = {
            id: userDocRef.id, name: userData.name, lastName: userData.lastName, dni: userData.dni, email: userData.email, phone: userData.phone, address: userData.address, postalCode: userData.postalCode, city: userData.city, country: userData.country, avatar: userData.avatar, groups: userData.groups, isAdmin: userData.isAdmin, isVerified: true,
        };
        return { success: true, user: verifiedUser, error: 'La cuenta ya está verificada.' }; 
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

    const userToReturn: User = {
      id: userDocRef.id,
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
      isVerified: true, 
    };

    return { success: true, user: userToReturn };

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

export async function getSiteSettingsForSocket(): Promise<SiteSettings | null> {
  try {
    const configDocRef = doc(db, 'admin_settings', 'main_config');
    const docSnap = await getDoc(configDocRef);

    if (docSnap.exists()) {
      const adminConfig = docSnap.data() as AdminConfig;
      // Map AdminConfig to SiteSettings structure expected by socket_io.ts
      return {
        liveStreamAuthorizedUserId: adminConfig.liveStreamAuthorizedUserId || null,
        liveStreamDefaultTitle: adminConfig.heroConfig?.mainText || 'Live Stream',
        liveStreamForLoggedInUsersOnly: adminConfig.liveStreamAccess === 'loggedIn',
        // adminAppUserId could be derived or set if there's a specific "super admin" ID
      };
    }
    console.warn('Socket Action: Admin config not found in Firestore.');
    return null;
  } catch (error) {
    console.error('Socket Action: Error fetching site settings from Firestore:', error);
    return null;
  }
}
