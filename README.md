# Expediente Médico

Un diagnóstico rápido de signos vitales para pacientes y cuidadores. Los
usuarios responden 4 datos básicos y obtienen un semáforo de urgencia claro:
Estable, Revisión, o Atención — junto con herramientas prácticas para
entender qué hacer después.

Tagline: Sabe cuándo actuar, a tiempo.

## Tech stack

- [Next.js](https://nextjs.org/) (App Router)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) (base de datos, conectada para guardar resultados)
- Desplegado en [Vercel](https://vercel.com/)

## Getting started (local development)

1. Instala dependencias:

   ```
   npm install
   ```

2. Copia `.env.example` a `.env.local` y llena tu URL y anon key de Supabase
   (Supabase > Settings > API).

3. Corre el servidor de desarrollo:

   ```
   npm run dev
   ```
Built as part of the Generative Core Agent sprint.
