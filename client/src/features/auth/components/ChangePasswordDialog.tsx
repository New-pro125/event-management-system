import { Button } from "@/features/shared/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/features/shared/components/ui/Dialog";
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
import { changePasswordSchema } from "@advanced-react/shared/schema/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

type ChangePasswordformData = z.infer<typeof changePasswordSchema>;
export function ChangePasswordDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const { t } = useTranslation("auth");
  const form = useForm<ChangePasswordformData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });
  const handleSubmit = form.handleSubmit((data) => {
    changePasswordMutation.mutate(data);
  });
  const changePasswordMutation = trpc.auth.changePassword.useMutation({
    onSuccess: async () => {
      await utils.auth.currentUser.invalidate();
      form.reset();
      setIsOpen(false);
      toast({
        title: t("changePassword.toast.successTitle"),
        description: t("changePassword.toast.successDescription"),
      });
    },
    onError: (err) => {
      toast({
        title: t("changePassword.toast.errorTitle"),
        description: err.message,
        variant: "destructive",
      });
    },
  });
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>{t("changePassword.trigger")}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100%-24px)] sm:w-fit">
        <DialogHeader>
          <DialogTitle>{t("changePassword.title")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("changePassword.newPassword")}</FormLabel>
                  <FormControl>
                    <Input
                      type={"password"}
                      {...field}
                      placeholder="*********"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("changePassword.currentPassword")}</FormLabel>
                  <FormControl>
                    <Input
                      type={"password"}
                      {...field}
                      placeholder="*********"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={changePasswordMutation.isPending}>
                {changePasswordMutation.isPending
                  ? t("common:actions.loading")
                  : t("changePassword.submit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
