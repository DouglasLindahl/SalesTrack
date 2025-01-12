"use client";

import { useState, FormEvent } from "react";
import { supabase } from "../../../supabase";
import { useRouter } from "next/navigation";
import styled from "styled-components";

// Styled Components
const Container = styled.div`
  max-width: 600px;
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
  font-size: 1.2rem;
  cursor: pointer;
  &:hover {
    background-color: #005bb5;
  }
`;

const ErrorText = styled.p`
  color: red;
  text-align: center;
  font-size: 0.9rem;
`;

const AddSale = () => {
  const [name, setName] = useState<string>("");
  const [number, setNumber] = useState<string>("");
  const [installDate, setInstallDate] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleAddSale = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Reset the error state

    // Real form validation
    if (!name || !number || !installDate) {
      setLoading(false);
      setError("All fields must be filled out.");
      return;
    }

    // Validate phone number (example regex for Swedish phone numbers)
    const phoneRegex = /^[\d]{10}$/; // Adjust the regex according to your format
    if (!phoneRegex.test(number)) {
      setLoading(false);
      setError("Invalid phone number format.");
      return;
    }

    // Validate the install date (it should not be in the past)
    const installDateObj = new Date(installDate);
    const currentDate = new Date();
    if (installDateObj < currentDate) {
      setLoading(false);
      setError("Install date cannot be in the past.");
      return;
    }

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      setLoading(false);
      setError("Failed to authenticate user. Please log in again.");
      return;
    }

    if (!user) {
      setLoading(false);
      setError("No user is logged in. Please log in first.");
      return;
    }

    // Insert new sale into Supabase
    const { error: insertError } = await supabase.from("sales").insert([
      {
        name,
        number,
        install_date: installDate,
        status: "not called",
        user_id: user.id,
      },
    ]);

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
    } else {
      router.push("/dashboard"); // Redirect to the dashboard if successful
    }
  };

  return (
    <Container>
      <Heading>Add Sale</Heading>
      <Form onSubmit={handleAddSale}>
        <div>
          <Label>Sale Name</Label>
          <Input
            type="text"
            placeholder="Enter sale name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <Label>Phone Number</Label>
          <Input
            type="text"
            placeholder="ex: 0735301569"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
          />
        </div>
        <div>
          <Label>Install Date</Label>
          <Input
            type="date"
            value={installDate}
            onChange={(e) => setInstallDate(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Adding Sale..." : "Add Sale"}
        </Button>
      </Form>
      {error && <ErrorText>{error}</ErrorText>}
    </Container>
  );
};

export default AddSale;
