import { Card, CardBody, CardHeader, Skeleton } from "@/components/ui";

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      {/* Page Header Skeleton */}
      <div className="mb-6 space-y-2">
        <Skeleton className="h-4 w-48 rounded-lg" />
        <Skeleton className="h-8 w-80 rounded-xl" />
        <Skeleton className="h-4 w-96 max-w-full rounded-lg" />
      </div>

      {/* KPI 4 Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28 rounded-lg" />
              <Skeleton className="size-10 rounded-2xl" />
            </div>
            <Skeleton className="my-3 h-8 w-20 rounded-xl" />
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="mt-2.5 h-3 w-36 rounded-lg" />
          </Card>
        ))}
      </div>

      {/* 2-column Grid: Peta Jalan & Sebaran Level */}
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader title={<Skeleton className="h-5 w-44 rounded-lg" />} />
          <CardBody>
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-2xl border border-slate-100 p-3.5 space-y-2">
                  <Skeleton className="h-4 w-20 rounded-lg" />
                  <Skeleton className="h-3 w-36 rounded-lg" />
                  <Skeleton className="h-2.5 w-full rounded-lg" />
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={<Skeleton className="h-5 w-36 rounded-lg" />} />
          <CardBody className="flex flex-col items-center justify-center py-8">
            <Skeleton className="size-48 rounded-full" />
            <div className="mt-6 flex gap-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-4 w-16 rounded-lg" />
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Table Card Skeleton */}
      <Card>
        <CardHeader title={<Skeleton className="h-5 w-52 rounded-lg" />} />
        <CardBody className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 first:pt-0 last:border-0">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-2xl" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32 rounded-lg" />
                  <Skeleton className="h-3 w-24 rounded-lg" />
                </div>
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-16 rounded-lg" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}

