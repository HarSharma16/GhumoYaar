import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Share2, Copy, Check, Link, Loader2, CheckCircle, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";


interface ExportShareButtonsProps {
  tripId: string;
  tripTitle: string;
  isShared: boolean;
  shareToken: string | null;
  onShareStatusChange: (isShared: boolean, shareToken: string | null) => void;
}

export function ExportShareButtons({
  tripId,
  tripTitle,
  isShared,
  shareToken,
  onShareStatusChange,
}: ExportShareButtonsProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [isUpdatingShare, setIsUpdatingShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const shareUrl = shareToken
    ? `${window.location.origin}/trip/share/${shareToken}`
    : null;

  const handleExportPDF = async () => {
    setIsExporting(true);
    
    try {
      const element = document.getElementById("itinerary-content");
      if (!element) {
        throw new Error("Itinerary content not found");
      }

      // Temporarily expand all accordions for PDF
      const accordionTriggers = element.querySelectorAll('[data-state="closed"]');
      accordionTriggers.forEach((trigger) => {
        (trigger as HTMLElement).click();
      });

      // Wait for accordions to expand
      await new Promise((resolve) => setTimeout(resolve, 500));
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      
      // Calculate how many pages we need
      const scaledHeight = imgHeight * ratio;
      const totalPages = Math.ceil(scaledHeight / pdfHeight);

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }
        pdf.addImage(
          imgData,
          "PNG",
          imgX,
          -(page * pdfHeight),
          imgWidth * ratio,
          imgHeight * ratio
        );
      }

      pdf.save(`${tripTitle.replace(/\s+/g, "_")}_itinerary.pdf`);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2000);
      
      toast({
        title: "PDF Exported",
        description: "Your itinerary has been downloaded as a PDF.",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleToggleShare = async (enabled: boolean) => {
    setIsUpdatingShare(true);
    
    try {
      if (enabled) {
        // Generate a new share token
        const { data: tokenData, error: tokenError } = await supabase
          .rpc("generate_share_token");
        
        if (tokenError) throw tokenError;

        const newToken = tokenData as string;

        const { error: updateError } = await supabase
          .from("trips")
          .update({ is_shared: true, share_token: newToken })
          .eq("id", tripId);

        if (updateError) throw updateError;

        onShareStatusChange(true, newToken);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
        
        toast({
          title: "Sharing Enabled",
          description: "Your trip is now shareable via link.",
        });
      } else {
        const { error: updateError } = await supabase
          .from("trips")
          .update({ is_shared: false, share_token: null })
          .eq("id", tripId);

        if (updateError) throw updateError;

        onShareStatusChange(false, null);
        toast({
          title: "Sharing Disabled",
          description: "Your trip is no longer shareable.",
        });
      }
    } catch (error) {
      console.error("Error updating share status:", error);
      toast({
        title: "Error",
        description: "Failed to update sharing settings.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingShare(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Link Copied",
        description: "Share link copied to clipboard.",
      });
    } catch (error) {
      console.error("Error copying link:", error);
      toast({
        title: "Copy Failed",
        description: "Failed to copy link. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
      {/* Export PDF Button */}
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportPDF}
          disabled={isExporting}
          className={cn(
            "gap-2 w-full sm:w-auto transition-all duration-300",
            exportSuccess && "bg-green-500/10 border-green-500/50 text-green-600 dark:text-green-400"
          )}
        >
          <AnimatePresence mode="wait">
            {isExporting ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Loader2 className="w-4 h-4 animate-spin" />
              </motion.div>
            ) : exportSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <CheckCircle className="w-4 h-4" />
              </motion.div>
            ) : (
              <motion.div
                key="default"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <FileDown className="w-4 h-4" />
              </motion.div>
            )}
          </AnimatePresence>
          {exportSuccess ? "Downloaded!" : "Export PDF"}
        </Button>
      </motion.div>

      {/* Share Button */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogTrigger asChild>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              variant="outline" 
              size="sm" 
              className={cn(
                "gap-2 w-full sm:w-auto",
                isShared && "bg-secondary/10 border-secondary/50 text-secondary"
              )}
            >
              <Share2 className="w-4 h-4" />
              {isShared ? "Sharing On" : "Share"}
            </Button>
          </motion.div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Share Trip</DialogTitle>
            <DialogDescription>
              Enable sharing to get a public link for your trip itinerary.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <motion.div 
              className="flex items-center justify-between p-4 rounded-xl bg-muted/50"
              animate={shareSuccess ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-0.5">
                <Label htmlFor="share-toggle" className="font-medium cursor-pointer">
                  Enable Public Sharing
                </Label>
                <p className="text-sm text-muted-foreground">
                  Anyone with the link can view your itinerary
                </p>
              </div>
              <div className="relative">
                {isUpdatingShare && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </motion.div>
                )}
                <Switch
                  id="share-toggle"
                  checked={isShared}
                  onCheckedChange={handleToggleShare}
                  disabled={isUpdatingShare}
                  className={cn(isUpdatingShare && "opacity-0")}
                />
              </div>
            </motion.div>

            <AnimatePresence>
              {isShared && shareUrl && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <Label>Share Link</Label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        readOnly
                        value={shareUrl}
                        className="pl-9 pr-3 bg-muted/50 font-mono text-sm"
                      />
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={handleCopyLink}
                        className={cn(
                          "shrink-0 transition-colors",
                          copied && "bg-green-500/20 text-green-600 dark:text-green-400"
                        )}
                      >
                        <AnimatePresence mode="wait">
                          {copied ? (
                            <motion.div
                              key="check"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                            >
                              <Check className="w-4 h-4" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="copy"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                            >
                              <Copy className="w-4 h-4" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Button>
                    </motion.div>
                  </div>
                  {copied && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-green-600 dark:text-green-400"
                    >
                      Link copied to clipboard!
                    </motion.p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
