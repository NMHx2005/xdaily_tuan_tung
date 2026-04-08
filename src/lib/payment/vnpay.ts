import crypto from 'crypto';

interface VnpayPaymentParams {
  orderId: string;
  amount: number;
  orderInfo: string;
  ipAddr: string;
}

export function createVnpayPaymentUrl(params: VnpayPaymentParams): string {
  const tmnCode = process.env.VNPAY_TMN_CODE;
  const hashSecret = process.env.VNPAY_HASH_SECRET;
  const vnpUrl = process.env.VNPAY_URL;
  const returnUrl = process.env.VNPAY_RETURN_URL;

  if (!tmnCode || !hashSecret || !vnpUrl || !returnUrl) {
    throw new Error('VNPay environment variables are not configured');
  }

  const date = new Date();
  const createDate = formatVnpDate(date);
  const expireDate = formatVnpDate(new Date(date.getTime() + 15 * 60 * 1000));

  const vnpParams: Record<string, string> = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: tmnCode,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: params.orderId,
    vnp_OrderInfo: params.orderInfo,
    vnp_OrderType: 'other',
    vnp_Amount: String(params.amount * 100),
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: params.ipAddr,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };

  const sortedParams = Object.keys(vnpParams)
    .sort()
    .reduce((acc, key) => {
      acc[key] = vnpParams[key];
      return acc;
    }, {} as Record<string, string>);

  const signData = new URLSearchParams(sortedParams).toString();
  const hmac = crypto.createHmac('sha512', hashSecret);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  sortedParams['vnp_SecureHash'] = signed;

  return `${vnpUrl}?${new URLSearchParams(sortedParams).toString()}`;
}

export function verifyVnpayReturn(query: Record<string, string>): boolean {
  const hashSecret = process.env.VNPAY_HASH_SECRET;
  if (!hashSecret) return false;
  const secureHash = query['vnp_SecureHash'];

  if (!secureHash) return false;

  const params = { ...query };
  delete params['vnp_SecureHash'];
  delete params['vnp_SecureHashType'];

  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as Record<string, string>);

  const signData = new URLSearchParams(sortedParams).toString();
  const hmac = crypto.createHmac('sha512', hashSecret);
  const checkSum = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  return secureHash === checkSum;
}

function formatVnpDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${y}${m}${d}${h}${min}${s}`;
}
