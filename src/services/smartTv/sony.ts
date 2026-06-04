import { fetchWithTimeout } from '../../utils/network';
import { SONY_IRCC } from './commandMaps';
import type { SmartTvSendResult } from './types';

const SOAP_BODY = (code: string) =>
  `<?xml version="1.0"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
  <s:Body>
    <u:X_SendIRCCCommand xmlns:u="urn:schemas-sony-com:service:IRCC:1">
      <IRCCCode>${code}</IRCCCode>
    </u:X_SendIRCCCommand>
  </s:Body>
</s:Envelope>`;

export async function sendSonyCommand(
  host: string,
  command: string,
): Promise<SmartTvSendResult> {
  const code = SONY_IRCC[command];
  if (!code) {
    return { success: false, error: `Commande Sony inconnue: ${command}` };
  }

  const url = `http://${host}/sony/IRCC`;
  try {
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=UTF-8',
        SOAPAction: '"urn:schemas-sony-com:service:IRCC:1#X_SendIRCCCommand"',
      },
      body: SOAP_BODY(code),
    });
    if (res.ok) return { success: true };
    return { success: false, error: `Sony HTTP ${res.status}` };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : 'Erreur réseau' };
  }
}

export async function probeSony(host: string, timeoutMs = 800): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(`http://${host}/sony/system`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method: 'getSystemInformation', id: 1, params: [], version: '1.0' }),
    }, timeoutMs);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.result?.[0]?.product ?? 'Sony Bravia';
  } catch {
    return null;
  }
}
