'use client';

import { useEffect, useState } from 'react';
import { Admin } from '@/app/page';

const ADMIN_PASSWORD = 'chiky2026';
const ADMIN_SESSION_KEY = 'donde-la-chiky-admin';

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (window.sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true') {
      setAuthorized(true);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready && !authorized && window.location.pathname === '/admin' && window.history.state?.usr === 'denied') {
      window.location.href = '/';
    }
  }, [authorized, ready]);

  const submit = (event) => {
    event.preventDefault();
    if (password !== ADMIN_PASSWORD) {
      setError('Clave incorrecta. Serás redirigida a la tienda.');
      window.setTimeout(() => { window.location.href = '/'; }, 900);
      return;
    }

    window.sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
    setAuthorized(true);
  };

  if (!ready || !authorized) {
    return (
      <main className="admin-login-page">
        <form className="admin-login" onSubmit={submit}>
          <div className="brand"><div className="brand-mark">DLC</div><div><strong>Panel <em>Chiky</em></strong><small>Acceso exclusivo</small></div></div>
          <h1>Zona privada</h1>
          <p>Ingresa la clave maestra para administrar el catálogo.</p>
          <label>Contraseña o PIN<input autoFocus type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          {error && <div className="error-box">{error}</div>}
          <button className="primary-btn full" type="submit">Entrar al panel</button>
          <a href="/">Volver a la tienda</a>
        </form>
      </main>
    );
  }

  return <Admin onClose={() => { window.sessionStorage.removeItem(ADMIN_SESSION_KEY); window.location.href = '/'; }} />;
}
