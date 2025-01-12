"use client";

import { useState, FormEvent } from "react";
import { supabase } from "../../../supabase";
import { useRouter } from "next/navigation";
import styled from "styled-components";

// Styled components
const Container = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Heading = styled.h1`
  text-align: center;
  font-size: 2rem;
  color: #333;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 1rem;
  margin-bottom: 5px;
  color: #555;
`;

const Input = styled.input`
  padding: 12px;
  margin-bottom: 15px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  outline: none;
  &:focus {
    border-color: #0070f3;
  }
`;

const Button = styled.button`
  padding: 12px;
  background-color: #0070f3;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  &:disabled {
    background-color: #ccc;
  }
  &:hover {
    background-color: #005bb5;
  }
`;

const ErrorText = styled.p`
  color: red;
  text-align: center;
  font-size: 0.9rem;
`;

const SignUpLink = styled.p`
  text-align: center;
  margin-top: 10px;
  font-size: 1rem;
`;

const Link = styled.a`
  color: #0070f3;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      router.push("/dashboard"); // Redirect to the dashboard on successful login
    }
  };

  return (
    <Container>
      <Heading>Login</Heading>
      <Form onSubmit={handleLogin}>
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <Label>Password</Label>
          <Input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
      </Form>
      {error && <ErrorText>{error}</ErrorText>}
      <SignUpLink>
        Don’t have an account? <Link href="/signup">Sign up</Link>
      </SignUpLink>
    </Container>
  );
};

export default Login;
