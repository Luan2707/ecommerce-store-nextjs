const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.resolve(__dirname, '..', '.env.local');
const env = fs.readFileSync(envPath, 'utf8');
for (const line of env.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
  const [key, ...rest] = trimmed.split('=');
  process.env[key.trim()] = rest.join('=').trim().replace(/^['"]|['"]$/g, '');
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const images = {
  naturaCrema: 'https://images.unsplash.com/photo-1608248597359-07f0f6224ce8?w=600&auto=format&fit=crop&q=80',
  naturaPerfume: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&auto=format&fit=crop&q=80',
  naturaManos: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80',
  cartera: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80',
  mochila: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
};

const imageFor = (name) => {
  const normalized = name.toLowerCase();
  if (normalized.includes('crema corporal')) return images.naturaCrema;
  if (normalized.includes('perfume frescor')) return images.naturaPerfume;
  if (normalized.includes('pulpa hidratante')) return images.naturaManos;
  if (normalized.includes('cartera')) return images.cartera;
  if (normalized.includes('mochila')) return images.mochila;
  return null;
};

async function main() {
  const { data: products, error: selectError } = await supabase.from('productos').select('id, nombre');
  if (selectError) throw selectError;

  let updated = 0;
  for (const product of products || []) {
    const image = imageFor(product.nombre);
    if (!image) continue;
    const { error } = await supabase.from('productos').update({
      imagen_url: image,
      imagenes_url: JSON.stringify([image]),
    }).eq('id', product.id);
    if (error && error.message.includes('imagenes_url')) {
      const { error: fallbackError } = await supabase.from('productos').update({ imagen_url: image }).eq('id', product.id);
      if (fallbackError) throw fallbackError;
    } else if (error) {
      throw error;
    }
    updated += 1;
    console.log(`Actualizado: ${product.nombre}`);
  }

  console.log(`Productos reparados: ${updated}`);
}

main().catch((error) => {
  console.error('Error reparando imágenes:', error.message);
  process.exit(1);
});
