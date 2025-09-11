import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Users, TrendingUp, Calendar, Clock } from "lucide-react";
import prisma from "@repo/db";

function getDateRanges() {
  const now = new Date();
  const today = new Date(now.setHours(0, 0, 0, 0));
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  return {
    today,
    yesterday,
    weekAgo,
    tomorrow,
  };
}

// Server action to get user signup statistics
async function getUserSignupStats() {
  const { today, yesterday, weekAgo, tomorrow } = getDateRanges();

  try {
    // Get signups for today
    const todaySignups = await prisma.user.count({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Get signups for yesterday
    const yesterdaySignups = await prisma.user.count({
      where: {
        createdAt: {
          gte: yesterday,
          lt: today,
        },
      },
    });

    // Get signups for the past week
    const weekSignups = await prisma.user.count({
      where: {
        createdAt: {
          gte: weekAgo,
          lt: tomorrow,
        },
      },
    });

    // Get detailed user data for today
    const todayUsers = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        image: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    return {
      todaySignups,
      yesterdaySignups,
      weekSignups,
      todayUsers,
    };
  } catch (error) {
    console.error("Error fetching user signup stats:", error);
    return {
      todaySignups: 0,
      yesterdaySignups: 0,
      weekSignups: 0,
      todayUsers: [],
    };
  }
}

// Main server component
export default async function UserSignupsPage() {
  const stats = await getUserSignupStats();

  // Calculate growth percentages
  const todayVsYesterday =
    stats.yesterdaySignups > 0
      ? ((stats.todaySignups - stats.yesterdaySignups) /
          stats.yesterdaySignups) *
        100
      : stats.todaySignups > 0
        ? 100
        : 0;

  const avgDailyThisWeek = stats.weekSignups / 7;

  return (
    <div className="min-h-screen dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">User Signups Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track new user registrations across different time periods
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Today's Signups */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Today's Signups
              </h3>
              <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.todaySignups}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {todayVsYesterday >= 0 ? "+" : ""}
              {todayVsYesterday.toFixed(1)}% from yesterday
            </p>
          </div>

          {/* Yesterday's Signups */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Yesterday's Signups
              </h3>
              <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.yesterdaySignups}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Previous day performance
            </p>
          </div>

          {/* Past Week Signups */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Past Week
              </h3>
              <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.weekSignups}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {avgDailyThisWeek.toFixed(1)} avg per day
            </p>
          </div>
        </div>

        {/* Today's New Users */}
        {stats.todayUsers.length > 0 && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Today's New Users
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Latest {stats.todayUsers.length} users who signed up today
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {stats.todayUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name || "User"}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">
                          {user.name || "Anonymous User"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(user.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* No signups today message */}
        {stats.todayUsers.length === 0 && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No signups today yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Check back later to see new user registrations.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
