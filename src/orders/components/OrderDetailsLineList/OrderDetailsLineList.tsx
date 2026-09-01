import { Menu, type TopNavMenuItem } from "@dashboard/components/AppLayout/TopNav/Menu";
import { formatMoney } from "@dashboard/components/Money";
import { Placeholder } from "@dashboard/components/Placeholder";
import { SaleorThrobber } from "@dashboard/components/Throbber";
import { type OrderLineFragment } from "@dashboard/graphql";
import useLocale from "@dashboard/hooks/useLocale";
import { buttonMessages } from "@dashboard/intl";
import { messages as rowActionMessages } from "@dashboard/orders/components/OrderLineRowActions/messages";
import { messages as orderMessages } from "@dashboard/orders/components/OrderListDatagrid/messages";
import { Box } from "@saleor/macaw-ui-next";
import { Code, EllipsisVertical } from "lucide-react";
import { type ReactElement, type ReactNode } from "react";
import { useIntl } from "react-intl";

import {
  isLineDiscounted,
  isLineExplainable,
  type LineReasonDisplay,
} from "../OrderDetailsDatagrid/datagrid";
import { columnsMessages } from "../OrderDetailsDatagrid/messages";
import { messages as priceBreakdownMessages } from "../OrderLinePriceBreakdown/messages";
import styles from "./OrderDetailsLineList.module.css";

interface OrderDetailsLineListProps {
  getLineMenuItems: (index: number) => TopNavMenuItem[];
  lineReasons?: LineReasonDisplay[];
  lines: OrderLineFragment[];
  loading: boolean;
  onOrderLineShowMetadata: (id: string) => void;
  onShowLinePriceBreakdown?: (lineId: string) => void;
}

interface PriceValueProps {
  current: string;
  label: string;
  onClick?: () => void;
  original?: string;
}

const PriceValue = ({ current, label, onClick, original }: PriceValueProps): ReactElement => {
  const content = (
    <>
      <span className={styles.priceLabel}>{label}</span>
      <span className={styles.priceValue}>
        {original && <del className={styles.originalPrice}>{original}</del>}
        {current}
      </span>
    </>
  );

  if (!onClick) {
    return <div className={styles.price}>{content}</div>;
  }

  return (
    <button className={`${styles.price} ${styles.priceButton}`} onClick={onClick} type="button">
      {content}
    </button>
  );
};

const Detail = ({ label, children }: { label: string; children: ReactNode }): ReactElement => (
  <div className={styles.detail}>
    <span className={styles.detailLabel}>{label}</span>
    <span className={styles.detailValue}>{children}</span>
  </div>
);

export const OrderDetailsLineList = ({
  getLineMenuItems,
  lineReasons,
  lines,
  loading,
  onOrderLineShowMetadata,
  onShowLinePriceBreakdown,
}: OrderDetailsLineListProps): ReactElement => {
  const intl = useIntl();
  const { locale } = useLocale();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" padding={8}>
        <SaleorThrobber />
      </Box>
    );
  }

  if (lines.length === 0) {
    return (
      <Box padding={4}>
        <Placeholder>{intl.formatMessage(orderMessages.emptyText)}</Placeholder>
      </Box>
    );
  }

  return (
    <ul className={styles.list} data-test-id="order-details-mobile-lines">
      {lines.map((line, index) => {
        const discounted = isLineDiscounted(line);
        const explainable = Boolean(onShowLinePriceBreakdown) && isLineExplainable(line);
        const lineReason = lineReasons?.[index];
        const reason = [lineReason?.reasonType, lineReason?.reason].filter(Boolean).join(": ");
        const unitPrice = formatMoney(line.unitPrice.gross, locale);
        const unitPriceOriginal = discounted
          ? formatMoney(line.undiscountedUnitPrice.gross, locale)
          : undefined;
        const totalPrice = formatMoney(line.totalPrice.gross, locale);
        const totalPriceOriginal = discounted
          ? formatMoney(line.undiscountedTotalPrice.gross, locale)
          : undefined;
        const showPriceBreakdown: (() => void) | undefined = explainable
          ? (): void => {
              onShowLinePriceBreakdown?.(line.id);
            }
          : undefined;
        const menuItems = getLineMenuItems(index);

        return (
          <li className={styles.item} key={line.id}>
            <div className={styles.product}>
              <div className={styles.thumbnail}>
                {line.thumbnail?.url ? (
                  <img
                    alt=""
                    className={styles.thumbnailImage}
                    loading="lazy"
                    src={line.thumbnail.url}
                  />
                ) : (
                  <span aria-hidden="true" className={styles.thumbnailFallback}>
                    {line.productName?.charAt(0) || "–"}
                  </span>
                )}
              </div>

              <div className={styles.identity}>
                <strong className={styles.productName}>{line.productName || "–"}</strong>
                {line.variant?.name && (
                  <span className={styles.variantName}>{line.variant.name}</span>
                )}
                {line.productSku && <span className={styles.sku}>{line.productSku}</span>}
              </div>

              <span className={styles.quantity}>
                {intl.formatMessage(columnsMessages.quantity)}: {line.quantity}
              </span>
            </div>

            <div className={styles.prices}>
              <PriceValue
                current={unitPrice}
                label={intl.formatMessage(columnsMessages.price)}
                onClick={showPriceBreakdown}
                original={unitPriceOriginal}
              />
              <PriceValue
                current={totalPrice}
                label={intl.formatMessage(columnsMessages.total)}
                onClick={showPriceBreakdown}
                original={totalPriceOriginal}
              />
            </div>

            {(line.isGift || line.priceOverrideReason || reason) && (
              <div className={styles.details}>
                {line.isGift && (
                  <span className={styles.gift}>{intl.formatMessage(columnsMessages.isGift)}</span>
                )}
                {line.priceOverrideReason && (
                  <Detail label={intl.formatMessage(columnsMessages.priceOverrideReason)}>
                    {line.priceOverrideReason}
                  </Detail>
                )}
                {reason && (
                  <Detail label={intl.formatMessage(columnsMessages.reason)}>{reason}</Detail>
                )}
              </div>
            )}

            <div className={styles.actions}>
              {explainable && (
                <button className={styles.actionButton} onClick={showPriceBreakdown} type="button">
                  {intl.formatMessage(priceBreakdownMessages.modalTitle)}
                </button>
              )}
              <button
                className={styles.actionButton}
                disabled={loading}
                onClick={() => onOrderLineShowMetadata(line.id)}
                type="button"
              >
                <Code aria-hidden="true" size={16} />
                {intl.formatMessage(rowActionMessages.showMetadata)}
              </button>
              {menuItems.length > 0 && (
                <Menu
                  items={menuItems}
                  trigger={
                    <button className={styles.actionButton} disabled={loading} type="button">
                      <EllipsisVertical aria-hidden="true" size={16} />
                      {intl.formatMessage(buttonMessages.moreOptions)}
                    </button>
                  }
                />
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
};
