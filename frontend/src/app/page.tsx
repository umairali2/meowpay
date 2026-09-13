"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ApiClientError, createTransfer, getRecipients, getWallet } from "@/lib/api";
import type { Cat, TransferResult, Wallet } from "@/types/api";
import styles from "./page.module.css";

function fetchWalletData() {
  return Promise.all([getWallet(), getRecipients()]);
}

export default function Home() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [recipients, setRecipients] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recipientId, setRecipientId] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [transferResult, setTransferResult] = useState<TransferResult | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const amountValue = Number(amount);
  const amountError = amount && (!Number.isInteger(amountValue) || amountValue <= 0)
    ? "Enter a positive whole number."
    : amount && wallet && amountValue > wallet.balance
      ? "Amount exceeds your available balance."
      : null;
  const formIsValid = Boolean(recipientId && amount && !amountError);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [currentWallet, availableRecipients] = await fetchWalletData();
      setWallet(currentWallet);
      setRecipients(availableRecipients);
    } catch {
      setError("We couldn't load your wallet. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!wallet || !formIsValid || submitting) {
      return;
    }

    setSubmitting(true);
    setSubmissionError(null);

    try {
      const result = await createTransfer({
        recipientId: Number(recipientId),
        amount: amountValue,
      });
      setTransferResult(result);
      setWallet({ ...wallet, balance: result.remainingBalance });
    } catch (error) {
      setSubmissionError(
        error instanceof ApiClientError
          ? error.message
          : "Unable to send treats. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMore = () => {
    setTransferResult(null);
    setRecipientId("");
    setAmount("");
  };

  const handleTryAgain = () => {
    setSubmissionError(null);
  };

  useEffect(() => {
    let active = true;

    fetchWalletData()
      .then(([currentWallet, availableRecipients]) => {
        if (active) {
          setWallet(currentWallet);
          setRecipients(availableRecipients);
        }
      })
      .catch(() => {
        if (active) {
          setError("We couldn't load your wallet. Please try again.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className={styles.page}>
      <header className="navbar bg-white border-bottom">
        <div className="container py-2">
          <span className="navbar-brand mb-0 fw-bold text-primary">🐱 MeowPay</span>
          <span
            className="badge rounded-pill text-bg-warning fs-6 px-3 py-2"
            aria-label={wallet ? `Current balance: ${wallet.balance} treats` : "Balance unavailable"}
          >
            🪙 {wallet?.balance ?? "—"}
          </span>
        </div>
      </header>

      <main className="container py-5">
        {loading && (
          <section className={`card border-0 shadow-sm mx-auto ${styles.transferCard}`}>
            <div className="card-body p-5 text-center" role="status">
              <div className="spinner-border text-primary mb-3" aria-hidden="true" />
              <p className="fw-semibold mb-0">Loading your wallet...</p>
            </div>
          </section>
        )}

        {!loading && error && (
          <section className={`card border-0 shadow-sm mx-auto ${styles.transferCard}`}>
            <div className="card-body p-5 text-center" role="alert">
              <div className="fs-1 mb-3" aria-hidden="true">⚠️</div>
              <h1 className="h4 fw-bold">Unable to load MeowPay</h1>
              <p className="text-body-secondary mb-4">{error}</p>
              <button className="btn btn-primary px-4" type="button" onClick={loadData}>
                Try Again
              </button>
            </div>
          </section>
        )}

        {!loading && wallet && !error && (
          <section className={`card border-0 shadow-sm mx-auto ${styles.transferCard}`}>
            <div className="card-body p-4 p-sm-5">
              {transferResult ? (
                <div className="text-center">
                  <div className="display-5 mb-3" aria-hidden="true">🎉</div>
                  <h1 className="h3 fw-bold mb-2">Treats Sent Successfully!</h1>
                  <p className="text-body-secondary mb-4">Your treats are on their way.</p>

                  <div className={`rounded-3 p-4 mb-4 ${styles.sender}`}>
                    <div className="fw-semibold">🐱 {transferResult.transfer.sender.name}</div>
                    <div className="text-primary fs-4 my-2" aria-hidden="true">↓</div>
                    <div className="h3 fw-bold mb-2">{transferResult.transfer.amount} 🍪</div>
                    <div className="text-primary fs-4 mb-2" aria-hidden="true">↓</div>
                    <div className="fw-semibold">🐱 {transferResult.transfer.recipient.name}</div>
                  </div>

                  <p className="mb-4">
                    Remaining balance: <strong>{transferResult.remainingBalance} 🍪</strong>
                  </p>
                  <button className="btn btn-primary btn-lg w-100 fw-semibold" type="button" onClick={handleSendMore}>
                    Send More Treats
                  </button>
                </div>
              ) : submissionError ? (
                <div className="text-center" role="alert">
                  <div className="display-5 mb-3" aria-hidden="true">⚠️</div>
                  <h1 className="h3 fw-bold mb-2">Couldn&apos;t send treats</h1>
                  <p className="text-body-secondary mb-4">{submissionError}</p>
                  <button className="btn btn-primary btn-lg w-100 fw-semibold" type="button" onClick={handleTryAgain}>
                    Try Again
                  </button>
                </div>
              ) : (
                <>
              <div className="mb-4">
                <h1 className="h3 fw-bold mb-2">Send Treats</h1>
                <p className="text-body-secondary mb-0">Share some treats with a feline friend.</p>
              </div>

              <div className={`d-flex align-items-center gap-3 rounded-3 p-3 mb-4 ${styles.sender}`}>
                <span className={styles.avatar} aria-hidden="true">🐱</span>
                <div>
                  <div className="small text-body-secondary">From</div>
                  <div className="fw-semibold">{wallet.name}</div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold" htmlFor="recipient">Send to</label>
                  <select
                    className="form-select form-select-lg"
                    id="recipient"
                    value={recipientId}
                    onChange={(event) => setRecipientId(event.target.value)}
                    disabled={submitting}
                    required
                  >
                    <option value="">Select a cat</option>
                    {recipients.map((recipient) => (
                      <option key={recipient.id} value={recipient.id}>{recipient.name}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold" htmlFor="amount">Amount</label>
                  <div className="input-group input-group-lg">
                    <input
                      className={`form-control ${amountError ? "is-invalid" : ""}`}
                      id="amount"
                      type="number"
                      inputMode="numeric"
                      min="1"
                      max={wallet.balance}
                      step="1"
                      placeholder="0"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      disabled={submitting}
                      required
                    />
                    <span className="input-group-text">🍪</span>
                    {amountError && <div className="invalid-feedback">{amountError}</div>}
                  </div>
                </div>

                <button className="btn btn-primary btn-lg w-100 fw-semibold" type="submit" disabled={!formIsValid || submitting}>
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                      Sending treats...
                    </>
                  ) : "Send Treats 🍪"}
                </button>
              </form>
                </>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
