"use client";  // This tells Next.js it's a Client Component

import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5001/")  // Fetch from Flask API
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => setError("Error fetching data"));
  }, []);

  return (
    <div>
      <h1>React + Next.js Connected to Flask</h1>
      {error ? <p style={{ color: "red" }}>{error}</p> : null}
      <p>Data from Flask: {data ? JSON.stringify(data) : "Loading..."}</p>
    </div>
  );
}
