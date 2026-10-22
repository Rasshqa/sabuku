"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      identifier: data.identifier,
      password: data.password,
    });

    if (res?.error) {
      setError("NISN/Email atau password salah");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div 
      style={{ 
        backgroundColor: '#F7F7F8',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 1rem'
      }}
    >
      <div 
        style={{
          maxWidth: '28rem',
          width: '100%',
          padding: '2.5rem',
          backgroundColor: 'white',
          borderRadius: '24px',
          boxShadow: '0 6px 24px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            <span style={{ color: '#FFCDB8' }}>SA</span>
            <span style={{ color: '#B9E6E8' }}>BUKU</span>
          </h2>
          <p style={{ color: '#4B5563', marginTop: '1rem', fontSize: '1rem' }}>
            Satu Orang Satu Buku
          </p>
          <p style={{ color: '#9CA3AF', marginTop: '0.5rem', fontSize: '0.875rem' }}>
            Platform literasi digital SMKN 1 Cianjur
          </p>
        </div>

        <form style={{ marginTop: '2rem' }} onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div 
              style={{
                padding: '1rem',
                borderRadius: '12px',
                fontSize: '0.875rem',
                textAlign: 'center',
                backgroundColor: '#FEE2E2',
                color: '#B91C1C',
                marginBottom: '1.5rem'
              }}
            >
              {error}
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: '#374151',
                marginBottom: '0.5rem'
              }}
            >
              NISN (Siswa) atau Email (Guru)
            </label>
            <input
              type="text"
              {...register("identifier")}
              placeholder="Masukkan NISN atau Email"
              style={{
                display: 'block',
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid #D1D5DB',
                borderRadius: '12px',
                fontSize: '1rem',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#F2B5D4'
                e.target.style.boxShadow = '0 0 0 3px rgba(242, 181, 212, 0.1)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#D1D5DB'
                e.target.style.boxShadow = 'none'
              }}
            />
            {errors.identifier && (
              <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#DC2626' }}>
                {errors.identifier.message}
              </p>
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: '#374151',
                marginBottom: '0.5rem'
              }}
            >
              Password
            </label>
            <input
              type="password"
              {...register("password")}
              placeholder="Masukkan password"
              style={{
                display: 'block',
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid #D1D5DB',
                borderRadius: '12px',
                fontSize: '1rem',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#F2B5D4'
                e.target.style.boxShadow = '0 0 0 3px rgba(242, 181, 212, 0.1)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#D1D5DB'
                e.target.style.boxShadow = 'none'
              }}
            />
            {errors.password && (
              <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#DC2626' }}>
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              backgroundColor: loading ? '#F2B5D4' : '#F2B5D4',
              color: 'white',
              fontWeight: '500',
              borderRadius: '12px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              transition: 'all 0.2s',
              fontSize: '1rem'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(242, 181, 212, 0.4)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
            Siswa login dengan NISN. Guru/Admin menggunakan email.
          </p>
        </div>
      </div>
    </div>
  );
}
