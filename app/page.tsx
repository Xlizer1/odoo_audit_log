/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState, useRef } from "react";
import { OdooLog } from "@/types";
import { LogItem } from "@/components/dashboard/log-item";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
} from "lucide-react";
import { ActivityGraph } from "@/components/dashboard/activity-graph";
import { Leaderboard } from "@/components/dashboard/leaderboard";
import { format, startOfDay, endOfDay } from "date-fns";
import { DateRange } from "react-day-picker";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [logs, setLogs] = useState<OdooLog[]>([]);
  const [loading, setLoading] = useState(false);

  const [graphData, setGraphData] = useState<{ time: string; count: number }[]>(
    []
  );
  const [leaderboard, setLeaderboard] = useState<
    { name: string; count: number }[]
  >([]);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  const fetchLocalLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: search,
        type: filterType,
      });

      if (date?.from) {
        params.append("startDate", startOfDay(date.from).toISOString());
      }
      if (date?.to) {
        params.append("endDate", endOfDay(date.to).toISOString());
      }

      const res = await fetch(`/api/logs?${params}`);
      const data = await res.json();

      setLogs(data.data);
      setTotalPages(data.pagination.totalPages);
      setTotalRecords(data.pagination.total);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (logs.length === 0) return;

    const userCounts = new Map<string, number>();
    logs.forEach((log) =>
      userCounts.set(log.author, (userCounts.get(log.author) || 0) + 1)
    );

    const sortedLeaderboard = [...userCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([name, count]) => ({ name, count }));

    setLeaderboard(sortedLeaderboard);

    const timeMap = new Map<string, number>();
    [...logs].reverse().forEach((log) => {
      const timeKey = log.time.substring(0, 5);
      timeMap.set(timeKey, (timeMap.get(timeKey) || 0) + 1);
    });
    setGraphData(
      Array.from(timeMap.entries())
        .map(([time, count]) => ({ time, count }))
        .slice(-20)
    );
  }, [logs]);

  useEffect(() => {
    fetchLocalLogs();
    const interval = setInterval(() => {
      const isToday = date?.from?.getDate() === new Date().getDate();
      if (page === 1 && !search && isToday) fetchLocalLogs();
    }, 5000);
    return () => clearInterval(interval);
  }, [page, limit, search, filterType, date]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              isActive={page === i}
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(i);
              }}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            href="#"
            className={page === 1 ? "text-black" : ""}
            isActive={page === 1}
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(1);
            }}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (page > 3) {
        items.push(
          <PaginationItem key="start-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              href="#"
              className={page === i ? "text-black" : ""}
              isActive={page === i}
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(i);
              }}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      if (page < totalPages - 2) {
        items.push(
          <PaginationItem key="end-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            href="#"
            className={page === totalPages ? "text-black" : ""}
            isActive={page === totalPages}
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(totalPages);
            }}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className="min-h-screen bg-black text-slate-200 font-sans p-6 flex flex-col gap-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-xl font-mono font-bold tracking-widest text-white">
            AJIAL BAGHDAD <span className="text-slate-600">{"//"}</span> AUDIT
            LOG
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            {totalRecords} RECORDS FOUND
          </p>
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
          <div className="grid gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-[260px] justify-start text-left font-normal bg-[#111] border-slate-800 text-white hover:bg-[#222] hover:text-white",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-[#111] border-slate-800"
                align="start"
              >
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={(newDate) => {
                    setDate(newDate);
                    setPage(1);
                  }}
                  numberOfMonths={2}
                  className="bg-black text-white"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="relative flex-1 md:w-64">
            <Search
              className="absolute left-3 top-2.5 text-slate-500"
              size={16}
            />
            <input
              type="text"
              placeholder="Search record, user..."
              className="w-full bg-[#111] border border-slate-800 rounded py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-green-500 transition-colors"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="relative">
            <select
              className="appearance-none bg-[#111] border border-slate-800 rounded py-2 pl-4 pr-10 text-sm text-white focus:outline-none focus:border-green-500 cursor-pointer"
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All Types</option>
              <option value="SALES">Sales</option>
              <option value="PURCHASE">Purchases</option>
              <option value="INVENTORY">Inventory</option>
              <option value="FINANCE">Finance</option>
              <option value="CRM">CRM</option>
              <option value="CONTACT">Contacts</option>
            </select>
            <Filter
              className="absolute right-3 top-2.5 text-slate-500 pointer-events-none"
              size={14}
            />
          </div>

          <Select
            value={limit.toString()}
            onValueChange={(val) => {
              setLimit(Number(val));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[100px] bg-[#111] border-slate-800 text-white h-[38px]">
              <SelectValue placeholder="Rows" />
            </SelectTrigger>
            <SelectContent className="bg-[#111] border-slate-800 text-white">
              <SelectItem value="20">20 Rows</SelectItem>
              <SelectItem value="50">50 Rows</SelectItem>
              <SelectItem value="100">100 Rows</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        <div className="lg:col-span-3 flex flex-col">
          <ActivityGraph data={graphData} />
          <Leaderboard stats={leaderboard} />
        </div>

        <div className="lg:col-span-9 bg-[#050505] border border-slate-800 rounded-sm flex flex-col h-[calc(100vh-160px)]">
          <div className="bg-slate-900/50 px-4 py-3 border-b border-slate-800 flex justify-between items-center text-xs font-bold text-slate-400">
            <span>HISTORICAL FEED</span>
            <div className="flex items-center gap-2">
              <span>
                PAGE {page} OF {totalPages}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {loading && logs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 font-mono text-sm">
                Loading...
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {logs.map((log) => (
                  <LogItem key={log.dbId || log.id} log={log} />
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-800 p-4 bg-[#080808]">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page - 1);
                    }}
                    className={
                      page <= 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {renderPaginationItems()}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page + 1);
                    }}
                    className={
                      page >= totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </div>
  );
}
