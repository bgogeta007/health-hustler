import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Bell,
  Shield,
  PenTool as Tool,
  AlertTriangle,
  Clock,
  Upload,
  Save,
  Loader,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { usePlatform } from "../../contexts/PlatformContext";

interface PlatformSettings {
  id: string;
  theme_color: string;
  theme_mode: "light" | "dark" | "system";
  platform_name: string;
  logo_url: string | null;
  favicon_url: string | null;
  admin_2fa_required: boolean;
  account_lockout_attempts: number;
  session_timeout_minutes: number;
  maintenance_mode: boolean;
  maintenance_message: string | null;
  maintenance_start_time: string | null;
  maintenance_end_time: string | null;
  email_notifications_enabled: boolean;
  notification_frequency: "daily" | "weekly" | "monthly";
}

const SettingsTab: React.FC = () => {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("customization");
  const [logs, setLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  const platform = usePlatform();

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      // Apply theme color
      document.documentElement.style.setProperty(
        "--primary-color",
        settings.theme_color
      );

      // Update favicon
      const favicon =
        document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (favicon && settings.favicon_url) {
        favicon.href = settings.favicon_url;
      }

      // Update page title with platform name
      document.title = settings.platform_name;
    }
  }, [settings]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error("Error fetching settings:", error);
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: keyof PlatformSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase
        .from("platform_settings")
        .update(settings)
        .eq("id", settings.id);

      if (error) throw error;
      setSuccess("Settings saved successfully");

      if (platform?.refresh) {
        await platform.refresh(); // Add refresh method to your PlatformContext
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "favicon"
  ) => {
    const file = event.target.files?.[0];
    if (!file || !settings) return;

    try {
      // Delete old file if exists
      const currentUrl =
        type === "logo" ? settings.logo_url : settings.favicon_url;
      if (currentUrl) {
        const fileName = currentUrl.split("/").pop();
        await supabase.storage.from("public").remove([`platform/${fileName}`]);
      }

      // Upload new file
      const fileExt = file.name.split(".").pop();
      const fileName = `${type}_${Date.now()}.${fileExt}`;
      const filePath = `platform/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("public")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("public").getPublicUrl(filePath);

      handleSettingChange(
        type === "logo" ? "logo_url" : "favicon_url",
        publicUrl
      );
    } catch (error) {
      console.error("Error uploading file:", error);
      setError(`Failed to upload ${type}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Failed to load settings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold dark:text-white">
          Platform Settings
        </h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {saving ? (
            <>
              <Loader className="animate-spin -ml-1 mr-2 h-5 w-5" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg">
          {success}
        </div>
      )}

      {/* Navigation */}
      <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {[
          { id: "customization", label: "Customization", icon: Settings },
          { id: "security", label: "Security", icon: Shield },
          { id: "notifications", label: "Notifications", icon: Bell },
          { id: "maintenance", label: "Maintenance", icon: Tool },
          { id: "logs", label: "Logs", icon: AlertTriangle },
        ].map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center px-4 py-2 border-b-2 transition-colors ${
              activeSection === section.id
                ? "border-green-500 text-green-500"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <section.icon className="h-5 w-5 mr-2" />
            {section.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        {/* Customization Section */}
        {activeSection === "customization" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Platform Name
                </label>
                <input
                  type="text"
                  value={settings.platform_name}
                  onChange={(e) =>
                    handleSettingChange("platform_name", e.target.value)
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter platform name..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  This name will appear throughout the platform
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Primary Color
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={settings.theme_color}
                    onChange={(e) =>
                      handleSettingChange("theme_color", e.target.value)
                    }
                    className="w-16 h-12 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium dark:text-white">
                      {settings.theme_color.toUpperCase()}
                    </span>
                    <button
                      onClick={() =>
                        handleSettingChange("theme_color", "#10B981")
                      }
                      className="text-sm text-green-500 hover:text-green-600 text-left"
                    >
                      Reset to default
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Platform Logo
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {settings.logo_url ? (
                      <img
                        src={settings.logo_url}
                        alt="Logo preview"
                        className="h-16 w-16 object-contain rounded-lg bg-gray-100 dark:bg-gray-700 p-2"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <Tool className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 w-fit">
                      <Upload className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                      <input
                        type="file"
                        accept="image/png, image/svg+xml, image/jpeg"
                        onChange={(e) => handleFileUpload(e, "logo")}
                        className="hidden"
                      />
                    </label>
                    <p className="text-sm text-gray-500">
                      Recommended: SVG or PNG (300x300px)
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Favicon
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {settings.favicon_url ? (
                      <img
                        src={settings.favicon_url}
                        alt="Favicon preview"
                        className="h-12 w-12 object-contain rounded-lg bg-gray-100 dark:bg-gray-700 p-2"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <Tool className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 w-fit">
                      <Upload className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                      <input
                        type="file"
                        accept="image/png, image/x-icon, image/svg+xml"
                        onChange={(e) => handleFileUpload(e, "favicon")}
                        className="hidden"
                      />
                    </label>
                    <p className="text-sm text-gray-500">
                      Recommended: ICO or PNG (32x32px)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="text-sm font-medium dark:text-white mb-2">
                Live Preview
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  {settings.logo_url ? (
                    <img
                      src={settings.logo_url}
                      alt="Logo preview"
                      className="h-8 w-8 object-contain"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                      <Tool className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2
                    className="text-xl font-bold"
                    style={{ color: settings.theme_color }}
                  >
                    {settings.platform_name}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-300">
                    Platform preview text
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Security Section */}
        {activeSection === "security" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium dark:text-white">
                  Two-Factor Authentication
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  Require 2FA for admin accounts
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.admin_2fa_required}
                  onChange={(e) =>
                    handleSettingChange("admin_2fa_required", e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Account Lockout Attempts
              </label>
              <input
                type="number"
                value={settings.account_lockout_attempts}
                onChange={(e) =>
                  handleSettingChange(
                    "account_lockout_attempts",
                    parseInt(e.target.value)
                  )
                }
                min="1"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={settings.session_timeout_minutes}
                onChange={(e) =>
                  handleSettingChange(
                    "session_timeout_minutes",
                    parseInt(e.target.value)
                  )
                }
                min="5"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </motion.div>
        )}

        {/* Notifications Section */}
        {activeSection === "notifications" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium dark:text-white">
                  Email Notifications
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  Enable email notifications for users
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.email_notifications_enabled}
                  onChange={(e) =>
                    handleSettingChange(
                      "email_notifications_enabled",
                      e.target.checked
                    )
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notification Frequency
              </label>
              <select
                value={settings.notification_frequency}
                onChange={(e) =>
                  handleSettingChange("notification_frequency", e.target.value)
                }
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </motion.div>
        )}

        {/* Maintenance Section */}
        {activeSection === "maintenance" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium dark:text-white">Maintenance Mode</p>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  Enable maintenance mode to restrict access
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenance_mode}
                  onChange={(e) =>
                    handleSettingChange("maintenance_mode", e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Maintenance Message
              </label>
              <textarea
                value={settings.maintenance_message || ""}
                onChange={(e) =>
                  handleSettingChange("maintenance_message", e.target.value)
                }
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter maintenance message..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={settings.maintenance_start_time?.slice(0, 16) || ""}
                  onChange={(e) =>
                    handleSettingChange(
                      "maintenance_start_time",
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  value={settings.maintenance_end_time?.slice(0, 16) || ""}
                  onChange={(e) =>
                    handleSettingChange("maintenance_end_time", e.target.value)
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Logs Section */}
        {activeSection === "logs" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium dark:text-white">
                System Logs
              </h3>
              <button
                onClick={() => setShowLogs(!showLogs)}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                {showLogs ? "Hide" : "Show"} Logs
              </button>
            </div>

            {showLogs && (
              <div className="bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-lg h-96 overflow-auto">
                <div className="space-y-2">
                  {logs.length === 0 ? (
                    <p className="text-gray-500">No logs available</p>
                  ) : (
                    logs.map((log, index) => <p key={index}>{log}</p>)
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SettingsTab;
