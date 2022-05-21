import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import utils from "~/common/lib/utils";

import ConnectorForm from "@components/ConnectorForm";
import TextField from "@components/form/TextField";

export default function ConnectLnbits() {
  const navigate = useNavigate();
  const { t } = useTranslation("translation", {
    keyPrefix: "choose_connector.lnbits",
  });
  const [formData, setFormData] = useState({
    adminkey: "",
    url: "https://legend.lnbits.com",
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
      return "nativelnbits";
    }
    // default to LNbits
    return "lnbits";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const { adminkey, url } = formData;
    const account = {
      name: "LNBits",
      config: {
        adminkey,
        url,
      },
      connector: getConnectorType(),
    };

    try {
      let validation;
      // TODO: for native connectors we currently skip the validation because it is too slow (booting up Tor etc.)
      if (account.connector === "nativelnbits") {
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
        console.log(validation);
        alert(`${t("errors.connection_failed")} \n\n(${validation.error})`);
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
      title={t("lnbits")}
      submitLoading={loading}
      submitDisabled={formData.adminkey === "" || formData.url === ""}
      onSubmit={handleSubmit}
    >
      <div className="mb-6">
        <TextField
          id="adminkey"
          label={t("admin_key")}
          type="text"
          required
          onChange={handleChange}
        />
      </div>
      <TextField
        id="url"
        label="LNbits URL"
        type="text"
        value={formData.url}
        required
        onChange={handleChange}
      />
    </ConnectorForm>
  );
}
