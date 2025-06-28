export const prerender = false;

import { loginUser, validateEmail } from '../../lib/userService.js';

export async function POST({ request }) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email y contraseña requeridos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!validateEmail(email)) {
      return new Response(JSON.stringify({ error: 'Email no válido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await loginUser(email, password);
    
    if (result.success) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Login exitoso',
        user: { email: result.user.email, id: result.user.id }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}