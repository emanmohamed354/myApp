// services/remoteAuth.js
import axios from 'axios';
import Config from '../config/config';

const REMOTE_API = `${Config.remoteUrl}/auth`;

export const verifyPairing = async (pairingToken, payload, accessToken) => {
  const response = await axios.post(
    `${REMOTE_API}/verify-pairing`,
    { token: pairingToken, payload },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  return {
    carRefreshToken: response.data.carRefreshToken,
    payloadData: response.data.payloadData,
  };
};
