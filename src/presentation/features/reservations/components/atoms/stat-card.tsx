import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export interface StatCardProps {
  title: string;
  value: string;
  Icon: React.ComponentType<{ className?: string }>;
  trend?: "up" | "down" | "neutral";
  changeLabel?: string;
}

export const StatCard = ({
  title,
  value,
  Icon,
  trend = "neutral",
  changeLabel,
}: StatCardProps) => (
  <Card className="card-hover">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {changeLabel && (
        <p
          className={`text-xs ${
            trend === "up"
              ? "text-green-600"
              : trend === "down"
                ? "text-red-600"
                : "text-gray-500"
          }`}
        >
          {changeLabel}
        </p>
      )}
    </CardContent>
  </Card>
);
