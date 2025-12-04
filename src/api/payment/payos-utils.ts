import { createHmac } from 'node:crypto';

export function sortObjDataByKey(object: Record<string, any>): Record<string, any> {
    if (!object || typeof object !== 'object' || Array.isArray(object)) {
        return object;
    }

    return Object.keys(object)
        .sort()
        .reduce((result: Record<string, any>, key) => {
            const value = object[key];
            // Nếu là object (không phải array), sort đệ quy
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                result[key] = sortObjDataByKey(value);
            } else if (Array.isArray(value)) {
                result[key] = value.map(item =>
                    item && typeof item === 'object' ? sortObjDataByKey(item) : item
                );
            } else {
                result[key] = value ?? ''; // null hoặc undefined → chuỗi rỗng
            }
            return result;
        }, {});
}

export function convertObjToQueryStr(object: Record<string, any>): string {
    return Object.keys(object)
        .sort()
        .map(key => {
            let value = object[key];

            // PayOS yêu cầu null, undefined, 'null', 'undefined' → chuỗi rỗng
            if (value === null || value === undefined || value === 'null' || value === 'undefined') {
                value = '';
            }
            // Nếu là object (không phải array) → stringify sau khi đã sort
            else if (value && typeof value === 'object' && !Array.isArray(value)) {
                value = JSON.stringify(sortObjDataByKey(value));
            }
            // Nếu là array → stringify từng phần tử đã sort
            else if (Array.isArray(value)) {
                value = JSON.stringify(value.map(item => sortObjDataByKey(item)));
            }
            // Các kiểu khác (string, number, boolean) → convert thành string
            else {
                value = String(value);
            }

            return `${key}=${value}`;
        })
        .join('&');
}

export function generateSignature(
    data: Record<string, unknown>,
    checksumKey: string,
) {
    const sortedDataByKey = sortObjDataByKey(data);
    const dataQueryStr = convertObjToQueryStr(sortedDataByKey);
    const dataToSignature = createHmac('sha256', checksumKey)
        .update(dataQueryStr)
        .digest('hex');
    return dataToSignature;
}