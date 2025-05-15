import React, { useEffect, useState } from "react";
import { userAPI } from "../api/user";
import { useParams } from "react-router-dom";

const Following = () => {
  const { userId } = useParams();
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const { following: newFollowing } = await userAPI.getFollowing(userId);
        if (JSON.stringify(newFollowing) !== JSON.stringify(following)) {
          setFollowing(newFollowing);
        }
      } catch (error) {
        console.error("Error fetching following:", error);
      }
    };
    fetchFollowing();
  }, [userId]);

  return (
    <div>
      <h2 className="text-center text-lg font-bold ">Following List</h2>
      <div className="flex justify-center">
        {following.map((following, index) => (
          <Link to={"/profile/" + `${following._id}`} key={following._id}>
            <div className="p-2 w-200 border-b flex justify-between items-center cursor-pointer">
              {/* Grouping photo and name together */}
              <div className="flex items-center gap-3">
                <img
                  src={following.profilePic}
                  alt={following.name}
                  width={50}
                  className="rounded-full"
                />
                <div>
                  <h3 className="font-bold">{following.name}</h3>
                  <p>{following.regd_no}</p>
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

export default Following;
