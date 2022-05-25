import { ChangeEventHandler } from "react";
import { Transition } from "@headlessui/react";
import { useTranslation } from "react-i18next";

import Checkbox from "../form/Checkbox";
import TextField from "../form/TextField";

type Props = {
  remember: boolean;
  onRememberChange: ChangeEventHandler<HTMLInputElement>;
  budget: string;
  onBudgetChange: ChangeEventHandler<HTMLInputElement>;
};

function BudgetControl({
  remember,
  onRememberChange,
  budget,
  onBudgetChange,
}: Props) {
  const { t } = useTranslation("translation", {
    keyPrefix: "components.budget_control",
  });
  const { t: tCommon } = useTranslation("common");
  return (
    <div className="mb-6">
      <div className="flex items-center">
        <Checkbox
          id="remember_me"
          name="remember_me"
          checked={remember}
          onChange={onRememberChange}
        />
        <label
          htmlFor="remember_me"
          className="ml-2 block text-sm text-gray-900 font-medium dark:text-white"
        >
          {t("remember_set_budget")}
        </label>
      </div>

      <Transition
        show={remember}
        enter="transition duration-100 ease-out"
        enterFrom="scale-95 opacity-0"
        enterTo="scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="scale-100 opacity-100"
        leaveTo="scale-95 opacity-0"
      >
        <p className="my-3 text-gray-500 text-sm">{t("dont_ask_balance")}</p>
        <div>
          <TextField
            id="budget"
            label={t("budget")}
            placeholder={tCommon("sat")}
            value={budget}
            type="number"
            onChange={onBudgetChange}
          />
        </div>
      </Transition>
    </div>
  );
}

export default BudgetControl;
