import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import ConfirmOrCancel from "@components/ConfirmOrCancel";
import TextField from "@components/form/TextField";
import PublisherCard from "@components/PublisherCard";
import msg from "~/common/lib/msg";
import type { RequestInvoiceArgs } from "~/types";
import api from "~/common/lib/api";
import SatButtons from "@components/SatButtons";
import { USER_REJECTED_ERROR } from "~/common/constants";

type Origin = {
  name: string;
  host: string;
  icon: string;
};

type Props = {
  amountEditable: boolean;
  memoEditable: boolean;
  invoiceAttributes: RequestInvoiceArgs;
  origin: Origin;
};

const Dt = ({ children }: { children: React.ReactNode }) => (
  <dt className="font-medium text-gray-800 dark:text-white">{children}</dt>
);

const Dd = ({ children }: { children: React.ReactNode }) => (
  <dd className="mb-4 text-gray-600 dark:text-gray-500">{children}</dd>
);

function MakeInvoice({
  amountEditable,
  memoEditable,
  invoiceAttributes,
  origin,
}: Props) {
  const { t } = useTranslation("translation", { keyPrefix: "make_invoice" });
  const { t: tCommon } = useTranslation("common");
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState(invoiceAttributes.amount || "");
  const [memo, setMemo] = useState(invoiceAttributes.memo || "");
  const [error, setError] = useState("");

  function handleValueChange(amount: string) {
    setError("");
    if (
      invoiceAttributes.minimumAmount &&
      parseInt(amount) < invoiceAttributes.minimumAmount
    ) {
      setError(t("errors.amount_less_than_minimum"));
    } else if (
      invoiceAttributes.maximumAmount &&
      parseInt(amount) > invoiceAttributes.maximumAmount
    ) {
      setError(t("errors.amount_exceeds_maximum"));
    }
    setValue(amount);
  }

  function handleMemoChange(e: React.ChangeEvent<HTMLInputElement>) {
    setMemo(e.target.value);
  }

  async function confirm() {
    if (!value) return;
    try {
      setLoading(true);
      const response = await api.makeInvoice({
        amount: value,
        memo: memo,
      });
      msg.reply(response);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function reject(e: React.MouseEvent) {
    e.preventDefault();
    msg.error(USER_REJECTED_ERROR);
  }

  return (
    <div>
      <PublisherCard title={origin.name} image={origin.icon} />

      <div className="p-4">
        <div className="mb-8">
          <div className="mb-4">
            <p className="font-semibold text-gray-500 mb-4">
              {origin.host} {t("requests_invoice")}
            </p>
            <div className="mt-4">
              {amountEditable && (
                <>
                  <TextField
                    id="amount"
                    label={tCommon("amount")}
                    type="number"
                    min={invoiceAttributes.minimumAmount}
                    max={invoiceAttributes.maximumAmount}
                    value={value}
                    onChange={(e) => handleValueChange(e.target.value)}
                  />
                  <SatButtons onClick={handleValueChange} />
                </>
              )}
              {!amountEditable && (
                <dl className="dark:bg-surface-02dp pt-4 overflow-hidden">
                  <Dt>{tCommon("amount")}</Dt>
                  <Dd>{invoiceAttributes.amount}</Dd>
                </dl>
              )}
              {error && <p className="mt-1 text-red-500">{error}</p>}
            </div>
            <div className="mt-4">
              {memoEditable && (
                <TextField
                  id="memo"
                  label={t("memo")}
                  value={memo}
                  onChange={handleMemoChange}
                />
              )}
              {!memoEditable && (
                <dl className="dark:bg-surface-02dp overflow-hidden">
                  <Dt>{t("memo")}</Dt>
                  <Dd>{invoiceAttributes.memo}</Dd>
                </dl>
              )}
            </div>
          </div>
        </div>

        <ConfirmOrCancel
          disabled={!value || loading || Boolean(error)}
          loading={loading}
          onConfirm={confirm}
          onCancel={reject}
        />
      </div>
    </div>
  );
}

export default MakeInvoice;
