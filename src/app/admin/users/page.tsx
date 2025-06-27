
"use client";

import { useState, useEffect } from 'react';
import type { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { Video, Search, UserCheck, UserX, UserPlus, Loader2, Eye, Ban, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { useAdminConfig } from '@/contexts/AdminConfigContext';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getAllUsersAction, updateUserSuspensionAction } from '@/app/actions'; 
import { Label } from '@/components/ui/label';

const ADMIN_EMAIL_FOR_FILTERING = process.env.NEXT_PUBLIC_ADMIN_EMAIL_FOR_DEMO || 'admin@onlyfansly.com';

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const { toast } = useToast();
  const { config, setConfig, t } = useAdminConfig();
  const { user: adminUser } = useAuth(); 
  const router = useRouter();


  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const fetchedUsers = await getAllUsersAction();
        const filteredForDisplay = fetchedUsers.filter(u => u.email.toLowerCase() !== ADMIN_EMAIL_FOR_FILTERING.toLowerCase());
        setUsers(filteredForDisplay);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load users." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [toast]);

  const filteredUsers = users.filter(user =>
    (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const handleDesignateForVideoCall = async (userToCall: User) => {
    if (!adminUser || !adminUser.isAdmin) {
        toast({ variant: "destructive", title: "Error", description: "Admin privileges required."});
        return;
    }
    if (userToCall.id === adminUser.id || userToCall.email.toLowerCase() === ADMIN_EMAIL_FOR_FILTERING.toLowerCase()) {
        toast({ variant: "destructive", title: "Error", description: "Cannot start a call with yourself or the main admin."});
        return;
    }
    try {
        await setConfig(prevConfig => ({ 
            ...prevConfig,
            liveStreamAuthorizedUserId: userToCall.id
        }));
        toast({
            title: t('adminManageUsersUserDesignatedForCall'),
            description: `Se ha designado a ${userToCall.name}. Serás redirigido para iniciar la llamada.`
        });
        router.push('/admin/video-call');
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to designate user for call."});
        console.error("Error designating user for call:", error);
    }
  };

  const toggleSuspensionStatus = async (userId: string, currentStatus: boolean) => {
    // Optimistic UI update
    setUsers(users.map(u => u.id === userId ? { ...u, isSuspended: !currentStatus } : u));
    
    const result = await updateUserSuspensionAction(userId, !currentStatus);

    if (result.success) {
        toast({ title: "Estado de Usuario Actualizado", description: `El usuario ha sido ${!currentStatus ? 'suspendido' : 'reactivado'}.` });
    } else {
        // Revert on failure
        setUsers(users.map(u => u.id === userId ? { ...u, isSuspended: currentStatus } : u));
        toast({ variant: "destructive", title: "Actualización Fallida", description: result.error });
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">{t('loadingAdminArea')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold">{t('adminManageUsersTitle')}</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('adminManageUsersListTitle')}</CardTitle>
          <CardDescription>{t('adminManageUsersListDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('adminManageUsersSearchPlaceholder')}
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('adminManageUsersAvatarHeader')}</TableHead>
                <TableHead>{t('adminManageUsersNameHeader')}</TableHead>
                <TableHead>{t('adminManageUsersEmailHeader')}</TableHead>
                <TableHead>{t('adminManageUsersRoleHeader')}</TableHead>
                <TableHead>{t('adminManageUsersGroupsHeader')}</TableHead>
                <TableHead className="text-right">{t('adminManageUsersActionsHeader')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className={user.isSuspended ? 'opacity-50 bg-destructive/10' : ''}>
                  <TableCell>
                    <Image 
                        src={user.avatar || `https://placehold.co/40x40.png?text=${user.name?.charAt(0) || 'U'}`} 
                        alt={user.name || 'User'} 
                        width={40} 
                        height={40} 
                        className="rounded-full"
                        data-ai-hint="avatar person" 
                    />
                  </TableCell>
                  <TableCell className="font-medium">{user.name} {user.lastName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.isAdmin ? t('adminManageUsersRoleAdmin') : t('adminManageUsersRoleUser')}</TableCell>
                  <TableCell>{user.groups?.join(', ') || t('adminManageUsersGroupsNone')}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                            variant="outline" 
                            size="icon" 
                            title={t('adminManageUsersDesignateForCall')}
                            disabled={user.id === adminUser?.id || user.email.toLowerCase() === ADMIN_EMAIL_FOR_FILTERING.toLowerCase() || config.liveStreamAuthorizedUserId === user.id || !!user.isSuspended}
                        >
                          <Video className="h-4 w-4 text-primary" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('adminManageUsersStartVideoCallAlertTitle', { name: user.name })}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t('adminManageUsersStartVideoCallAlertDescription')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('adminManageUsersStartVideoCallAlertCancel')}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDesignateForVideoCall(user)}>
                            {t('adminManageUsersStartVideoCallAlertAction')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <Dialog onOpenChange={(isOpen) => !isOpen && setViewingUser(null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon" title="Ver Perfil" onClick={() => setViewingUser(user)}>
                            <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                    
                    {adminUser?.id !== user.id && user.email.toLowerCase() !== ADMIN_EMAIL_FOR_FILTERING.toLowerCase() && ( 
                        <Button variant="outline" size="icon" title={user.isSuspended ? 'Reactivar Usuario' : 'Suspender Usuario'} onClick={() => toggleSuspensionStatus(user.id, !!user.isSuspended)}>
                          {user.isSuspended ? <UserCheck className="h-4 w-4 text-green-500" /> : <UserX className="h-4 w-4 text-destructive" />}
                        </Button>
                    )}
                     <Button variant="destructive" size="icon" title={t('adminManageUsersDeleteUserTitle')} disabled>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredUsers.length === 0 && <p className="text-center text-muted-foreground py-8">{t('adminManageUsersNoUsers')}</p>}
        </CardContent>
      </Card>
      {viewingUser && (
        <Dialog open={!!viewingUser} onOpenChange={(isOpen) => !isOpen && setViewingUser(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Perfil de Usuario</DialogTitle>
              <DialogDescription>
                Detalles completos del usuario seleccionado.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right col-span-1">Avatar</Label>
                  <Image src={viewingUser.avatar || `https://placehold.co/80x80.png`} alt={viewingUser.name || 'User'} width={80} height={80} className="rounded-full col-span-3" data-ai-hint="avatar person" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Nombre</Label>
                <Input id="name" value={`${viewingUser.name} ${viewingUser.lastName}`} readOnly className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" value={viewingUser.email} readOnly className="col-span-3" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dni" className="text-right">DNI</Label>
                <Input id="dni" value={viewingUser.dni} readOnly className="col-span-3" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">Teléfono</Label>
                <Input id="phone" value={viewingUser.phone} readOnly className="col-span-3" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">Dirección</Label>
                <Input id="address" value={`${viewingUser.address}, ${viewingUser.postalCode}, ${viewingUser.city}, ${viewingUser.country}`} readOnly className="col-span-3" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Estado</Label>
                 <span className={`col-span-3 font-semibold ${viewingUser.isSuspended ? 'text-destructive' : 'text-green-600'}`}>
                  {viewingUser.isSuspended ? 'Suspendido' : 'Activo'}
                </span>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
