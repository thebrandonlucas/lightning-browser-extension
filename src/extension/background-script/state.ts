import browser from "webextension-polyfill";
import createState from "zustand";

import { decryptData } from "../../common/lib/crypto";
import connectors from "./connectors";
import type Connector from "./connectors/connector.interface";

interface Account {
  connector: keyof typeof connectors;
  config: string;
}

interface State {
  connector: Connector | null;
  account: Account | null;
  settings: Record<string, unknown>;
  accounts: Record<string, Account>;
  currentAccountId: string | null;
  password: string | null;
  getAccount: () => Account | null;
  getConnector: () => Promise<Connector>;
  lock: () => Promise<void>;
  init: () => Promise<void>;
  saveToStorage: () => Promise<void>;
}

export const DEFAULT_SETTINGS = {
  websiteEnhancements: true,
  userName: "",
};

// these keys get synced from the state to the browser storage
// the values are the default values
const browserStorage: {
  settings: typeof DEFAULT_SETTINGS;
  accounts: Record<string, Account>;
  currentAccountId: string | null;
} = {
  settings: DEFAULT_SETTINGS,
  accounts: {},
  currentAccountId: null,
};

const browserStorageKeys = Object.keys(browserStorage) as Array<
  keyof typeof browserStorage
>;

const state = createState<State>((set, get) => ({
  connector: null,
  account: null,
  settings: {},
  accounts: {},
  currentAccountId: null,
  password: null,
  getAccount: () => {
    const currentAccountId = get().currentAccountId;
    let account = null;
    if (currentAccountId) {
      account = get().accounts[currentAccountId];
    }
    return account;
  },
  getConnector: async () => {
    if (get().connector) {
      return get().connector as Connector;
    }
    const currentAccountId = get().currentAccountId as string;
    const account = get().accounts[currentAccountId];

    const password = get().password as string;
    const config = decryptData(account.config, password);

    const connector = new connectors[account.connector](config);
    await connector.init();

    set({ connector: connector });

    return connector;
  },
  lock: async () => {
    const connector = get().connector;
    if (connector) {
      connector.unload();
    }
    set({ password: null, connector: null, account: null });
  },
  init: () => {
    return browser.storage.sync.get(browserStorageKeys).then((result) => {
      const data = { ...browserStorage };
      browserStorageKeys.forEach((key) => {
        data[key] = result[key] || browserStorage[key];
      });

      /**
       * MIGRATION CODE
       * This check is currently needed for existing users that upgrade
       * as they already have a stored settings object, but without the new defaults.
       * TODO: delete this migration code in the future.
       */
      if (
        !("userName" in data.settings) ||
        !("websiteEnhancements" in data.settings)
      ) {
        data.settings = DEFAULT_SETTINGS;
      }

      set(data);
    });
  },
  saveToStorage: () => {
    const current = get();
    const data: State[keyof typeof browserStorage] = {};
    browserStorageKeys.forEach((key) => {
      data[key] = current[key] || browserStorage[key];
    });
    return browser.storage.sync.set(data);
  },
}));

browserStorageKeys.forEach((key) => {
  console.log(`Adding state subscription for ${key}`);
  state.subscribe(
    (newValue, previousValue) => {
      //if (previous && Object.keys(previous) > 0) {
      const data: State[keyof typeof browserStorage] = {};
      data[key] = newValue;
      return browser.storage.sync.set(data);
      //}
      //return Promise.resolve();
    },
    (state) => state[key],
    (newValue, previousValue) => {
      // NOTE: using JSON.stringify to compare objects
      return JSON.stringify(newValue) === JSON.stringify(previousValue);
    }
  );
});

export default state;
