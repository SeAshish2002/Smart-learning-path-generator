// Study Groups page - collaborative learning features
import React, { useState } from 'react';
import './StudyGroups.css';

const StudyGroups = () => {
  const [groups] = useState([]);

  return (
    <div className="study-groups-page">
      <div className="container">
        <h1>Study Groups</h1>
        
        <div className="card">
          <h2>Coming Soon!</h2>
          <p>
            The study groups feature is currently under development. 
            Soon you'll be able to:
          </p>
          <ul>
            <li>Create and join study groups</li>
            <li>Collaborate with peers on learning paths</li>
            <li>Share progress and achievements</li>
            <li>Participate in group discussions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StudyGroups;

