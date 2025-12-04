import { createHmac } from 'node:crypto';
import { sortObjDataByKey, convertObjToQueryStr } from './payos-utils';

export interface VerifyWebhookResult {
    success: boolean;
    message: string;
    body?: any;
    calculatedSignature?: string;
}

export function verifyWebhookSignature(
    rawBody: string,
    checksumKey: string,
): VerifyWebhookResult {
    if (!rawBody) return { success: false, message: 'Empty raw body' };

    let parsed: any;
    try {
        parsed = JSON.parse(rawBody);
    } catch {
        return { success: false, message: 'Invalid JSON' };
    }

    const receivedSignature = parsed.signature;
    if (!receivedSignature) return { success: false, message: 'Missing signature' };

    // PayOS only uses the 'data' object for signature verification
    const dataObj = parsed.data || {};

    // Sort + convert
    const sorted = sortObjDataByKey(dataObj);
    const queryStr = convertObjToQueryStr(sorted);

    const calculated = createHmac('sha256', checksumKey)
        .update(queryStr)
        .digest('hex');

    // console.log('Data object for signature:', JSON.stringify(dataObj));
    // console.log('Query string:', queryStr);
    // console.log('Calculated :', calculated);
    // console.log('Received   :', receivedSignature);

    if (calculated !== receivedSignature) {
        return {
            success: false,
            message: 'Invalid signature',
            calculatedSignature: calculated,
        };
    }

    return {
        success: true,
        message: 'OK',
        body: parsed,
    };
}