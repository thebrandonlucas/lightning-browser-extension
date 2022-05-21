import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import TextField from "@components/form/TextField";
import ConnectorForm from "@components/ConnectorForm";

import utils from "~/common/lib/utils";

export default function ConnectCitadel() {
  const navigate = useNavigate();
  const { t } = useTranslation("translation", {
    keyPrefix: "choose_connector.citadel",
  });
  const [formData, setFormData] = useState({
    password: "",
    url: "http://citadel.local",
  });
  const [loading, setLoading] = useState(false);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value.trim(),
    });
  }

  function getConnectorType() {
    if (formData.url.match(/\.onion/i)) {
      return "nativecitadel";
    }
    return "citadel";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const { password, url } = formData;
    /** The URL with an http:// in front if the protocol is missing */
    const fullUrl =
      url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `http://${url}`;
    const account = {
      name: "Citadel",
      config: {
        url: fullUrl,
        password,
      },
      connector: getConnectorType(),
    };

    try {
      let validation;
      // TODO: for native connectors we currently skip the validation because it is too slow (booting up Tor etc.)
      if (account.connector === "nativecitadel") {
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
      description={t("page_description")}
      submitLoading={loading}
      submitDisabled={formData.password === "" || formData.url === ""}
      onSubmit={handleSubmit}
    >
      <div className="mb-6">
        <TextField
          label={t("password")}
          id="password"
          type="password"
          required
          onChange={handleChange}
        />
      </div>
      <TextField
        label={t("url")}
        id="url"
        placeholder="citadel.local"
        type="text"
        value={formData.url}
        required
        onChange={handleChange}
      />
    </ConnectorForm>
  );
}
