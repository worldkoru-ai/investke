// "use client";

// import { useEffect, useState } from "react";
// import { useSearchParams, useRouter } from "next/navigation";

// type User = {
//   id?: string;
//   name?: string;
//   email?: string;
//   [key: string]: any;
// };

// type VerifyResponse = {
//   status?: boolean;
//   message?: string;
//   data?: {
//     status: string;
//     amount: number;
//     currency: string;
//     reference: string;
//     gateway_response?: string;
//     authorization?: {
//       authorization_code?: string;
//     };
//   };
//   error?: string;
// };

// export default function VerifyPage() {
//   const searchParams = useSearchParams();
//     const [user, setUser] = useState<User | null>(null);
//   const router = useRouter();
//   const reference =
//     searchParams.get("reference") || searchParams.get("trxref");

//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState<VerifyResponse | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (!reference) {
//       setError("No payment reference found in callback URL.");
//       return;
//     }

//       const fetchUserData = async () => {
//   try {
//     const res = await fetch("/api/me");
//     const data = await res.json();
//     if (res.ok) setUser(data.user);
//   } catch (err) {
//     console.error(err);
//   }
// };

//     const verifyPayment = async () => {
//       setLoading(true);
//       setError(null);

//       try {
//         const res = await fetch(
//           `/api/invest/paystack/verify?reference=${reference}`
//         );

//         const data = await res.json();

//         if (!res.ok) {
//           throw new Error(data?.error || "Verification failed");
//         }

//         setResult(data);
//         await fetchUserData();
//         router.push("/dashboard");
//       } catch (err: any) {
//         setError(err?.message || "Verification error");
//       } finally {
//         setLoading(false);
//       }
//     };

//     verifyPayment();
//   }, [reference]);

//   const goHome = () => router.push("/dashboard");

//   return (
//     <div style={styles.container}>
//       <h1 style={styles.title}>Payment Verification</h1>

//       {!reference && (
//         <div style={styles.card}>
//           <p style={styles.error}>
//             Missing payment reference. This page must be used as Paystack's
//             callback URL.
//           </p>
//           <button onClick={goHome} style={styles.button}>
//             Go Home
//           </button>
//         </div>
//       )}

//       {reference && (
//         <div style={styles.card}>
//           <p>
//             <strong>Reference:</strong> {reference}
//           </p>

//           {loading && <p>Verifying payment, please wait...</p>}

//           {error && (
//             <>
//               <p style={styles.error}>{error}</p>
//               <button onClick={goHome} style={styles.button}>
//                 Return Home
//               </button>
//             </>
//           )}

//           {!loading && result?.data && (
//             <>
//               {result.data.status === "success" ? (
//                 <>
//                   <p style={styles.success}>✅ Payment successful!</p>

//                   <div style={styles.meta}>
//                     <p>
//                       <strong>Amount:</strong>{" "}
//                       {formatAmount(
//                         result.data.amount,
//                         result.data.currency
//                       )}
//                     </p>
//                     <p>
//                       <strong>Status:</strong> {result.data.status}
//                     </p>
//                     {result.data.gateway_response && (
//                       <p>
//                         <strong>Gateway:</strong>{" "}
//                         {result.data.gateway_response}
//                       </p>
//                     )}
//                     {result.data.authorization?.authorization_code && (
//                       <p>
//                         <strong>Authorization:</strong>{" "}
//                         {result.data.authorization.authorization_code}
//                       </p>
//                     )}
//                   </div>

//                   <button onClick={goHome} style={styles.button}>
//                     Continue
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   <p style={styles.error}>❌ Payment failed</p>
//                   <button onClick={goHome} style={styles.button}>
//                     Try Again
//                   </button>
//                 </>
//               )}
//             </>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// /* ---------------- STYLES ---------------- */

// const styles: Record<string, React.CSSProperties> = {
//   container: {
//     maxWidth: 760,
//     margin: "60px auto",
//     padding: 20,
//     fontFamily: "system-ui, sans-serif",
//   },
//   title: { fontSize: 22, marginBottom: 16 },
//   card: {
//     padding: 20,
//     borderRadius: 8,
//     border: "1px solid #e5e7eb",
//     background: "#fff",
//   },
//   error: { color: "#b91c1c", margin: "12px 0" },
//   success: { color: "#065f46", margin: "12px 0" },
//   meta: {
//     marginTop: 12,
//     padding: 12,
//     background: "#f9fafb",
//     borderRadius: 6,
//   },
//   button: {
//     marginTop: 16,
//     background: "#111827",
//     color: "#fff",
//     border: "none",
//     padding: "10px 16px",
//     borderRadius: 6,
//     cursor: "pointer",
//   },
// };

// function formatAmount(amount: number, currency?: string) {
//   const value = amount / 100;
//   return `${value.toFixed(2)} ${currency || ""}`;
// }


"use client";

// Force dynamic rendering so Next.js doesn't pre-render this page
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type User = {
  id?: string;
  name?: string;
  email?: string;
  [key: string]: any;
};

type VerifyResponse = {
  status?: boolean;
  message?: string;
  data?: {
    status: string;
    amount: number;
    currency: string;
    reference: string;
    gateway_response?: string;
    authorization?: {
      authorization_code?: string;
    };
  };
  error?: string;
};

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const reference =
    searchParams.get("reference") || searchParams.get("trxref");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) {
      setError("No payment reference found in callback URL.");
      return;
    }

    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        if (res.ok) setUser(data.user);
      } catch (err) {
        console.error(err);
      }
    };

    const verifyPayment = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/invest/paystack/verify?reference=${reference}`
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Verification failed");
        }

        setResult(data);
        await fetchUserData();
        router.push("/dashboard");
      } catch (err: any) {
        setError(err?.message || "Verification error");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [reference]);

  const goHome = () => router.push("/dashboard");

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Payment Verification</h1>

      {!reference && (
        <div style={styles.card}>
          <p style={styles.error}>
            Missing payment reference. This page must be used as Paystack's
            callback URL.
          </p>
          <button onClick={goHome} style={styles.button}>
            Go Home
          </button>
        </div>
      )}

      {reference && (
        <div style={styles.card}>
          <p>
            <strong>Reference:</strong> {reference}
          </p>

          {loading && <p>Verifying payment, please wait...</p>}

          {error && (
            <>
              <p style={styles.error}>{error}</p>
              <button onClick={goHome} style={styles.button}>
                Return Home
              </button>
            </>
          )}

          {!loading && result?.data && (
            <>
              {result.data.status === "success" ? (
                <>
                  <p style={styles.success}>✅ Payment successful!</p>

                  <div style={styles.meta}>
                    <p>
                      <strong>Amount:</strong>{" "}
                      {formatAmount(result.data.amount, result.data.currency)}
                    </p>
                    <p>
                      <strong>Status:</strong> {result.data.status}
                    </p>
                    {result.data.gateway_response && (
                      <p>
                        <strong>Gateway:</strong> {result.data.gateway_response}
                      </p>
                    )}
                    {result.data.authorization?.authorization_code && (
                      <p>
                        <strong>Authorization:</strong>{" "}
                        {result.data.authorization.authorization_code}
                      </p>
                    )}
                  </div>

                  <button onClick={goHome} style={styles.button}>
                    Continue
                  </button>
                </>
              ) : (
                <>
                  <p style={styles.error}>❌ Payment failed</p>
                  <button onClick={goHome} style={styles.button}>
                    Try Again
                  </button>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 760,
    margin: "60px auto",
    padding: 20,
    fontFamily: "system-ui, sans-serif",
  },
  title: { fontSize: 22, marginBottom: 16 },
  card: {
    padding: 20,
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    background: "#fff",
  },
  error: { color: "#b91c1c", margin: "12px 0" },
  success: { color: "#065f46", margin: "12px 0" },
  meta: {
    marginTop: 12,
    padding: 12,
    background: "#f9fafb",
    borderRadius: 6,
  },
  button: {
    marginTop: 16,
    background: "#111827",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: 6,
    cursor: "pointer",
  },
};

function formatAmount(amount: number, currency?: string) {
  const value = amount / 100;
  return `${value.toFixed(2)} ${currency || ""}`;
}
