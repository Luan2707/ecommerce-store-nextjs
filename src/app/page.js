'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, Bell, Camera, Check, ChevronDown, Clock3, ImagePlus,
  Menu, Minus, Package, Pencil, Plus, Search, ShoppingBag, Sparkles,
  MessageCircle, Store, Trash2, Truck, UserRound, X, Zap,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const WHATSAPP_PHONE = '56997701868';
const getWhatsAppUrl = (message) => `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(message)}`;
const categories = ['Todos', 'Productos Natura', 'Belleza & Cuidado', 'Accesorios', 'Carteras & Mochilas'];
const defaultProductImage = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=85';
const fallbackProductImage = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80';
const heroSlides = [
  { image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=90', label: 'Pequeños detalles,', title: 'gran actitud.' },
  { image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=90', label: 'Belleza que', title: 'se nota.' },
  { image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=90', label: 'Tu día,', title: 'tu estilo.' },
];

export const demoProducts = [
  { id: 1, nombre: 'Mochila urbana rosa', descripcion: 'Ligera, espaciosa y con bolsillo para notebook.', precio: 24990, stock: 8, categoria: 'Mochilas', imagen_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85', tag: 'Favorito', activo: true },
  { id: 2, nombre: 'Set gloss juicy', descripcion: 'Tres tonos para llevar tu brillo a otro nivel.', precio: 8990, stock: 12, categoria: 'Maquillaje', imagen_url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=900&q=85', tag: 'Nuevo', activo: true },
  { id: 3, nombre: 'Audífonos wireless mini', descripcion: 'Sonido nítido y estuche de carga compacto.', precio: 17990, stock: 5, categoria: 'Tecnología', imagen_url: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=85', tag: 'Top ventas', activo: true },
  { id: 4, nombre: 'Zapatilla urbana white', descripcion: 'El básico que combina con todos tus looks.', precio: 32990, stock: 3, categoria: 'Zapatillas', imagen_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85', tag: 'Últimas', activo: true },
  { id: 5, nombre: 'Kit skincare glow', descripcion: 'Rutina esencial para una piel luminosa.', precio: 15990, stock: 9, categoria: 'Belleza', imagen_url: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=900&q=85', tag: 'Nuevo', activo: true },
  { id: 6, nombre: 'Gafas black mood', descripcion: 'Marco liviano, actitud gigante.', precio: 11990, stock: 6, categoria: 'Accesorios', imagen_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=85', tag: 'Favorito', activo: true },
];

const money = (value) => `$${new Intl.NumberFormat('es-CL').format(value)}`;
const getProductImages = (product) => {
  if (Array.isArray(product?.imagenes_url)) return product.imagenes_url.filter(Boolean);
  if (typeof product?.imagenes_url === 'string') {
    try {
      const parsed = JSON.parse(product.imagenes_url);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {
      return product.imagenes_url.split(',').map((url) => url.trim()).filter(Boolean);
    }
  }
  return product?.imagen_url ? [product.imagen_url] : [defaultProductImage];
};

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [category, setCategory] = useState('Todos');
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [heroSlide, setHeroSlide] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = async () => {
    if (!supabase) {
      setProducts([]);
      setLoadingProducts(false);
      return;
    }

    setLoadingProducts(true);
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('activo', true)
      .order('id', { ascending: false });

    if (!error) {
      setProducts(data || []);
    } else {
      console.error('Error al cargar productos:', error);
      setProducts([]);
    }

    setLoadingProducts(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setHeroSlide((current) => (current + 1) % heroSlides.length), 5000);
    return () => window.clearInterval(timer);
  }, []);

  const visible = useMemo(() => products.filter((product) => {
    const matchesCategory = category === 'Todos' || product.categoria === category;
    const name = String(product?.nombre || '').toLowerCase();
    return matchesCategory && name.includes(query.toLowerCase());
  }), [products, category, query]);

  const subtotal = cart.reduce((total, item) => total + Number(item.precio) * Number(item.cantidad), 0);

  const addToCart = (product) => {
    setCart((current) => {
      const found = current.find((item) => item.id === product.id);
      if (found) {
        return current.map((item) => item.id === product.id
          ? { ...item, cantidad: Math.min(item.cantidad + 1, Number(product.stock || 1)) }
          : item);
      }

      return [...current, { ...product, cantidad: 1 }];
    });

    setToast('Agregado a tu bolsa');
    window.setTimeout(() => setToast(''), 1800);
  };

  const updateCart = (id, change) => {
    setCart((current) => current
      .map((item) => item.id === id ? { ...item, cantidad: item.cantidad + change } : item)
      .filter((item) => item.cantidad > 0));
  };

  return (
    <main>
      <div className="topline"><span><Clock3 size={14} /> Lunes a sábado, 10:00 - 20:00</span><span className="topline-desktop">Atención por WhatsApp <strong>+56 9 9770 1868</strong></span></div>
      <header className="header">
        <div className="brand"><div className="brand-mark">DLC</div><div><strong>Donde la <em>Chiky</em></strong><small>Iquique · Alto Hospicio</small></div></div>
        <nav><a href="#catalogo">Tienda</a><a href="#historia">Nosotras</a></nav>
        <div className="header-actions"><button className="icon-btn mobile-menu"><Menu size={20} /></button><button className="bag-button" onClick={() => setCartOpen(true)}><ShoppingBag size={19} /><span>Mi bolsa</span>{cart.length > 0 && <b>{cart.reduce((n, i) => n + i.cantidad, 0)}</b>}</button></div>
      </header>

      <section className="hero"><div className="hero-copy"><span className="eyebrow"><Sparkles size={14} /> Donde la Chiky</span><div className="hero-slogan">Tu tienda de confianza | Venta de artículos varios</div><h1>Tu estilo.<br /><i>Tu momento.</i></h1><p>Variedad en cosmética y perfumería original Natura, accesorios, mochilas, carteras y novedades para tu día a día. Entregas rápidas en Iquique y Alto Hospicio, retiro en Pasaje Linares #2740 o delivery directo a tu puerta.</p><a className="primary-btn" href="#catalogo">Ver novedades <ArrowRight size={17} /></a><div className="hero-proof"><div className="avatars"><span>J</span><span>M</span><span>V</span></div><span><strong>+300 clientas felices</strong><br />en Iquique y Alto Hospicio</span></div></div><div className="hero-image" style={{ backgroundImage: `linear-gradient(110deg, rgba(0,0,0,.18), transparent), url('${heroSlides[heroSlide].image}')` }}><div className="hero-sticker"><span>NUEVA</span><strong>COLECCIÓN</strong></div><div className="hero-image-caption"><span>{String(heroSlide + 1).padStart(2, '0')} / 03</span><strong>{heroSlides[heroSlide].label}<br />{heroSlides[heroSlide].title}</strong></div><div className="hero-dots">{heroSlides.map((slide, index) => <button key={slide.image} className={index === heroSlide ? 'active' : ''} onClick={() => setHeroSlide(index)} aria-label={`Ver imagen ${index + 1}`} />)}</div></div></section>

      <section className="service-strip"><div><Truck size={23} /><span><strong>Delivery local</strong><small>Desde $2.500</small></span></div><div><Store size={23} /><span><strong>Retiro en tienda</strong><small>Pasaje Linares #2740</small></span></div><div><Zap size={23} /><span><strong>Compra segura</strong><small>Atención personalizada</small></span></div></section>

      <section className="catalog" id="catalogo">
        <div className="section-heading">
          <div><span className="eyebrow pink">A tu pinta</span><h2>Lo más <i>chiky</i> de la semana</h2></div>
          <div className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar productos..." /></div>
        </div>
        <div className="category-row">{categories.map((item) => <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div>

        {loadingProducts ? (
          <div className="empty">Cargando catálogo...</div>
        ) : visible.length > 0 ? (
          <div className="product-grid">{visible.map((product) => <ProductCard key={product.id} product={product} onAdd={addToCart} onOpen={() => setSelectedProduct(product)} />)}</div>
        ) : (
          <div className="empty">Pronto se añadirán novedades. ¡Vuelve a revisar nuestro catálogo!</div>
        )}
      </section>

      <section className="local-banner" id="historia"><div><span className="eyebrow">Somos de aquí</span><h2>Una tienda local,<br /><i>hecha con cariño.</i></h2><p>Desde Pasaje Linares #2740 acercamos cosmética Natura, perfumería original, accesorios y novedades para todos los días. Creemos en la atención cercana, las entregas rápidas y la confianza de recibir justo lo que elegiste, en Iquique y Alto Hospicio.</p><a className="outline-btn" href="#historia">Conócenos <ArrowRight size={16} /></a></div><div className="local-note"><Camera size={22} /><strong>@dondelachiky</strong><span>Únete a la comunidad</span></div></section>

      <footer><div className="brand"><div className="brand-mark">DLC</div><div><strong>Donde la <em>Chiky</em></strong><small>Detalles que hacen la diferencia</small></div></div><span>Pasaje Linares #2740, Iquique.</span><button type="button" className="whatsapp-contact" onClick={() => window.open(getWhatsAppUrl('Hola Donde la Chiky, quisiera hacer una consulta.'), '_blank')}><MessageCircle size={18} /> <span>Escríbenos al WhatsApp</span><strong>+56997701868</strong></button></footer>

      {cartOpen && <CartDrawer cart={cart} subtotal={subtotal} onClose={() => setCartOpen(false)} onUpdate={updateCart} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} />}
      {checkoutOpen && <Checkout cart={cart} subtotal={subtotal} onClose={() => setCheckoutOpen(false)} onDone={async () => { setCart([]); setCheckoutOpen(false); setToast('Pedido enviado. ¡Gracias por comprar local!'); setTimeout(() => setToast(''), 3000); await fetchProducts(); }} />}
      {selectedProduct && <ProductDetailModal product={selectedProduct} onAdd={addToCart} onClose={() => setSelectedProduct(null)} />}
      {toast && <div className="toast"><Check size={17} /> {toast}</div>}
    </main>
  );
}

function ProductCard({ product, onAdd, onOpen }) {
  const imagenes = getProductImages(product);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  return (
    <article className="product-card" onClick={onOpen} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onOpen(); }} role="button" tabIndex={0}>
      <div className="product-image">
        <img className="product-image-media" src={imagenes[activeImgIndex] || fallbackProductImage} alt={`${product.nombre}, imagen ${activeImgIndex + 1}`} onError={(event) => { event.currentTarget.src = fallbackProductImage; }} />
        <span className="product-tag">{product.tag || 'Disponible'}</span>
        {imagenes.length > 1 && <div className="product-gallery-controls"><button type="button" onClick={(event) => { event.stopPropagation(); setActiveImgIndex((previous) => (previous - 1 + imagenes.length) % imagenes.length); }} aria-label="Imagen anterior">‹</button><span>{activeImgIndex + 1}/{imagenes.length}</span><button type="button" onClick={(event) => { event.stopPropagation(); setActiveImgIndex((previous) => (previous + 1) % imagenes.length); }} aria-label="Imagen siguiente">›</button></div>}
      </div>
      <div className="product-info">
        <span>{product.categoria}</span>
        <h3>{product.nombre}</h3>
        <p>{product.descripcion}</p>
        <div className="price-row">
          <strong>{money(Number(product.precio || 0))}</strong>
          <small>{product.stock} disponibles</small>
          <button type="button" className="quick-add" onClick={(event) => { event.stopPropagation(); onAdd(product); }} aria-label={`Agregar ${product.nombre} a la bolsa`}><Plus size={18} /></button>
        </div>
      </div>
    </article>
  );
}

function ProductDetailModal({ product, onAdd, onClose }) {
  const imagenes = getProductImages(product);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  const openWhatsApp = () => {
    const message = `¡Hola Donde la Chiky! Estoy viendo *${product.nombre}* ($${product.precio}) y quiero consultar disponibilidad para entrega.`;
    window.open(getWhatsAppUrl(message), '_blank');
  };

  return (
    <div className="overlay product-detail-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="product-detail-modal" role="dialog" aria-modal="true" aria-labelledby="product-detail-title">
        <button type="button" className="close-btn product-detail-close" onClick={onClose} aria-label="Cerrar detalle"><X size={22} /></button>
        <div className="product-detail-gallery">
          <img className="product-detail-image" src={imagenes[activeImgIndex] || fallbackProductImage} alt={`${product.nombre}, imagen ${activeImgIndex + 1}`} onError={(event) => { event.currentTarget.src = fallbackProductImage; }} />
          {imagenes.length > 1 && <div className="product-detail-arrows"><button type="button" onClick={() => setActiveImgIndex((previous) => (previous - 1 + imagenes.length) % imagenes.length)} aria-label="Imagen anterior">‹</button><span>{activeImgIndex + 1}/{imagenes.length}</span><button type="button" onClick={() => setActiveImgIndex((previous) => (previous + 1) % imagenes.length)} aria-label="Imagen siguiente">›</button></div>}
          <div className="product-detail-thumbnails">{imagenes.map((image, index) => <button type="button" className={index === activeImgIndex ? 'active' : ''} key={image} onClick={() => setActiveImgIndex(index)}><img src={image} alt={`Miniatura ${index + 1}`} onError={(event) => { event.currentTarget.src = fallbackProductImage; }} /></button>)}</div>
        </div>
        <div className="product-detail-copy"><span className="eyebrow pink">{product.categoria}</span><h2 id="product-detail-title">{product.nombre}</h2><strong className="product-detail-price">{money(Number(product.precio || 0))}</strong><p>{product.descripcion || 'Un producto especial seleccionado para ti.'}</p><span className="product-detail-stock">{product.stock} disponibles</span><div className="product-detail-actions"><button type="button" className="primary-btn full" onClick={() => { onAdd(product); onClose(); }}>Añadir al carrito <ShoppingBag size={17} /></button><button type="button" className="whatsapp-modal-button full" onClick={openWhatsApp}><MessageCircle size={19} /> Chatear por WhatsApp ahora</button></div></div>
      </section>
    </div>
  );
}

function OrderRow({ order, onStatusChange }) {
  const phone = String(order.cliente_telefono || '').replace(/\D/g, '');
  const whatsappPhone = phone.startsWith('56') ? phone : `56${phone.replace(/^0+/, '')}`;
  const orderDate = order.created_at ? new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(order.created_at)) : 'Fecha no disponible';
  const status = String(order.estado || 'pendiente').toLowerCase();

  return (
    <article className="order-row">
      <div className="order-main"><strong>Pedido #{order.id}</strong><span>{orderDate}</span></div>
      <div className="order-customer"><strong>{order.cliente_nombre}</strong><a href={`https://wa.me/${whatsappPhone}`} target="_blank" rel="noreferrer">{order.cliente_telefono}</a></div>
      <div className="order-products">{order.items.map((item) => <span key={`${order.id}-${item.producto_id}`}>{item.cantidad}x {item.nombre}</span>)}</div>
      <div className="order-delivery"><strong>{order.tipo_entrega || 'Entrega no indicada'}</strong><span>{order.comuna || 'Comuna no indicada'}</span></div>
      <div className="order-payment"><span>{order.metodo_pago || 'Pago no indicado'}</span><strong>{money(Number(order.total || 0))}</strong></div>
      <label className="order-status">Estado<select value={status} onChange={(event) => onStatusChange(order.id, event.target.value)}><option value="pendiente">Pendiente</option><option value="en camino">En camino</option><option value="completado">Completado</option><option value="cancelado">Cancelado</option></select></label>
    </article>
  );
}

function CartDrawer({ cart, subtotal, onClose, onUpdate, onCheckout }) {
  return (
    <div className="overlay">
      <aside className="drawer">
        <div className="drawer-head">
          <div><span className="eyebrow pink">Tu selección</span><h2>Mi bolsa <small>({cart.reduce((n, i) => n + i.cantidad, 0)})</small></h2></div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        {cart.length === 0 ? (
          <div className="empty-cart"><ShoppingBag size={38} /><h3>Tu bolsa está vacía</h3><p>Agrega algo bonito para comenzar.</p></div>
        ) : (
          <>
            <div className="cart-items">{cart.map((item) => <div className="cart-item" key={item.id}><img src={item.imagen_url || defaultProductImage} alt="" onError={(event) => { event.currentTarget.src = fallbackProductImage; }} /><div><strong>{item.nombre}</strong><span>{money(item.precio)}</span><div className="stepper"><button type="button" onClick={() => onUpdate(item.id, -1)}><Minus size={13} /></button><b>{item.cantidad}</b><button type="button" onClick={() => onUpdate(item.id, 1)}><Plus size={13} /></button></div></div></div>)}</div>
            <div className="drawer-total"><div><span>Subtotal</span><strong>{money(subtotal)}</strong></div><small>El costo de envío se calcula según tu comuna.</small><button className="primary-btn full" onClick={onCheckout}>Continuar al checkout <ArrowRight size={17} /></button></div>
          </>
        )}
      </aside>
    </div>
  );
}

function Checkout({ cart, subtotal, onClose, onDone }) {
  const [delivery, setDelivery] = useState('Retiro en tienda');
  const [form, setForm] = useState({ name: '', phone: '', address: '', comuna: 'Iquique', payment: 'Transferencia bancaria' });
  const shipping = delivery === 'Delivery Iquique' ? 2500 : delivery === 'Delivery Alto Hospicio' ? 3500 : 0;
  const total = subtotal + shipping;
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    if (!form.name || !form.phone || (delivery !== 'Retiro en tienda' && !form.address)) {
      return;
    }

    if (!supabase) {
      alert('La conexión con Supabase no está disponible.');
      return;
    }

    try {
      const orderPayload = {
        cliente_nombre: form.name,
        cliente_telefono: form.phone,
        tipo_entrega: delivery,
        direccion: form.address,
        comuna: form.comuna,
        total,
        metodo_pago: form.payment,
        estado: 'pendiente',
      };

      const { data: orderData, error: orderError } = await supabase
        .from('pedidos')
        .insert([orderPayload])
        .select('id')
        .single();

      if (orderError) throw orderError;

      const itemsPayload = cart.map((item) => ({
        pedido_id: orderData.id,
        producto_id: item.id,
        cantidad: item.cantidad,
        precio_unitario: Number(item.precio),
      }));

      const { error: itemsError } = await supabase.from('pedido_items').insert(itemsPayload);
      if (itemsError) throw itemsError;

      for (const item of cart) {
        const currentStock = Number(item.stock || 0);
        const nextStock = Math.max(0, currentStock - Number(item.cantidad));
        await supabase.from('productos').update({ stock: nextStock }).eq('id', item.id);
      }

      const detail = cart
        .map((item) => `• ${item.cantidad}x ${item.nombre} - ${money(item.precio * item.cantidad)}`)
        .join('\n');

      const text = `Hola Donde la Chiky! Soy ${form.name}.\n\n*NUEVO PEDIDO*\n${detail}\n\n*Total: ${money(total)}*\nEntrega: ${delivery}\n${form.address ? `Dirección: ${form.address}, ${form.comuna}` : 'Retiro en Pasaje Linares #2740'}\nPago: ${form.payment}`;

      window.open(getWhatsAppUrl(text), '_blank');
      await onDone();
    } catch (error) {
      console.error('Error guardando el pedido:', error);
      alert('No pudimos registrar el pedido. Revisa la conexión y vuelve a intentar.');
    }
  };

  const fieldStyle = { width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #3f3f46', background: '#18181b', color: '#fff', fontWeight: 500, outlineColor: '#eab308' };

  return (
    <div className="overlay">
      <div className="checkout-modal">
        <div className="modal-head"><div><span className="eyebrow pink">Último paso</span><h2>Completa tu pedido</h2></div><button className="close-btn" onClick={onClose}><X size={20} /></button></div>
        <form onSubmit={submit}>
          <div className="form-section"><h3><UserRound size={17} /> Tus datos</h3><div className="form-grid"><label>Nombre<input className="checkout-field" style={fieldStyle} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Tu nombre" /></label><label>Celular<input className="checkout-field" style={fieldStyle} value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+56 9 ..." /></label></div></div>
          <div className="form-section"><h3><Truck size={17} /> Entrega</h3><div className="form-grid"><label>Tipo de entrega<select className="checkout-field" style={fieldStyle} value={delivery} onChange={(e) => setDelivery(e.target.value)}><option>Retiro en tienda</option><option>Delivery Iquique</option><option>Delivery Alto Hospicio</option></select></label>{delivery !== 'Retiro en tienda' && <label>Dirección<input className="checkout-field" style={fieldStyle} value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Calle / N°" /></label>}<label>Comuna<input className="checkout-field" style={fieldStyle} value={form.comuna} onChange={(e) => set('comuna', e.target.value)} /></label></div></div>
          <div className="form-section"><h3><Bell size={17} /> Pago</h3><div className="payment-options"><label><input type="radio" checked={form.payment === 'Transferencia bancaria'} onChange={() => set('payment', 'Transferencia bancaria')} /> Transferencia bancaria</label><label><input type="radio" checked={form.payment === 'Pago contra entrega'} onChange={() => set('payment', 'Pago contra entrega')} /> Pago contra entrega</label></div></div>
          <div className="drawer-total">
            <div><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
            <div><span>Envío</span><strong>{money(shipping)}</strong></div>
            <div><span>Total</span><strong>{money(total)}</strong></div>
            <button type="submit" className="primary-btn full">Confirmar pedido <ArrowRight size={17} /></button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Admin({ onClose }) {
  const [tab, setTab] = useState('productos');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [newProduct, setNewProduct] = useState({ nombre: '', descripcion: '', precio: '', stock: '', categoria: 'Accesorios', imagen_url: '' });
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [saving, setSaving] = useState(false);
  const [editingStock, setEditingStock] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingProductId, setEditingProductId] = useState(null);

  const loadProducts = async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from('productos').select('*').order('id', { ascending: false });
    if (!error) {
      setProducts(data || []);
    } else {
      console.error('Error cargando productos admin:', error);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (tab === 'pedidos') loadOrders();
  }, [tab]);

  const loadOrders = async () => {
    if (!supabase) return;
    setOrdersLoading(true);
    setOrdersError('');
    try {
      const { data: orderRows, error: orderError } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false });
      if (orderError) throw orderError;

      const orderIds = (orderRows || []).map((order) => order.id);
      const { data: itemRows, error: itemError } = orderIds.length
        ? await supabase.from('pedido_items').select('*').in('pedido_id', orderIds)
        : { data: [], error: null };
      if (itemError) throw itemError;

      const productIds = [...new Set((itemRows || []).map((item) => item.producto_id).filter(Boolean))];
      const { data: productRows, error: productError } = productIds.length
        ? await supabase.from('productos').select('id,nombre').in('id', productIds)
        : { data: [], error: null };
      if (productError) throw productError;

      const productNames = new Map((productRows || []).map((product) => [product.id, product.nombre]));
      const itemsByOrder = new Map();
      (itemRows || []).forEach((item) => {
        const current = itemsByOrder.get(item.pedido_id) || [];
        current.push({ ...item, nombre: productNames.get(item.producto_id) || 'Producto eliminado' });
        itemsByOrder.set(item.pedido_id, current);
      });
      setOrders((orderRows || []).map((order) => ({ ...order, items: itemsByOrder.get(order.id) || [] })));
    } catch (error) {
      console.error('Error cargando pedidos:', error);
      setOrdersError('No se pudieron cargar los pedidos. Revisa las tablas y políticas RLS.');
    } finally {
      setOrdersLoading(false);
    }
  };

  const updateOrderStatus = async (id, estado) => {
    if (!supabase) return;
    const { error } = await supabase.from('pedidos').update({ estado }).eq('id', id);
    if (error) {
      console.error('Error actualizando estado del pedido:', error);
      setOrdersError('No se pudo actualizar el estado del pedido.');
      return;
    }
    setOrders((current) => current.map((order) => order.id === id ? { ...order, estado } : order));
  };

  const updateField = (field, value) => setNewProduct((current) => ({ ...current, [field]: value }));

  const selectImages = (event) => {
    const files = Array.from(event.target.files || []);
    setSelectedImages(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const uploadImages = async () => {
    const urls = [];
    for (const [index, file] of selectedImages.entries()) {
      const extension = file.name.split('.').pop();
      const fileName = `productos/${Date.now()}-${index}-${Math.random().toString(36).slice(2)}.${extension}`;
      const { error: uploadError } = await supabase.storage.from('fotos-productos').upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('fotos-productos').getPublicUrl(fileName);
      const publicUrl = data.publicUrl;
      urls.push(publicUrl);
    }
    return urls;
  };

  const handleAddProduct = async (event) => {
    event.preventDefault();
    if (!supabase) {
      setErrorMessage('Supabase no está configurado.');
      return;
    }

    if (!newProduct.nombre.trim() || !newProduct.precio || !newProduct.stock) {
      setErrorMessage('Completa nombre, precio y stock.');
      return;
    }

    try {
      setSaving(true);
      setErrorMessage('');
      setSuccessMessage('');
      const uploadedImages = selectedImages.length > 0 ? await uploadImages() : [];
      const payload = {
        nombre: newProduct.nombre.trim(),
        descripcion: newProduct.descripcion.trim() || 'Nuevo producto disponible.',
        precio: Number(newProduct.precio),
        stock: Number(newProduct.stock),
        categoria: newProduct.categoria,
        imagen_url: uploadedImages[0] || newProduct.imagen_url || defaultProductImage,
        imagenes_url: JSON.stringify(uploadedImages.length > 0 ? uploadedImages : [newProduct.imagen_url || defaultProductImage]),
        activo: true,
      };

      const runSave = (data) => editingProductId
        ? supabase.from('productos').update(data).eq('id', editingProductId)
        : supabase.from('productos').insert([data]);
      let { error } = await runSave(payload);
      if (error?.message?.includes('imagenes_url')) {
        const { imagenes_url: ignoredImages, ...legacyPayload } = payload;
        ({ error } = await runSave(legacyPayload));
      }
      if (error) throw error;

      setNewProduct({ nombre: '', descripcion: '', precio: '', stock: '', categoria: 'Accesorios', imagen_url: '' });
      setSelectedImages([]);
      setImagePreviews([]);
      setEditingProductId(null);
      setSuccessMessage(editingProductId ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.');
      await loadProducts();
    } catch (error) {
      console.error('Error creando producto:', error);
      setErrorMessage('No se pudo crear el producto. Revisa la tabla y columnas en Supabase.');
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (product) => {
    setEditingProductId(product.id);
    setNewProduct({
      nombre: product.nombre || '',
      descripcion: product.descripcion || '',
      precio: product.precio ?? '',
      stock: product.stock ?? '',
      categoria: product.categoria || 'Accesorios',
      imagen_url: product.imagen_url || '',
    });
    setSelectedImages([]);
    setImagePreviews(getProductImages(product));
    setErrorMessage('');
    setSuccessMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditing = () => {
    setEditingProductId(null);
    setNewProduct({ nombre: '', descripcion: '', precio: '', stock: '', categoria: 'Accesorios', imagen_url: '' });
    setSelectedImages([]);
    setImagePreviews([]);
    setErrorMessage('');
  };

  const toggleActive = async (product) => {
    if (!supabase) return;
    const { error } = await supabase.from('productos').update({ activo: !product.activo }).eq('id', product.id);
    if (!error) await loadProducts();
  };

  const deleteProduct = async (id) => {
    if (!supabase) return;
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (!error) await loadProducts();
  };

  const updateStock = async (id, stock) => {
    if (!supabase) return;
    const { error } = await supabase.from('productos').update({ stock: Number(stock) }).eq('id', id);
    if (!error) await loadProducts();
  };

  return (
    <div className="overlay admin-overlay">
      <section className="admin-panel">
        <div className="admin-head">
          <div className="brand"><div className="brand-mark">DLC</div><div><strong>Panel <em>Chiky</em></strong><small>Administración de tienda</small></div></div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="admin-tabs">
          <button className={tab === 'productos' ? 'active' : ''} onClick={() => setTab('productos')}><ShoppingBag size={16} /> Productos</button>
          <button className={tab === 'pedidos' ? 'active' : ''} onClick={() => setTab('pedidos')}><Package size={16} /> Pedidos Recibidos <b>{orders.length}</b></button>
        </div>

        {tab === 'productos' ? (
          <div className="admin-content">
            <div className="admin-intro">
              <div><span className="eyebrow pink">Catálogo</span><h2>Gestiona tus productos</h2><p>Agrega novedades, actualiza precios y mantén tu stock al día.</p></div>
              <button className="outline-btn" onClick={() => setTab('productos')}>Actualizar</button>
            </div>

            <form onSubmit={handleAddProduct} className="admin-form">
              <div className="admin-form-heading"><div><span className="eyebrow pink">{editingProductId ? 'Editando producto' : 'Nuevo producto'}</span><h3>{editingProductId ? 'Actualizar producto' : 'Crear producto'}</h3></div>{editingProductId && <button type="button" className="mini-btn" onClick={cancelEditing}>Cancelar</button>}</div>
              <div className="form-grid">
                <label>Nombre<input value={newProduct.nombre} onChange={(e) => updateField('nombre', e.target.value)} placeholder="Nombre del producto" /></label>
                <label>Precio<input value={newProduct.precio} type="number" min="0" onChange={(e) => updateField('precio', e.target.value)} placeholder="24990" /></label>
                <label>Stock<input value={newProduct.stock} type="number" min="0" onChange={(e) => updateField('stock', e.target.value)} placeholder="10" /></label>
                <label>Categoría<select value={newProduct.categoria} onChange={(e) => updateField('categoria', e.target.value)}>{['Productos Natura', 'Belleza & Cuidado', 'Accesorios', 'Carteras & Mochilas'].map((item) => <option key={item}>{item}</option>)}</select></label>
                <label className="full-span">Descripción<textarea value={newProduct.descripcion} onChange={(e) => updateField('descripcion', e.target.value)} rows={3} placeholder="Detalles del producto" /></label>
                <label className="full-span upload-box">
                  <span><ImagePlus size={16} /> Seleccionar imágenes</span>
                  <input type="file" multiple accept="image/*" onChange={selectImages} />
                  {selectedImages.length > 0 && <small>{selectedImages.length} imagen(es) listas para subir</small>}
                </label>
              </div>

              {imagePreviews.length > 0 && <div className="preview-box image-preview-grid">{imagePreviews.map((preview, index) => <img key={preview} src={preview} alt={`Vista previa ${index + 1}`} />)}</div>}
              {errorMessage && <div className="error-box">{errorMessage}</div>}
              {successMessage && <div className="success-box">{successMessage}</div>}

              <button type="submit" className="primary-btn full" disabled={saving}>{saving ? 'Subiendo y guardando...' : editingProductId ? 'Guardar cambios' : 'Guardar producto'}</button>
            </form>

            <div className="admin-list">
              {products.map((product) => (
                <div className="admin-item" key={product.id}>
                  <img src={getProductImages(product)[0]} alt={product.nombre} onError={(event) => { event.currentTarget.src = fallbackProductImage; }} />
                  <div className="admin-item-body">
                    <div className="admin-item-name"><strong>{product.nombre}</strong><small>{product.categoria}</small></div>
                    <strong className="admin-item-price">{money(Number(product.precio || 0))}</strong>
                    <label className="admin-stock-control">Stock:<input type="number" min="0" value={editingStock[product.id] ?? product.stock ?? 0} onChange={(e) => setEditingStock((current) => ({ ...current, [product.id]: e.target.value }))} onBlur={() => updateStock(product.id, editingStock[product.id] ?? product.stock ?? 0)} onClick={(event) => event.stopPropagation()} /></label>
                    <span className={`badge ${product.activo ? 'active' : 'inactive'}`}>{product.activo ? 'Activo' : 'Inactivo'}</span>
                    <div className="admin-actions"><button type="button" className="mini-btn" onClick={() => startEditing(product)} aria-label={`Editar ${product.nombre}`}><Pencil size={15} /> Editar</button><button type="button" className="mini-btn" onClick={() => toggleActive(product)}>{product.activo ? 'Desactivar' : 'Activar'}</button><button type="button" className="mini-btn danger" onClick={() => deleteProduct(product.id)} aria-label={`Eliminar ${product.nombre}`}><Trash2 size={15} /> Eliminar</button></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="admin-content">
            <div className="admin-intro"><div><span className="eyebrow pink">Pedidos</span><h2>Seguimiento de ventas</h2><p>Pedidos reales recibidos desde Supabase.</p></div><button className="outline-btn" onClick={loadOrders}>Actualizar</button></div>
            {ordersError && <div className="error-box">{ordersError}</div>}
            {ordersLoading ? <div className="empty">Cargando pedidos...</div> : orders.length === 0 ? <div className="empty">Todavía no hay pedidos registrados.</div> : <div className="orders-list">{orders.map((order) => <OrderRow key={order.id} order={order} onStatusChange={updateOrderStatus} />)}</div>}
          </div>
        )}
      </section>
    </div>
  );
}

