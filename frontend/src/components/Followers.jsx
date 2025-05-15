import React, { useEffect, useState } from "react";
import { userAPI } from "../api/user";
import { Link, useParams } from "react-router-dom";

const Followers = () => {
  const { userId } = useParams();
  const [followers, setFollowers] = useState([]);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const { followers: newFollowers } = await userAPI.getFollowers(userId);
        if (JSON.stringify(newFollowers) !== JSON.stringify(followers)) {
          setFollowers(newFollowers);
        }
      } catch (error) {
        console.error("Error fetching followers:", error);
      }
    };
    fetchFollowers();
  }, [userId]);

  return (
    <div>
      <h2 className='text-center text-lg font-bold '>Followers List</h2>
      <div className="flex justify-center">
        {followers.map((follower, index) => (
          <Link to={"/profile/" + `${follower._id}`} key={follower._id}>
            <div className="p-2 w-200 border-b flex justify-between items-center cursor-pointer">
              {/* Grouping photo and name together */}
              <div className="flex items-center gap-3">
                <img
                  src={follower.profilePic}
                  alt={follower.name}
                  width={50}
                  className="rounded-full"
                />
                <div>
                  <h3 className="font-bold">{follower.name}</h3>
                  <p>{follower.regd_no}</p>
                </div>
              </div>
              {/* Follow button on the right */}
              <button className="rounded-xl border-2 px-4 py-1">Remove</button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Followers;
