import { useOrderTrashMutation } from "@dashboard/graphql";
import { useNotifier } from "@dashboard/hooks/useNotifier";
import { Button } from "@saleor/macaw-ui-next";
import { RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { useIntl } from "react-intl";

import { trashMessages } from "./messages";
import { OrderTrashDialog } from "./OrderTrashDialog";
import { type TrashOrder } from "./utils";

interface Props {
  orders: TrashOrder[];
  restore: boolean;
  onCompleted: () => void;
}

export const OrderTrashControls = ({ orders, restore, onCompleted }: Props) => {
  const intl = useIntl();
  const notify = useNotifier();
  const [selected, setSelected] = useState<TrashOrder[] | null>(null);
  const [error, setError] = useState("");
  const [apply, { loading }] = useOrderTrashMutation();
  const confirm = async (confirmation: string) => {
    if (!selected || loading) return;

    setError("");

    try {
      const result = await apply({
        variables: {
          ids: selected.map(order => order.id),
          numbers: selected.map(order => order.number),
          restore,
          confirmation,
        },
      });
      const errors = result.data?.orderTrash?.errors;

      if (!result.data?.orderTrash || errors?.length) {
        setError(
          errors?.map(item => item.message).join(" ") ||
            intl.formatMessage(trashMessages.uncertain),
        );

        return;
      }

      notify({
        status: "success",
        text: intl.formatMessage(restore ? trashMessages.restored : trashMessages.success),
      });
      setSelected(null);
      onCompleted();
    } catch {
      setError(intl.formatMessage(trashMessages.uncertain));
    }
  };

  return (
    <>
      <Button
        variant="secondary"
        disabled={orders.length === 0 || loading}
        onClick={() => {
          setError("");
          setSelected([...orders]);
        }}
        data-test-id="order-trash-action"
      >
        {restore ? <RotateCcw size={16} /> : <Trash2 size={16} />}
        {intl.formatMessage(restore ? trashMessages.restore : trashMessages.move)}
        {orders.length > 0 && ` (${orders.length})`}
      </Button>
      {selected && (
        <OrderTrashDialog
          orders={selected}
          restore={restore}
          loading={loading}
          error={error}
          onConfirm={confirm}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
};
