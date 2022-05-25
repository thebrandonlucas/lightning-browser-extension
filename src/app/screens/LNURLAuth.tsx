import { MouseEvent } from "react";
import { useTranslation } from "react-i18next";

import type { LNURLAuthServiceResponse } from "~/types";
import msg from "~/common/lib/msg";
import { USER_REJECTED_ERROR } from "~/common/constants";

import ConfirmOrCancel from "@components/ConfirmOrCancel";
import PublisherCard from "@components/PublisherCard";

type Props = {
  details: LNURLAuthServiceResponse;
  origin: {
    name: string;
    icon: string;
  };
};

function LNURLAuth({ details, origin }: Props) {
  const { t } = useTranslation("translation", { keyPrefix: "lnurl_auth" });

  async function confirm() {
    return await msg.reply({
      confirmed: true,
      remember: true,
    });
  }

  function reject(e: MouseEvent) {
    e.preventDefault();
    msg.error(USER_REJECTED_ERROR);
  }

  return (
    <div>
      <PublisherCard title={origin.name} image={origin.icon} />
      <div className="p-6">
        <dl className="shadow bg-white dark:bg-surface-02dp p-4 rounded-lg mb-8">
          <dt className="font-semibold text-gray-500">
            {origin.name} {t("ask_login")}
          </dt>
          <dd className="mb-6 dark:text-white">{details.domain}</dd>
        </dl>
        <ConfirmOrCancel onConfirm={confirm} onCancel={reject} />
      </div>
    </div>
  );
}

export default LNURLAuth;
