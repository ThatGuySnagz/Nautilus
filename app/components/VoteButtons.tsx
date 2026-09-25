'use client';

import { useTransition } from 'react';
import { vote } from '@/app/actions/questions';
import { ArrowBigUp, ArrowBigDown } from 'lucide-react';
import Icon from './Icon';
import { toast } from 'sonner';

interface Props {
  target: 'question' | 'answer';
  targetId: string;
  score: number;
  userVote: number; // 1 | -1 | 0
  questionIdForRevalidate?: string; // for answer votes
}

export function VoteButtons({ target, targetId, score, userVote, questionIdForRevalidate }: Props) {
  const [isPending, startTransition] = useTransition();

  async function handleVote(newValue: 1 | -1) {
    startTransition(async () => {
      try {
        // If clicking same vote again, we could remove, but our action always sets
        const effectiveValue = userVote === newValue ? 0 : newValue; // simplistic toggle
        if (effectiveValue === 0) {
          // For demo we just set opposite or ignore; current action always upserts
        }
        await vote(target, targetId, newValue);
        // The server revalidates the page
      } catch (e) {
        toast.error('You must be logged in to vote');
      }
    });
  }

  return (
    <div className="flex flex-col items-center gap-0.5 tabular-nums text-sm font-medium w-9">
      <button
        onClick={() => handleVote(1)}
        disabled={isPending}
        className={`vote-btn ${userVote === 1 ? 'active-up' : ''}`}
        aria-label="Upvote"
      >
        <Icon><ArrowBigUp className="h-5 w-5" /></Icon>
      </button>

      <div className={`font-semibold text-base ${userVote === 1 ? 'text-orange-500' : userVote === -1 ? 'text-blue-500' : ''}`}>
        {score}
      </div>

      <button
        onClick={() => handleVote(-1)}
        disabled={isPending}
        className={`vote-btn ${userVote === -1 ? 'active-down' : ''}`}
        aria-label="Downvote"
      >
        <Icon><ArrowBigDown className="h-5 w-5" /></Icon>
      </button>
    </div>
  );
}
