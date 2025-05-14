import React, { useEffect, useState } from 'react';
import { userAPI } from '../api/user';
import { useParams } from 'react-router-dom';

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
            <h2>Followers List</h2>
            <p>Total Followers: {followers.length}</p>
            <div>
                {followers.map((follower, index) => (
                    <div key={index}>{follower.name}</div>
                ))}
            </div>
        </div>
    );
};

export default Followers;
