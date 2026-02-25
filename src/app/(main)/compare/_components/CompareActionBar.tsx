'use client';

import { Share2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface CompareActionBarProps {
  schoolSlugs: string[];
}

export default function CompareActionBar({ schoolSlugs }: CompareActionBarProps) {
  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/compare?schools=${schoolSlugs.join(',')}`
      : '';

  async function handleShare() {
    // Try native share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'School Comparison — mydscvr.ai',
          text: 'Check out this school comparison on mydscvr.ai',
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled or not supported — fall through to clipboard
      }
    }

    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Failed to copy link');
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="compare-action-bar">
      {/* Desktop: inline */}
      <div className="hidden items-center gap-2 md:flex">
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="text-xs"
        >
          <Share2 className="mr-1.5 h-3.5 w-3.5" />
          Share
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="text-xs"
        >
          <Printer className="mr-1.5 h-3.5 w-3.5" />
          Print
        </Button>
      </div>

      {/* Mobile: fixed bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/80 backdrop-blur-lg p-2 sm:p-3 md:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-1.5 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="flex-1 text-xs h-9"
          >
            <Share2 className="mr-1 h-3.5 w-3.5" />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="flex-1 text-xs h-9"
          >
            <Printer className="mr-1 h-3.5 w-3.5" />
            Print
          </Button>
        </div>
      </div>
    </div>
  );
}
