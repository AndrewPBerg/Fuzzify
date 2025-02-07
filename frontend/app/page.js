"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/backend") // ✅ Call Next.js API instead of Flask directly
      .then((res) => res.json())
      .then((data) => setUsers(data.users || []))
      .catch((err) => setError("Error fetching users"));
  }, []);

  return (
    <div>
      <h1>React + Next.js Connected to Flask + MySQL</h1>
      {error ? <p style={{ color: "red" }}>{error}</p> : null}
      <h2>Users List</h2>
      <ul>
        {users.length > 0 ? (
          users.map((user) => (
            <li key={user.id}>{user.name} ({user.email})</li>
          ))
        ) : (
          <p>Loading users...</p>
        )}
      </ul>
    </div>
  );
}

