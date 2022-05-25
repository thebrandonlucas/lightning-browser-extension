/* eslint-disable react/jsx-key */
import { ReceiveIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import { useTranslation, Trans } from "react-i18next";

function CompanionDownloadInfo() {
  const { t } = useTranslation("translation", {
    keyPrefix: "components.companion_download_info",
  });

  function getOS() {
    if (navigator.appVersion.indexOf("Win") != -1) return "Windows";
    if (navigator.appVersion.indexOf("Mac") != -1) return "MacOS";
    if (navigator.appVersion.indexOf("X11") != -1) return "UNIX";
    if (navigator.appVersion.indexOf("Linux") != -1) return "Linux";
  }

  // TODO: check if the companion app is already installed
  return (
    <div className="dark:text-white">
      {t("connect_behind_tor")}
      <Trans
        i18nKey={"components"}
        t={t}
        components={[
          <a
            href={`https://getalby.com/install/companion/${getOS()}`}
            target="_blank"
            rel="noreferrer"
          />,
          <ReceiveIcon className="w-6 h-6 inline" />,
        ]}
      />
    </div>
  );
}

export default CompanionDownloadInfo;
