import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export function ContactModal() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="link" className="text-gray-400 hover:text-white transition-colors p-0 h-auto font-normal">
                    Contact
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-neutral-900 border-neutral-800 sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white mb-2">
                        Contact Us
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Have questions, feedback, or need support? We'd love to hear from you.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-neutral-800/50 border border-neutral-800">
                        <div className="bg-neutral-700/50 p-2 rounded-md">
                            <Mail className="size-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Email Support</p>
                            <p className="text-sm text-gray-200 font-medium">4aksharampadikk@gmail.com</p>
                        </div>
                    </div>

                    <Button
                        className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 text-white shadow-lg shadow-purple-900/20"
                        onClick={() => window.location.href = 'mailto:4aksharampadikk@gmail.com'}
                    >
                        <Mail className="mr-2 size-4" /> Send Email
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
