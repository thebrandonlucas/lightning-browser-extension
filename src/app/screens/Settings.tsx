import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Html5Qrcode } from "html5-qrcode";

import api from "~/common/lib/api";
import { SettingsStorage } from "~/types";
import { getTheme } from "~/app/utils";
import Container from "@components/Container";
import Button from "@components/Button";
import Toggle from "@components/form/Toggle";
import Input from "@components/form/Input";
import Setting from "@components/Setting";
import Select from "@components/form/Select";
import LocaleSwitcher from "@components/LocaleSwitcher/LocaleSwitcher";

function Settings() {
  const { t } = useTranslation("translation", { keyPrefix: "settings" });
  const { t: tCommon } = useTranslation("common");
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SettingsStorage>({
    websiteEnhancements: false,
    legacyLnurlAuth: false,
    userName: "",
    userEmail: "",
    locale: "",
    theme: "system",
  });
  const [cameraPermissionsGranted, setCameraPermissionsGranted] =
    useState(false);

  async function saveSetting(
    setting: Record<string, string | number | boolean>
  ) {
    const response = await api.setSetting(setting);
    setSettings(response);
  }

  useEffect(() => {
    api.getSettings().then((response) => {
      setSettings(response);
      setLoading(false);
    });
  }, []);

  return (
    <Container>
      <h2 className="mt-12 mb-6 text-2xl font-bold dark:text-white">
        {t("title")}
      </h2>
      <div className="shadow bg-white sm:rounded-md sm:overflow-hidden px-6 py-2 divide-y divide-black/10 dark:divide-white/10 dark:bg-surface-02dp">
        <Setting
          title={t("website_enhancements")}
          subtitle={t("website_enhancements_description")}
        >
          {!loading && (
            <Toggle
              checked={settings.websiteEnhancements}
              onChange={() => {
                saveSetting({
                  websiteEnhancements: !settings.websiteEnhancements,
                });
              }}
            />
          )}
        </Setting>

        <Setting
          title={t("legacy_signing")}
          subtitle={t("legacy_signing_description")}
        >
          {!loading && (
            <Toggle
              checked={settings.legacyLnurlAuth}
              onChange={() => {
                saveSetting({
                  legacyLnurlAuth: !settings.legacyLnurlAuth,
                });
              }}
            />
          )}
        </Setting>

        <Setting
          title={t("camera_access")}
          subtitle={t("camera_access_description")}
        >
          {!cameraPermissionsGranted ? (
            <Button
              label={t("allow_camera_access")}
              onClick={async () => {
                try {
                  await Html5Qrcode.getCameras();
                  setCameraPermissionsGranted(true);
                } catch (e) {
                  alert(e);
                }
              }}
            />
          ) : (
            <p className="text-green-500 font-medium">
              {t("permission_granted")}
            </p>
          )}
        </Setting>

        <Setting title={t("language")} subtitle={t("language_description")}>
          <div className="w-32">
            <LocaleSwitcher />
          </div>
        </Setting>

        <Setting title={t("theme")} subtitle={t("theme_description")}>
          {!loading && (
            <div className="w-64">
              <Select
                name="theme"
                value={settings.theme}
                onChange={async (ev) => {
                  await saveSetting({
                    theme: ev.target.value,
                  });
                  getTheme(); // Get the active theme and apply corresponding Tailwind classes to the document
                }}
              >
                <option value="dark">{t("dark")}</option>
                <option value="light">{t("light")}</option>
                <option value="system">{t("system")}</option>
              </Select>
            </div>
          )}
        </Setting>
      </div>
      <h2 className="mt-12 text-2xl font-bold dark:text-white">
        {t("personal_data")}
      </h2>
      <div className="mb-6 text-gray-700 dark:text-gray-300 text-sm">
        {t("personal_data_description")}
      </div>
      <div className="shadow bg-white sm:rounded-md sm:overflow-hidden px-6 py-2 divide-y divide-black/10 dark:divide-white/10 dark:bg-surface-02dp">
        <Setting title={tCommon("name")} subtitle="">
          {!loading && (
            <div className="w-64">
              <Input
                placeholder={t("name_placeholder")}
                type="text"
                value={settings.userName}
                onChange={(ev) => {
                  saveSetting({
                    userName: ev.target.value,
                  });
                }}
              />
            </div>
          )}
        </Setting>
        <Setting title={tCommon("email")} subtitle="">
          {!loading && (
            <div className="w-64">
              <Input
                placeholder={t("email_placeholder")}
                type="email"
                value={settings.userEmail}
                onChange={(ev) => {
                  saveSetting({
                    userEmail: ev.target.value,
                  });
                }}
              />
            </div>
          )}
        </Setting>
      </div>
    </Container>
  );
}

export default Settings;
