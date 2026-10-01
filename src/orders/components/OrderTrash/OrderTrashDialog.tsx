import ActionDialog from "@dashboard/components/ActionDialog";
import { Input } from "@saleor/macaw-ui-next";
import { useState } from "react";
import { useIntl } from "react-intl";

import { trashMessages } from "./messages";
import styles from "./OrderTrash.module.css";
import {
  canMoveOrderToTrash,
  getTrashConfirmation,
  isOrderInTrash,
  type TrashOrder,
} from "./utils";

interface Props {
  orders: TrashOrder[];
  restore: boolean;
  loading: boolean;
  error?: string;
  onClose: () => void;
  onConfirm: (confirmation: string) => void;
}

export const OrderTrashDialog = ({
  orders,
  restore,
  loading,
  error,
  onClose,
  onConfirm,
}: Props) => {
  const intl = useIntl();
  const [confirmation, setConfirmation] = useState("");
  const phrase = getTrashConfirmation(orders.length, restore);
  const eligible =
    orders.length > 0 &&
    orders.length <= 50 &&
    orders.every(restore ? isOrderInTrash : canMoveOrderToTrash);
  const close = () => {
    if (!loading) onClose();
  };

  return (
    <ActionDialog
      open
      title={intl.formatMessage(restore ? trashMessages.restore : trashMessages.move)}
      confirmButtonLabel={intl.formatMessage(restore ? trashMessages.restore : trashMessages.move)}
      confirmButtonState={loading ? "loading" : "default"}
      variant={restore ? "default" : "delete"}
      disabled={loading || !eligible || (!restore && confirmation !== phrase)}
      onClose={close}
      onConfirm={() => onConfirm(restore ? phrase : confirmation)}
    >
      <p>{intl.formatMessage(trashMessages.preserved)}</p>
      <ul className={styles.orders}>
        {orders.map(order => (
          <li key={order.id}>
            <strong>#{order.number}</strong>{" "}
            {[order.billingAddress?.firstName, order.billingAddress?.lastName]
              .filter(Boolean)
              .join(" ") || order.userEmail}
          </li>
        ))}
      </ul>
      {!eligible && (
        <p role="alert" className={styles.error}>
          {intl.formatMessage(orders.length > 50 ? trashMessages.limit : trashMessages.blocked)}
        </p>
      )}
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      {!restore && (
        <Input
          label={intl.formatMessage(trashMessages.confirm, { phrase, count: orders.length })}
          value={confirmation}
          onChange={event => setConfirmation(event.target.value)}
          autoComplete="off"
          role="textbox"
          disabled={loading}
          data-test-id="trash-confirmation"
        />
      )}
    </ActionDialog>
  );
};
