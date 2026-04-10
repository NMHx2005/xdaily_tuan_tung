"use client";

import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

export function AdminContactMessagesClient() {
  const utils = trpc.useUtils();
  const { data, isLoading, error } = trpc.contact.list.useQuery({ take: 200 });
  const markRead = trpc.contact.markRead.useMutation({
    onSuccess: async () => {
      await utils.contact.list.invalidate();
    },
  });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Đang tải…</p>;
  }
  if (error) {
    return (
      <p className="text-sm text-destructive">Không tải được: {error.message}</p>
    );
  }

  if (!data?.length) {
    return (
      <p className="text-sm text-muted-foreground">Chưa có tin nhắn liên hệ.</p>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[140px]">Thời gian</TableHead>
            <TableHead>Họ tên</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>SĐT</TableHead>
            <TableHead className="min-w-[200px]">Nội dung</TableHead>
            <TableHead className="w-[100px]">Đã đọc</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="align-top text-xs whitespace-nowrap">
                {formatDate(row.createdAt)}
              </TableCell>
              <TableCell className="align-top text-sm">{row.name}</TableCell>
              <TableCell className="align-top text-sm">
                <a href={`mailto:${row.email}`} className="text-primary hover:underline">
                  {row.email}
                </a>
              </TableCell>
              <TableCell className="align-top text-sm">{row.phone ?? "—"}</TableCell>
              <TableCell className="align-top text-sm whitespace-pre-wrap max-w-md">
                {row.message}
              </TableCell>
              <TableCell className="align-top">
                {row.readAt ? (
                  <span className="text-xs text-muted-foreground">
                    {formatDate(row.readAt)}
                  </span>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={markRead.isPending}
                    onClick={() => markRead.mutate({ id: row.id })}
                  >
                    Đánh dấu đã đọc
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
