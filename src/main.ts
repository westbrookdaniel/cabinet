import { createServer } from '@/lib/server.ts';
import { serve } from 'std/http/server.ts';
import { modules } from '../modules.gen.ts';

serve(await createServer(modules), { port: 3000 });
