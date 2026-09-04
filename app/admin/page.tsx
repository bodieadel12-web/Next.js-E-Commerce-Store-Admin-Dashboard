import db from "./dp/dp";
import { DollarSign, ShoppingCart, Tag, TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";

export const dynamic = "force-dynamic";

function formatNumber(num: number): string {
  return num.toLocaleString();
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function generateWavePath(dataPoints: number[], width = 140, height = 45) {
  let values = [...dataPoints];
  if (!values || values.length === 0) values = [0, 0, 0, 0, 0, 0, 0];

  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min === 0 ? 1 : max - min;

  const points = values.map((val, idx) => {
    const x = (idx / (values.length - 1)) * width;
    const y = height - 6 - ((val - min) / range) * (height - 12);
    return { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) };
  });

  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

    const cp1x = (p1.x + (p2.x - p0.x) / 6).toFixed(2);
    const cp1y = (p1.y + (p2.y - p0.y) / 6).toFixed(2);
    const cp2x = (p2.x - (p3.x - p1.x) / 6).toFixed(2);
    const cp2y = (p2.y - (p3.y - p1.y) / 6).toFixed(2);

    pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;
  return { pathD, areaD };
}

function getCalendarDayIndex(date: Date, startOfToday: Date): number {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  const diffTime = startOfToday.getTime() - targetDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
  return 6 - diffDays;
}

async function getSalesData() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const fourteenDaysAgo = new Date(today);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);

  const [aggregateData, recentOrders] = await Promise.all([
    db.order.aggregate({
      _sum: { pricePaidInCents: true },
      _count: true,
    }),
    db.order.findMany({
      where: { createdAt: { gte: fourteenDaysAgo } },
      select: { createdAt: true, pricePaidInCents: true },
    }),
  ]);

  const amount = (aggregateData._sum?.pricePaidInCents || 0) / 100;
  const numberOfSales = aggregateData._count;

  const dailyRevenue = Array(7).fill(0);
  const dailyOrders = Array(7).fill(0);

  let current7DaysRev = 0;
  let prev7DaysRev = 0;
  let current7DaysOrders = 0;
  let prev7DaysOrders = 0;

  recentOrders.forEach((order) => {
    const dayIndex = getCalendarDayIndex(new Date(order.createdAt), today);
    const rev = order.pricePaidInCents / 100;

    if (dayIndex >= 0 && dayIndex <= 6) {
      dailyRevenue[dayIndex] += rev;
      dailyOrders[dayIndex] += 1;
      current7DaysRev += rev;
      current7DaysOrders += 1;
    } else if (dayIndex < 0 && dayIndex >= -7) {
      prev7DaysRev += rev;
      prev7DaysOrders += 1;
    }
  });

  let accRev = 0;
  const cumulativeRevenue = dailyRevenue.map((val) => {
    accRev += val;
    return accRev;
  });

  let accOrders = 0;
  const cumulativeOrders = dailyOrders.map((val) => {
    accOrders += val;
    return accOrders;
  });

  return {
    amount,
    numberOfSales,
    revenueTrend: cumulativeRevenue,
    ordersTrend: cumulativeOrders,
    revenueChange: calculatePercentageChange(current7DaysRev, prev7DaysRev),
    ordersChange: calculatePercentageChange(current7DaysOrders, prev7DaysOrders),
  };
}

async function getCustomersData() {
  const [userCount, orderData] = await Promise.all([
    db.user.count(),
    db.order.aggregate({ _sum: { pricePaidInCents: true } }),
  ]);

  return {
    userCount,
    averageValuePerUser: userCount === 0 ? 0 : (orderData._sum?.pricePaidInCents || 0) / 100 / userCount,
  };
}

async function getProductsData() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const fourteenDaysAgo = new Date(today);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);

  const [activeProductsCount, inactiveProductsCount, recentProducts] = await Promise.all([
    db.product.count({ where: { isAvailableForPurchase: true } }),
    db.product.count({ where: { isAvailableForPurchase: false } }),
    db.product.findMany({
      where: { createdAt: { gte: fourteenDaysAgo } },
      select: { createdAt: true, isAvailableForPurchase: true },
    }),
  ]);

  const dailyProducts = Array(7).fill(0);
  let currentProductsCount = 0;
  let prevProductsCount = 0;

  recentProducts.forEach((p) => {
    const dayIndex = getCalendarDayIndex(new Date(p.createdAt), today);
    if (dayIndex >= 0 && dayIndex <= 6) {
      if (p.isAvailableForPurchase) dailyProducts[dayIndex] += 1;
      currentProductsCount++;
    } else if (dayIndex < 0 && dayIndex >= -7) {
      prevProductsCount++;
    }
  });

  let runningTotal = activeProductsCount - dailyProducts.reduce((a, b) => a + b, 0);
  const productsTrend = dailyProducts.map((addedToday) => {
    runningTotal += addedToday;
    return runningTotal;
  });

  return {
    activeProductsCount,
    inactiveProductsCount,
    productsTrend,
    productsChange: calculatePercentageChange(currentProductsCount, prevProductsCount),
  };
}

export default async function AdminDashboard() {
  const [salesData, userData, productsData] = await Promise.all([
    getSalesData(),
    getCustomersData(),
    getProductsData(),
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        Dashboard Overview
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <DashboardCard
          title="Net Revenue"
          subtitle={`${formatNumber(salesData.numberOfSales)} Orders`}
          body={formatCurrency(salesData.amount)}
          icon={DollarSign}
          dataTrend={salesData.revenueTrend}
          changePercentage={salesData.revenueChange}
          accentColor="#0f172a"
        />
        <DashboardCard
          title="Total Orders"
          subtitle={`${formatCurrency(userData.averageValuePerUser)} Avg. Value`}
          body={formatNumber(salesData.numberOfSales)}
          icon={ShoppingCart}
          dataTrend={salesData.ordersTrend}
          changePercentage={salesData.ordersChange}
          accentColor="#2563eb"
        />
        <DashboardCard
          title="Active Products"
          subtitle={`${formatNumber(productsData.inactiveProductsCount)} Inactive`}
          body={formatNumber(productsData.activeProductsCount)}
          icon={Tag}
          dataTrend={productsData.productsTrend}
          changePercentage={productsData.productsChange}
          accentColor="#4f46e5"
        />
      </div>
    </div>
  );
}

type DashboardCardProps = {
  title: string;
  subtitle: string;
  body: string;
  icon: LucideIcon;
  dataTrend: number[];
  changePercentage: number;
  accentColor: string;
};

function DashboardCard({
  title,
  subtitle,
  body,
  icon: Icon,
  dataTrend,
  changePercentage,
  accentColor,
}: DashboardCardProps) {
  const wave = generateWavePath(dataTrend);
  const gradientId = `grad-${title.replace(/\s+/g, "")}`;

  return (
    <div
      style={{ border: "none" }}
      className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_25px_-4px_rgba(0,0,0,0.08)] transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
            <Icon className="w-5 h-5 stroke-[2]" />
          </div>
          <span className="font-semibold text-slate-600 dark:text-slate-400 text-sm">{title}</span>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2 mt-2">
        <div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {body}
          </div>

          <div className="flex items-center gap-1.5 mt-2">
            {changePercentage > 0 ? (
              <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                <TrendingUp className="w-3.5 h-3.5" />
                +{changePercentage}%
              </span>
            ) : changePercentage < 0 ? (
              <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-md">
                <TrendingDown className="w-3.5 h-3.5" />
                {changePercentage}%
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                0.0%
              </span>
            )}
            <span className="text-slate-400 dark:text-slate-500 text-xs font-medium">
              from last week
            </span>
          </div>
        </div>

        <div className="w-32 h-11 relative overflow-visible flex-shrink-0">
          <svg className="w-full h-full" viewBox="0 0 140 45" preserveAspectRatio="none">
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accentColor} stopOpacity="0.2" />
                <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={wave.areaD} fill={`url(#${gradientId})`} />
            <path
              d={wave.pathD}
              fill="none"
              stroke={accentColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}