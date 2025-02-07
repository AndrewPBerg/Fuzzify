export async function GET() {
    try {
      const response = await fetch("http://capstone-backend:5000/users", {
        method: "GET",
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch users from Flask API");
      }
  
      const data = await response.json();
      return Response.json(data);
    } catch (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  }
  