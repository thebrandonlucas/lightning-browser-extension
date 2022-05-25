import { MouseEventHandler } from "react";
import { useTranslation } from "react-i18next";
import i18n from "~/i18n/i18nConfig";
import { commonI18nNamespace } from "~/i18n/namespaces";

import Button from "../Button";

type Props = {
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  onConfirm: MouseEventHandler;
  onCancel: MouseEventHandler;
};

function ConfirmOrCancel({
  disabled = false,
  loading = false,
  label = i18n.t("actions.confirm", commonI18nNamespace) || "Confirm",
  onConfirm,
  onCancel,
}: Props) {
  const { t } = useTranslation("translation", {
    keyPrefix: "components.confirm_or_cancel",
  });
  const { t: tCommon } = useTranslation("common");
  return (
    <div className="text-center">
      <div className="mb-4">
        <Button
          onClick={onConfirm}
          label={label}
          fullWidth
          primary
          disabled={disabled}
          loading={loading}
        />
      </div>

      <p className="mb-2 text-sm text-gray-400">
        <em>{t("only_trusted_sites")}</em>
      </p>

      <a
        className="underline text-sm text-gray-600 dark:text-gray-400"
        href="#"
        onClick={onCancel}
      >
        {tCommon("actions.cancel")}
      </a>
    </div>
  );
}

export default ConfirmOrCancel;
