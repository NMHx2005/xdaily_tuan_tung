import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { formatShippingAddressLine } from "@/lib/format-shipping-address";

export type OrderConfirmationItem = {
  name: string;
  variantName: string | null;
  price: number;
  quantity: number;
  imageUrl: string;
};

export type OrderConfirmationPayload = {
  orderNumber: string;
  shippingName: string;
  shippingPhone: string;
  shippingEmail: string;
  shippingAddress: string;
  shippingCity: string;
  shippingDistrict: string;
  shippingWard: string;
  shippingNote: string | null;
  paymentMethod: "COD" | "VNPAY" | "MOMO";
  subtotal: number;
  shippingFee: number;
  total: number;
  createdAt: string;
  items: OrderConfirmationItem[];
  siteUrl: string;
  logoUrl: string;
};

function formatVnd(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(n) + "₫";
}

const PAYMENT_LABEL: Record<OrderConfirmationPayload["paymentMethod"], string> = {
  COD: "Thanh toán khi nhận hàng (COD)",
  VNPAY: "VNPay",
  MOMO: "Ví MoMo",
};

export function OrderConfirmationEmail({ order }: { order: OrderConfirmationPayload }) {
  const preview = `Đơn hàng #${order.orderNumber} — XDAILY`;

  return (
    <Html lang="vi">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Link href={order.siteUrl} style={logoLink}>
              <Img
                src={order.logoUrl}
                width={160}
                height={48}
                alt="XDAILY"
                style={logoImg}
              />
            </Link>
          </Section>

          <Heading style={h1}>Xác nhận đơn hàng #{order.orderNumber}</Heading>
          <Text style={paragraph}>Cảm ơn bạn đã đặt hàng tại XDAILY!</Text>
          <Text style={muted}>
            Thời gian đặt: {order.createdAt}
          </Text>

          <Section style={tableSection}>
            <Text style={tableTitle}>Chi tiết sản phẩm</Text>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th} />
                  <th style={thLeft}>Sản phẩm</th>
                  <th style={th}>SL</th>
                  <th style={thRight}>Đơn giá</th>
                  <th style={thRight}>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((line, i) => (
                  <tr key={i}>
                    <td style={tdImg}>
                      <Img
                        src={line.imageUrl}
                        width={56}
                        height={56}
                        alt=""
                        style={thumb}
                      />
                    </td>
                    <td style={tdName}>
                      <Text style={cellName}>{line.name}</Text>
                      {line.variantName ? (
                        <Text style={variant}>{line.variantName}</Text>
                      ) : null}
                    </td>
                    <td style={tdCenter}>{line.quantity}</td>
                    <td style={tdRight}>{formatVnd(line.price)}</td>
                    <td style={tdRight}>
                      {formatVnd(line.price * line.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section style={summary}>
            <table style={summaryTable}>
              <tbody>
                <tr>
                  <td style={summaryLabel}>Tạm tính</td>
                  <td style={summaryValue}>{formatVnd(order.subtotal)}</td>
                </tr>
                <tr>
                  <td style={summaryLabel}>Phí vận chuyển</td>
                  <td style={summaryValue}>
                    {order.shippingFee === 0
                      ? "Miễn phí"
                      : formatVnd(order.shippingFee)}
                  </td>
                </tr>
                <tr style={totalRow}>
                  <td style={summaryLabelStrong}>Tổng cộng</td>
                  <td style={summaryTotal}>{formatVnd(order.total)}</td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Section style={box}>
            <Text style={boxTitle}>Thông tin giao hàng</Text>
            <Text style={paragraph}>
              <strong>Người nhận:</strong> {order.shippingName}
            </Text>
            <Text style={paragraph}>
              <strong>Số điện thoại:</strong> {order.shippingPhone}
            </Text>
            <Text style={paragraph}>
              <strong>Địa chỉ:</strong> {formatShippingAddressLine(order)}
            </Text>
            {order.shippingNote ? (
              <Text style={paragraph}>
                <strong>Ghi chú:</strong> {order.shippingNote}
              </Text>
            ) : null}
            <Text style={paragraph}>
              <strong>Phương thức thanh toán:</strong>{" "}
              {PAYMENT_LABEL[order.paymentMethod]}
            </Text>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>
            Cần hỗ trợ? Liên hệ chúng tôi qua email hoặc hotline trên website{" "}
            <Link href={order.siteUrl} style={link}>
              {order.siteUrl.replace(/^https?:\/\//, "")}
            </Link>
            .
          </Text>
          <Text style={footerMuted}>© {new Date().getFullYear()} XDAILY</Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f6f6",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "32px 24px 48px",
  maxWidth: "580px",
};

const header = { textAlign: "center" as const, marginBottom: "24px" };

const logoLink = { display: "inline-block" };

const logoImg = { margin: "0 auto", display: "block" };

const h1 = {
  color: "#171717",
  fontSize: "24px",
  fontWeight: "700",
  margin: "24px 0 12px",
  padding: "0",
  textAlign: "center" as const,
};

const paragraph = {
  color: "#404040",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "8px 0",
};

const muted = {
  ...paragraph,
  color: "#737373",
  fontSize: "13px",
  textAlign: "center" as const,
};

const tableSection = { marginTop: "24px" };

const tableTitle = {
  fontSize: "15px",
  fontWeight: 600,
  color: "#171717",
  marginBottom: "12px",
};

const table = {
  width: "100%",
  borderCollapse: "collapse" as const,
  fontSize: "13px",
};

const th = {
  width: "56px",
  padding: "8px 4px",
  borderBottom: "1px solid #e5e5e5",
  color: "#737373",
  fontSize: "11px",
  textTransform: "uppercase" as const,
};

const thLeft = { ...th, textAlign: "left" as const, width: "auto" };

const thRight = { ...th, textAlign: "right" as const };

const tdImg = {
  padding: "10px 8px 10px 0",
  verticalAlign: "top" as const,
  width: "56px",
};

const thumb = {
  borderRadius: "8px",
  objectFit: "cover" as const,
};

const tdName = {
  padding: "10px 8px",
  verticalAlign: "top" as const,
};

const cellName = {
  margin: "0",
  fontSize: "14px",
  fontWeight: 600,
  color: "#171717",
};

const variant = {
  margin: "4px 0 0",
  fontSize: "12px",
  color: "#737373",
};

const tdCenter = {
  padding: "10px 8px",
  textAlign: "center" as const,
  verticalAlign: "middle" as const,
  color: "#404040",
};

const tdRight = {
  padding: "10px 0 10px 8px",
  textAlign: "right" as const,
  verticalAlign: "middle" as const,
  color: "#404040",
  whiteSpace: "nowrap" as const,
};

const summary = { marginTop: "20px" };

const summaryTable = {
  width: "100%",
  borderCollapse: "collapse" as const,
};

const summaryLabel = {
  color: "#737373",
  fontSize: "14px",
  padding: "6px 0",
  width: "50%",
};

const summaryValue = {
  textAlign: "right" as const,
  color: "#404040",
  fontSize: "14px",
  padding: "6px 0",
};

const summaryLabelStrong = {
  ...summaryLabel,
  fontWeight: 700,
  color: "#171717",
  fontSize: "15px",
  paddingTop: "8px",
};

const summaryTotal = {
  textAlign: "right" as const,
  color: "#171717",
  fontWeight: 700,
  fontSize: "17px",
  padding: "12px 0 0",
};

const totalRow = {
  borderTop: "1px solid #e5e5e5",
};

const hr = {
  borderColor: "#e5e5e5",
  margin: "16px 0",
};

const box = {
  backgroundColor: "#fafafa",
  borderRadius: "8px",
  padding: "16px 20px",
  marginTop: "24px",
};

const boxTitle = {
  fontSize: "15px",
  fontWeight: 600,
  color: "#171717",
  margin: "0 0 12px",
};

const footer = {
  color: "#737373",
  fontSize: "13px",
  lineHeight: "20px",
  marginTop: "24px",
  textAlign: "center" as const,
};

const footerMuted = {
  ...footer,
  fontSize: "12px",
  marginTop: "12px",
};

const link = { color: "#ca8a04" };
