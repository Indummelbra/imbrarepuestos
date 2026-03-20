import { redirect } from 'next/navigation';

export default function TerminosPage() {
  // Redirigir a la nueva estructura unificada de políticas
  redirect('/politicas/terminos-y-condiciones');
}
