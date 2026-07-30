import { DashboardCard } from "@dashboard/components/Card";
import { Placeholder } from "@dashboard/components/Placeholder";
import { createFetch } from "@dashboard/legacy-sdk";
import { Button, Skeleton, Text } from "@saleor/macaw-ui-next";
import { ExternalLink, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import styles from "./OrderCustomerConversations.module.css";

const CUSTOMER_CONVERSATIONS_ENDPOINT = "https://chat.ruslibrary.com/cw/ghw-bot";
const authenticatedFetch = createFetch({ refreshOnUnauthorized: false });

interface ConversationAttachment {
  id: number;
  url: string;
  thumbnailUrl: string;
  fileType: string;
}

interface ConversationMessage {
  id: number | string;
  content: string;
  messageType: number | "incoming" | "outgoing";
  contentType: string;
  createdAt: number;
  senderName: string;
  attachments: ConversationAttachment[];
}

interface CustomerConversation {
  id: number | string;
  source: "chatwoot" | "email";
  subject: string;
  status: string;
  inboxId: number;
  createdAt: number;
  lastActivityAt: number;
  chatwootUrl: string;
  messages: ConversationMessage[];
}

interface CustomerConversationsResponse {
  email: string;
  conversations: CustomerConversation[];
}

interface OrderCustomerConversationsProps {
  email: string | null | undefined;
}

const getTimestamp = (value: number): Date => new Date(value * 1000);

export const OrderCustomerConversations = ({
  email,
}: OrderCustomerConversationsProps): JSX.Element => {
  const intl = useIntl();
  const [data, setData] = useState<CustomerConversationsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const loadConversations = useCallback(
    async (signal?: AbortSignal): Promise<void> => {
      if (!email) {
        setData(null);
        setHasError(false);

        return;
      }

      setLoading(true);
      setHasError(false);

      try {
        const endpoint = new URL(CUSTOMER_CONVERSATIONS_ENDPOINT);

        endpoint.searchParams.set("email", email);

        const response = await authenticatedFetch(endpoint.toString(), {
          method: "GET",
          signal,
        });

        if (!response.ok) {
          throw new Error(`Customer conversations request failed with ${response.status}`);
        }

        const result: CustomerConversationsResponse = await response.json();

        if (!signal?.aborted) {
          setData(result);
        }
      } catch (error) {
        if (!signal?.aborted) {
          setHasError(true);
          setData(null);
        }
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [email],
  );

  useEffect(
    function loadCustomerConversations() {
      const controller = new AbortController();

      void loadConversations(controller.signal);

      return function abortCustomerConversationsRequest(): void {
        controller.abort();
      };
    },
    [loadConversations],
  );

  const formatTimestamp = (timestamp: number): string => {
    const date = getTimestamp(timestamp);

    return `${intl.formatDate(date, {
      day: "numeric",
      month: "short",
      year: "numeric",
    })}, ${intl.formatTime(date, {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const formatStatus = (status: string): string => {
    switch (status) {
      case "resolved":
        return intl.formatMessage({
          id: "W6nSYE",
          defaultMessage: "Resolved",
        });
      case "pending":
        return intl.formatMessage({
          id: "eKEL/g",
          defaultMessage: "Pending",
        });
      case "snoozed":
        return intl.formatMessage({
          id: "iH+vKS",
          defaultMessage: "Snoozed",
        });
      default:
        return intl.formatMessage({
          id: "JfG49w",
          defaultMessage: "Open",
        });
    }
  };

  return (
    <DashboardCard data-test-id="customer-conversations">
      <DashboardCard.Header>
        <DashboardCard.Title>
          <FormattedMessage id="PTlcy9" defaultMessage="Customer conversations" />
        </DashboardCard.Title>
        {!!email && (
          <DashboardCard.Toolbar>
            <Button
              variant="secondary"
              onClick={() => void loadConversations()}
              disabled={loading}
              data-test-id="refresh-customer-conversations"
            >
              <RefreshCw size={16} />
              <FormattedMessage id="rELDbB" defaultMessage="Refresh" />
            </Button>
          </DashboardCard.Toolbar>
        )}
      </DashboardCard.Header>
      <DashboardCard.Content>
        {!email ? (
          <Placeholder>
            <FormattedMessage id="0FVOg6" defaultMessage="No customer email is available" />
          </Placeholder>
        ) : loading && !data ? (
          <>
            <Skeleton __height="56px" __marginBottom="12px" />
            <Skeleton __height="56px" />
          </>
        ) : hasError ? (
          <div className={styles.error}>
            <Text color="critical1">
              <FormattedMessage
                id="sqNhFZ"
                defaultMessage="Could not load customer conversations"
              />
            </Text>
            <Button variant="secondary" onClick={() => void loadConversations()}>
              <FormattedMessage id="FazwRl" defaultMessage="Try again" />
            </Button>
          </div>
        ) : !data?.conversations.length ? (
          <Placeholder>
            <FormattedMessage id="4DdW7k" defaultMessage="No conversations for this email" />
          </Placeholder>
        ) : (
          <div className={styles.scrollArea}>
            {data.conversations.map(conversation => (
              <section className={styles.conversation} key={conversation.id}>
                <div className={styles.conversationHeader}>
                  <div className={styles.conversationMeta}>
                    <Text fontWeight="bold">
                      {conversation.source === "email" ? (
                        <>
                          <FormattedMessage id="sy+pv5" defaultMessage="Email" />:{" "}
                          {conversation.subject || (
                            <FormattedMessage id="Zay6OH" defaultMessage="No subject" />
                          )}
                        </>
                      ) : (
                        <FormattedMessage
                          id="NlPrGG"
                          defaultMessage="Conversation #{number}"
                          values={{ number: conversation.id }}
                        />
                      )}
                    </Text>
                    <Text size={2} color="default2">
                      {conversation.source === "email" ? (
                        <FormattedMessage id="sy+pv5" defaultMessage="Email" />
                      ) : (
                        formatStatus(conversation.status)
                      )}{" "}
                      · {formatTimestamp(conversation.lastActivityAt)}
                    </Text>
                  </div>
                  {!!conversation.chatwootUrl && (
                    <a
                      className={styles.conversationLink}
                      href={conversation.chatwootUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink size={14} />
                      <FormattedMessage id="JfG49w" defaultMessage="Open" />
                    </a>
                  )}
                </div>
                {conversation.messages.length ? (
                  <div className={styles.messageList}>
                    {conversation.messages.map(message => {
                      const isOutgoing =
                        message.messageType === 1 || message.messageType === "outgoing";

                      return (
                        <div
                          className={`${styles.message} ${
                            isOutgoing ? styles.outgoing : styles.incoming
                          }`}
                          key={message.id}
                        >
                          <Text>{message.content}</Text>
                          {!!message.attachments.length && (
                            <div className={styles.attachments}>
                              {message.attachments.map(attachment => (
                                <a
                                  className={styles.attachmentLink}
                                  href={attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  key={attachment.id}
                                >
                                  <FormattedMessage id="eLCAEP" defaultMessage="Attachment" />
                                  {attachment.fileType ? ` (${attachment.fileType})` : ""}
                                </a>
                              ))}
                            </div>
                          )}
                          <span className={styles.messageMeta}>
                            {isOutgoing ? (
                              <FormattedMessage id="HqRNN8" defaultMessage="Support" />
                            ) : (
                              message.senderName || (
                                <FormattedMessage id="hkENym" defaultMessage="Customer" />
                              )
                            )}{" "}
                            · {formatTimestamp(message.createdAt)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <Text size={2} color="default2">
                    <FormattedMessage
                      id="Kt1byr"
                      defaultMessage="No customer messages in this conversation"
                    />
                  </Text>
                )}
              </section>
            ))}
          </div>
        )}
      </DashboardCard.Content>
    </DashboardCard>
  );
};

OrderCustomerConversations.displayName = "OrderCustomerConversations";
