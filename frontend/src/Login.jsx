import { useState } from "react";
import { auth } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const userCred = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      setUser(userCred.user);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white">

      <div className="bg-white/10 p-8 rounded-xl backdrop-blur-md">
        <h2 className="text-2xl mb-4">Login</h2>

        <input
          className="mb-3 p-2 rounded text-black"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="mb-3 p-2 rounded text-black"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="bg-purple-500 px-4 py-2 rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default Login;