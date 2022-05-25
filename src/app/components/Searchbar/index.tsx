import { SearchIcon } from "@bitcoin-design/bitcoin-icons-react/filled";
import { useTranslation } from "react-i18next";

export default function Searchbar() {
  const { t: tCommon } = useTranslation("common");
  return (
    <div className="w-full">
      <label htmlFor="search" className="sr-only">
        {tCommon("actions.search")}
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
          <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          id="search"
          name="search"
          className="block w-full bg-white border border-white rounded-md py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:outline-none focus:text-gray-900 focus:placeholder-gray-400 focus:ring-1 focus:ring-orange-bitcoin focus:border-orange-bitcoin sm:text-sm"
          placeholder="Search"
          type="search"
        />
      </div>
    </div>
  );
}
