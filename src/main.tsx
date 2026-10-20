import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const container = document.getElementById('root')!;
// The server sends a fully rendered page for storefront URLs → hydrate it (instant content, no flash).
// Pages without server HTML (e.g. /admin or static hosting) are rendered in the browser.
const hasServerHtml =
  container.firstElementChild !== null &&
  container.firstElementChild.id !== 'initial-app-shell' &&
  !window.location.pathname.startsWith('/admin');

if (hasServerHtml) {
  hydrateRoot(container, <App />, {
    onRecoverableError: (err) => {
      if (import.meta.env.DEV) console.warn('[hydration]', err);
    },
  });
} else {
  createRoot(container).render(<App />);
}
