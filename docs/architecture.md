# Arquitetura

## Supabase

O Supabase será usado como banco de dados principal do Radar Previdenciário. A aplicação Next.js manterá integrações em `lib/supabase/`, com cliente público baseado em anon key e cliente server-side preparado para uso futuro em Server Actions.

Por enquanto, a service role não é exposta no código e nenhuma tela está conectada ao banco.
