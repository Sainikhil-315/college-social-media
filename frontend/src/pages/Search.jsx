import React, { useState, useEffect } from "react";
import { userAPI } from "../api/user";
import { Link } from "react-router-dom";

const Search = () => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (query.trim() !== "") {
        try {
          const response = await userAPI.searchUser(query.trim());
          setUsers(response);
        } catch (err) {
          console.error("Search error:", err);
        }
      } else {
        setUsers([]); // Clear results if query is empty
      }
    }, 500); // 500ms debounce
    return () => clearTimeout(delayDebounce);
  }, [query]);
  return (
    <div className="m-5">
      <label htmlFor="search">Search:</label>
      <br />
      <input
        type="search"
        id="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border-2 w-full h-10 rounded-2xl p-3"
        placeholder="Search by name"
      />

      <div className="mt-4">
        {users.length === 0 && query.trim() !== "" && <p>No users found.</p>}
        {users.map((user) => (
          <Link key={user._id} to={"/profile/" + `${user._id}`}>
            <div
            key={user._id}
            className="p-2 border-b flex justify-between items-center cursor-pointer"
          >
            {/* Grouping photo and name together */}
            <div className="flex items-center gap-3">
              <img
                src={user.profilePic}
                alt={user.name}
                width={50}
                className="rounded-full"
              />
              <div>
                <h3 className="font-bold">{user.name}</h3>
                <p>{user.regd_no}</p>
              </div>
            </div>

            {/* Follow button on the right */}
            <button className="rounded-xl bg-blue-500 text-white px-4 py-1 hover:bg-blue-600">
              Follow
            </button>
          </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Search;
