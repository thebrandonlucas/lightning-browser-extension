/* eslint-disable react/jsx-key */
import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation, Trans } from "react-i18next";

import ConfirmOrCancel from "@components/ConfirmOrCancel";
import PublisherCard from "@components/PublisherCard";
import msg from "~/common/lib/msg";
import type { OriginData } from "~/types";
import { USER_REJECTED_ERROR } from "~/common/constants";

type Props = {
  origin: OriginData;
};

function Enable(props: Props) {
  const { t } = useTranslation("translation", { keyPrefix: "enable" });
  const { t: tCommon } = useTranslation("common");
  const hasFetchedData = useRef(false);
  const [, setLoading] = useState(true);
  const [remember] = useState(true);
  const [, setEnabled] = useState(false);
  const [budget] = useState(null);

  const enable = useCallback(() => {
    setEnabled(true);
    msg.reply({
      enabled: true,
      remember,
      budget,
    });
  }, [budget, remember]);

  function reject(event: React.MouseEvent<HTMLAnchorElement>) {
    msg.error(USER_REJECTED_ERROR);
    event.preventDefault();
  }

  useEffect(() => {
    async function getAllowance() {
      try {
        const allowance = await msg.request("getAllowance", {
          domain: props.origin.domain,
          host: props.origin.host,
        });
        if (allowance && allowance.enabled) {
          enable();
        }
        setLoading(false);
      } catch (e) {
        if (e instanceof Error) console.log(e.message);
      }
    }

    // Run once.
    if (!hasFetchedData.current) {
      getAllowance();
      hasFetchedData.current = true;
    }
  }, [enable, props.origin.domain, props.origin.host]);

  return (
    <div>
      <PublisherCard title={props.origin.name} image={props.origin.icon} />

      <div className="text-center p-6">
        <h3 className="text-xl mb-4 dark:text-white">
          <Trans
            i18nKey={"connect_with_host"}
            t={t}
            values={{ host: props.origin.host }}
            components={[<i></i>]}
          />
        </h3>

        <p className="text-gray-500 mb-4 dark:text-gray-400">
          <Trans
            i18nKey={"no_access"}
            t={t}
            values={{ name: props.origin.name }}
            components={[<strong></strong>]}
          />
        </p>
        <p className="mb-8 text-gray-500 mb-4 dark:text-gray-400">
          {t("grant_access_question")}
        </p>

        <ConfirmOrCancel
          label={tCommon("actions.enable")}
          onConfirm={enable}
          onCancel={reject}
        />
      </div>
    </div>
  );
}

export default Enable;
