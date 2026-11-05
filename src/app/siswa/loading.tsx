import { Card, CardBody, CardHeader, Skeleton } from "@/components/ui";

export default function StudentLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-32 rounded-lg" />
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-4 w-80 max-w-full rounded-lg" />
      </div>

      {/* Top Section: CEFR Level Ring Card & 4 Stat Cards */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
          <Skeleton className="size-32 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-28 rounded-full" />
            <Skeleton className="h-6 w-56 rounded-xl" />
            <Skeleton className="h-4 w-full rounded-lg" />
            <Skeleton className="h-3 w-4/5 rounded-lg" />
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-16 rounded-lg" />
                <Skeleton className="size-8 rounded-xl" />
              </div>
              <Skeleton className="my-2 h-7 w-12 rounded-lg" />
              <Skeleton className="h-2.5 w-24 rounded-md" />
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom Section: Progress Chart & Material Cards */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader title={<Skeleton className="h-5 w-48 rounded-lg" />} />
          <CardBody>
            <Skeleton className="h-44 w-full rounded-2xl" />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={<Skeleton className="h-5 w-36 rounded-lg" />} />
          <CardBody className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 p-3">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-36 rounded-lg" />
                  <Skeleton className="h-3 w-20 rounded-md" />
                </div>
                <Skeleton className="h-8 w-20 rounded-xl" />
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

