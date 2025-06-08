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
import { changeEmailSchema } from "@advanced-react/shared/schema/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

type ChangeEmailformData = z.infer<typeof changeEmailSchema>;
export function ChangeEmailDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const { t } = useTranslation("auth");
  const form = useForm<ChangeEmailformData>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const handleSubmit = form.handleSubmit((data) => {
    changeEmailMutation.mutate(data);
  });
  const changeEmailMutation = trpc.auth.changeEmail.useMutation({
    onSuccess: async () => {
      await utils.auth.currentUser.invalidate();
      form.reset();
      setIsOpen(false);
      toast({
        title: t("changeEmail.toast.successTitle"),
        description: t("changeEmail.toast.successDescription"),
      });
    },
    onError: (err) => {
      toast({
        title: t("changeEmail.toast.errorTitle"),
        description: err.message,
        variant: "destructive",
      });
    },
  });
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>{t("changeEmail.trigger")}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100%-24px)] sm:w-fit">
        <DialogHeader>
          <DialogTitle>{t("changeEmail.title")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("changeEmail.newEmail")}</FormLabel>
                  <FormControl>
                    <Input
                      type={"email"}
                      {...field}
                      placeholder="dev@example.com"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("changeEmail.currentPassword")}</FormLabel>
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
              <Button type="submit" disabled={changeEmailMutation.isPending}>
                {changeEmailMutation.isPending
                  ? t("common:actions.loading")
                  : t("changeEmail.submit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
