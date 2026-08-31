import { formatMoney } from "@dashboard/components/Money";
import { Pill } from "@dashboard/components/Pill";
import { Placeholder } from "@dashboard/components/Placeholder";
import { SaleorThrobber } from "@dashboard/components/Throbber";
import { OrderChargeStatusEnum, type OrderListQuery } from "@dashboard/graphql";
import { getPrevLocationState } from "@dashboard/hooks/useBackLinkWithState";
import useLocale from "@dashboard/hooks/useLocale";
import {
  transformChargedStatus,
  transformOrderStatus,
  transformPaymentStatus,
} from "@dashboard/misc";
import { type RelayToFlat } from "@dashboard/types";
import { Box } from "@saleor/macaw-ui-next";
import { ChevronRight } from "lucide-react";
import { type MouseEvent, type ReactElement } from "react";
import { useIntl } from "react-intl";
import { useLocation } from "react-router";
import { Link } from "react-router-dom";

import { getCountryFlagDataUri } from "../OrderListDatagrid/countryFlag";
import styles from "./OrderListMobile.module.css";

type Order = RelayToFlat<NonNullable<OrderListQuery["orders"]>>[number];

interface OrderListMobileProps {
  disabled?: boolean;
  emptyText: string;
  onRowClick?: (id: string) => void;
  orders: Order[];
  rowAnchor?: (id: string) => string;
}

const getCustomerLabel = (order: Order): string => {
  const customerName = [order.billingAddress?.firstName, order.billingAddress?.lastName]
    .filter(Boolean)
    .join(" ");

  return customerName || order.userEmail || "-";
};

export const OrderListMobile = ({
  disabled,
  emptyText,
  onRowClick,
  orders,
  rowAnchor,
}: OrderListMobileProps): ReactElement => {
  const intl = useIntl();
  const { locale } = useLocale();
  const location = useLocation();

  if (disabled) {
    return (
      <Box
        data-test-id="order-mobile-list-loader"
        display="flex"
        justifyContent="center"
        padding={8}
      >
        <SaleorThrobber />
      </Box>
    );
  }

  if (orders.length === 0) {
    return (
      <Box padding={4}>
        <Placeholder>{emptyText}</Placeholder>
      </Box>
    );
  }

  return (
    <ul className={styles.list} data-test-id="order-mobile-list">
      {orders.map(order => {
        const rowUrl = rowAnchor?.(order.id);
        const country = order.shippingAddress?.country ?? order.billingAddress?.country;
        const countryFlag = country?.code ? getCountryFlagDataUri(country.code) : null;
        const paymentStatus =
          order.chargeStatus === OrderChargeStatusEnum.OVERCHARGED
            ? transformChargedStatus(order.chargeStatus, intl)
            : transformPaymentStatus(order.paymentStatus, intl);
        const orderStatus = transformOrderStatus(order.status, intl);
        const createdAt = new Date(order.created);
        const formattedDate = Number.isNaN(createdAt.getTime())
          ? order.created
          : `${intl.formatDate(createdAt, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}, ${intl.formatTime(createdAt, {
              hour: "2-digit",
              minute: "2-digit",
            })}`;
        const total = order.total?.gross ? formatMoney(order.total.gross, locale) : "-";
        const handleFallbackClick = (event: MouseEvent<HTMLAnchorElement>): void => {
          if (rowUrl || !onRowClick) {
            return;
          }

          event.preventDefault();
          onRowClick(order.id);
        };

        return (
          <li className={styles.item} key={order.id}>
            <Link
              className={styles.link}
              onClick={handleFallbackClick}
              to={{
                pathname: rowUrl ?? "#",
                state: getPrevLocationState(location),
              }}
            >
              <div className={styles.heading}>
                <div className={styles.identity}>
                  <span className={styles.number}>#{order.number}</span>
                  <span className={styles.customer}>{getCustomerLabel(order)}</span>
                </div>
                <span className={styles.total}>{total}</span>
                <ChevronRight aria-hidden="true" className={styles.chevron} size={20} />
              </div>

              <div className={styles.metadata}>
                <span>{formattedDate}</span>
                {country?.country && (
                  <span className={styles.country}>
                    {countryFlag && <img alt="" className={styles.flag} src={countryFlag} />}
                    {country.country}
                  </span>
                )}
              </div>

              <div className={styles.statuses}>
                <Pill color={paymentStatus.status} label={paymentStatus.localized} size="small" />
                <Pill color={orderStatus.status} label={orderStatus.localized} size="small" />
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};
