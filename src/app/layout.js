import './globals.css';

export const metadata = {
  title: 'Donde la Chiky | Iquique y Alto Hospicio',
  description: 'Accesorios, belleza y tecnología con despacho local.',
};

export default function RootLayout({ children }) {
  return <html lang="es"><body>{children}</body></html>;
}