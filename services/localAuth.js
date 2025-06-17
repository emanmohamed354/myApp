// services/localAuth.js
import axios from 'axios';
import Config from '../config/config';

const LOCAL_API = `${Config.apiUrl}/api/auth`;

/**
 * Step 2: Get encrypted pairing token from local backend
 * @param {string} accessToken  — JWT from remoteLogin
 * @returns {Promise<string>} pairingToken
 */
export const getPairingToken = async (accessToken) => {
  const response = await axios.get(`${LOCAL_API}/pairing-token`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data.token;
};

/**
 * Step 4: Register the car locally using the payloadData
 * @param {string} payloadData  — encrypted+signed payload
 * @param {string} accessToken
 * @returns {Promise<any>}
 */
export const registerCar = async (payloadData, accessToken) => {
  const response = await axios.post(
    `${LOCAL_API}/register`,
    { payloadData },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  return response.data;
};
