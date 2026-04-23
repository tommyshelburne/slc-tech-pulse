import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export function Layout() {
  return (
    <>
      <Header />
      <main
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '32px 24px',
          minHeight: 'calc(100vh - 200px)',
        }}
      >
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
