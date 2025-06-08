import { Button } from "@/features/shared/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/features/shared/components/ui/Dialog";
import FileInput from "@/features/shared/components/ui/FileInput";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/features/shared/components/ui/Form";
import Input from "@/features/shared/components/ui/Input";
import { useToast } from "@/features/shared/hooks/useToast";
import { trpc } from "@/router";
import { User } from "@advanced-react/server/database/schema";
import { userEditSchema } from "@advanced-react/shared/schema/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

type UserFormData = z.infer<typeof userEditSchema>;
type UserEditDialogProps = {
  user: User;
};
export function UserEditDialog({ user }: UserEditDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<UserFormData>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      bio: user.bio as string,
      name: user.name,
      id: user.id,
    },
  });
  const { toast } = useToast();
  const { t } = useTranslation("users");
  const utils = trpc.useUtils();
  const editUserMutation = trpc.users.edit.useMutation({
    onSuccess: async ({ id }) => {
      await Promise.all([
        utils.users.byId.invalidate({ id }),
        utils.auth.currentUser.invalidate(),
      ]);
      form.reset();
      setIsOpen(false);
      toast({
        title: t("edit.toast.successTitle"),
        description: t("edit.toast.successDescription"),
      });
    },
    onError: (error) => {
      toast({
        title: t("edit.toast.errorTitle"),
        description: error.message,
        variant: "destructive",
      });
    },
  });
  const handleSubmit = form.handleSubmit((data) => {
    const formData = new FormData();
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        formData.append(key, value as string | Blob);
      }
    }
    editUserMutation.mutate(formData);
  });
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>{t("edit.trigger")}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100%-24px)] sm:w-fit">
        <DialogHeader>
          <DialogTitle>{t("edit.title")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("edit.name")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("edit.bio")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="photo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("edit.image")}</FormLabel>
                  <FormControl>
                    <FileInput
                      accept="image/*"
                      onChange={(event) =>
                        field.onChange(event.target?.files?.[0])
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={editUserMutation.isPending}>
                {editUserMutation.isPending
                  ? t("common:actions.saving")
                  : t("common:actions.save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
