import { useState } from "react";
import { api } from "../services/api";

export default function ForgotPassword() {

  const [email, setEmail] = useState("");

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const submitHandler = async (e) => {

    e.preventDefault();

    setMessage("");
    setError("");

    try {

      const data = await api.post(
        "/auth/forgot-password",
        { email }
      );

      setMessage(data.message);

    } catch (err) {

      setError(
        err.message || "Something went wrong"
      );

    }

  };

  return (

    <div className="auth-wrap">

      <div className="auth-card">

        <h1>Forgot Password</h1>

        <form
          onSubmit={submitHandler}
          className="form"
        >

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          <button
            className="btn btn-primary"
            type="submit"
          >
            Send Reset Link
          </button>

        </form>

        {message && (
          <p>{message}</p>
        )}

        {error && (
          <p style={{ color: "red" }}>
            {error}
          </p>
        )}

      </div>

    </div>

  );

}