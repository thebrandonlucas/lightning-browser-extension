/* eslint-disable react/jsx-key */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";

import utils from "~/common/lib/utils";

import ConnectorForm from "@components/ConnectorForm";
import TextField from "@components/form/TextField";
import CompanionDownloadInfo from "@components/CompanionDownloadInfo";

const initialFormData = Object.freeze({
  url: "",
  macaroon: "",
});

const descriptionKeyPrefix = "choose_connector.start9.page_description";

export default function ConnectStart9() {
  const navigate = useNavigate();
  const { t } = useTranslation("translation", {
    keyPrefix: "choose_connector.start9",
  });
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);

  function handleLndconnectUrl(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      const lndconnectUrl = event.target.value.trim();
      const lndconnect = new URL(lndconnectUrl);
      const url = "https:" + lndconnect.pathname;
      let macaroon = lndconnect.searchParams.get("macaroon") || "";
      macaroon = utils.urlSafeBase64ToHex(macaroon);
      // const cert = lndconnect.searchParams.get("cert"); // TODO: handle LND certs with the native connector
      setFormData({
        ...formData,
        url,
        macaroon,
      });
    } catch (e) {
      console.log("invalid lndconnect string");
    }
  }

  function getConnectorType() {
    if (formData.url.match(/\.onion/i)) {
      return "nativelnd";
    }
    // default to LND
    return "lnd";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const { url, macaroon } = formData;
    const account = {
      name: "Start9",
      config: {
        macaroon,
        url,
      },
      connector: getConnectorType(),
    };

    try {
      let validation;
      // TODO: for native connectors we currently skip the validation because it is too slow (booting up Tor etc.)
      if (account.connector === "nativelnd") {
        validation = { valid: true, error: "" };
      } else {
        validation = await utils.call("validateAccount", account);
      }

      if (validation.valid) {
        const addResult = await utils.call("addAccount", account);
        if (addResult.accountId) {
          await utils.call("selectAccount", {
            id: addResult.accountId,
          });
          navigate("/test-connection");
        }
      } else {
        alert(`
          ${t("errors.connection_failed")} \n\n(${validation.error})`);
      }
    } catch (e) {
      console.error(e);
      let message = t("errors.connection_failed");
      if (e instanceof Error) {
        message += `\n\n${e.message}`;
      }
      alert(message);
    }
    setLoading(false);
  }

  return (
    <ConnectorForm
      title={t("page_title")}
      description={
        <p>
          <Trans
            i18nKey={`${descriptionKeyPrefix}.part1`}
            components={[<strong />]}
          />
          <br />
          <Trans
            i18nKey={`${descriptionKeyPrefix}.part2`}
            components={[<strong />]}
          />
          <br />
          <Trans
            i18nKey={`${descriptionKeyPrefix}.part3`}
            components={[<strong />]}
          />
          <br />{" "}
          <Trans
            i18nKey={`${descriptionKeyPrefix}.part4`}
            components={[<strong />]}
          />
        </p>
      }
      submitLoading={loading}
      submitDisabled={formData.url === "" || formData.macaroon === ""}
      onSubmit={handleSubmit}
    >
      <TextField
        id="lndconnect"
        label={t("url_label")}
        placeholder={t("url_placeholder")}
        onChange={handleLndconnectUrl}
        required
      />
      {formData.url.match(/\.onion/i) && (
        <div className="mt-6">
          <CompanionDownloadInfo />
        </div>
      )}
    </ConnectorForm>
  );
}
