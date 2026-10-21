import { useState } from "react";
import { useLogin } from "../features/auth/hooks/useLogin";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const { mutate, isLoading } = useLogin();

  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    mutate(formData, {
      onSuccess: () => {
        navigate("/");
      },
    });
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-6 bg-white rounded-xl shadow"
      >
        <h1 className="text-2xl font-bold mb-5">
          Login
        </h1>

        <input
          name="email"
          type="email"
          placeholder="Email"
          autoComplete="email"
          className="w-full border p-3 mb-4 rounded"
          onChange={(e) =>
            setFormData({
              ...formData,
              email: e.target.value,
            })
          }
        />

        <div className="relative mb-4">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            autoComplete="current-password"
            className="w-full border p-3 pr-11 rounded outline-none focus:border-gray-400 transition"
            onChange={(e) =>
              setFormData({
                ...formData,
                password: e.target.value,
              })
            }
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1 cursor-pointer"
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>

        <button
          disabled={isLoading}
          className="w-full bg-black text-white p-3 rounded"
        >
          {isLoading ? "Loading..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;