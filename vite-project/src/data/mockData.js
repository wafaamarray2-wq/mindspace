// src/data/mockData.js
export const groupInfo = {
  name: "Healing Minds Support Group",
  description: "A safe space for sharing experiences and receiving therapist guidance.",
  membersCount: 12,
  therapists: [
    { id: 1, name: "Dr. Lena Ortiz", avatar: "https://i.pravatar.cc/40?img=1" },
    { id: 2, name: "Dr. Raj Patel", avatar: "https://i.pravatar.cc/40?img=2" }
  ],
  image: "https://picsum.photos/seed/group/80/80"
};

export const members = [
  { id: 1, name: "Alice", avatar: "https://i.pravatar.cc/40?img=3", role: "patient" },
  { id: 2, name: "Bob", avatar: "https://i.pravatar.cc/40?img=4", role: "patient" },
  { id: 3, name: "Catherine", avatar: "https://i.pravatar.cc/40?img=5", role: "patient" },
  // add more mock members as needed
];

export const messages = [
  {
    id: 1,
    author: { id: 1, name: "Dr. Lena Ortiz", avatar: "https://i.pravatar.cc/40?img=1", isTherapist: true },
    content: "Welcome everyone! Remember you can share how you feel today.",
    timestamp: "2026-06-17T08:00:00Z",
    reactions: []
  },
  {
    id: 2,
    author: { id: 2, name: "Alice", avatar: "https://i.pravatar.cc/40?img=3", isTherapist: false },
    content: "Feeling a bit anxious today.",
    timestamp: "2026-06-17T08:05:12Z",
    reactions: [{ type: "support", count: 1 }]
  },
  // more messages
];

export const pinnedMessages = [
  {
    id: 101,
    content: "Next group session: Friday 6 pm (Zoom link will be shared soon).",
    author: { name: "Dr. Raj Patel" }
  }
];

export const resources = [
  { id: 201, title: "Managing Anxiety", type: "pdf", url: "#", thumbnail: "https://picsum.photos/seed/res1/60/80" },
  { id: 202, title: "Mindfulness Exercise Video", type: "video", url: "#", thumbnail: "https://picsum.photos/seed/res2/60/80" }
];

export const weeklyGoal = {
  title: "Practice gratitude journaling",
  progress: 40 // percent
};

export const progressStreak = {
  days: 3
};
