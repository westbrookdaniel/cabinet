import { createCabinet } from '@/lib/cabinet.ts';
import { serve } from 'std/http/server.ts';
import { modules } from '../modules.gen.ts';

serve(await createCabinet(modules), { port: 3000 });
