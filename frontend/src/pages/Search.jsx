import React, { useState, useEffect } from "react";
import { userAPI } from "../api/user";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Search = () => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const { user } = useAuth();

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
        {users.map((person) => (
          <Link key={person._id} to={"/profile/" + `${person._id}`}>
            <div
              key={person._id}
              className="p-2 border-b flex justify-between items-center cursor-pointer"
            >
              {/* Grouping photo and name together */}
              <div className="flex items-center gap-3">
                <img
                  src={person.profilePic}
                  alt={person.name}
                  width={50}
                  className="rounded-full"
                />
                <div>
                  <h3 className="font-bold">{person.name}</h3>
                  <p>{person.regd_no}</p>
                </div>
              </div>

              {/* Follow button on the right */}
              {/* {user._id !== person._id &&
              (user.following.includes(person._id) ? (
                <button className="w-24 rounded-xl border-2 text-center px-5 py-1 hover:bg-blue-600 hover:text-white">
                  Remove
                </button>
              ) : (
                <button className="w-24 rounded-xl border-2 text-center px-5 py-1 hover:bg-blue-600 hover:text-white">
                  Follow
                </button>
              ))} */}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Search;
