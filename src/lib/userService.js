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

// funcion para eliminar usuario
export async function deleteUserById(userId) {
  try {
    const user = await prisma.user.findUnique({
    where: { id: parseInt(userId, 10) }
    });

    if (!user) {
      return { success: false, error: 'Usuario no encontrado' };
    }

   await prisma.user.delete({
    where: { id: parseInt(userId, 10) }
   });

    return { success: true };
  } catch (error) {
    console.error('Error en deleteUserById:', error);
    return { success: false, error: 'Error al eliminar el usuario' };
  }
}

//funcion para cambiar contrasenia niauwu
export async function updatePassword(userId, currentPassword, newPassword) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    if (user.password !== currentPassword) {
      return { success: false, error: 'La contraseña actual no es correcta' };
    }

    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { password: newPassword }
    });

    return { success: true };
  } catch (error) {
    console.error('Error actualizando contraseña:', error);
    return { success: false, error: 'Error del servidor' };
  }
}

