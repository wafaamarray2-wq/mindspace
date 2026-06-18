// src/components/GroupPage.jsx
import React from 'react';
import GroupHeader from './GroupHeader';
// import MoodCheckinCard from './MoodCheckinCard';
import GroupChat from './GroupChat';
// import MembersSidebar from './MembersSidebar';
// import './GroupPage.css';

const GroupPage = () => {
  return (
    <div className="group-page">
      <GroupHeader />
      <MoodCheckinCard />
      <div className="content-wrapper">
        <GroupChat />
        <MembersSidebar />
      </div>
    </div>
  );
};

export default GroupPage;
