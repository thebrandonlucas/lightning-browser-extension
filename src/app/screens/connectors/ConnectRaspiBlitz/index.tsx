/* eslint-disable react/jsx-key */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import utils from "~/common/lib/utils";
import TextField from "@components/form/TextField";
import CompanionDownloadInfo from "@components/CompanionDownloadInfo";
import ConnectorForm from "@components/ConnectorForm";

const initialFormData = Object.freeze({
  url: "",
  macaroon: "",
});

export default function ConnectRaspiBlitz() {
  const navigate = useNavigate();
  const { t } = useTranslation("translation", {
    keyPrefix: "choose_connector.raspiblitz",
  });
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);

  function handleUrl(event: React.ChangeEvent<HTMLInputElement>) {
    let url = event.target.value.trim();
    if (url.substring(0, 4) !== "http") {
      url = `https://${url}`;
    }
    setFormData({
      ...formData,
      [event.target.name]: url,
    });
  }

  function handleMacaroon(event: React.ChangeEvent<HTMLInputElement>) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value.trim(),
    });
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
      name: "RaspiBlitz",
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
          {t("page_description.rest_host.part1")}
          <br />
          <br />
          <Trans
            i18nKey={"page_description.rest_host.part2"}
            t={t}
            components={[<strong />]}
          />
          <br />
          <Trans
            i18nKey={"page_description.rest_host.part3"}
            t={t}
            components={[<strong />]}
          />
          <br />
          <Trans
            i18nKey={"page_description.rest_host.part4"}
            t={t}
            components={[<strong />]}
          />
          <br />
          <Trans
            i18nKey={"page_description.rest_host.part5"}
            t={t}
            components={[<strong />]}
          />
        </p>
      }
      submitLoading={loading}
      submitDisabled={formData.url === "" || formData.macaroon === ""}
      onSubmit={handleSubmit}
      video="https://cdn.getalby-assets.com/connector-guides/in_extension_guide_raspiblitz.mp4"
    >
      <div className="mt-6">
        <TextField
          id="url"
          label={t("rest_host_label")}
          placeholder={t("rest_host_placeholder")}
          onChange={handleUrl}
          required
        />
      </div>
      {formData.url.match(/\.onion/i) && <CompanionDownloadInfo />}
      <div className="mt-6">
        <p className="mb-6 text-gray-500 mt-6 dark:text-gray-400">
          <Trans
            i18nKey={"page_description.macaroon.part1"}
            t={t}
            components={[<b />]}
          />{" "}
          <br />
          <Trans
            i18nKey={"page_description.macaroon.part2"}
            t={t}
            components={[<b />]}
          />
          <br />
          <Trans
            i18nKey={"page_description.macaroon.part3"}
            t={t}
            components={[<b />]}
          />
          <br />
          <Trans
            i18nKey={"page_description.macaroon.part4"}
            t={t}
            components={[<b />]}
          />
          <br />
          {t("page_description.macaroon.part5")}
        </p>
        <div>
          <TextField
            id="macaroon"
            label={t("macaroon_label")}
            value={formData.macaroon}
            onChange={handleMacaroon}
            required
          />
        </div>
      </div>
    </ConnectorForm>
  );
}
