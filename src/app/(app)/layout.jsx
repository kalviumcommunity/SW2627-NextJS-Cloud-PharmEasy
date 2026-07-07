export default function AppLayout({ children }) {
  return (
    <div className="app-layout">

      <aside className="sidebar">
        <h2>PharmEasy</h2>

        <nav>
          <a href="/home">Dashboard</a>
          <a href="/medicines">Medicines</a>
          <a href="/orders">Orders</a>
          <a href="/subscriptions">Subscriptions</a>
          <a href="/notifications">Notifications</a>
          <a href="/profile">Profile</a>
        </nav>
      </aside>

      <div className="main-section">

        <main className="content">
          {children}
        </main>

        <footer className="footer">
          <p>© 2026 PharmEasy. All rights reserved.</p>
        </footer>

      </div>

    </div>
  );
}