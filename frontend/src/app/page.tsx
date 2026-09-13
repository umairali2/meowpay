import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <header className="navbar bg-white border-bottom">
        <div className="container py-2">
          <span className="navbar-brand mb-0 fw-bold text-primary">🐱 MeowPay</span>
          <span className="badge rounded-pill text-bg-warning fs-6 px-3 py-2" aria-label="Current balance: 250 treats">
            🪙 250
          </span>
        </div>
      </header>

      <main className="container py-5">
        <section className={`card border-0 shadow-sm mx-auto ${styles.transferCard}`}>
          <div className="card-body p-4 p-sm-5">
            <div className="mb-4">
              <h1 className="h3 fw-bold mb-2">Send Treats</h1>
              <p className="text-body-secondary mb-0">Share some treats with a feline friend.</p>
            </div>

            <div className={`d-flex align-items-center gap-3 rounded-3 p-3 mb-4 ${styles.sender}`}>
              <span className={styles.avatar} aria-hidden="true">🐱</span>
              <div>
                <div className="small text-body-secondary">From</div>
                <div className="fw-semibold">Whiskers</div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold" htmlFor="recipient">Send to</label>
              <select className="form-select form-select-lg" id="recipient" disabled>
                <option>Select a cat</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold" htmlFor="amount">Amount</label>
              <div className="input-group input-group-lg">
                <input className="form-control" id="amount" inputMode="numeric" placeholder="0" disabled />
                <span className="input-group-text">🍪</span>
              </div>
            </div>

            <button className="btn btn-primary btn-lg w-100 fw-semibold" type="button" disabled>
              Send Treats 🍪
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
