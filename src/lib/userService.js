import { prisma } from './prisma.js';

// Función para validar email
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Función para verificar si el usuario ya existe
export async function userExists(email) {
  try {
    console.log('Buscando usuario:', email);
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    return user !== null;
  } catch (error) {
    console.error('Error verificando usuario:', error);
    return false;
  }
}

// Función para crear un nuevo usuario
export async function createUser(email, password) {
  try {
    console.log('Creando usuario:', email);
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: password
      }
    });
    return { success: true, user: newUser };
  } catch (error) {
    console.error('Error creando usuario:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return { success: false, error: 'El email ya está registrado' };
    }
    return { success: false, error: error.message };
  }
}

// Función para login del usuario
export async function loginUser(email, password) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    
    if (user && user.password === password) {
      return { success: true, user: user };
    } else {
      return { success: false, error: 'Email o contraseña incorrectos' };
    }
  } catch (error) {
    console.error('Error en login:', error);
    return { success: false, error: 'Error del servidor' };
  }
}