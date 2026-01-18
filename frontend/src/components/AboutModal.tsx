import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function AboutModal() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="link" className="text-gray-400 hover:text-white transition-colors p-0 h-auto font-normal">
                    About
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-neutral-900 border-neutral-800 sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold bg-gradient-to-r from-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
                        About 4aksharampadikk
                    </DialogTitle>
                    <DialogDescription className="text-gray-400 pt-4 leading-relaxed">
                        <p className="mb-4">
                            <strong className="text-purple-300">4aksharampadikk</strong> is a student-driven initiative at <strong className="text-white">Model Engineering College (MEC)</strong>, designed to bridge the gap between seniors and juniors.
                        </p>
                        <p>
                            Our mission is to democratize academic success by connecting students with the right mentors and resources, powered by <span className="text-indigo-300">advanced AI</span> to personalize your learning journey.
                        </p>
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}
