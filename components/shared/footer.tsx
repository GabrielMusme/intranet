// Footer is a Server Component but renders a small Client `Logo` component
import { cookies } from 'next/headers';
import { Logo2 } from './logo2';

export async function Footer() {

  // We keep reading cookie for other server-side logic if needed, but the logo
  // is rendered by the client `Logo` component to reflect theme changes in-place.
  const cookieStore = await cookies();
  const theme = cookieStore.get('app-theme')?.value || 'light';


  return (
    // <footer className="bg-card border-t border-gray-200 px-6 py-4">
    <footer className="bg-card border-t border-border shadow-lg px-6 py-4 shadow-inset">
      <div className="flex flex-col items-center justify-center md:flex-row md:justify-between text-sm text-gray-500">

        <div className="flex flex-wrap justify-center md:justify-start items-center">
          <div className="flex items-center mr-4">
            <Logo2 width={80} height={20} className="h-8 w-auto object-contain pr-2" />
            <p className="pl-1">
            by <strong> Depto Sistemas </strong>
            </p>
          </div>
          <p>
            © {new Date().getFullYear()} INTEMA - Todos los derechos reservados.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <span>Versión 1.0.0</span>
          <span>•</span>
          <a href="#" className="hover:text-gray-700 transition-colors">
            Soporte
          </a>
          <span>•</span>
          <a href="#" className="hover:text-gray-700 transition-colors">
            Documentación
          </a>
        </div>
      </div>
    </footer>
  );
}
