import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Building2, BedDouble, CalendarCheck, Clock, Plus, ArrowRight } from "lucide-react";
import { residences, roomTypes, bookings, getResidenceById } from "@/data/mockData";
import { format } from "date-fns";

const AdminDashboard = () => {
  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const recentBookings = [...bookings]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const stats = [
    {
      title: "Total Residences",
      value: residences.length,
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Room Types",
      value: roomTypes.length,
      icon: BedDouble,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Pending Bookings",
      value: pendingBookings.length,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      highlight: true,
    },
    {
      title: "Total Bookings",
      value: bookings.length,
      icon: CalendarCheck,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-muted-foreground">
          Welcome back! Here's what's happening.
        </h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className={stat.highlight ? "ring-2 ring-amber-300" : ""}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Button asChild>
          <Link to="/admin/residences">
            <Plus className="h-4 w-4 mr-2" />
            Add Residence
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/admin/bookings">
            View All Bookings
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest</TableHead>
                <TableHead>Residence</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentBookings.map((booking) => {
                const residence = getResidenceById(booking.residenceId);
                return (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{booking.guestName}</p>
                        <p className="text-sm text-muted-foreground">{booking.guestEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>{residence?.name || "Unknown"}</TableCell>
                    <TableCell>{format(booking.checkIn, "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      <StatusBadge status={booking.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(booking.createdAt, "MMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
