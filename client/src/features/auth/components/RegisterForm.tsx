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

const registerCredentialSchema = userCredentialsSchema;
type RegisterFormData = z.infer<typeof registerCredentialSchema>;

export function RegisterForm() {
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const router = useRouter();
  const { t } = useTranslation("auth");
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerCredentialSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });
  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: async () => {
      await utils.auth.currentUser.invalidate();
      router.navigate({ to: "/" });
      toast({
        title: t("register.toast.successTitle"),
        description: t("register.toast.successDescription"),
      });
    },
    onError: (error) => {
      toast({
        title: t("register.toast.errorTitle"),
        description: error.message,
        variant: "destructive",
      });
    },
  });
  const handleSubmit = form.handleSubmit((data) => {
    registerMutation.mutate(data);
  });
  return (
    <Form {...form}>
      <Card>
        <form onSubmit={handleSubmit}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.name")}</FormLabel>
                <FormControl>
                  <Input {...field} type="text" placeholder="john doe" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending
              ? t("register.submitting")
              : t("register.submit")}
          </Button>
          <Link to="/login" variant="ghost" className="justify-center py-1">
            {t("register.hasAccount")}
          </Link>
        </form>
      </Card>
    </Form>
  );
}
