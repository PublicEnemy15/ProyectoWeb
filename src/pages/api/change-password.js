export const prerender = false;

import { updatePassword } from '../../lib/userService.js';

export async function POST({ request }) {
  try {
    const { userId, currentPassword, newPassword } = await request.json();

    if (!userId || !currentPassword || !newPassword) {
      return new Response(JSON.stringify({ error: 'Faltan datos' }), { status: 400 });
    }

    const result = await updatePassword(userId, currentPassword, newPassword);

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), { status: 400 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('Error en el cambio de contraseña:', err);
    return new Response(JSON.stringify({ error: 'Error del servidor' }), { status: 500 });
  }
}
