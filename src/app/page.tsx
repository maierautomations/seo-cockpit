import { redirect } from 'next/navigation';

// Root page redirects to the static landing page
export default function RootPage() {
  redirect('/landing/index.html');
}
