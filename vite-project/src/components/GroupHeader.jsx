// src/components/GroupHeader.jsx
import React from 'react';
import { groupInfo } from '../data/mockData';
// import './GroupHeader.css';

const GroupHeader = () => {
  const { name, description, membersCount, therapists, image } = groupInfo;
  return (
    <header className="group-header">
      {image && <img src={image} alt="Group" className="group-image" />}
      <div className="group-info">
        <h1 className="group-name">{name}</h1>
        <p className="group-desc">{description}</p>
        <div className="group-meta">
          <span className="members-count">👥 {membersCount} members</span>
          <div className="therapists-avatars">
            {therapists.map(t => (
              <img key={t.id} src={t.avatar} alt={t.name} className="therapist-avatar" title={t.name} />
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default GroupHeader;
