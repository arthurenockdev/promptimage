"use client";

import ProtectedRoute from "../ProtectedRoute"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Sparkles, MoreVertical, Trash2, ImageIcon, Plus, LayoutDashboard, Download, LogOut, Settings, User, X, Menu, ChevronsUpDown } from 'lucide-react';
import { collection, getDocs, deleteDoc, doc, orderBy, query, where } from 'firebase/firestore';
import db from '../utils/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { signOut } from "firebase/auth";
import { auth } from "../utils/firebaseConfig";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Dashboard() {
  const router = useRouter();
  const [visuals, setVisuals] = useState([]);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedVisual, setSelectedVisual] = useState(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setEmail(user.email);
        fetchVisuals();
        fetchSubscriptionStatus(user.email);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchSubscriptionStatus = async (userEmail) => {
    try {
      const subscriptionRef = collection(db, "subscriptions");
      const q = query(subscriptionRef, where("email", "==", userEmail));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const subscriptionData = querySnapshot.docs[0].data();
        setSubscriptionStatus(subscriptionData.status);
      } else {
        setSubscriptionStatus(null);
      }
    } catch (error) {
      console.error("Error fetching subscription status:", error);
      setError("Error fetching subscription status: " + error.message);
      setSubscriptionStatus(null);
    }
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchVisuals = async () => {
    try {
      setIsLoading(true);
      const visualsRef = collection(db, "visuals");
      const q = query(visualsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const visualsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }));

      setVisuals(visualsData);
    } catch (error) {
      setError("Error fetching visuals: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateClick = () => {
    if (subscriptionStatus === "completed") {
      router.push('/generate_visual');
    } else {
      setShowSubscriptionDialog(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedVisual) return;

    try {
      await deleteDoc(doc(db, "visuals", selectedVisual.id));
      setVisuals(visuals.filter((visual) => visual.id !== selectedVisual.id));
      setDeleteDialogOpen(false);
      setSelectedVisual(null);
      setNotification({ type: "success", message: "Visual deleted successfully" });
    } catch (error) {
      setError("Error deleting visual: " + error.message);
      setNotification({ type: "error", message: "Failed to delete visual: " + error.message });
    }
  };

  const handleDeleteClick = (visual) => {
    setSelectedVisual(visual);
    setDeleteDialogOpen(true);
  };

  const handleCardClick = (visual) => {
    router.push(`/generate_visual?prompt=${encodeURIComponent(visual.prompt)}&aspectRatio=${visual.aspectRatio}`);
  };

  const handlePreviewClick = (e, visual) => {
    e.stopPropagation();
    setPreviewImage(visual);
    setPreviewDialogOpen(true);
  };

  const handleDownload = (imageUrl) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.setAttribute("download", `generated-image-${Date.now()}.png`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      setNotification({
        type: "error",
        message: "Failed to log out: " + error.message,
      });
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        {/* Sidebar */}
        <aside className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col`}>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">PromptImage</h2>
          </div>
          <nav className="flex-1 space-y-2 px-4">
            <Button
              variant="ghost"
              className="w-full justify-start"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </nav>
          <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full flex items-center justify-between">
                  <div className="flex items-center">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg" alt={email} />
                      <AvatarFallback>{email ? email[0].toUpperCase() : ''}</AvatarFallback>
                    </Avatar>
                    <span className="ml-2 text-sm font-medium truncate">{email}</span>
                  </div>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsEditProfileOpen(true)}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsSubscriptionOpen(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Subscription</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="lg:hidden mr-2" onClick={toggleSidebar}>
                <Menu className="h-6 w-6" />
              </Button>
              <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                Dashboard
              </h1>
            </div>
            <Button className="flex items-center gap-2" onClick={handleGenerateClick}>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Generate New</span>
            </Button>
          </header>

          {/* Main Dashboard Content */}
          <main className="flex-1 overflow-y-auto p-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold">Generated Visuals</h2>
              </div>
              
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {notification && (
                <Alert variant={notification.type === 'error' ? 'destructive' : 'default'} className="mb-6">
                  <AlertDescription>{notification.message}</AlertDescription>
                </Alert>
              )}

              {isLoading ? (
                <div className="flex justify-center items-center min-h-[400px]">
                  <div className="animate-pulse text-muted-foreground">Loading visuals...</div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {visuals.map((visual) => (
                      <Card 
                        key={visual.id} 
                        className="overflow-hidden group hover:shadow-lg transition-shadow duration-200"
                      >
                        <div 
                          className="relative aspect-square cursor-pointer"
                          onClick={() => handleCardClick(visual)}
                        >
                          <Image
                            src={visual.imageUrl}
                            alt={visual.prompt}
                            layout="fill"
                            objectFit="cover"
                            className="transition-transform duration-200 group-hover:scale-105"
                          />
                          <Button
                            variant="secondary"
                            size="sm"
                            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            onClick={(e) => handlePreviewClick(e, visual)}
                          >
                            <ImageIcon className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                        </div>
                        
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start gap-4">
                            <p className="text-sm line-clamp-2 flex-1">{visual.prompt}</p>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleDownload(visual.imageUrl)}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteClick(visual)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                        
                        <CardFooter className="p-4 pt-0">
                          <div className="flex justify-between items-center w-full text-sm text-muted-foreground">
                            <span>{visual.aspectRatio}</span>
                            <span>{visual.createdAt?.toLocaleDateString()}</span>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                
                  </div>

                  {visuals.length === 0 && !isLoading && (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                      <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-semibold">No visuals yet</h3>
                      <p className="mt-2 text-muted-foreground">Get started by generating your first visual</p>
                      <Button
                        className="mt-4"
                        onClick={handleGenerateClick}
                      >
                        Generate Your First Visual
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </main>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Visual</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this visual? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Preview Visual</DialogTitle>
            </DialogHeader>
            {previewImage && (
              <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                <Image
                  src={previewImage.imageUrl}
                  alt={previewImage.prompt}
                  layout="fill"
                  objectFit="contain"
                  className="bg-background"
                />
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Profile Dialog */}
        <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} readOnly />
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Subscription Dialog */}
        <Dialog open={isSubscriptionOpen} onOpenChange={setIsSubscriptionOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Subscription Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="current-plan">Current Plan</Label>
                <Input id="current-plan" value="Pro" readOnly />
              </div>
              
              <div>
                <Label htmlFor="billing-cycle">Billing Cycle</Label>
                <Input id="billing-cycle" value="Monthly" readOnly />
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Subscription Alert Dialog */}
        <AlertDialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
          <AlertDialogContent className="sm:max-w-[425px] bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2 text-primary">
                <ImageIcon className="w-6 h-6" />
                Upgrade to Generate
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center pt-4">
                Unlock the power of AI-generated images by upgrading your account. Create stunning visuals with just a click!
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex flex-col items-center justify-center p-4">
              <Sparkles className="w-16 h-16 text-yellow-400 animate-pulse" />
              <p className="mt-4 text-sm text-center text-muted-foreground">
                Join our premium users and enjoy unlimited image generation, priority processing, and exclusive styles.
              </p>
            </div>
            <AlertDialogFooter className="sm:justify-center">
              <AlertDialogCancel className="sm:w-auto" onClick={() => setShowSubscriptionDialog(false)}>
                Maybe Later
              </AlertDialogCancel>
              <AlertDialogAction
                className="sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                onClick={() => {
                  router.push('/pricing'); 
                  setShowSubscriptionDialog(false);
                }}
              >
                Subscribe Now
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedRoute>
  );
}