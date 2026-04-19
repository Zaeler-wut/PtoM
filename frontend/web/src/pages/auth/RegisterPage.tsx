import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { RiEyeLine, RiEyeOffLine, RiHome2Line } from "react-icons/ri";
import { authApi } from "../../api/auth/authApi";
import { registerSchema, type RegisterFormData } from "../../schemas/authSchema";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await authApi.register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      navigate("/login", { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error ?? "เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center mb-3">
            <RiHome2Line className="text-white/70 text-lg" />
          </div>
          <h1 className="text-white text-xl font-semibold">Create Account</h1>
          <p className="text-white/40 text-sm mt-1">Fill in the details to get started.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
          {/* First + Last Name */}
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                placeholder="ชื่อ"
                {...register("firstName")}
                className={`w-full bg-white/[0.06] border rounded-xl px-4 py-3 text-sm text-white/85 placeholder:text-white/25 outline-none focus:border-white/30 transition-colors ${errors.firstName ? "border-red-500/60" : "border-white/12"}`}
              />
              {errors.firstName && <p className="text-red-400 text-xs mt-1 ml-1">{errors.firstName.message}</p>}
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="นามสกุล"
                {...register("lastName")}
                className={`w-full bg-white/[0.06] border rounded-xl px-4 py-3 text-sm text-white/85 placeholder:text-white/25 outline-none focus:border-white/30 transition-colors ${errors.lastName ? "border-red-500/60" : "border-white/12"}`}
              />
              {errors.lastName && <p className="text-red-400 text-xs mt-1 ml-1">{errors.lastName.message}</p>}
            </div>
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Enter your email address"
              autoComplete="email"
              {...register("email")}
              className={`w-full bg-white/[0.06] border rounded-xl px-4 py-3 text-sm text-white/85 placeholder:text-white/25 outline-none focus:border-white/30 transition-colors ${errors.email ? "border-red-500/60" : "border-white/12"}`}
            />
            {errors.email && <p className="text-red-400 text-xs mt-1 ml-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                autoComplete="new-password"
                {...register("password")}
                className={`w-full bg-white/[0.06] border rounded-xl px-4 py-3 pr-11 text-sm text-white/85 placeholder:text-white/25 outline-none focus:border-white/30 transition-colors ${errors.password ? "border-red-500/60" : "border-white/12"}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/60 transition-colors"
              >
                {showPassword ? <RiEyeOffLine className="text-base" /> : <RiEyeLine className="text-base" />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1 ml-1">{errors.password.message}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm Password"
                autoComplete="new-password"
                {...register("confirmPassword")}
                className={`w-full bg-white/[0.06] border rounded-xl px-4 py-3 pr-11 text-sm text-white/85 placeholder:text-white/25 outline-none focus:border-white/30 transition-colors ${errors.confirmPassword ? "border-red-500/60" : "border-white/12"}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/60 transition-colors"
              >
                {showConfirm ? <RiEyeOffLine className="text-base" /> : <RiEyeLine className="text-base" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1 ml-1">{errors.confirmPassword.message}</p>}
          </div>

          {/* API Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-black font-medium text-sm py-3 rounded-xl hover:bg-white/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                Creating account...
              </>
            ) : "Create Account"}
          </button>

          {/* Link to Login */}
          <p className="text-center text-white/40 text-xs">
            Already have an account?{" "}
            <Link to="/login" className="text-white/70 hover:text-white transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
