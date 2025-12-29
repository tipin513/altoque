import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 pt-10 pb-6 mt-20">
            <div className="max-w-[1200px] mx-auto px-4 lg:px-0">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 text-sm">
                    <div>
                        <h4 className="font-bold mb-4">Sobre nosotros</h4>
                        <ul className="space-y-2 text-gray-600">
                            <li><Link href="/about" className="hover:text-blue-600">Quiénes somos</Link></li>
                            <li><Link href="/terms" className="hover:text-blue-600">Términos y condiciones</Link></li>
                            <li><Link href="/privacy" className="hover:text-blue-600">Privacidad</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Ayuda</h4>
                        <ul className="space-y-2 text-gray-600">
                            <li><Link href="/faq" className="hover:text-blue-600">Preguntas frecuentes</Link></li>
                            <li><Link href="/support" className="hover:text-blue-600">Centro de seguridad</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Redes sociales</h4>
                        <ul className="space-y-2 text-gray-600">
                            <li><a href="#" className="hover:text-blue-600">Facebook</a></li>
                            <li><a href="#" className="hover:text-blue-600">Instagram</a></li>
                            <li><a href="#" className="hover:text-blue-600">Twitter</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Contacto</h4>
                        <p className="text-gray-600">Soporte técnico 24/7</p>
                        <p className="text-gray-600 mt-2 font-semibold">info@altoque.com.ar</p>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-6 text-[11px] text-gray-400">
                    <p>© 2024 Altoque - Marketplace de Servicios Argentina. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    );
}
