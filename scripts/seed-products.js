const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.resolve(__dirname, '..', '.env.local');

if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, 'utf8');
  for (const line of env.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const [key, ...rest] = trimmed.split('=');
    const value = rest.join('=').trim();
    process.env[key.trim()] = value.replace(/^['"]|['"]$/g, '');
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const products = [
  {
    nombre: 'Crema Corporal Natura Tododia Algodón 400ml',
    descripcion: 'Nutrición prebiótica para el cuerpo. Piel firme y ultrasuave.',
    precio: 12990,
    stock: 8,
    categoria: 'Productos Natura',
    imagen_url: 'https://images.unsplash.com/photo-1608248597359-07f0f6224ce8?w=500',
    activo: true,
  },
  {
    nombre: 'Perfume Frescor Ekos Maracuyá 150ml',
    descripcion: 'Fragancia fresca y calmante con notas cítricas de maracuyá.',
    precio: 18990,
    stock: 5,
    categoria: 'Productos Natura',
    imagen_url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500',
    activo: true,
  },
  {
    nombre: 'Pulpa Hidratante de Manos Ekos Castaña 75g',
    descripcion: 'Antiresequedad y nutrición intensa para manos y cutículas.',
    precio: 6990,
    stock: 12,
    categoria: 'Productos Natura',
    imagen_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500',
    activo: true,
  },
  {
    nombre: 'Cartera Elegante Glitter con Cadena Dorada',
    descripcion: 'Cartera compacta de fiesta con acabado brillante y broche magnético.',
    precio: 16990,
    stock: 4,
    categoria: 'Accesorios',
    imagen_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500',
    activo: true,
  },
];

async function main() {
  const { data: existing, error: selectError } = await supabase.from('productos').select('nombre');

  if (selectError) {
    console.error('No se pudo leer la tabla productos. Confirma que exista en Supabase:', selectError.message);
    process.exit(1);
  }

  const currentNames = new Set((existing || []).map((product) => product.nombre));
  const pending = products.filter((product) => !currentNames.has(product.nombre));

  if (pending.length === 0) {
    console.log('La tabla de productos ya está sincronizada con estos productos.');
    return;
  }

  const { data, error } = await supabase.from('productos').insert(pending);

  if (error) {
    console.error('Error al insertar productos:', error);
    process.exit(1);
  }

  console.log('Productos semilla insertados:', data?.length ?? pending.length);
}

main();
