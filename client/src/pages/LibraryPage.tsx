import { useState } from "react";
import { useAuth } from "../context/UseAuth";

// Placeholder items: replace with data from the API.
const items = [
  {
    id: 1,
    title: "Introduction to Algorithms",
    tag: "Book",
    description: "Core data structures and algorithm design.",
  },
  {
    id: 2,
    title: "React Hooks Deep Dive",
    tag: "Article",
    description: "How useState, useEffect and friends really work.",
  },
  {
    id: 3,
    title: "REST API Design Notes",
    tag: "Notes",
    description: "Naming, status codes and versioning cheatsheet.",
  },
  {
    id: 4,
    title: "MongoDB Indexing",
    tag: "Video",
    description: "Compound indexes and query performance.",
  },
  {
    id: 5,
    title: "TypeScript Handbook",
    tag: "Docs",
    description: "Types, generics and narrowing.",
  },
  {
    id: 6,
    title: "System Design Basics",
    tag: "Course",
    description: "Scaling, caching and load balancing.",
  },
];

export default function Library() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");

  const filtered = items.filter((i) =>
    i.title.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Library</h1>
        <p className="opacity-70">
          Welcome back, {user?.name}. Here is everything in your library.
        </p>
      </div>

      <input
        type="search"
        placeholder="Search your library..."
        className="input w-full max-w-md"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {filtered.length === 0 ? (
        <div className="card card-border bg-base-100">
          <div className="card-body items-center py-12 text-center">
            <p className="text-lg font-semibold">Nothing found</p>
            <p className="opacity-70">Try a different search term.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="card card-border bg-base-100 transition hover:shadow-md"
            >
              <div className="card-body">
                <div className="badge badge-primary badge-soft">{item.tag}</div>
                <h2 className="card-title">{item.title}</h2>
                <p className="opacity-70">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
