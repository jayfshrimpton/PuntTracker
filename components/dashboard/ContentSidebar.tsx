'use client';

import { Play, FileText, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ContentSidebar() {
    return (
        <div className="hidden xl:flex w-80 flex-col gap-6 pt-6 pr-6 pb-6 sticky top-[80px] h-[calc(100vh-80px)] overflow-y-auto no-scrollbar">

            {/* Widgets Section */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
                    Widgets
                </h3>

                {/* Quick Stats Widget */}
                <Card className="glass border-white/20 dark:border-gray-800/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            Daily Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">+12.5u</div>
                        <p className="text-xs text-muted-foreground">Today&apos;s Profit</p>
                    </CardContent>
                </Card>

                {/* Next Race Widget (Placeholder) */}
                <Card className="glass border-white/20 dark:border-gray-800/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            Next Race
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">Flemington R4</span>
                            <span className="text-red-500 font-bold">5m 23s</span>
                        </div>
                        <p className="text-xs text-muted-foreground">The golden ticket</p>
                    </CardContent>
                </Card>
            </div>

            {/* Blog Posts Section */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
                    Latest News
                </h3>
                <div className="space-y-3">
                    {[
                        { title: "Top 5 Tips for Spring Carnival", date: "2 hours ago" },
                        { title: "Understanding Sectional Times", date: "1 day ago" },
                        { title: "Weekly Punting Wrap-up", date: "3 days ago" }
                    ].map((post, i) => (
                        <Link key={i} href="#" className="block group">
                            <div className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-md bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                        <FileText className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium leading-tight mb-1 group-hover:text-blue-400 transition-colors">
                                            {post.title}
                                        </h4>
                                        <span className="text-xs text-muted-foreground">{post.date}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Videos Section */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
                    Featured Videos
                </h3>
                <Card className="overflow-hidden border-white/20 dark:border-gray-800/50 group cursor-pointer">
                    <div className="relative aspect-video bg-black/50 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform z-10">
                            <Play className="h-5 w-5 text-white ml-1" />
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 z-10">
                            <p className="text-white text-sm font-medium line-clamp-1">Expert Analysis: Cox Plate Preview</p>
                            <p className="text-white/70 text-xs">10:24 • Punters Club</p>
                        </div>
                    </div>
                </Card>
            </div>

        </div>
    );
}
