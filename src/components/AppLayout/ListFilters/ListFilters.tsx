import { type FilterErrorMessages, type IFilter } from "@dashboard/components/Filter/types";
import { type FilterProps, type SearchPageProps } from "@dashboard/types";
import { Box } from "@saleor/macaw-ui-next";
import { type ReactNode } from "react";

import { ExpressionFilters } from "./components/ExpressionFilters";
import { FiltersSelect } from "./components/FiltersSelect";
import { LegacyFiltersPresetsAlert } from "./components/LegacyFiltersPresetsAlert";
import SearchInput from "./components/SearchInput";
import styles from "./ListFilters.module.css";

interface NewFilterProps extends SearchPageProps {
  type: "expression-filter";
  searchPlaceholder: string;
  actions?: ReactNode;
  showSearchTooltip?: boolean;
}

interface OldFiltersProps<TKeys extends string = string>
  extends FilterProps<TKeys>,
    SearchPageProps {
  type?: "old-filter-select";
  searchPlaceholder: string;
  actions?: ReactNode;
  showSearchTooltip?: boolean;
  filterStructure?: IFilter<TKeys>;
  errorMessages?: FilterErrorMessages<TKeys>;
}

type ListFiltersProps<TKeys extends string = string> = NewFilterProps | OldFiltersProps<TKeys>;

export const ListFilters = <TFilterKeys extends string = string>({
  initialSearch,
  searchPlaceholder,
  onSearchChange,
  actions,
  showSearchTooltip,
  ...props
}: ListFiltersProps<TFilterKeys>) => {
  const isExpressionFilter = props.type === "expression-filter";

  return (
    <>
      {isExpressionFilter && <LegacyFiltersPresetsAlert />}
      <Box
        className={styles.filterBar}
        display="grid"
        __gridTemplateColumns="auto 1fr"
        gap={4}
        paddingBottom={2}
        paddingX={6}
      >
        <Box className={styles.controls} display="flex" alignItems="center" gap={4}>
          {isExpressionFilter ? (
            <ExpressionFilters data-test-id="filters-button" />
          ) : (
            <FiltersSelect<TFilterKeys>
              errorMessages={props.errorMessages}
              menu={props.filterStructure!}
              currencySymbol={props.currencySymbol}
              onFilterAdd={props.onFilterChange!}
              onFilterAttributeFocus={props.onFilterAttributeFocus}
            />
          )}
          <Box className={styles.search} __width="360px">
            <SearchInput
              initialSearch={initialSearch}
              placeholder={searchPlaceholder}
              onSearchChange={onSearchChange}
              showSearchTooltip={showSearchTooltip}
            />
          </Box>
        </Box>
        <Box className={styles.actions} display="flex" justifyContent="flex-end">
          {actions}
        </Box>
      </Box>
    </>
  );
};

ListFilters.displayName = "FilterBar";
