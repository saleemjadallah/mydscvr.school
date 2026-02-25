"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Loader2, Save, Bell, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { UserNotificationPrefs } from "@/types";

export default function NotificationsTab() {
  const [prefs, setPrefs] = useState<UserNotificationPrefs | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Local form state
  const [emailEnquiryUpdates, setEmailEnquiryUpdates] = useState(true);
  const [emailSchoolNews, setEmailSchoolNews] = useState(false);
  const [emailWeeklyDigest, setEmailWeeklyDigest] = useState(false);
  const [noResponseDays, setNoResponseDays] = useState(7);

  useEffect(() => {
    async function fetchPrefs() {
      try {
        const res = await fetch("/api/user/notification-prefs");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setPrefs(data.prefs);
        setEmailEnquiryUpdates(data.prefs.email_enquiry_updates);
        setEmailSchoolNews(data.prefs.email_school_news);
        setEmailWeeklyDigest(data.prefs.email_weekly_digest);
        setNoResponseDays(data.prefs.enquiry_no_response_days);
      } catch {
        toast.error("Failed to load notification preferences");
      } finally {
        setLoading(false);
      }
    }

    fetchPrefs();
  }, []);

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
        <p className="mt-3 text-sm text-gray-500">Loading preferences...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Email Notifications */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border bg-white p-6 shadow-sm"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#FF6B35]/10">
            <Mail className="size-5 text-[#FF6B35]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Email Notifications
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
        transition={{ delay: 0.1 }}
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
          <Label htmlFor="noResponseDays" className="text-sm text-gray-700 whitespace-nowrap">
            Remind me after
          </Label>
          <Input
            id="noResponseDays"
            type="number"
            min="1"
            max="30"
            value={noResponseDays}
            onChange={(e) =>
              setNoResponseDays(Math.max(1, Math.min(30, parseInt(e.target.value) || 7)))
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
        transition={{ delay: 0.2 }}
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
