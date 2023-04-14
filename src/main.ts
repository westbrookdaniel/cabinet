import { createApp } from '@/lib/app.ts';
import { serve } from 'std/http/server.ts';
import { modules } from '../modules.gen.ts';

serve(await createApp(modules), { port: 3000 });
