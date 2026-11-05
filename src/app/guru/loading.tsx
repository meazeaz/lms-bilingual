import { Card, CardBody, CardHeader, Skeleton } from "@/components/ui";

export default function TeacherLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-40 rounded-lg" />
        <Skeleton className="h-8 w-72 rounded-xl" />
        <Skeleton className="h-4 w-96 max-w-full rounded-lg" />
      </div>

      {/* Level Hero Card with Ring & Checklist */}
      <Card className="p-6 sm:p-7">
        <div className="grid gap-6 md:grid-cols-[auto_1fr_auto] items-center">
          <Skeleton className="size-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48 rounded-xl" />
            <Skeleton className="h-4 w-64 rounded-lg" />
            <Skeleton className="h-3 w-40 rounded-lg" />
          </div>
          <Skeleton className="h-11 w-36 rounded-2xl" />
        </div>

        {/* Readiness Checklist Skeleton */}
        <div className="mt-6 border-t border-slate-100 pt-5">
          <Skeleton className="mb-3 h-4 w-44 rounded-lg" />
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-2.5 rounded-2xl border border-slate-100 p-3">
                <Skeleton className="size-5 rounded-full shrink-0" />
                <div className="min-w-0 flex-1 space-y-1">
                  <Skeleton className="h-3.5 w-full rounded-lg" />
                  <Skeleton className="h-2.5 w-1/2 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 4 Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24 rounded-lg" />
              <Skeleton className="size-10 rounded-2xl" />
            </div>
            <Skeleton className="my-3 h-8 w-16 rounded-xl" />
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="mt-2.5 h-3 w-28 rounded-lg" />
          </Card>
        ))}
      </div>

      {/* Chart & Badges Grid */}
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader title={<Skeleton className="h-5 w-44 rounded-lg" />} />
          <CardBody className="space-y-4">
            <Skeleton className="h-48 w-full rounded-2xl" />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={<Skeleton className="h-5 w-32 rounded-lg" />} />
          <CardBody>
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <Skeleton className="size-14 rounded-2xl" />
                  <Skeleton className="h-2.5 w-10 rounded-md" />
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

