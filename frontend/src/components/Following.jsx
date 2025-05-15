import React, { useEffect, useState } from 'react';
import { userAPI } from '../api/user';
import { useParams } from 'react-router-dom';

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
                console.error("Error fetching followers:", error);
            }
        };
        fetchFollowing();
    }, [userId]);

    return (
        <div>
            <h2>Following List</h2>
            <p>Total Following: {following.length}</p>
            <div>
                {following.map((following, index) => (
                    <div key={index}>{following.name}</div>
                ))}
            </div>
        </div>
    );
};

export default Following;
