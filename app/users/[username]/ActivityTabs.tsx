'use client';

import Link from 'next/link';
import { useState } from 'react';

type ActivityItem = {
  type: 'question' | 'answer' | 'discussion' | 'discussion_reply' | 'blog';
  title: string;
  href: string;
  date: Date;
  subtitle?: string;
};

interface ActivityTabsProps {
  posts: ActivityItem[];
  replies: ActivityItem[];
}

export default function ActivityTabs({ posts, replies }: ActivityTabsProps) {
  const [activeTab, setActiveTab] = useState<'posts' | 'replies'>('posts');
  const displayedActivity = activeTab === 'posts' ? posts : replies;

  return (
    <div>
      {/* Posts / Replies Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
            activeTab === 'posts'
              ? 'bg-zinc-800 text-zinc-100'
              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
        >
          Posts ({posts.length})
        </button>
        <button
          onClick={() => setActiveTab('replies')}
          className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
            activeTab === 'replies'
              ? 'bg-zinc-800 text-zinc-100'
              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
        >
          Replies ({replies.length})
        </button>
      </div>

      {displayedActivity.length > 0 ? (
        <div className="space-y-3">
          {displayedActivity.map((activity, index) => (
            <Link
              key={index}
              href={activity.href}
              className="block rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-1 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-baseline gap-2 text-sm">
                <span className="font-medium text-zinc-100">{activity.title}</span>
                <span className="text-zinc-400">•</span>
                <span className="text-zinc-400">{activity.subtitle}</span>
              </div>
              <div className="text-xs text-zinc-500 mt-0.5 text-[13px]">
                {activity.date.toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center text-sm text-zinc-400 py-8">
          No {activeTab} yet.
        </div>
      )}
    </div>
  );
}
