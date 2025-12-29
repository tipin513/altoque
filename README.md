# Altoque - Marketplace de Servicios Argentina

Este es un marketplace inspirado en Mercado Libre para la contratación de servicios profesionales en Argentina.

## Características
- 🚀 **Next.js 15+** con App Router.
- 🎨 **Tailwind CSS 4** para un diseño moderno y fluido.
- 🔐 **Supabase Auth** para gestión de usuarios (Clientes y Prestadores).
- 📊 **PostgreSQL** para almacenamiento de servicios, categorías y perfiles.

## Requisitos Previos
1. Tener una cuenta en [Supabase](https://supabase.com).
2. Crear un nuevo proyecto.

## Configuración del Proyecto

### 1. Base de Datos
Copiá y pegá el contenido de `supabase_schema.sql` en el **SQL Editor** de tu panel de Supabase y ejecutalo. Esto creará las tablas, las políticas de seguridad (RLS) y las categorías iniciales.

### 2. Variables de Entorno
Creá un archivo `.env.local` en la raíz del proyecto y agregá tus credenciales:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

### 3. Instalación
```bash
npm install
```

### 4. Desarrollo
```bash
npm run dev
```

## Estructura de Carpetas
- `app/`: Rutas y lógica de páginas.
- `components/`: Componentes UI reutilizables.
- `lib/`: Utilidades y clientes de Supabase.
- `supabase_schema.sql`: Script de base de datos.

## Próximos Pasos (Post-MVP)
- Sistema de reputación y reseñas.
- Chat en tiempo real.
- Integración de pagos (Mercado Pago).
- Geolocalización avanzada.
