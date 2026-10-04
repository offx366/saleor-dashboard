import jwtDecode from "jwt-decode";

import { createApolloClient } from "../apollo";
import { USER } from "../apollo/queries";
import { DEVELOPMENT_MODE, WINDOW_EXISTS } from "../constants";
import { isInternalToken } from "../helpers";
import { auth } from "./auth";
import { getSessionVersion } from "./sessionRefresh";
import { getState, type State } from "./state";
import { createStorage, storage } from "./storage";
import { type JWTToken, type SaleorClient, type SaleorClientOpts } from "./types";
import { user } from "./user";

export const createSaleorClient = ({
  apiUrl,
  channel,
  opts = {},
}: SaleorClientOpts): SaleorClient => {
  let _channel = channel;
  const { autologin = true, fetchOpts } = opts;

  const setChannel = (channel: string): string => {
    _channel = channel;

    return _channel;
  };

  createStorage(autologin);

  const apolloClient = createApolloClient(apiUrl, autologin, fetchOpts);
  const authSDK = auth({ apolloClient });
  const userSDK = user({ apolloClient, channel: _channel });

  const refreshToken = storage.getRefreshToken();

  if (autologin && refreshToken) {
    const version = getSessionVersion();
    const restoreSession = async (): Promise<void> => {
      try {
        let owner: string;

        try {
          owner = jwtDecode<JWTToken>(refreshToken).owner;
        } catch {
          // A malformed stored JWT cannot be repaired by retrying the network.
          await authSDK.logout();

          return;
        }

        if (isInternalToken(owner)) {
          await authSDK.refreshToken(true);
        } else {
          await authSDK.refreshExternalToken(true);
        }
      } catch {
        // Keep a stored refresh token on network failure. A reload can retry recovery.
      } finally {
        if (version === getSessionVersion()) {
          apolloClient.writeQuery({ query: USER, data: { authenticating: false } });
        }
      }
    };

    void restoreSession();
  }

  const client = {
    auth: authSDK,
    user: userSDK,
    config: { channel: _channel, setChannel, autologin },
    _internal: { apolloClient },
    getState: (): State => getState(apolloClient),
  };

  if (DEVELOPMENT_MODE && WINDOW_EXISTS) {
    (window as any).__SALEOR_CLIENT__ = client;
  }

  return client;
};
