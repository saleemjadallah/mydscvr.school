"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Loader2,
  Save,
  Bell,
  Mail,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { UserNotificationPrefs, EnquiryNotification } from "@/types";

export default function NotificationsTab() {
  const [prefs, setPrefs] = useState<UserNotificationPrefs | null>(null);
  const [notifications, setNotifications] = useState<EnquiryNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Local form state
  const [emailEnquiryUpdates, setEmailEnquiryUpdates] = useState(true);
  const [emailSchoolNews, setEmailSchoolNews] = useState(false);
  const [emailWeeklyDigest, setEmailWeeklyDigest] = useState(false);
  const [noResponseDays, setNoResponseDays] = useState(7);

  useEffect(() => {
    async function fetchData() {
      try {
        const [prefsRes, notifsRes] = await Promise.all([
          fetch("/api/user/notification-prefs"),
          fetch("/api/user/notifications"),
        ]);

        if (prefsRes.ok) {
          const data = await prefsRes.json();
          setPrefs(data.prefs);
          setEmailEnquiryUpdates(data.prefs.email_enquiry_updates);
          setEmailSchoolNews(data.prefs.email_school_news);
          setEmailWeeklyDigest(data.prefs.email_weekly_digest);
          setNoResponseDays(data.prefs.enquiry_no_response_days);
        }

        if (notifsRes.ok) {
          const data = await notifsRes.json();
          setNotifications(data.notifications ?? []);
        }
      } catch {
        toast.error("Failed to load notification data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/user/notifications/${id}`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error("Failed");
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, read_at: new Date().toISOString() } : n
        )
      );
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const onSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/notification-prefs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email_enquiry_updates: emailEnquiryUpdates,
          email_school_news: emailSchoolNews,
          email_weekly_digest: emailWeeklyDigest,
          enquiry_no_response_days: noResponseDays,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");
      const data = await res.json();
      setPrefs(data.prefs);
      toast.success("Notification preferences saved!");
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-[#FF6B35]" />
        <p className="mt-3 text-sm text-gray-500">Loading notifications...</p>
      </div>
    );
  }

  const unreadNotifs = notifications.filter((n) => !n.read_at);
  const readNotifs = notifications.filter((n) => n.read_at);

  return (
    <div className="space-y-8">
      {/* Notification List */}
      {notifications.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border bg-white shadow-sm"
        >
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50">
                <Bell className="size-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Notifications
                </h2>
                {unreadNotifs.length > 0 && (
                  <p className="text-xs text-amber-600">
                    {unreadNotifs.length} unread
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {unreadNotifs.map((notif) => (
              <NotificationItem
                key={notif.id}
                notification={notif}
                onMarkRead={markAsRead}
              />
            ))}
            {readNotifs.map((notif) => (
              <NotificationItem
                key={notif.id}
                notification={notif}
                onMarkRead={markAsRead}
              />
            ))}
          </div>
        </motion.section>
      )}

      {notifications.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border bg-white p-8 text-center shadow-sm"
        >
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-gray-50">
            <Bell className="size-7 text-gray-300" />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-gray-900">
            No notifications yet
          </h3>
          <p className="mx-auto mt-1 max-w-xs text-xs text-gray-500">
            You&apos;ll receive notifications here when schools haven&apos;t
            responded to your enquiries within your configured timeframe.
          </p>
        </motion.div>
      )}

      {/* Email Notification Preferences */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border bg-white p-6 shadow-sm"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#FF6B35]/10">
            <Mail className="size-5 text-[#FF6B35]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Email Preferences
            </h2>
            <p className="text-xs text-gray-500">
              Choose which emails you&apos;d like to receive.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium text-gray-900">
                Enquiry updates
              </Label>
              <p className="text-xs text-gray-500">
                Get notified when schools respond to your enquiries.
              </p>
            </div>
            <Switch
              checked={emailEnquiryUpdates}
              onCheckedChange={setEmailEnquiryUpdates}
            />
          </div>

          <div className="border-t border-gray-100" />

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium text-gray-900">
                School news
                <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                  Coming soon
                </span>
              </Label>
              <p className="text-xs text-gray-500">
                News and updates about your saved schools.
              </p>
            </div>
            <Switch
              checked={emailSchoolNews}
              onCheckedChange={setEmailSchoolNews}
            />
          </div>

          <div className="border-t border-gray-100" />

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium text-gray-900">
                Weekly digest
                <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                  Coming soon
                </span>
              </Label>
              <p className="text-xs text-gray-500">
                A weekly summary of your activity and new schools matching your
                preferences.
              </p>
            </div>
            <Switch
              checked={emailWeeklyDigest}
              onCheckedChange={setEmailWeeklyDigest}
            />
          </div>
        </div>
      </motion.section>

      {/* No-Response Reminders */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border bg-white p-6 shadow-sm"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50">
            <Clock className="size-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              No-Response Reminders
            </h2>
            <p className="text-xs text-gray-500">
              Get alerted when a school hasn&apos;t responded to your enquiry
              within your configured timeframe.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Label
            htmlFor="noResponseDays"
            className="text-sm text-gray-700 whitespace-nowrap"
          >
            Remind me after
          </Label>
          <Input
            id="noResponseDays"
            type="number"
            min="1"
            max="30"
            value={noResponseDays}
            onChange={(e) =>
              setNoResponseDays(
                Math.max(1, Math.min(30, parseInt(e.target.value) || 7))
              )
            }
            className="w-20"
          />
          <span className="text-sm text-gray-500">days</span>
        </div>
      </motion.section>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-end"
      >
        <Button
          onClick={onSave}
          disabled={saving}
          className="bg-[#FF6B35] px-8 py-3 text-base text-white hover:bg-[#e55a2a]"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 size-4" />
              Save Preferences
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Notification item
// ---------------------------------------------------------------------------

function NotificationItem({
  notification,
  onMarkRead,
}: {
  notification: EnquiryNotification;
  onMarkRead: (id: string) => void;
}) {
  const isUnread = !notification.read_at;

  return (
    <div
      className={`flex items-start gap-4 px-6 py-4 ${
        isUnread ? "bg-amber-50/50" : ""
      }`}
    >
      <div
        className={`mt-0.5 flex size-8 flex-shrink-0 items-center justify-center rounded-lg ${
          isUnread ? "bg-amber-100" : "bg-gray-100"
        }`}
      >
        <AlertTriangle
          className={`size-4 ${isUnread ? "text-amber-600" : "text-gray-400"}`}
        />
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={`text-sm ${
            isUnread ? "font-medium text-gray-900" : "text-gray-600"
          }`}
        >
          {notification.message}
        </p>
        <div className="mt-1.5 flex items-center gap-3">
          <span className="text-xs text-gray-400">
            {formatTimeAgo(notification.created_at)}
          </span>
          {notification.school_slug && (
            <Link
              href={`/schools/${notification.school_slug}`}
              className="inline-flex items-center gap-1 text-xs text-[#FF6B35] hover:underline"
            >
              View school
              <ExternalLink className="size-3" />
            </Link>
          )}
        </div>
      </div>

      {isUnread && (
        <button
          type="button"
          onClick={() => onMarkRead(notification.id)}
          className="flex-shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          title="Mark as read"
        >
          <CheckCircle2 className="size-4" />
        </button>
      )}
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}
