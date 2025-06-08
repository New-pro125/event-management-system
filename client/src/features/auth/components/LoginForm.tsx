import { Button } from "@/features/shared/components/ui/Button";
import Card from "@/features/shared/components/ui/Card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/features/shared/components/ui/Form";
import Input from "@/features/shared/components/ui/Input";
import Link from "@/features/shared/components/ui/Link";
import { useToast } from "@/features/shared/hooks/useToast";
import { trpc } from "@/router";
import { userCredentialsSchema } from "@advanced-react/shared/schema/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

const loginCredentialSchema = userCredentialsSchema.omit({
  name: true,
});
type LoginFormData = z.infer<typeof loginCredentialSchema>;

export function LoginForm() {
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const router = useRouter();
  const { t } = useTranslation("auth");
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginCredentialSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      await utils.auth.currentUser.invalidate();
      router.navigate({ to: "/" });
      toast({
        title: t("login.toast.successTitle"),
        description: t("login.toast.successDescription"),
      });
    },
    onError: (error) => {
      toast({
        title: t("login.toast.errorTitle"),
        description: error.message,
        variant: "destructive",
      });
    },
  });
  const handleSubmit = form.handleSubmit((data) => {
    loginMutation.mutate(data);
  });
  return (
    <Form {...form}>
      <Card>
        <form onSubmit={handleSubmit}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.email")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
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
                <FormLabel>{t("fields.password")}</FormLabel>
                <FormControl>
                  <Input {...field} type="password" placeholder="*********" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="my-2 w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending
              ? t("login.submitting")
              : t("login.submit")}
          </Button>
          <Link to="/register" variant="ghost" className="justify-center py-1">
            {t("login.noAccount")}
          </Link>
        </form>
      </Card>
    </Form>
  );
}
