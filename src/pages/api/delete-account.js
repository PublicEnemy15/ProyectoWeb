export const prerender = false;

import { deleteUserById } from '../../lib/userService.js';


export async function POST({ request }) {
  try {
    const { userId } = await request.json();

    console.log('Recibido userId:', userId);

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Falta el ID del usuario' }), { status: 400 });
    }

    const result = await deleteUserById(userId);

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error eliminando cuenta:', error);
    return new Response(JSON.stringify({ error: 'Error del servidor' }), { status: 500 });
  }
}
