import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import UserInitialAvatar from './UserInitialAvatar';

export default function RightColumn({ currentUser, posts }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(ref.current?.children || [], { 
        y: 20, 
        opacity: 0, 
        stagger: 0.12, 
        duration: 0.5, 
        ease: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  const getDynamicTrends = () => {
    if (!posts || posts.length === 0) {
      return [
        { id: 'trend-compilation', label: '#compilation', score: '0.0k', meta: 'No active data nodes' },
        { id: 'trend-fastapi', label: '#fastapi', score: '0.0k', meta: 'Waiting for entries' }
      ];
    }

    const rankedPosts = posts.map((p, idx) => {
      const commentCount = p.comments?.length || 0;
      const likesCount = p.likes?.length || 0;
      const computedScore = 5.2 + (commentCount * 1.5) + (likesCount * 0.8); 
      const uniqueLabel = p.author?.username ? `#${p.author.username.toLowerCase()}` : `#entry_${idx + 1}`;
      
      return {
        // FIXED: Create a unique id incorporating the post's distinct ID structure to prevent duplicates
        id: `trend-${p.id || idx}`, 
        label: uniqueLabel,
        score: `${computedScore.toFixed(1)}k`,
        meta: `Ranked #${idx + 1} • Active Feed`,
        activitySum: commentCount + likesCount
      };
    });

    return rankedPosts.sort((a, b) => b.activitySum - a.activitySum).slice(0, 5);
  };

  return (
    <aside ref={ref} className="fc-rightcol">
      {currentUser && (
        <div className="fc-flat-card" style={{ opacity: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="fc-author-avatar" style={{ width: 44, height: 44 }}>
              <UserInitialAvatar targetName={currentUser.name} targetHandle={currentUser.username} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14.5px' }}>{currentUser.name}</div>
              <div style={{ color: 'var(--fc-text-muted)', fontSize: 12.5 }}>@{currentUser.username}</div>
            </div>
          </div>
        </div>
      )}

      <div className="fc-flat-card" style={{ opacity: 0 }}>
        <h3 className="fc-panel-title">Trending tags</h3>
        {getDynamicTrends().map((t) => (
          /* FIXED: Swapped out non-unique t.label for the guaranteed unique t.id hook */
          <div key={t.id} className="fc-trend">
            <div>
              <div className="fc-trend-meta">{t.meta}</div>
              <div className="fc-trend-tag">{t.label}</div>
            </div>
            <div className="fc-trend-meta">{t.score}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}
