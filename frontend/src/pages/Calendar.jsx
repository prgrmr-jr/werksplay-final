import PageTitle from "../components/common/PageTitle";

export default function SeasonCalendar() {
    const today = new Date();

    const getDayStyle = (day) => {
        if (day === 30) {
            return {
                bg: "bg-gold/10 border-gold/30",
                label: "Winner Announcement",
                text: "text-gold",
            };
        }

        if (day >= 22 && day <= 29) {
            return {
                bg: "bg-green-500/10 border-green-500/20",
                label: "Week 4",
                text: "text-green-400",
            };
        }

        if (day >= 15 && day < 22) {
            return {
                bg: "bg-gold/10 border-gold/20",
                label: "Week 3",
                text: "text-gold",
            };
        }

        if (day >= 8 && day < 15) {
            return {
                bg: "bg-cyan/10 border-cyan/20",
                label: "Week 2",
                text: "text-cyan",
            };
        }

        if (day >= 5 && day < 8) {
            return {
                bg: "bg-purple/10 border-purple/20",
                label: "Week 1",
                text: "text-purple",
            };
        }

        return {
            bg: "bg-white/5 border-white/10",
            label: "",
            text: "text-white/40",
        };
    };

    const days = Array.from({length: 26}, (_, i) => i + 5);

    const currentDay =
        today.getMonth() === 5
            ? today.getDate()
            : null;

    const Weeks = [
        {
            name: "Week 1",
            start: 5,
            end: 8,
            color: "text-purple",
        },
        {
            name: "Week 2",
            start: 8,
            end: 15,
            color: "text-cyan",
        },
        {
            name: "Week 3",
            start: 15,
            end: 22,
            color: "text-gold",
        },
        {
            name: "Week 4",
            start: 22,
            end: 29,
            color: "text-green-400",
        },
    ];

    const currentWeek =
        Weeks.find(
            (Week) =>
                currentDay >= Week.start &&
                currentDay < Week.end
        ) || null;

    return (
        <div className="space-y-6">

            <PageTitle
                title="SEASON CALENDAR"
                sub="Track Week resets and winner announcement dates."
            />

            {/* CURRENT Week */}

            <div className="card-cyan relative overflow-hidden">

                <div className="absolute inset-0 bg-gradient-to-r from-cyan/5 via-transparent to-gold/5"/>

                <div
                    className="relative z-10 flex flex-col gap-4">

                    <div>
                        <p className="text-white/40 text-xs uppercase tracking-widest font-game">
                            Current Week
                        </p>

                        <h2
                            className={`font-game text-2xl md:text-3xl mt-2 ${
                                currentWeek?.color || "text-gold"
                            }`}
                        >
                            {currentWeek?.name || "Winner Announcement"}
                        </h2>

                        <p className="text-white/60 text-sm mt-1">
                            {currentWeek
                                ? `June ${currentWeek.start} - June ${currentWeek.end}`
                                : "June 30"}
                        </p>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                        <p className="text-white/40 text-xs uppercase tracking-widest">
                            Match Limit
                        </p>

                        <p
                            className={`font-game text-4xl ${
                                currentWeek?.color || "text-gold"
                            }`}
                        >
                            5
                        </p>

                        <p className="text-white/40 text-xs">
                            Matches per Week
                        </p>
                    </div>

                </div>

            </div>

            {/* LEGEND */}

            <div className="card-cyan">

                <div className="grid grid-cols-2 sm:grid-cols-3 md:flex gap-3 text-xs">

                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple"/>
                        <span className="text-white/70">Week 1</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-cyan"/>
                        <span className="text-white/70">Week 2</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"/>
                        <span className="text-white/70">Week 3</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"/>
                        <span className="text-white/70">Week 4</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gold"/>
                        <span className="text-white/70">Winner Day</span>
                    </div>

                </div>

            </div>

            {/* CALENDAR */}

            <div className="card-cyan">

                <div className="flex items-center justify-between mb-5">

                    <div>
                        <h2 className="font-game text-xl text-white">
                            June 2026
                        </h2>

                        <p className="text-white/40 text-sm">
                            Match reset schedule
                        </p>
                    </div>

                </div>

                <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2 sm:gap-3">

                    {days.map((day) => {
                        const style = getDayStyle(day);

                        const isToday = currentDay === day;

                        const isReset =
                            day === 8 ||
                            day === 15 ||
                            day === 22 ||
                            day === 29;

                        return (
                            <div
                                key={day}
                                className={`
                                    relative
                                    min-h-[130px]
                                    rounded-xl
                                    border
                                    p-4
                                    transition-all
                                    duration-200
                                    hover:border-cyan/30
                                    hover:bg-white/[0.03]
                                    ${style.bg}
                                    ${
                                    isToday
                                        ? "ring-2 ring-cyan shadow-lg shadow-cyan/20"
                                        : ""
                                }
                                `}
                            >

                                {/* TODAY */}

                                {isToday && (
                                    <div className="absolute top-2 right-2">

                                        <span
                                            className="
                                               text-[9px]
                                                uppercase
                                                tracking-wider
                                                px-2 py-1
                                                rounded-full
                                                bg-cyan/10
                                                border
                                                border-cyan/20
                                                text-cyan
                                                font-medium
                                            "
                                        >
                                            Today
                                        </span>

                                    </div>
                                )}

                                <div className="font-game text-lg sm:text-2xl text-white">
                                    {day}
                                </div>

                                <div className="mt-3 space-y-2">

                                    <div
                                        className={`text-[11px] uppercase tracking-wider font-medium ${style.text}`}
                                    >
                                        {style.label}
                                    </div>

                                    {isReset && (
                                        <span
                                            className="
                                                inline-flex
                                                px-2
                                                py-1
                                                rounded-md
                                                bg-gold/10
                                                border
                                                border-gold/20
                                                text-gold
                                               text-[9px]
                                                uppercase
                                                tracking-wider
                                            "
                                        >
                                            Reset
                                        </span>
                                    )}

                                    {day === 30 && (
                                        <span
                                            className="
                                                inline-flex
                                                px-2
                                                py-1
                                                rounded-md
                                                bg-gold/10
                                                border
                                                border-gold/20
                                                text-gold
                                                text-[9px]
                                                uppercase
                                                tracking-wider
                                            "
                                        >
                                            Announcement
                                        </span>
                                    )}

                                </div>

                            </div>
                        );
                    })}

                </div>

            </div>

            {/* SCHEDULE */}

            <div className="card-cyan">

                <div className="flex items-center justify-between mb-5">

                    <h2 className="font-game text-white text-lg">
                        Season Schedule
                    </h2>

                    <span className="text-white/30 text-xs uppercase tracking-wider">
                        June 2026
                    </span>

                </div>

                <div className="space-y-3">

                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                        <span className="text-white/70">Week 1</span>
                        <span className="text-purple font-medium">
                            June 5 - June 8
                        </span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                        <span className="text-white/70">Week 2</span>
                        <span className="text-cyan font-medium">
                            June 8 - June 15
                        </span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                        <span className="text-white/70">Week 3</span>
                        <span className="text-gold font-medium">
                            June 15 - June 22
                        </span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                        <span className="text-white/70">Week 4</span>
                        <span className="text-green-400 font-medium">
                            June 22 - June 29
                        </span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                        <span className="text-white/70">
                            Winner Announcement
                        </span>

                        <span className="text-gold font-game">
                            June 30
                        </span>
                    </div>

                </div>

            </div>

        </div>
    );
}