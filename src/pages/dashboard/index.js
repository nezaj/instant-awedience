import React, { useState } from "react"
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { init, useAuth } from "@instantdb/react"

const db = init({ appId: "d7e379b9-9744-4ba1-a7d4-4b022080338d" })

// Styles
const inputStyle = "box-border block w-full rounded-md border-0 px-4 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 mt-4"
const authContainerStyle = "box-border rounded-lg overflow-hidden bg-white outline outline-1 -outline-offset-1 outline-gray-900/10 max-w-md mx-auto flex flex-col p-6";
const authHeaderStyle = "text-black text-2xl font-semibold tracking-tight mt-8";
const authSubheaderStyle = "text-black text-base leading-relaxed mt-2";

// Helpers
// ----------------------
function AuthButton({ label }) {
  return (
    <button className="appearance-none border-0 font-bold rounded-md cursor-pointer px-3.5 py-2.5 text-sm bg-violet-500 hover:bg-violet-400 text-white shadow-sm mt-4 w-full">
      {label}
    </button>
  )
}

function Background() {
  return (
    <img className="absolute inset-0 w-full h-full -z-10" alt="" src="data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%0A%3Csvg%20width%3D%221000px%22%20height%3D%221000px%22%20viewBox%3D%220%200%201000%201000%22%20preserveAspectRatio%3D%22xMidYMid%20slice%22%20version%3D%221.1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%20%20%3Cdefs%3E%0A%20%20%20%20%3CradialGradient%20id%3D%22rg0%22%20cx%3D%220.218%22%20cy%3D%220.78%22%20r%3D%221%22%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%238b5cf61e%22%20stop-opacity%3D%221%22%20%2F%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%2250%25%22%20stop-color%3D%22%238b5cf61e%22%20stop-opacity%3D%220%22%20%2F%3E%0A%20%20%20%20%3C%2FradialGradient%3E%0A%20%20%20%20%3Cfilter%20id%3D%22f0%22%3E%0A%20%20%20%20%20%20%3CfeColorMatrix%20type%3D%22hueRotate%22%20values%3D%2227%22%20%2F%3E%0A%20%20%20%20%3C%2Ffilter%3E%0A%20%20%20%20%3CradialGradient%20id%3D%22rg1%22%20cx%3D%220.805%22%20cy%3D%220.499%22%20r%3D%221%22%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%238b5cf61e%22%20stop-opacity%3D%221%22%20%2F%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%2250%25%22%20stop-color%3D%22%238b5cf61e%22%20stop-opacity%3D%220%22%20%2F%3E%0A%20%20%20%20%3C%2FradialGradient%3E%0A%20%20%20%20%3Cfilter%20id%3D%22f1%22%3E%0A%20%20%20%20%20%20%3CfeColorMatrix%20type%3D%22hueRotate%22%20values%3D%222%22%20%2F%3E%0A%20%20%20%20%3C%2Ffilter%3E%0A%20%20%3C%2Fdefs%3E%0A%20%20%3Crect%20fill%3D%22none%22%20x%3D%220%25%22%20y%3D%220%25%22%20width%3D%22100%25%22%20height%3D%22100%25%22%20%2F%3E%0A%20%20%3Crect%20fill%3D%22url(%23rg0)%22%20filter%3D%22url(%23f0)%22%20x%3D%220%25%22%20y%3D%220%25%22%20width%3D%22100%25%22%20height%3D%22100%25%22%20%2F%3E%0A%20%20%3Crect%20fill%3D%22url(%23rg1)%22%20filter%3D%22url(%23f1)%22%20x%3D%220%25%22%20y%3D%220%25%22%20width%3D%22100%25%22%20height%3D%22100%25%22%20%2F%3E%0A%3C%2Fsvg%3E" />
  )

}

function Divider() {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-slate-400 flex-1 h-px" />
      <span className="text-sm text-neutral-500">or</span>
      <div className="bg-slate-400 flex-1 h-px" />
    </div>
  );
}

// Auth components
// ----------------------
function GoogleAuth() {
  const [error, setError] = useState(null);
  const [nonce] = useState(crypto.randomUUID());
  return (
    <GoogleOAuthProvider
      clientId="416673654793-s0grgnmg2s86h1re3ipaumqq64kloq7o.apps.googleusercontent.com"
      nonce={nonce}
    >
      <div className="flex justify-center items-center mt-4">
        <GoogleLogin
          nonce={nonce}
          onSuccess={(credentialResponse) => {
            const idToken = credentialResponse.credential;
            if (!idToken) {
              setError("Missing id_token.");
              return;
            }
            db.auth.signInWithIdToken({
              clientName: "instant-awedience",
              idToken,
              nonce,
            }).catch((err) => {
              console.log(err.body);
              alert("Uh oh: " + err.body?.message);
            });
          }}
          onError={() => {
            setError("Login failed.");
          }}
          type="standard"
        />
        {error}
      </div>
    </GoogleOAuthProvider>
  )
}

function Login() {
  const [sentEmail, setSentEmail] = useState('')
  return (
    <div className="h-screen p-4 sm:p-20 flex-1 justify-center items-center flex">
      {!sentEmail ? (
        <Email setSentEmail={setSentEmail} />
      ) : (
        <MagicCode sentEmail={sentEmail} />
      )}
    </div>
  )
}

function Email({ setSentEmail }) {
  const [email, setEmail] = useState('')
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email) return
    setSentEmail(email)
    db.auth.sendMagicCode({ email }).catch((err) => {
      alert('Uh oh :' + err.body?.message)
      setSentEmail('')
    })
  }
  return (
    <div className={authContainerStyle}>
      <h5 className={authHeaderStyle}>Sign in with Email</h5>
      <p className={authSubheaderStyle}>We'll send you an email with a special link that you can use to sign in, no password needed!</p>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          className={inputStyle}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@email.com" />
        <AuthButton label="Send link" />
      </form >
      <Divider />
      <GoogleAuth />
      <Background />
    </div>
  );
}
function MagicCode({ sentEmail }) {
  const [code, setCode] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    db.auth.signInWithMagicCode({ email: sentEmail, code }).catch((err) => {
      alert('Uh oh :' + err.body?.message)
      setCode('')
    })
  }
  return (
    <form onSubmit={handleSubmit}>
      <div className={authContainerStyle}>
        <h5 className={authHeaderStyle}>Enter your code</h5>
        <p className={authSubheaderStyle}>We'll send you an email with a special link that you can use to sign in, no password needed!</p>
        <input
          className={inputStyle}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="12345..." />
        <AuthButton label="Verify" />
      </div>
      <Background />
    </form >
  );
}

// Dashboard
// ----------------------
function Main({ user }) {
  return (
    <div>
      <div className="text-lg">Welcome {user.email}</div>
      <button onClick={() => { db.auth.signOut() }}>Sign Out</button>
    </div>
  )
}

// App
// ----------------------
function App() {
  const { isLoading, user, error } = useAuth(db)
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (user) return <Main user={user} />
  return <Login />
}

export default App
