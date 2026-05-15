import { useState } from "react";

import { useParams, useNavigate } from "react-router-dom";

import { api } from "../services/api";

export default function ResetPassword() {

  const { token } = useParams();

  const navigate = useNavigate();

  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const submitHandler = async (e) => {

    e.preventDefault();

    setMessage("");
    setError("");

    try {

      const data = await api.post(
        `/auth/reset-password/${token}`,
        { password }
      );

      setMessage(data.message);

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {

      setError(
        err.message || "Something went wrong"
      );

    }

  };

  return (

    <div className="auth-wrap">

      <div className="auth-card">

        <h1>Reset Password</h1>

        <form
          onSubmit={submitHandler}
          className="form"
        >

          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />

          <button
            className="btn btn-primary"
            type="submit"
          >
            Reset Password
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