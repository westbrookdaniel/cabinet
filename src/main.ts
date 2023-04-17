import { createServer } from '@/lib/server.ts';
import { serve } from 'std/http/server.ts';
import { modules } from '../modules.gen.ts';

const port = Number(Deno.env.get('PORT') || '3000');

serve(await createServer(modules), { port });
