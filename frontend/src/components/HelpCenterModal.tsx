import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export function HelpCenterModal() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="link" className="text-gray-400 hover:text-white transition-colors p-0 h-auto font-normal">
                    Help Center
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-neutral-900 border-neutral-800 sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white">
                        Getting Started Guide
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Everything you need to know to kickstart your academic journey with us.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    <div className="space-y-4">
                        {[
                            {
                                title: "Create Your Account",
                                desc: "Sign up using your email and set up a strong password to get started."
                            },
                            {
                                title: "Complete Your Profile",
                                desc: "Add your department, semester, and academic interests to get personalized recommendations."
                            },
                            {
                                title: "Connect with Mentors",
                                desc: "Browse our network of verified seniors, filter by expertise, and send connection requests."
                            },
                            {
                                title: "Use SemSense AI",
                                desc: "Upload your class timetable to generate a custom 16-week study roadmap derived from your schedule."
                            },
                            {
                                title: "Track & Maintain Streak",
                                desc: "Log your daily study hours to build consistency and climb the community leaderboard."
                            }
                        ].map((step, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="flex-shrink-0 mt-0.5">
                                    <CheckCircle2 className="size-5 text-emerald-500" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-200 mb-1">{step.title}</h4>
                                    <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-800">
                        <h4 className="text-sm font-semibold text-white mb-2">Frequently Asked Questions</h4>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs font-medium text-gray-300">Will I lose my progress if I close the app?</p>
                                <p className="text-xs text-gray-500">No, all your progress, study logs, and streaks are automatically saved to your secure cloud account. You can pick up right where you left off from any device.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-purple-900/20 border border-purple-500/20 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-purple-200 mb-2">Still have questions?</h4>
                        <p className="text-sm text-purple-300/80 mb-3">
                            Our support team is just an email away. Reach out if you face any issues.
                        </p>
                        <Button
                            size="sm"
                            variant="outline"
                            className="w-full border-purple-500/30 text-purple-200 hover:bg-purple-900/40 hover:text-white"
                            onClick={() => window.location.href = 'mailto:4aksharampadikk@gmail.com'}
                        >
                            Contact Support
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
